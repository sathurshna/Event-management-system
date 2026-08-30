"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenCookieOptions = exports.REFRESH_TOKEN_COOKIE = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
// ─── Password Helpers ─────────────────────────────────────────────────────────
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, env_1.env.BCRYPT_ROUNDS);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, {
        expiresIn: env_1.env.JWT_ACCESS_EXPIRES,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
// ─── Cookie Helpers ───────────────────────────────────────────────────────────
exports.REFRESH_TOKEN_COOKIE = 'refreshToken';
exports.refreshTokenCookieOptions = {
    httpOnly: true, // not accessible via JS (XSS protection)
    secure: env_1.env.NODE_ENV === 'production',
    sameSite: (env_1.env.NODE_ENV === 'production' ? 'none' : 'lax'),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
};
