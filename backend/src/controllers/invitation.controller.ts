import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { pool } from '../config/db';
import { InvitationInput } from '../middleware/validate';
import { RowDataPacket } from 'mysql2';
import { emailService } from '../services/email.service';
import { pushService } from '../services/push.service';

export const createInvitation = async (
  req: Request<{ id: string }, {}, InvitationInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;
    const inviterId = req.user!.userId;
    const { email, force } = req.body;

    // Check if event exists and if user is the host
    const [events] = await pool.execute<RowDataPacket[]>('SELECT host_id, title FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    if (String(events[0].host_id).trim() !== String(inviterId).trim()) {
      return res.status(403).json({ success: false, message: 'Only the host can send invitations' });
    }

    const eventTitle = events[0].title;
    
    // Get Inviter Name
    const [inviter] = await pool.execute<RowDataPacket[]>('SELECT name FROM users WHERE id = ?', [inviterId]);
    const inviterName = inviter[0]?.name || 'Someone';

    // Check if already invited
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id, token, accepted, declined FROM invitations WHERE event_id = ? AND email = ?',
      [eventId, email]
    );

    let token = '';
    let isResend = false;
    let previousResponse = '';

    if (existing.length > 0) {
      if (!force) {
        return res.status(409).json({ success: false, message: 'This guest is already invited. Are you sure you want to send the invitation again?', requiresConfirmation: true });
      }

      token = existing[0].token;
      isResend = true;

      if (existing[0].accepted) previousResponse = 'Accepted';
      else if (existing[0].declined) previousResponse = 'Declined';

      // Reset their response if they had already answered, allowing them to change their mind
      if (existing[0].accepted || existing[0].declined) {
        await pool.execute(
          'UPDATE invitations SET accepted = false, declined = false, note = NULL WHERE id = ?',
          [existing[0].id]
        );
      }
    } else {
      const id = uuidv4();
      token = crypto.randomBytes(32).toString('hex');

      await pool.execute(
        'INSERT INTO invitations (id, email, token, event_id, inviter_id) VALUES (?, ?, ?, ?, ?)',
        [id, email, token, eventId, inviterId]
      );
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${clientUrl}/invites/${token}`;
    
    // Check if the invited email belongs to an existing user
    const [invitedUsers] = await pool.execute<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
    if (invitedUsers.length > 0) {
      const invitedUserId = invitedUsers[0].id;
      const notificationId = uuidv4();

      let message = `${inviterName} ${isResend ? 'reminded you about the invite to' : 'invited you to'} ${eventTitle}`;
      if (previousResponse) {
        message = `${eventTitle}: ${inviterName} invited you again.`;
      }

      await pool.execute(
        'INSERT INTO notifications (id, type, message, link, user_id) VALUES (?, ?, ?, ?, ?)',
        [notificationId, 'EVENT_INVITE', message, inviteLink, invitedUserId]
      );
    }

    // Check email preference and send email
    if (invitedUsers.length > 0) {
      const [prefs] = await pool.execute<RowDataPacket[]>('SELECT email_enabled, push_enabled, expo_push_token FROM users WHERE email = ?', [email]);
      
      if (prefs.length > 0) {
        if (prefs[0].email_enabled !== 0) {
          await emailService.sendInvitationEmail(email, inviterName, eventTitle, inviteLink).catch(err => console.error("Failed to send invite email", err));
        }

        if (prefs[0].push_enabled !== 0 && prefs[0].expo_push_token) {
          let pushMessage = `${inviterName} ${isResend ? 'reminded you about the invite to' : 'invited you to'} ${eventTitle}`;
          if (previousResponse) pushMessage = `${eventTitle}: ${inviterName} invited you again.`;
          
          await pushService.sendPushNotification(
            prefs[0].expo_push_token,
            'New Event Invitation! 🎉',
            pushMessage,
            { url: inviteLink }
          );
        }
      }
    } else {
      // Not a registered user, just send the email anyway
      await emailService.sendInvitationEmail(email, inviterName, eventTitle, inviteLink).catch(err => console.error("Failed to send invite email", err));
    }
    res.status(201).json({ success: true, message: isResend ? 'Invitation resent successfully' : 'Invitation sent successfully', token });
  } catch (error) {
    next(error);
  }
};

export const getInvitationInfo = async (
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    const [invites] = await pool.execute<RowDataPacket[]>(
      `SELECT i.id, i.email, i.accepted, i.declined, i.event_id, e.title, e.date, e.location, u.name as inviter_name 
       FROM invitations i
       JOIN events e ON i.event_id = e.id
       JOIN users u ON i.inviter_id = u.id
       WHERE i.token = ?`,
      [token]
    );

    if (invites.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or expired invitation' });
    }

    res.status(200).json({ success: true, data: invites[0] });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { note } = req.body;
    
    const [invites] = await pool.execute<RowDataPacket[]>(
      'SELECT id, event_id, inviter_id, email, accepted, declined FROM invitations WHERE token = ?',
      [token]
    );

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

    await pool.execute('UPDATE invitations SET accepted = true, note = ? WHERE token = ?', [note || null, token]);

    // Check if the guest is a registered user
    const [users] = await pool.execute<RowDataPacket[]>('SELECT id, name FROM users WHERE email = ?', [email]);
    let guestName = email;

    if (users.length > 0) {
      const userId = users[0].id;
      guestName = users[0].name;

      // Auto-RSVP
      const [existingRsvp] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM rsvps WHERE user_id = ? AND event_id = ?',
        [userId, eventId]
      );

      if (existingRsvp.length > 0) {
        await pool.execute('UPDATE rsvps SET status = ? WHERE id = ?', ['ATTENDING', existingRsvp[0].id]);
      } else {
        await pool.execute(
          'INSERT INTO rsvps (id, status, user_id, event_id) VALUES (?, ?, ?, ?)',
          [uuidv4(), 'ATTENDING', userId, eventId]
        );
      }
    }

    // Notify the host
    const notificationId = uuidv4();
    const message = `${guestName} accepted your invitation` + (note ? ` (Note: ${note})` : '');
    const link = `/events/${eventId}`; // Host can click to go to event details
    
    await pool.execute(
      'INSERT INTO notifications (id, type, message, link, user_id) VALUES (?, ?, ?, ?, ?)',
      [notificationId, 'RSVP_UPDATE', message, link, inviterId]
    );
    
    res.status(200).json({ success: true, message: 'Invitation accepted' });
  } catch (error) {
    next(error);
  }
};

export const declineInvitation = async (
  req: Request<{ token: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { note } = req.body;
    
    const [invites] = await pool.execute<RowDataPacket[]>(
      'SELECT id, event_id, inviter_id, email, accepted, declined FROM invitations WHERE token = ?',
      [token]
    );

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

    await pool.execute('UPDATE invitations SET declined = true, note = ? WHERE token = ?', [note || null, token]);

    // Check if the guest is a registered user
    const [users] = await pool.execute<RowDataPacket[]>('SELECT id, name FROM users WHERE email = ?', [email]);
    let guestName = email;

    if (users.length > 0) {
      const userId = users[0].id;
      guestName = users[0].name;

      // Auto-RSVP (Declined)
      const [existingRsvp] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM rsvps WHERE user_id = ? AND event_id = ?',
        [userId, eventId]
      );

      if (existingRsvp.length > 0) {
        await pool.execute('UPDATE rsvps SET status = ? WHERE id = ?', ['DECLINED', existingRsvp[0].id]);
      } else {
        await pool.execute(
          'INSERT INTO rsvps (id, status, user_id, event_id) VALUES (?, ?, ?, ?)',
          [uuidv4(), 'DECLINED', userId, eventId]
        );
      }
    }

    // Notify the host
    const notificationId = uuidv4();
    const message = `${guestName} declined your invitation` + (note ? ` (Note: ${note})` : '');
    const link = `/events/${eventId}`; // Host can click to go to event details
    
    await pool.execute(
      'INSERT INTO notifications (id, type, message, link, user_id) VALUES (?, ?, ?, ?, ?)',
      [notificationId, 'RSVP_UPDATE', message, link, inviterId]
    );
    
    res.status(200).json({ success: true, message: 'Invitation declined' });
  } catch (error) {
    next(error);
  }
};
