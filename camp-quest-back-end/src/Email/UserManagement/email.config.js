import nodemailer from "nodemailer";
import 'dotenv/config';

const isProd = process.env.NODE_ENV === "production";

// Email transporter configuration
export const transporter = nodemailer.createTransport(
  isProd || process.env.EMAIL_SERVICE === 'gmail'
    ? {
        service: 'gmail',
        auth: { 
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASSWORD 
        },
      }
    : {
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: { 
          user: process.env.MT_TEST_USER, 
          pass: process.env.MT_TEST_PASS 
        },
      }
);

// Single source of truth for the From header
export const FROM = {
  name: process.env.MAIL_FROM_NAME || "CampQuest",
  address: process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@campquest.com",
};

// Optional sanity check you can call on app start
export async function verifyMailer() {
  try {
    await transporter.verify();
    console.log("Mailer ready");
  } catch (e) {
    console.error("Mailer config error:", e);
  }
}
