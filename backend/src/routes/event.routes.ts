import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { validate, createEventSchema, updateEventSchema } from '../middleware/validate';
import {
  createEvent,
  getMyEvents,
  getPublicEvents,
  getEventDetail,
  updateEvent,
  deleteEvent,
  getMyStats
} from '../controllers/event.controller';

import { submitRsvp, getEventAttendees } from '../controllers/rsvp.controller';
import { createInvitation } from '../controllers/invitation.controller';
import { rsvpSchema, invitationSchema } from '../middleware/validate';

const router = Router();

// Public routes (anyone can see)
router.get('/public', getPublicEvents);

// Protected routes (require JWT auth)
// We handle optional auth for GET /:id inside the route.
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

router.get('/stats', protect, getMyStats);
router.get('/:id', optionalAuth, getEventDetail);

// Fully protected routes
router.use(protect); // Applies to all routes below this line
router.post('/', validate(createEventSchema), createEvent);
router.get('/', getMyEvents);
router.put('/:id', validate(updateEventSchema), updateEvent);
router.delete('/:id', deleteEvent);

// RSVP & Invites
router.post('/:id/rsvp', validate(rsvpSchema), submitRsvp);
router.get('/:id/rsvps', getEventAttendees);
router.post('/:id/invites', validate(invitationSchema), createInvitation);

export default router;
