import nodemailer from 'nodemailer';
import { env } from '../config/env';

// We use Ethereal Email for testing during development.
// It catches all outgoing emails and provides a link to preview them.
let transporter: nodemailer.Transporter | null = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  // In a real app, you'd use real SMTP credentials from env
  // For development, we auto-generate an Ethereal test account if credentials aren't provided
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.log('Generating Ethereal test account for emails...');
    const testAccount = await nodemailer.createTestAccount();
    user = testAccount.user;
    pass = testAccount.pass;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: { user, pass },
  });

  return transporter;
};

export const sendInvitationEmail = async (toEmail: string, inviterName: string, eventTitle: string, inviteLink: string) => {
  try {
    const tp = await createTransporter();
    
    const info = await tp.sendMail({
      from: '"Event Management App" <noreply@events.com>',
      to: toEmail,
      subject: `You're invited to ${eventTitle}!`,
      text: `${inviterName} has invited you to the event: ${eventTitle}.\nClick here to view and accept the invitation: ${inviteLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited!</h2>
          <p><strong>${inviterName}</strong> has invited you to the event: <strong>${eventTitle}</strong>.</p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Invitation
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser: <br/> ${inviteLink}</p>
        </div>
      `
    });

    console.log('✉️ Email sent: %s', info.messageId);
    console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendReminderEmail = async (toEmail: string, eventTitle: string, eventLink: string) => {
  try {
    const tp = await createTransporter();
    
    const info = await tp.sendMail({
      from: '"Event Management App" <noreply@events.com>',
      to: toEmail,
      subject: `Reminder: ${eventTitle} is happening tomorrow!`,
      text: `This is a reminder that the event "${eventTitle}" is happening tomorrow!\nClick here to view the event: ${eventLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2>Event Reminder!</h2>
          <p>This is a quick reminder that <strong>${eventTitle}</strong> is happening tomorrow.</p>
          <div style="margin: 30px 0;">
            <a href="${eventLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Event
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser: <br/> ${eventLink}</p>
        </div>
      `
    });

    console.log('✉️ Reminder Email sent: %s', info.messageId);
    console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw new Error('Failed to send reminder email');
  }
};
