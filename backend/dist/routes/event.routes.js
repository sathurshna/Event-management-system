"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_1 = require("../middleware/validate");
const event_controller_1 = require("../controllers/event.controller");
const rsvp_controller_1 = require("../controllers/rsvp.controller");
const invitation_controller_1 = require("../controllers/invitation.controller");
const validate_2 = require("../middleware/validate");
const router = (0, express_1.Router)();
// Public routes (anyone can see)
router.get('/public', event_controller_1.getPublicEvents);
// Protected routes (require JWT auth)
// We handle optional auth for GET /:id inside the route.
const auth_utils_1 = require("../utils/auth.utils");
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            req.user = (0, auth_utils_1.verifyAccessToken)(token);
        }
        catch (error) {
            // ignore
        }
    }
    next();
};
router.get('/stats', auth_middleware_1.protect, event_controller_1.getMyStats);
router.get('/:id', optionalAuth, event_controller_1.getEventDetail);
// Fully protected routes
router.use(auth_middleware_1.protect); // Applies to all routes below this line
router.post('/', (0, validate_1.validate)(validate_1.createEventSchema), event_controller_1.createEvent);
router.get('/', event_controller_1.getMyEvents);
router.put('/:id', (0, validate_1.validate)(validate_1.updateEventSchema), event_controller_1.updateEvent);
router.delete('/:id', event_controller_1.deleteEvent);
// RSVP & Invites
router.post('/:id/rsvp', (0, validate_1.validate)(validate_2.rsvpSchema), rsvp_controller_1.submitRsvp);
router.get('/:id/my-rsvp', rsvp_controller_1.getMyRsvpForEvent);
router.get('/:id/rsvps', rsvp_controller_1.getEventAttendees);
router.post('/:id/invites', (0, validate_1.validate)(validate_2.invitationSchema), invitation_controller_1.createInvitation);
exports.default = router;
