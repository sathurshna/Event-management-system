import cron from 'node-cron';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { emailService } from '../services/email.service';
import { v4 as uuidv4 } from 'uuid';

export const initCronJobs = () => {
  // Run every minute for testing, or hourly
  // We'll use '* * * * *' to run every minute in dev just to test, but the prompt says 24h.
  // Actually, we should run hourly: '0 * * * *'
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running hourly event reminder cron job...');
    
    try {
      // Find events starting between 24 and 25 hours from now
      // This ensures we catch every event exactly once per day, since the cron runs hourly
      const [events] = await pool.execute<RowDataPacket[]>(
        `SELECT id, title, date 
         FROM events 
         WHERE date >= DATE_ADD(NOW(), INTERVAL 24 HOUR)
         AND date < DATE_ADD(NOW(), INTERVAL 25 HOUR)`
      );

      if (events.length === 0) {
        return;
      }

      console.log(`Found ${events.length} events starting in ~24 hours.`);

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

      for (const event of events) {
        // Find all attendees for this event
        const [attendees] = await pool.execute<RowDataPacket[]>(
          `SELECT u.id, u.email, u.name 
           FROM rsvps r
           JOIN users u ON r.user_id = u.id
           WHERE r.event_id = ? AND r.status = 'ATTENDING'`,
          [event.id]
        );

        const eventLink = `${clientUrl}/events/${event.id}`;

        for (const attendee of attendees) {
          // Send Email
          await emailService.sendReminderEmail(attendee.email, event.title, eventLink).catch((err: any) => console.error("Failed to send reminder email", err));

          // Also create an in-app notification
          const notificationId = uuidv4();
          await pool.execute(
            'INSERT INTO notifications (id, type, message, link, user_id) VALUES (?, ?, ?, ?, ?)',
            [notificationId, 'EVENT_REMINDER', `Reminder: ${event.title} is happening tomorrow!`, eventLink, attendee.id]
          );
        }
      }
      
      console.log('✅ Finished event reminder cron job.');
    } catch (error) {
      console.error('Error running event reminder cron job:', error);
    }

  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
};
