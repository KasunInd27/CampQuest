// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true, // ✅ improvement: faster queries
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordOTPExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Generate OTP method
userSchema.methods.generateResetOTP = function () {
  // ✅ improvement: Google users shouldn't use OTP password reset
  if (this.authProvider === "google") {
    throw new Error("Google account users cannot reset password with OTP. Use Google login.");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordOTP = otp;
  this.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

// Verify OTP method
userSchema.methods.verifyResetOTP = function (otp) {
  return this.resetPasswordOTP === otp && this.resetPasswordOTPExpires > Date.now();
};

// Clear OTP method
userSchema.methods.clearResetOTP = function () {
  this.resetPasswordOTP = null;
  this.resetPasswordOTPExpires = null;
};

const User = mongoose.model("User", userSchema);
export default User;
