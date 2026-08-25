import { Router } from 'express';
import { getInvitationInfo, acceptInvitation, declineInvitation } from '../controllers/invitation.controller';

const router = Router();

// These endpoints are generally public because the user might not be logged in when clicking the invite link
router.get('/:token', getInvitationInfo);
router.post('/:token/accept', acceptInvitation);
router.post('/:token/decline', declineInvitation);

export default router;
