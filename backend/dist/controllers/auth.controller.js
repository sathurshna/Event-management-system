"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = exports.getMe = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
const auth_utils_1 = require("../utils/auth.utils");
const errorHandler_1 = require("../middleware/errorHandler");
// Helper: send tokens in response
const sendTokenResponse = async (userId, email, res, statusCode = 200) => {
    const payload = { userId, email };
    const accessToken = (0, auth_utils_1.generateAccessToken)(payload);
    const refreshToken = (0, auth_utils_1.generateRefreshToken)(payload);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    // Delete old refresh token for this user to keep it clean (optional logic)
    // Store refresh token in DB
    await db_1.pool.query('INSERT INTO refresh_tokens (id, token, expires_at, user_id) VALUES (?, ?, ?, ?)', [(0, uuid_1.v4)(), refreshToken, expiresAt, userId]);
    // Set refresh token as HTTP-only cookie
    res.cookie(auth_utils_1.REFRESH_TOKEN_COOKIE, refreshToken, auth_utils_1.refreshTokenCookieOptions);
    res.status(statusCode).json({
        success: true,
        accessToken,
    });
};
// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { name, email, password } = req.body;
    // Check if email already taken
    const [existing] = await db_1.pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
        throw new errorHandler_1.AppError('An account with this email already exists.', 409);
    // Hash password and create user
    const hashedPassword = await (0, auth_utils_1.hashPassword)(password);
    const userId = (0, uuid_1.v4)();
    await db_1.pool.query('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', [userId, name, email, hashedPassword]);
    await sendTokenResponse(userId, email, res, 201);
});
// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { email, password } = req.body;
    // Find user
    const [users] = await db_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user)
        throw new errorHandler_1.AppError('Invalid email or password.', 401);
    // Compare password
    const isMatch = await (0, auth_utils_1.comparePassword)(password, user.password);
    if (!isMatch)
        throw new errorHandler_1.AppError('Invalid email or password.', 401);
    await sendTokenResponse(user.id, user.email, res);
});
// ─── Refresh Token ────────────────────────────────────────────────────────────
exports.refresh = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const token = req.cookies[auth_utils_1.REFRESH_TOKEN_COOKIE];
    if (!token)
        throw new errorHandler_1.AppError('No refresh token provided.', 401);
    // Verify the refresh token signature
    const payload = (0, auth_utils_1.verifyRefreshToken)(token);
    // Check it exists in DB and is not expired
    const [storedTokens] = await db_1.pool.query('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
    const stored = storedTokens[0];
    if (!stored || new Date(stored.expires_at) < new Date()) {
        throw new errorHandler_1.AppError('Invalid or expired session. Please log in again.', 401);
    }
    // Delete old refresh token
    await db_1.pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
    // Issue a new pair
    await sendTokenResponse(payload.userId, payload.email, res);
});
// ─── Logout ───────────────────────────────────────────────────────────────────
exports.logout = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const token = req.cookies[auth_utils_1.REFRESH_TOKEN_COOKIE];
    if (token) {
        // Remove from DB
        await db_1.pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
        // Clear cookie
        res.clearCookie(auth_utils_1.REFRESH_TOKEN_COOKIE, { path: '/' });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
});
// ─── Get Me (current user) ────────────────────────────────────────────────────
exports.getMe = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const [users] = await db_1.pool.query('SELECT id, name, email, avatar, expo_push_token, push_enabled, email_enabled, created_at as createdAt FROM users WHERE id = ?', [req.user.userId]);
    const user = users[0];
    if (!user)
        throw new errorHandler_1.AppError('User not found.', 404);
    // Count events and rsvps for the user
    const [eventCountResult] = await db_1.pool.query('SELECT COUNT(*) as count FROM events WHERE host_id = ?', [user.id]);
    const [rsvpCountResult] = await db_1.pool.query('SELECT COUNT(*) as count FROM rsvps WHERE user_id = ?', [user.id]);
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
exports.updateMe = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const { name, avatar, expo_push_token, push_enabled, email_enabled } = req.body;
    // Build the update query dynamically
    const updates = [];
    const values = [];
    if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
    }
    if (avatar !== undefined) {
        updates.push('avatar = ?');
        values.push(avatar);
    }
    if (expo_push_token !== undefined) {
        updates.push('expo_push_token = ?');
        values.push(expo_push_token);
    }
    if (push_enabled !== undefined) {
        updates.push('push_enabled = ?');
        values.push(push_enabled);
    }
    if (email_enabled !== undefined) {
        updates.push('email_enabled = ?');
        values.push(email_enabled);
    }
    if (updates.length > 0) {
        values.push(userId);
        await db_1.pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }
    // Fetch updated user
    const [users] = await db_1.pool.query('SELECT id, name, email, avatar, expo_push_token, push_enabled, email_enabled, created_at, updated_at FROM users WHERE id = ?', [userId]);
    res.status(200).json({
        success: true,
        data: {
            user: users[0],
        },
    });
});
