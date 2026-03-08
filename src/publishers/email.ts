import nodemailer from 'nodemailer';
import type { EmailRecipient } from '../types.js';

export async function sendEmail({ name, address }: EmailRecipient, subject: string, content: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: `${name} <${address}>`,
    subject,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${content}</body></html>`,
  });
}

export async function sendMailList(emails: EmailRecipient[], subject: string, content: string): Promise<void> {
  for (const email of emails) {
    await sendEmail(email, subject, content);
  }
}
