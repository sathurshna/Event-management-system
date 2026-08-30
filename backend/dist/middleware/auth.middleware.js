"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const auth_utils_1 = require("../utils/auth.utils");
const errorHandler_1 = require("./errorHandler");
const protect = (req, _res, next) => {
    try {
        // 1. Get token from Authorization header: "Bearer <token>"
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('Not authenticated. Please log in.', 401);
        }
        const token = authHeader.split(' ')[1];
        // 2. Verify the token (throws if invalid or expired)
        const decoded = (0, auth_utils_1.verifyAccessToken)(token);
        // 3. Attach user payload to request for downstream use
        req.user = decoded;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.protect = protect;
