"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../config/db");
const email_service_1 = require("../services/email.service");
const uuid_1 = require("uuid");
const initCronJobs = () => {
    // Run every minute for testing, or hourly
    // We'll use '* * * * *' to run every minute in dev just to test, but the prompt says 24h.
    // Actually, we should run hourly: '0 * * * *'
    node_cron_1.default.schedule('0 * * * *', async () => {
        console.log('⏰ Running hourly event reminder cron job...');
        try {
            // Find events starting between 24 and 25 hours from now
            // This ensures we catch every event exactly once per day, since the cron runs hourly
            const [events] = await db_1.pool.execute(`SELECT id, title, date 
         FROM events 
         WHERE date >= DATE_ADD(NOW(), INTERVAL 24 HOUR)
         AND date < DATE_ADD(NOW(), INTERVAL 25 HOUR)`);
            if (events.length === 0) {
                return;
            }
            console.log(`Found ${events.length} events starting in ~24 hours.`);
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            for (const event of events) {
                // Find all attendees for this event
                const [attendees] = await db_1.pool.execute(`SELECT u.id, u.email, u.name 
           FROM rsvps r
           JOIN users u ON r.user_id = u.id
           WHERE r.event_id = ? AND r.status = 'ATTENDING'`, [event.id]);
                const eventLink = `${clientUrl}/events/${event.id}`;
                for (const attendee of attendees) {
                    // Send Email
                    await email_service_1.emailService.sendReminderEmail(attendee.email, event.title, eventLink).catch((err) => console.error("Failed to send reminder email", err));
                    // Also create an in-app notification
                    const notificationId = (0, uuid_1.v4)();
                    await db_1.pool.execute('INSERT INTO notifications (id, type, message, link, user_id) VALUES (?, ?, ?, ?, ?)', [notificationId, 'EVENT_REMINDER', `Reminder: ${event.title} is happening tomorrow!`, eventLink, attendee.id]);
                }
            }
            console.log('✅ Finished event reminder cron job.');
        }
        catch (error) {
            console.error('Error running event reminder cron job:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
};
exports.initCronJobs = initCronJobs;
