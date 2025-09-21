import { 
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_OTP_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE 
} from "./emailTemplatesUser.js";
import { Client, sender } from "./mailtrap.config.js";

// 1) Verification code email
export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await Client.send({
      from: sender,
      to: recipient,
      subject: "Verify your CampQuest account",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      category: "Email Verification",
    });

    console.log("Verification email sent successfully", response);
    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error: error.message };
  }
};

// 2) Welcome email
export const sendWelcomeEmail = async (email, firstName) => {
  const recipient = [{ email }];
  const name = firstName || "there";
  const dashboardUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const html = WELCOME_EMAIL_TEMPLATE
    .replace("{firstName}", name)
    .replace(/{dashboardUrl}/g, dashboardUrl);

  try {
    const response = await Client.send({
      from: sender,
      to: recipient,
      subject: "Welcome to CampQuest! 🏕️",
      html,
      category: "Welcome",
    });

    console.log("Welcome email sent successfully", response);
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

// 3) Password reset OTP
export const sendPasswordResetOTP = async (email, name, otp) => {
  const recipient = [{ email }];

  try {
    const response = await Client.send({
      from: sender,
      to: recipient,
      subject: "Your CampQuest Password Reset OTP",
      html: PASSWORD_RESET_OTP_TEMPLATE.replace("{otp}", otp),
      category: "Password Reset",
    });

    console.log(`Password reset OTP sent to ${email}: ${otp}`, response);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset OTP:", error);
    return { success: false, error: error.message };
  }
};

// 4) Password reset success
export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await Client.send({
      from: sender,
      to: recipient,
      subject: "CampQuest Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    console.log("Password reset success email sent", response);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    return { success: false, error: error.message };
  }
};
