import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db';
import { RsvpInput } from '../middleware/validate';
import { RowDataPacket } from 'mysql2';

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

export const getEventAttendees = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;

    const [attendees] = await pool.execute<RowDataPacket[]>(
      `SELECT r.id as rsvp_id, r.status, r.note, r.created_at, u.id as user_id, u.name, u.avatar 
       FROM rsvps r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ?`,
      [eventId]
    );

    res.status(200).json({ success: true, data: attendees });
  } catch (error) {
    next(error);
  }
};

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
