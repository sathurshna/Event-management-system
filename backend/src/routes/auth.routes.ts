import { Router } from 'express';
import { register, login, refresh, logout, getMe, updateMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate, registerSchema, loginSchema } from '../middleware/validate';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login',    validate(loginSchema),    login);
router.post('/refresh',                            refresh);
router.post('/logout',                             logout);

// Protected routes (requires valid access token)
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
