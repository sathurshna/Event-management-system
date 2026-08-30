import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db';
import { RsvpInput } from '../middleware/validate';
import { RowDataPacket } from 'mysql2';

// ─── Submit RSVP ──────────────────────────────────────────────────────────────
export const submitRsvp = async (
  req: Request<{ id: string }, {}, RsvpInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;
    const userId = req.user!.userId;
    const { status, note } = req.body;

    // Check if event exists
    const [events] = await pool.execute<RowDataPacket[]>('SELECT id, host_id, is_public, title FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const event = events[0];
    if (event.host_id === userId) {
      return res.status(400).json({ success: false, message: 'Hosts cannot RSVP to their own events' });
    }

    // Check if RSVP exists
    const [rsvps] = await pool.execute<RowDataPacket[]>('SELECT id, status FROM rsvps WHERE user_id = ? AND event_id = ?', [userId, eventId]);
    const previousStatus = rsvps.length > 0 ? rsvps[0].status : null;

    if (rsvps.length > 0) {
      // Update existing
      await pool.execute('UPDATE rsvps SET status = ?, note = ? WHERE user_id = ? AND event_id = ?', [status, note ?? null, userId, eventId]);
    } else {
      // Create new
      const id = uuidv4();
      await pool.execute(
        'INSERT INTO rsvps (id, status, note, user_id, event_id) VALUES (?, ?, ?, ?, ?)',
        [id, status, note ?? null, userId, eventId]
      );
    }

    // Notify host if someone changes their RSVP status on a public event
    if (event.is_public === 1 && status !== previousStatus && userId !== event.host_id) {
      const [users] = await pool.execute<RowDataPacket[]>('SELECT name FROM users WHERE id = ?', [userId]);
      const userName = users[0]?.name || 'Someone';
      
      let actionText = '';
      if (status === 'ATTENDING') actionText = 'is attending';
      else if (status === 'MAYBE') actionText = 'might attend';
      else if (status === 'DECLINED') actionText = 'is no longer attending';
      
      const notificationId = uuidv4();
      const message = `${userName} ${actionText} your public event: ${event.title}`;
      
      await pool.execute(
        `INSERT INTO notifications (id, type, message, user_id, link) VALUES (?, 'RSVP_UPDATE', ?, ?, ?)`,
        [notificationId, message, event.host_id, `/events/${eventId}`]
      );
      
      try {
        const { sendPushNotificationToUser } = require('../services/push.service');
        await sendPushNotificationToUser(event.host_id, 'RSVP Update', message, { url: `/events/${eventId}` });
      } catch (err) {
        console.error('Failed to send push notification:', err);
      }
    }

    res.status(200).json({ success: true, message: 'RSVP updated successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Get Event Attendees ──────────────────────────────────────────────────────
export const getEventAttendees = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;

    const [attendees] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id as user_id, u.name, u.avatar
       FROM events e
       JOIN users u ON e.host_id = u.id
       WHERE e.id = ?
       
       UNION
       
       SELECT u.id as user_id, u.name, u.avatar
       FROM rsvps r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ? AND r.status = 'ATTENDING'
       
       UNION
       
       SELECT u.id as user_id, u.name, u.avatar
       FROM invitations i
       JOIN users u ON i.email = u.email
       WHERE i.event_id = ? AND i.accepted = TRUE
         AND NOT EXISTS (SELECT 1 FROM rsvps r2 WHERE r2.event_id = i.event_id AND r2.user_id = u.id)`,
      [eventId, eventId, eventId]
    );

    // Note: we just default role to 'GUEST' in the API mapping for simplicity, except for the host
    const [eventRecord] = await pool.execute<RowDataPacket[]>('SELECT host_id FROM events WHERE id = ?', [eventId]);
    const hostId = eventRecord[0]?.host_id;

    const mappedAttendees = attendees.map(a => ({
      ...a,
      role: a.user_id === hostId ? 'HOST' : 'GUEST',
      status: 'ATTENDING'
    }));

    res.status(200).json({ success: true, data: mappedAttendees });
  } catch (error) {
    next(error);
  }
};

// ─── Get My RSVPs ─────────────────────────────────────────────────────────────
export const getMyRsvps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const [myRsvps] = await pool.execute<RowDataPacket[]>(
      `SELECT r.id as rsvp_id, r.status as rsvp_status, e.* 
       FROM rsvps r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ?
       ORDER BY e.date ASC`,
      [userId]
    );

    res.status(200).json({ success: true, data: myRsvps });
  } catch (error) {
    next(error);
  }
};

// ─── Get My RSVP For Event ────────────────────────────────────────────────────
export const getMyRsvpForEvent = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;
    const userId = req.user!.userId;
    const email = req.user!.email;

    let rsvpStatus = null;
    let rsvpNote = null;

    // Check RSVP table
    const [rsvps] = await pool.execute<RowDataPacket[]>(
      'SELECT status, note FROM rsvps WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );

    if (rsvps.length > 0) {
      rsvpStatus = rsvps[0].status;
      rsvpNote = rsvps[0].note;
    } else if (email) {
      // Check invitations if no RSVP exists
      const [invites] = await pool.execute<RowDataPacket[]>(
        'SELECT accepted, declined, note FROM invitations WHERE email = ? AND event_id = ?',
        [email, eventId]
      );
      if (invites.length > 0) {
        if (invites[0].accepted) rsvpStatus = 'ATTENDING';
        else if (invites[0].declined) rsvpStatus = 'DECLINED';
        rsvpNote = invites[0].note;
      }
    }

    res.status(200).json({ success: true, data: rsvpStatus ? { status: rsvpStatus, note: rsvpNote } : null });
  } catch (error) {
    next(error);
  }
};
