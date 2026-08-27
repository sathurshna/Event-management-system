import { Request, Response } from 'express';
import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  REFRESH_TOKEN_COOKIE,
  refreshTokenCookieOptions,
} from '../utils/auth.utils';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../middleware/validate';
import { RowDataPacket } from 'mysql2';

// Helper: send tokens in response
const sendTokenResponse = async (
  userId: string,
  email: string,
  res: Response,
  statusCode = 200
) => {
  const payload = { userId, email };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Delete old refresh token for this user to keep it clean (optional logic)
  // Store refresh token in DB
  await pool.query(
    'INSERT INTO refresh_tokens (id, token, expires_at, user_id) VALUES (?, ?, ?, ?)',
    [uuidv4(), refreshToken, expiresAt, userId]
  );

  // Set refresh token as HTTP-only cookie
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions);

  res.status(statusCode).json({
    success: true,
    accessToken,
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterInput;

  // Check if email already taken
  const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) throw new AppError('An account with this email already exists.', 409);

  // Hash password and create user
  const hashedPassword = await hashPassword(password);
  const userId = uuidv4();
  
  await pool.query(
    'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
    [userId, name, email, hashedPassword]
  );

  await sendTokenResponse(userId, email, res, 201);
});

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  // Find user
  const [users] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
  const user = users[0];
  if (!user) throw new AppError('Invalid email or password.', 401);

  // Compare password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new AppError('Invalid email or password.', 401);

  await sendTokenResponse(user.id, user.email, res);
});

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies[REFRESH_TOKEN_COOKIE];
  if (!token) throw new AppError('No refresh token provided.', 401);

  // Verify the refresh token signature
  const payload = verifyRefreshToken(token);

  // Check it exists in DB and is not expired
  const [storedTokens] = await pool.query<RowDataPacket[]>('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
  const stored = storedTokens[0];

  if (!stored || new Date(stored.expires_at) < new Date()) {
    throw new AppError('Invalid or expired session. Please log in again.', 401);
  }

  // Delete old refresh token
  await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);

  // Issue a new pair
  await sendTokenResponse(payload.userId, payload.email, res);
});

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies[REFRESH_TOKEN_COOKIE];

  if (token) {
    // Remove from DB
    await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
    // Clear cookie
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
  }

  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

// ─── Get Me (current user) ────────────────────────────────────────────────────
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const [users] = await pool.query<RowDataPacket[]>(
    'SELECT id, name, email, avatar, created_at as createdAt FROM users WHERE id = ?',
    [req.user!.userId]
  );
  
  const user = users[0];
  if (!user) throw new AppError('User not found.', 404);

  // Count events and rsvps for the user
  const [eventCountResult] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM events WHERE host_id = ?', [user.id]);
  const [rsvpCountResult] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM rsvps WHERE user_id = ?', [user.id]);

  res.status(200).json({
    success: true,
    data: {
      ...user,
      _count: {
        events: eventCountResult[0].count,
        rsvps: rsvpCountResult[0].count
      }
    }
  });
});
// ─── Update Current User Profile ─────────────────────────────────────────────
export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { name, avatar } = req.body;

  if (!name) {
    throw new AppError('Name is required', 400);
  }

  // Update user in database
  if (avatar) {
    await pool.query(
      'UPDATE users SET name = ?, avatar = ? WHERE id = ?',
      [name, avatar, userId]
    );
  } else {
    await pool.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name, userId]
    );
  }

  // Fetch updated user
  const [users] = await pool.query<RowDataPacket[]>(
    'SELECT id, name, email, avatar, created_at, updated_at FROM users WHERE id = ?',
    [userId]
  );

  res.status(200).json({
    success: true,
    data: {
      user: users[0],
    },
  });
});
