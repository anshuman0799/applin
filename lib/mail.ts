import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT
  ? Number(process.env.SMTP_PORT)
  : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const mailFrom = process.env.MAIL_FROM;

const smtpConfigured = Boolean(
  smtpHost && smtpPort && smtpUser && smtpPass && mailFrom,
);

export async function sendEmail({ to, subject, text, html }: SendEmailArgs) {
  if (!smtpConfigured) {
    console.info(`[MAIL] SMTP not configured. Intended recipient: ${to}`);
    console.info(`[MAIL] Subject: ${subject}`);
    console.info(text);
    return { mode: "log" as const };
  }

  const transportOptions: SMTPTransport.Options = {
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true" || smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  };

  const transporter = createTransport(transportOptions);

  await transporter.sendMail({
    from: mailFrom,
    to,
    subject,
    text,
    html,
  });

  return { mode: "smtp" as const };
}
