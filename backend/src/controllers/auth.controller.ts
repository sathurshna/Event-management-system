import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
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

  // Store refresh token in DB (so we can invalidate on logout)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt },
  });

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
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('An account with this email already exists.', 409);

  // Hash password and create user
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  await sendTokenResponse(user.id, user.email, res, 201);
});

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
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
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Invalid or expired session. Please log in again.', 401);
  }

  // Delete old refresh token (rotate tokens for security)
  await prisma.refreshToken.delete({ where: { token } });

  // Issue a new pair
  await sendTokenResponse(payload.userId, payload.email, res);
});

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies[REFRESH_TOKEN_COOKIE];

  if (token) {
    // Remove from DB (invalidate)
    await prisma.refreshToken.deleteMany({ where: { token } });
    // Clear cookie
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
  }

  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

// ─── Get Me (current user) ────────────────────────────────────────────────────
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: { events: true, rsvps: true },
      },
    },
  });

  if (!user) throw new AppError('User not found.', 404);

  res.status(200).json({ success: true, data: user });
});
