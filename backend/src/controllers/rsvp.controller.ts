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
    const [events] = await pool.execute<RowDataPacket[]>('SELECT id FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if RSVP exists
    const [rsvps] = await pool.execute<RowDataPacket[]>('SELECT id FROM rsvps WHERE user_id = ? AND event_id = ?', [userId, eventId]);

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
