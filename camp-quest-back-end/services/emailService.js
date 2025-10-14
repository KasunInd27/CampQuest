// services/emailService.js
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'campquest512@gmail.com', // Your email
      pass: process.env.SMTP_PASS || 'iwqqkifvraqcuvio'  // Your email password or app password
    }
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'CampQuest',
        address: process.env.SMTP_USER
      },
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset OTP</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #84cc16; }
            .otp-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #84cc16; letter-spacing: 5px; margin: 10px 0; }
            .warning { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏕️ CampGear</div>
              <h1>Password Reset Request</h1>
            </div>
            
            <p>Hello ${name},</p>
            
            <p>We received a request to reset your password. Use the OTP code below to proceed with resetting your password:</p>
            
            <div class="otp-box">
              <p>Your OTP Code:</p>
              <div class="otp-code">${otp}</div>
              <p><small>This code will expire in 10 minutes</small></p>
            </div>
            
            <div class="warning">
              <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </div>
            
            <p>For security reasons, do not share this OTP with anyone.</p>
            
            <div class="footer">
              <p>Best regards,<br>The CampGear Team</p>
              <p><small>This is an automated email. Please do not reply to this message.</small></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'CampQuest',
        address: process.env.SMTP_USER
      },
      to: email,
      subject: 'Password Reset Successful',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset Successful</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #84cc16; }
            .success-box { background-color: #d4edda; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #c3e6cb; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏕️ CampGear</div>
              <h1>Password Reset Successful</h1>
            </div>
            
            <p>Hello ${name},</p>
            
            <div class="success-box">
              <h2>✅ Password Reset Complete</h2>
              <p>Your password has been successfully updated.</p>
            </div>
            
            <p>You can now log in to your account using your new password.</p>
            
            <p>If you didn't make this change, please contact our support team immediately.</p>
            
            <div class="footer">
              <p>Best regards,<br>The CampGear Team</p>
              <p><small>This is an automated email. Please do not reply to this message.</small></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw error for confirmation email as it's not critical
  }
};