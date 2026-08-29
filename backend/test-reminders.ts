import { pool } from './src/config/db';
import { RowDataPacket } from 'mysql2';
import { emailService } from './src/services/email.service';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
  console.log('⏰ Running manual event reminder test...');
  
  try {
    // Find ALL upcoming events to guarantee we find something to test with
    const [events] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, date 
       FROM events 
       WHERE date >= NOW()`
    );

    if (events.length === 0) {
      console.log('No upcoming events found. Create an event in the future and RSVP "Attending" to test.');
      process.exit(0);
    }

    console.log(`Found ${events.length} upcoming events.`);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    for (const event of events) {
      const [attendees] = await pool.execute<RowDataPacket[]>(
        `SELECT u.id, u.email, u.name 
         FROM rsvps r
         JOIN users u ON r.user_id = u.id
         WHERE r.event_id = ? AND r.status = 'ATTENDING'`,
        [event.id]
      );

      console.log(`Event "${event.title}" has ${attendees.length} attendees.`);
      const eventLink = `${clientUrl}/events/${event.id}`;

      for (const attendee of attendees) {
        console.log(`Sending reminder to ${attendee.email}...`);
        
        // Send Email
        await emailService.sendReminderEmail(attendee.email, event.title, eventLink).catch((err: any) => console.error("Failed to send reminder email", err));

        // Create an in-app notification
        const notificationId = uuidv4();
        await pool.execute(
          'INSERT INTO notifications (id, type, message, link, user_id) VALUES (?, ?, ?, ?, ?)',
          [notificationId, 'EVENT_REMINDER', `Reminder (TEST): ${event.title} is happening soon!`, eventLink, attendee.id]
        );
      }
    }
    
    console.log('✅ Finished test.');
    process.exit(0);
  } catch (error) {
    console.error('Error running test:', error);
    process.exit(1);
  }
};

runTest();
