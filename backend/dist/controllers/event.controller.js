"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.getEventDetail = exports.getPublicEvents = exports.getMyStats = exports.getMyEvents = exports.createEvent = void 0;
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
const errorHandler_1 = require("../middleware/errorHandler");
// ─── Create Event ─────────────────────────────────────────────────────────────
exports.createEvent = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { title, description, date, endDate, location, isPublic, coverImage } = req.body;
    const hostId = req.user.userId;
    const eventId = (0, uuid_1.v4)();
    const formattedDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    const formattedEndDate = endDate ? new Date(endDate).toISOString().slice(0, 19).replace('T', ' ') : null;
    await db_1.pool.query(`INSERT INTO events (id, title, description, date, end_date, location, is_public, cover_image, host_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [eventId, title, description, formattedDate, formattedEndDate, location, isPublic ? 1 : 0, coverImage, hostId]);
    res.status(201).json({
        success: true,
        data: { id: eventId },
        message: 'Event created successfully',
    });
});
// ─── Helper for Pagination & Search ───────────────────────────────────────────
const buildQuery = (baseQuery, queryParams, isPublic, currentUserId, currentUserEmail) => {
    const { search, date, visibility, page = '1', limit = '10', category = 'all' } = queryParams;
    const conditions = [];
    const values = [];
    if (isPublic) {
        conditions.push('e.is_public = 1');
    }
    else if (currentUserId) {
        if (category === 'hosting') {
            conditions.push('e.host_id = ?');
            values.push(currentUserId);
        }
        else if (category === 'attending') {
            // Attendance definition: RSVP = YES OR (Invitation = ACCEPTED AND NO RSVP EXISTS)
            // RSVP represents the latest explicit manual decision and overrides invitation state.
            let attendCond = `(EXISTS (SELECT 1 FROM rsvps r WHERE r.event_id = e.id AND r.user_id = ? AND r.status = 'ATTENDING')`;
            values.push(currentUserId);
            if (currentUserEmail) {
                attendCond += ` OR (EXISTS (SELECT 1 FROM invitations i WHERE i.event_id = e.id AND i.email = ? AND i.accepted = TRUE) AND NOT EXISTS (SELECT 1 FROM rsvps r2 WHERE r2.event_id = e.id AND r2.user_id = ?))`;
                values.push(currentUserEmail, currentUserId);
            }
            attendCond += `)`;
            conditions.push(attendCond);
        }
        else if (category === 'calendar') {
            // Calendar view: strictly personal (hosting + active RSVP or accepted invite overriding)
            let calCond = `(e.host_id = ? OR EXISTS (SELECT 1 FROM rsvps r WHERE r.event_id = e.id AND r.user_id = ? AND r.status = 'ATTENDING')`;
            values.push(currentUserId, currentUserId);
            if (currentUserEmail) {
                calCond += ` OR (EXISTS (SELECT 1 FROM invitations i WHERE i.event_id = e.id AND i.email = ? AND i.accepted = TRUE) AND NOT EXISTS (SELECT 1 FROM rsvps r2 WHERE r2.event_id = e.id AND r2.user_id = ?))`;
                values.push(currentUserEmail, currentUserId);
            }
            calCond += `)`;
            conditions.push(calCond);
        }
        else {
            // Default to 'all' (Discovery view - includes all public events, and private events user is attending/hosting/invited to)
            let allCond = `(e.is_public = 1 OR e.host_id = ? OR EXISTS (SELECT 1 FROM rsvps r WHERE r.event_id = e.id AND r.user_id = ? AND r.status = 'ATTENDING')`;
            values.push(currentUserId, currentUserId);
            if (currentUserEmail) {
                allCond += ` OR EXISTS (SELECT 1 FROM invitations i WHERE i.event_id = e.id AND i.email = ? AND i.declined = FALSE)`;
                values.push(currentUserEmail);
            }
            allCond += `)`;
            conditions.push(allCond);
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
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const finalQuery = `${baseQuery} ${whereClause} ORDER BY e.date ASC LIMIT ? OFFSET ?`;
    values.push(parseInt(limit), offset);
    return { finalQuery, values };
};
// ─── Get My Events ────────────────────────────────────────────────────────────
exports.getMyEvents = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const hostId = req.user.userId;
    const userEmail = req.user.email;
    const base = `SELECT e.id, e.title, e.description, e.date, e.location, e.is_public, e.cover_image, e.created_at, e.host_id FROM events e`;
    const { finalQuery, values } = buildQuery(base, req.query, false, hostId, userEmail);
    console.log(`[getMyEvents DEBUG] category: ${req.query.category}, hostId: ${hostId}, email: ${userEmail}`);
    console.log(`[getMyEvents DEBUG] Query: ${finalQuery}`);
    console.log(`[getMyEvents DEBUG] Values:`, values);
    const [events] = await db_1.pool.query(finalQuery, values);
    res.status(200).json({ success: true, data: events });
});
// ─── Get My Stats ─────────────────────────────────────────────────────────────
exports.getMyStats = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const hostId = req.user.userId;
    const userEmail = req.user.email;
    const [activeRes] = await db_1.pool.query(`SELECT COUNT(*) as count 
     FROM events e
     WHERE EXISTS (SELECT 1 FROM rsvps r WHERE r.event_id = e.id AND r.user_id = ? AND r.status = 'ATTENDING')
        OR (EXISTS (SELECT 1 FROM invitations i WHERE i.event_id = e.id AND i.email = ? AND i.accepted = TRUE) 
            AND NOT EXISTS (SELECT 1 FROM rsvps r2 WHERE r2.event_id = e.id AND r2.user_id = ?))`, [hostId, userEmail, hostId]);
    const [attendeesRes] = await db_1.pool.query(`SELECT COUNT(r.id) as count 
     FROM rsvps r 
     JOIN events e ON r.event_id = e.id 
     WHERE e.host_id = ? AND r.status = 'ATTENDING'`, [hostId]);
    // Fetch pending invites via email. First get the user's email.
    const [userRes] = await db_1.pool.query('SELECT email FROM users WHERE id = ?', [hostId]);
    let pendingInvitesCount = 0;
    if (userRes.length > 0) {
        const userEmail = userRes[0].email;
        const [invitesRes] = await db_1.pool.query(`SELECT COUNT(id) as count FROM invitations WHERE email = ? AND accepted = FALSE AND declined = FALSE`, [userEmail]);
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
exports.getPublicEvents = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const base = `SELECT e.id, e.title, e.description, e.date, e.location, e.cover_image, u.name as host_name, u.avatar as host_avatar FROM events e JOIN users u ON e.host_id = u.id`;
    const { finalQuery, values } = buildQuery(base, req.query, true);
    const [events] = await db_1.pool.query(finalQuery, values);
    res.status(200).json({ success: true, data: events });
});
// ─── Get Event Detail ─────────────────────────────────────────────────────────
exports.getEventDetail = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const [events] = await db_1.pool.query(`SELECT e.*, u.name as host_name, u.avatar as host_avatar
     FROM events e 
     JOIN users u ON e.host_id = u.id 
     WHERE e.id = ?`, [id]);
    if (events.length === 0)
        throw new errorHandler_1.AppError('Event not found', 404);
    const event = events[0];
    // If it's private, only the host or invited users should see it
    if (!event.is_public && (!req.user || req.user.userId !== event.host_id)) {
        if (!req.user) {
            throw new errorHandler_1.AppError('You do not have permission to view this event', 403);
        }
        // Check if the user has an active RSVP or a non-declined invitation
        const [rsvps] = await db_1.pool.query('SELECT id, status FROM rsvps WHERE event_id = ? AND user_id = ?', [id, req.user.userId]);
        const [invites] = await db_1.pool.query('SELECT id FROM invitations WHERE event_id = ? AND email = ? AND declined = FALSE', [id, req.user.email]);
        if ((rsvps.length === 0 || rsvps[0].status === 'DECLINED') && invites.length === 0) {
            throw new errorHandler_1.AppError('You do not have permission to view this event', 403);
        }
    }
    res.status(200).json({ success: true, data: event });
});
// ─── Update Event ─────────────────────────────────────────────────────────────
exports.updateEvent = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const hostId = req.user.userId;
    // Check if event exists and user is host
    const [events] = await db_1.pool.query('SELECT host_id FROM events WHERE id = ?', [id]);
    if (events.length === 0)
        throw new errorHandler_1.AppError('Event not found', 404);
    if (events[0].host_id !== hostId)
        throw new errorHandler_1.AppError('Not authorized to update this event', 403);
    // Dynamically build the update query
    const fields = [];
    const values = [];
    if (updateData.title !== undefined) {
        fields.push('title = ?');
        values.push(updateData.title);
    }
    if (updateData.description !== undefined) {
        fields.push('description = ?');
        values.push(updateData.description);
    }
    if (updateData.date !== undefined) {
        fields.push('date = ?');
        values.push(new Date(updateData.date).toISOString().slice(0, 19).replace('T', ' '));
    }
    if (updateData.endDate !== undefined) {
        fields.push('end_date = ?');
        values.push(updateData.endDate ? new Date(updateData.endDate).toISOString().slice(0, 19).replace('T', ' ') : null);
    }
    if (updateData.location !== undefined) {
        fields.push('location = ?');
        values.push(updateData.location);
    }
    if (updateData.isPublic !== undefined) {
        fields.push('is_public = ?');
        values.push(updateData.isPublic ? 1 : 0);
    }
    if (updateData.coverImage !== undefined) {
        fields.push('cover_image = ?');
        values.push(updateData.coverImage);
    }
    if (fields.length === 0)
        throw new errorHandler_1.AppError('No data provided to update', 400);
    values.push(id); // For the WHERE clause
    await db_1.pool.query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values);
    res.status(200).json({ success: true, message: 'Event updated successfully' });
});
// ─── Delete Event ─────────────────────────────────────────────────────────────
exports.deleteEvent = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const hostId = req.user.userId;
    const [result] = await db_1.pool.query('DELETE FROM events WHERE id = ? AND host_id = ?', [id, hostId]);
    if (result.affectedRows === 0) {
        throw new errorHandler_1.AppError('Event not found or not authorized to delete', 404);
    }
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
});
