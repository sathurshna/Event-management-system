import { Request, Response } from 'express';
import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { CreateEventInput, UpdateEventInput } from '../middleware/validate';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ─── Create Event ─────────────────────────────────────────────────────────────
export const createEvent = catchAsync(async (req: Request, res: Response) => {
  const { title, description, date, endDate, location, isPublic, coverImage } = req.body as CreateEventInput;
  const hostId = req.user!.userId;
  const eventId = uuidv4();

  const formattedDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');
  const formattedEndDate = endDate ? new Date(endDate).toISOString().slice(0, 19).replace('T', ' ') : null;

  await pool.query(
    `INSERT INTO events (id, title, description, date, end_date, location, is_public, cover_image, host_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [eventId, title, description, formattedDate, formattedEndDate, location, isPublic ? 1 : 0, coverImage, hostId]
  );

  // Auto-RSVP the host as ATTENDING
  const rsvpId = uuidv4();
  await pool.query(
    `INSERT INTO rsvps (id, event_id, user_id, status) VALUES (?, ?, ?, 'ATTENDING')
     ON DUPLICATE KEY UPDATE status = 'ATTENDING'`,
    [rsvpId, eventId, hostId]
  );

  res.status(201).json({
    success: true,
    data: { id: eventId },
    message: 'Event created successfully',
  });
});

// ─── Helper for Pagination & Search ───────────────────────────────────────────
const buildQuery = (baseQuery: string, queryParams: any, isPublic: boolean, hostId?: string) => {
  const { search, date, visibility, page = '1', limit = '10', category = 'all' } = queryParams;
  const conditions: string[] = [];
  const values: any[] = [];

  if (isPublic) {
    conditions.push('e.is_public = 1');
  } else if (hostId) {
    if (category === 'hosting') {
      conditions.push('e.host_id = ?');
      values.push(hostId);
    } else if (category === 'attending') {
      conditions.push(`(e.host_id != ? AND EXISTS (SELECT 1 FROM rsvps r WHERE r.event_id = e.id AND r.user_id = ? AND r.status = 'ATTENDING'))`);
      values.push(hostId, hostId);
    } else if (category === 'calendar') {
      // Calendar view: strictly personal (hosting or active RSVP)
      conditions.push(`(e.host_id = ? OR EXISTS (SELECT 1 FROM rsvps r WHERE r.event_id = e.id AND r.user_id = ? AND r.status != 'DECLINED'))`);
      values.push(hostId, hostId);
    } else {
      // Default to 'all' (Discovery view - includes all public events, and private events user is attending/hosting)
      conditions.push(`(e.host_id = ? OR e.is_public = 1 OR EXISTS (SELECT 1 FROM rsvps r WHERE r.event_id = e.id AND r.user_id = ? AND r.status = 'ATTENDING'))`);
      values.push(hostId, hostId);
    }
  }

  if (search) {
    conditions.push('(e.title LIKE ? OR e.description LIKE ?)');
    values.push(`%${search}%`, `%${search}%`);
  }

  if (date) {
    conditions.push('DATE(e.date) = ?');
    values.push(date);
  }
  
  if (!isPublic && visibility) {
    conditions.push('e.is_public = ?');
    values.push(visibility === 'public' ? 1 : 0);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
  
  const finalQuery = `${baseQuery} ${whereClause} ORDER BY e.date ASC LIMIT ? OFFSET ?`;
  values.push(parseInt(limit as string), offset);

  return { finalQuery, values };
};

// ─── Get My Events ────────────────────────────────────────────────────────────
export const getMyEvents = catchAsync(async (req: Request, res: Response) => {
  const hostId = req.user!.userId;
  const base = `SELECT e.id, e.title, e.description, e.date, e.location, e.is_public, e.cover_image, e.created_at, e.host_id FROM events e`;
  const { finalQuery, values } = buildQuery(base, req.query, false, hostId);

  const [events] = await pool.query<RowDataPacket[]>(finalQuery, values);
  res.status(200).json({ success: true, data: events });
});

// ─── Get My Stats ─────────────────────────────────────────────────────────────
export const getMyStats = catchAsync(async (req: Request, res: Response) => {
  const hostId = req.user!.userId;
  
  const [activeRes] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(r.id) as count 
     FROM rsvps r 
     WHERE r.user_id = ? AND r.status = 'ATTENDING'`,
    [hostId]
  );
  
  const [attendeesRes] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(r.id) as count 
     FROM rsvps r 
     JOIN events e ON r.event_id = e.id 
     WHERE e.host_id = ? AND r.status = 'ATTENDING'`,
    [hostId]
  );

  // Fetch pending invites via email. First get the user's email.
  const [userRes] = await pool.query<RowDataPacket[]>('SELECT email FROM users WHERE id = ?', [hostId]);
  let pendingInvitesCount = 0;
  if (userRes.length > 0) {
    const userEmail = userRes[0].email;
    const [invitesRes] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(id) as count FROM invitations WHERE email = ? AND accepted = FALSE AND declined = FALSE`,
      [userEmail]
    );
    pendingInvitesCount = invitesRes[0].count;
  }

  res.status(200).json({
    success: true,
    data: {
      activeEvents: activeRes[0].count,
      totalAttendees: attendeesRes[0].count,
      pendingInvites: pendingInvitesCount,
      avgRating: 4.8
    }
  });
});

// ─── Get Public Events ────────────────────────────────────────────────────────
export const getPublicEvents = catchAsync(async (req: Request, res: Response) => {
  const base = `SELECT e.id, e.title, e.description, e.date, e.location, e.cover_image, u.name as host_name, u.avatar as host_avatar FROM events e JOIN users u ON e.host_id = u.id`;
  const { finalQuery, values } = buildQuery(base, req.query, true);

  const [events] = await pool.query<RowDataPacket[]>(finalQuery, values);
  res.status(200).json({ success: true, data: events });
});

// ─── Get Event Detail ─────────────────────────────────────────────────────────
export const getEventDetail = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const [events] = await pool.query<RowDataPacket[]>(
    `SELECT e.*, u.name as host_name, u.avatar as host_avatar
     FROM events e 
     JOIN users u ON e.host_id = u.id 
     WHERE e.id = ?`,
    [id]
  );

  if (events.length === 0) throw new AppError('Event not found', 404);
  const event = events[0];

  // If it's private, only the host or invited users should see it
  if (!event.is_public && (!req.user || req.user.userId !== event.host_id)) {
    if (!req.user) {
      throw new AppError('You do not have permission to view this event', 403);
    }
    // Check if the user is invited and accepted (has an RSVP)
    const [rsvps] = await pool.query<RowDataPacket[]>('SELECT id, status FROM rsvps WHERE event_id = ? AND user_id = ?', [id, req.user.userId]);
    if (rsvps.length === 0 || rsvps[0].status === 'DECLINED') {
      throw new AppError('You do not have permission to view this event', 403);
    }
  }

  res.status(200).json({ success: true, data: event });
});

// ─── Update Event ─────────────────────────────────────────────────────────────
export const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body as UpdateEventInput;
  const hostId = req.user!.userId;

  // Check if event exists and user is host
  const [events] = await pool.query<RowDataPacket[]>('SELECT host_id FROM events WHERE id = ?', [id]);
  if (events.length === 0) throw new AppError('Event not found', 404);
  if (events[0].host_id !== hostId) throw new AppError('Not authorized to update this event', 403);

  // Dynamically build the update query
  const fields: string[] = [];
  const values: any[] = [];

  if (updateData.title !== undefined) { fields.push('title = ?'); values.push(updateData.title); }
  if (updateData.description !== undefined) { fields.push('description = ?'); values.push(updateData.description); }
  if (updateData.date !== undefined) { 
    fields.push('date = ?'); 
    values.push(new Date(updateData.date).toISOString().slice(0, 19).replace('T', ' ')); 
  }
  if (updateData.endDate !== undefined) { 
    fields.push('end_date = ?'); 
    values.push(updateData.endDate ? new Date(updateData.endDate).toISOString().slice(0, 19).replace('T', ' ') : null); 
  }
  if (updateData.location !== undefined) { fields.push('location = ?'); values.push(updateData.location); }
  if (updateData.isPublic !== undefined) { fields.push('is_public = ?'); values.push(updateData.isPublic ? 1 : 0); }
  if (updateData.coverImage !== undefined) { fields.push('cover_image = ?'); values.push(updateData.coverImage); }

  if (fields.length === 0) throw new AppError('No data provided to update', 400);

  values.push(id); // For the WHERE clause

  await pool.query(
    `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  res.status(200).json({ success: true, message: 'Event updated successfully' });
});

// ─── Delete Event ─────────────────────────────────────────────────────────────
export const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const hostId = req.user!.userId;

  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM events WHERE id = ? AND host_id = ?',
    [id, hostId]
  );

  if (result.affectedRows === 0) {
    throw new AppError('Event not found or not authorized to delete', 404);
  }

  res.status(200).json({ success: true, message: 'Event deleted successfully' });
});
