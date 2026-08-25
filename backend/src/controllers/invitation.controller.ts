import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { pool } from '../config/db';
import { InvitationInput } from '../middleware/validate';
import { RowDataPacket } from 'mysql2';
import { sendInvitationEmail } from '../utils/email.utils';

export const createInvitation = async (
  req: Request<{ id: string }, {}, InvitationInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;
    const inviterId = req.user!.userId;
    const { email } = req.body;

    // Check if event exists and if user is the host
    const [events] = await pool.execute<RowDataPacket[]>('SELECT host_id, title FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    if (events[0].host_id !== inviterId) {
      return res.status(403).json({ success: false, message: 'Only the host can send invitations' });
    }

    const eventTitle = events[0].title;
    
    // Get Inviter Name
    const [inviter] = await pool.execute<RowDataPacket[]>('SELECT name FROM users WHERE id = ?', [inviterId]);
    const inviterName = inviter[0]?.name || 'Someone';

    // Check if already invited
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM invitations WHERE event_id = ? AND email = ?',
      [eventId, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User is already invited' });
    }

    const id = uuidv4();
    const token = crypto.randomBytes(32).toString('hex');

    await pool.execute(
      'INSERT INTO invitations (id, email, token, event_id, inviter_id) VALUES (?, ?, ?, ?, ?)',
      [id, email, token, eventId, inviterId]
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${clientUrl}/invites/${token}`;
    
    // Check if the invited email belongs to an existing user
    const [invitedUsers] = await pool.execute<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
    if (invitedUsers.length > 0) {
      const invitedUserId = invitedUsers[0].id;
      const notificationId = uuidv4();
      await pool.execute(
        'INSERT INTO notifications (id, type, message, link, user_id) VALUES (?, ?, ?, ?, ?)',
        [notificationId, 'EVENT_INVITE', `${inviterName} invited you to ${eventTitle}`, inviteLink, invitedUserId]
      );
    }

    // Send Email via Nodemailer
    // We do not await this to avoid blocking the response, or we can await it if we want to ensure it sent
    await sendInvitationEmail(email, inviterName, eventTitle, inviteLink).catch(err => console.error("Failed to send invite email", err));

    res.status(201).json({ success: true, message: 'Invitation sent successfully', token });
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
      `SELECT i.id, i.email, i.accepted, i.declined, e.title, e.date, e.location, u.name as inviter_name 
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
