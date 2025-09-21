export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your CampQuest Account</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">🏕️ CampQuest</h1>
    <p style="color: white; margin: 5px 0 0 0;">Smart Camping Equipment Rental</p>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for joining CampQuest! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration and start exploring our camping equipment.</p>
    <p>This code will expire in 24 hours for security reasons.</p>
    <p>If you didn't create an account with CampQuest, please ignore this email.</p>
    <p>Best regards,<br>The CampQuest Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful - CampQuest</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">🏕️ CampQuest</h1>
    <p style="color: white; margin: 5px 0 0 0;">Password Reset Successful</p>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your CampQuest password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #667eea; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>The CampQuest Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_OTP_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP - CampQuest</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">🏕️ CampQuest</h1>
    <p style="color: white; margin: 5px 0 0 0;">Password Reset OTP</p>
  </div>
  <div style="background-color: #f9f9f9; padding: 30px; text-align: center;">
    <p>Hello,</p>
    <p>Here's your One-Time Password (OTP) to reset your CampQuest account password:</p>
    <div style="background: #fff; border: 2px dashed #667eea; border-radius: 10px; padding: 30px; margin: 30px 0;">
      <h1 style="color: #667eea; font-size: 48px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
        {otp}
      </h1>
    </div>
    <p style="color: #666; font-size: 16px; font-weight: bold;">
      Enter this OTP in the password reset form to continue.
    </p>
    <p style="color: #e74c3c; font-size: 14px; background: #ffeaea; padding: 15px; border-radius: 5px;">
      ⚠️ This OTP will expire in <strong>10 minutes</strong> for security reasons.
    </p>
    <p>If you didn't request a password reset, please ignore this email.</p>
    <p>Best regards,<br>The CampQuest Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to CampQuest</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">🏕️ Welcome to CampQuest!</h1>
    <p style="color: white; margin: 5px 0 0 0;">Smart Camping Equipment Rental</p>
  </div>

  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello <strong>{firstName}</strong>,</p>
    <p>🎉 We're excited to have you join the CampQuest community! Your account has been verified successfully and you're all set to explore our premium camping equipment.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="{dashboardUrl}" style="display: inline-block; background: #667eea; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 6px;">
        Start Exploring Equipment
      </a>
    </div>

    <p>🏕️ <strong>What you can do now:</strong></p>
    <ul>
      <li>Browse our premium camping equipment</li>
      <li>Create your wishlist</li>
      <li>Book equipment for your next adventure</li>
      <li>Manage your rentals</li>
    </ul>

    <p>If you have any questions, our support team is here to help!</p>
    <p>Happy camping!<br/>The CampQuest Team</p>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message; please do not reply.</p>
  </div>
</body>
</html>
`;
