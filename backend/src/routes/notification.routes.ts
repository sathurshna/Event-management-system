import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notification.controller';

const router = Router();

router.use(protect); // All notification routes require auth

router.get('/', getMyNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
