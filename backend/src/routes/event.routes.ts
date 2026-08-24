import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { validate, createEventSchema, updateEventSchema } from '../middleware/validate';
import {
  createEvent,
  getMyEvents,
  getPublicEvents,
  getEventDetail,
  updateEvent,
  deleteEvent
} from '../controllers/event.controller';

const router = Router();

// Public routes (anyone can see)
router.get('/public', getPublicEvents);

// Protected routes (require JWT auth)
// Optional: If we want getEventDetail to be semi-public, we can extract the token conditionally inside the controller,
// but for simplicity, let's say only authenticated users can view event details (or we skip protect for GET /:id and handle it inside)

router.get('/:id', getEventDetail); // We'll handle optional auth inside or assume we need to pass a token if it's private. Actually, let's keep it unprotected here, and handle private logic in controller. But we need `req.user` if it's there. 

// A specialized middleware that populates `req.user` if a token is present, but doesn't throw if it isn't.
import { verifyAccessToken } from '../utils/auth.utils';
const optionalAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = verifyAccessToken(token);
    } catch (error) {
      // ignore
    }
  }
  next();
};

router.get('/:id', optionalAuth, getEventDetail);

// Fully protected routes
router.use(protect); // Applies to all routes below this line
router.post('/', validate(createEventSchema), createEvent);
router.get('/', getMyEvents);
router.put('/:id', validate(updateEventSchema), updateEvent);
router.delete('/:id', deleteEvent);

export default router;
