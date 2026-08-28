import nodemailer from 'nodemailer';
import { env } from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(env.SMTP_PORT) || 587,
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Event Management System" <${env.SMTP_USER || 'noreply@events.com'}>`,
        to,
        subject,
        html,
      });

      console.log('Message sent: %s', info.messageId);
      
      // If using ethereal email for testing, you can preview it:
      if (env.SMTP_HOST === 'smtp.ethereal.email' || info.messageId.includes('ethereal')) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      
      return info;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendInvitationEmail(to: string, inviterName: string, eventTitle: string, inviteLink: string) {
    const subject = `You're invited to ${eventTitle}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">You're Invited!</h2>
        <p style="color: #555; font-size: 16px;">
          <strong>${inviterName}</strong> has invited you to <strong>${eventTitle}</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            View Invitation & RSVP
          </a>
        </div>
        <p style="color: #888; font-size: 12px; text-align: center;">
          If the button doesn't work, copy and paste this link into your browser: <br/>
          <a href="${inviteLink}" style="color: #6366f1;">${inviteLink}</a>
        </p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }
  async sendReminderEmail(to: string, eventTitle: string, eventLink: string) {
    const subject = `Reminder: ${eventTitle} is happening soon!`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Event Reminder</h2>
        <p style="color: #555; font-size: 16px; text-align: center;">
          Just a quick reminder that <strong>${eventTitle}</strong> is happening soon!
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${eventLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            View Event Details
          </a>
        </div>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }
}

export const emailService = new EmailService();
