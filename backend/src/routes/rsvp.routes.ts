import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getMyRsvps } from '../controllers/rsvp.controller';

const router = Router();

router.use(protect);
router.get('/me', getMyRsvps);

export default router;
