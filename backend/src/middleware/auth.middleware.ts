import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/auth.utils';
import { AppError } from './errorHandler';

// Extend Express Request type to include our user payload
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const protect = (req: Request, _res: Response, next: NextFunction) => {
  try {
    // 1. Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Not authenticated. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify the token (throws if invalid or expired)
    const decoded = verifyAccessToken(token);

    // 3. Attach user payload to request for downstream use
    req.user = decoded;

    next();
  } catch (err) {
    next(err);
  }
};
