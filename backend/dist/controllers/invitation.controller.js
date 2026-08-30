"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineInvitation = exports.acceptInvitation = exports.getInvitationInfo = exports.createInvitation = void 0;
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../config/db");
const email_service_1 = require("../services/email.service");
const push_service_1 = require("../services/push.service");
const createInvitation = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const inviterId = req.user.userId;
        const { email, force } = req.body;
        // Check if event exists and if user is the host
        const [events] = await db_1.pool.execute('SELECT host_id, title FROM events WHERE id = ?', [eventId]);
        if (events.length === 0) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        if (String(events[0].host_id).trim() !== String(inviterId).trim()) {
            return res.status(403).json({ success: false, message: `Only host can invite. Event host: ${events[0].host_id}, You: ${inviterId}` });
        }
        const eventTitle = events[0].title;
        // Get Inviter Name
        const [inviter] = await db_1.pool.execute('SELECT name FROM users WHERE id = ?', [inviterId]);
        const inviterName = inviter[0]?.name || 'Someone';
        // Check if already invited
        const [existing] = await db_1.pool.execute('SELECT id, token, accepted, declined FROM invitations WHERE event_id = ? AND email = ?', [eventId, email]);
        let token = '';
        let isResend = false;
        let previousResponse = '';
        if (existing.length > 0) {
            if (!force) {
                return res.status(409).json({ success: false, message: 'This guest is already invited. Are you sure you want to send the invitation again?', requiresConfirmation: true });
            }
            token = existing[0].token;
            isResend = true;
            if (existing[0].accepted)
                previousResponse = 'Accepted';
            else if (existing[0].declined)
                previousResponse = 'Declined';
            // Reset their response if they had already answered, allowing them to change their mind
            if (existing[0].accepted || existing[0].declined) {
                await db_1.pool.execute('UPDATE invitations SET accepted = false, declined = false, note = NULL WHERE id = ?', [existing[0].id]);
            }
        }
        else {
            const id = (0, uuid_1.v4)();
            token = crypto_1.default.randomBytes(32).toString('hex');
            await db_1.pool.execute('INSERT INTO invitations (id, email, token, event_id, inviter_id) VALUES (?, ?, ?, ?, ?)', [id, email, token, eventId, inviterId]);
        }
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const inviteLink = `${clientUrl}/invites/${token}`;
        // Check if the invited email belongs to an existing user
        const [invitedUsers] = await db_1.pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (invitedUsers.length > 0) {
            const invitedUserId = invitedUsers[0].id;
            const notificationId = (0, uuid_1.v4)();
            let message = `${inviterName} ${isResend ? 'reminded you about the invite to' : 'invited you to'} ${eventTitle}`;
            if (previousResponse) {
                message = `${eventTitle}: ${inviterName} invited you again.`;
            }
            await db_1.pool.execute('INSERT INTO notifications (id, type, message, link, user_id) VALUES (?, ?, ?, ?, ?)', [notificationId, 'EVENT_INVITE', message, inviteLink, invitedUserId]);
        }
        // Check email preference and send email
        if (invitedUsers.length > 0) {
            const [prefs] = await db_1.pool.execute('SELECT email_enabled, push_enabled, expo_push_token FROM users WHERE email = ?', [email]);
            if (prefs.length > 0) {
                if (prefs[0].email_enabled !== 0) {
                    await email_service_1.emailService.sendInvitationEmail(email, inviterName, eventTitle, inviteLink).catch(err => console.error("Failed to send invite email", err)).catch(e => console.error("Email failed:", e));
                }
                if (prefs[0].push_enabled !== 0 && prefs[0].expo_push_token) {
                    let pushMessage = `${inviterName} ${isResend ? 'reminded you about the invite to' : 'invited you to'} ${eventTitle}`;
                    if (previousResponse)
                        pushMessage = `${eventTitle}: ${inviterName} invited you again.`;
                    await push_service_1.pushService.sendPushNotification(prefs[0].expo_push_token, 'New Event Invitation! 🎉', pushMessage, { url: inviteLink });
                }
            }
        }
        else {
            // Not a registered user, just send the email anyway
            await email_service_1.emailService.sendInvitationEmail(email, inviterName, eventTitle, inviteLink).catch(err => console.error("Failed to send invite email", err)).catch(e => console.error("Email failed:", e));
        }
        res.status(201).json({ success: true, message: isResend ? 'Invitation resent successfully' : 'Invitation sent successfully', token });
    }
    catch (error) {
        next(error);
    }
};
exports.createInvitation = createInvitation;
const getInvitationInfo = async (req, res, next) => {
    try {
        const { token } = req.params;
        const [invites] = await db_1.pool.execute(`SELECT i.id, i.email, i.accepted, i.declined, i.event_id, e.title, e.date, e.location, u.name as inviter_name 
       FROM invitations i
       JOIN events e ON i.event_id = e.id
       JOIN users u ON i.inviter_id = u.id
       WHERE i.token = ?`, [token]);
        if (invites.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid or expired invitation' });
        }
        res.status(200).json({ success: true, data: invites[0] });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvitationInfo = getInvitationInfo;
const acceptInvitation = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { note } = req.body;
        const [invites] = await db_1.pool.execute('SELECT id, event_id, inviter_id, email, accepted, declined FROM invitations WHERE token = ?', [token]);
        if (invites.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid or expired invitation' });
        }
        if (invites[0].accepted || invites[0].declined) {
            return res.status(400).json({ success: false, message: 'Invitation already responded to' });
        }
        const invite = invites[0];
        const eventId = invite.event_id;
        const inviterId = invite.inviter_id;
        const email = invite.email;
        await db_1.pool.execute('UPDATE invitations SET accepted = true, note = ? WHERE token = ?', [note || null, token]);
        // Check if the guest is a registered user for notification purposes
        const [users] = await db_1.pool.execute('SELECT id, name FROM users WHERE email = ?', [email]);
        let guestName = email;
        if (users.length > 0) {
            guestName = users[0].name;
        }
        // Notify the host
        const notificationId = (0, uuid_1.v4)();
        const message = `${guestName} accepted your invitation` + (note ? ` (Note: ${note})` : '');
        const link = `/events/${eventId}`; // Host can click to go to event details
        await db_1.pool.execute('INSERT INTO notifications (id, type, message, link, user_id) VALUES (?, ?, ?, ?, ?)', [notificationId, 'RSVP_UPDATE', message, link, inviterId]);
        res.status(200).json({ success: true, message: 'Invitation accepted' });
    }
    catch (error) {
        next(error);
    }
};
exports.acceptInvitation = acceptInvitation;
const declineInvitation = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { note } = req.body;
        const [invites] = await db_1.pool.execute('SELECT id, event_id, inviter_id, email, accepted, declined FROM invitations WHERE token = ?', [token]);
        if (invites.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid or expired invitation' });
        }
        if (invites[0].accepted || invites[0].declined) {
            return res.status(400).json({ success: false, message: 'Invitation already responded to' });
        }
        const invite = invites[0];
        const eventId = invite.event_id;
        const inviterId = invite.inviter_id;
        const email = invite.email;
        await db_1.pool.execute('UPDATE invitations SET declined = true, note = ? WHERE token = ?', [note || null, token]);
        // Check if the guest is a registered user for notification purposes
        const [users] = await db_1.pool.execute('SELECT id, name FROM users WHERE email = ?', [email]);
        let guestName = email;
        if (users.length > 0) {
            guestName = users[0].name;
        }
        // Notify the host
        const notificationId = (0, uuid_1.v4)();
        const message = `${guestName} declined your invitation` + (note ? ` (Note: ${note})` : '');
        const link = `/events/${eventId}`; // Host can click to go to event details
        await db_1.pool.execute('INSERT INTO notifications (id, type, message, link, user_id) VALUES (?, ?, ?, ?, ?)', [notificationId, 'RSVP_UPDATE', message, link, inviterId]);
        res.status(200).json({ success: true, message: 'Invitation declined' });
    }
    catch (error) {
        next(error);
    }
};
exports.declineInvitation = declineInvitation;
