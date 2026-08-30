"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: env_1.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(env_1.env.SMTP_PORT) || 587,
            secure: Number(env_1.env.SMTP_PORT) === 465,
            auth: {
                user: env_1.env.SMTP_USER,
                pass: env_1.env.SMTP_PASS,
            },
        });
    }
    async sendEmail(to, subject, html) {
        try {
            const info = await this.transporter.sendMail({
                from: `"Event Management System" <${env_1.env.SMTP_USER || 'noreply@events.com'}>`,
                to,
                subject,
                html,
            });
            console.log('Message sent: %s', info.messageId);
            // If using ethereal email for testing, you can preview it:
            if (env_1.env.SMTP_HOST === 'smtp.ethereal.email' || info.messageId.includes('ethereal')) {
                console.log('Preview URL: %s', nodemailer_1.default.getTestMessageUrl(info));
            }
            return info;
        }
        catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }
    async sendInvitationEmail(to, inviterName, eventTitle, inviteLink) {
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
    async sendReminderEmail(to, eventTitle, eventLink) {
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
exports.emailService = new EmailService();
