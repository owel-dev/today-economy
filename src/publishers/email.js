import nodemailer from 'nodemailer';
import { gmailUser, gmailAppPassword } from '../../config.js';

export async function sendEmail({ name, address }, subject, content) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword
    }
  });

  await transporter.sendMail({
    from: gmailUser,
    to: `${name} <${address}>`,
    subject: subject,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${content}</body></html>`
  });
}

export async function sendMailList(emails, subject, content) {
  for (const email of emails) {
    await sendEmail(email, subject, content);
  }
}
