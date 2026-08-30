"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invitation_controller_1 = require("../controllers/invitation.controller");
const router = (0, express_1.Router)();
// These endpoints are generally public because the user might not be logged in when clicking the invite link
router.get('/:token', invitation_controller_1.getInvitationInfo);
router.post('/:token/accept', invitation_controller_1.acceptInvitation);
router.post('/:token/decline', invitation_controller_1.declineInvitation);
exports.default = router;
