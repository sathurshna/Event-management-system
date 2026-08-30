"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.catchAsync = exports.AppError = void 0;
// ─── Custom App Error ─────────────────────────────────────────────────────────
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// ─── Async Wrapper ────────────────────────────────────────────────────────────
// Wraps async route handlers so you don't need try/catch in every controller
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
// ─── Global Error Handler ─────────────────────────────────────────────────────
const errorHandler = (err, _req, res, _next) => {
    // Operational errors (our AppError) — safe to send to client
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token. Please log in again.',
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Your session has expired. Please log in again.',
        });
    }
    // Unhandled / unexpected errors — don't leak internal details
    console.error('💥 Unexpected error:', err);
    return res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again later.',
    });
};
exports.errorHandler = errorHandler;
