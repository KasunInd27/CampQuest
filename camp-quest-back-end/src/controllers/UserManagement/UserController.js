import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../../models/UserManagement/User.js";
import { generateTokenAndSetCookie } from "../../utils/generateTokenAndSetCookie.js";

import {
  sendResetSuccessEmail,
  sendPasswordResetOTP,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../../Email/UserManagement/emailUser.js";

// Create User (Register)
export const addUser = async (req, res) => {
  try {
    console.log('=== REGISTRATION REQUEST ===');
    console.log('Request body:', req.body);
    
    const {
      profilePic,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      password,
      role,
      confirmPassword,
    } = req.body;

    // For frontend compatibility, also accept 'name' and 'phone' fields
    const fName = firstName || (req.body.name ? req.body.name.split(' ')[0] : '');
    const lName = lastName || (req.body.name ? req.body.name.split(' ').slice(1).join(' ') : '');
    const phone = phoneNumber || req.body.phone;

    console.log('Processed fields:', { fName, lName, email, phone, password: !!password, address });

    if(!fName || !lName || !email || !phone || !password){
        console.log('Missing fields validation failed');
        throw new Error("All fields are required");
    }
    
    // Set default address if not provided
    const userAddress = address || { country: 'USA' };
    console.log('Using address:', userAddress);

    const userAlreadyExists = await User.findOne({email});
    console.log("userAlreadyExists", userAlreadyExists);

    if (userAlreadyExists){
        return res.status(400).json({
          success: false,
          message: "User already exists"
        });
    }

    // Basic password validation
    if (password && password.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters long" 
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      profilePic,
      firstName: fName,
      lastName: lName,
      email,
      phoneNumber: phone,
      address: userAddress,
      password: hashed, // store hashed only
      role: role || 'customer',
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24*60*60*1000, // 24 hours
      // For compatibility with existing frontend
      isVerified: false
    });

    await newUser.save();
    
    //jwt
    generateTokenAndSetCookie(res, newUser._id);
    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
        success: true,
        message: "User registered successfully. Please check your email to verify your account.",
        data: {
          user: {
            ...newUser._doc,
            password: undefined,
            // For frontend compatibility, add name field
            name: `${newUser.firstName} ${newUser.lastName}`
          },
          emailSent: true
        }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({success: false, message: error.message });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    // password is select:false in schema; this will exclude it by default
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "Error fetching users", error: err.message });
  }
};

// Get One User
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: "User not found" });
    return res.status(200).json({ status: "User Fetched", user });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "Error fetching user", error: err.message });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const {
      profilePic,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      password,          // optional
      confirmPassword,   // optional, only used if password provided
    } = req.body;

    const updateData = {
      profilePic,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
    };

    // If password fields are provided, validate + hash
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        return res.status(400).json({ status: "Passwords do not match" });
      }
      if (password && password.length < 8) {
        return res
          .status(400)
          .json({ status: "Password must be at least 8 characters" });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(userId, updateData, { runValidators: true });
    return res.status(200).json({ status: "User Updated" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "Error updating user", error: err.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ status: "User Deleted" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: "Error deleting user", error: err.message });
  }
};

// Logout 
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    
    console.log('Login attempt for:', email);
    console.log('User found:', !!user);
    console.log('Password provided:', !!password);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: {
          ...user._doc,
          password: undefined,
          // For frontend compatibility
          name: `${user.firstName} ${user.lastName}`
        },
        token: token,
        refreshToken: 'refresh_token_placeholder' // Frontend expects this
      }
    });  
  } catch (error) {
    console.log("Error in login ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Verify Email
export const verifyEmail = async(req,res)=>{
  const{code}=req.body;

  try{
    const user = await User.findOne({
      verificationToken : code,
      verificationTokenExpiresAt:{$gt:Date.now()}
    })

   if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.isEmailVerified = true; // For compatibility
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.firstName);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          ...user._doc,
          password: undefined,
          name: `${user.firstName} ${user.lastName}`
        }
      }
    });

  }catch(error){
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Forgot Password (Send OTP)
export const forgetPassword = async(req,res)=>{
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: "If an account with that email exists, a password reset OTP has been sent to your email." 
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP email
    await sendPasswordResetOTP(user.email, user.firstName, otp);

    res.status(200).json({ 
      success: true, 
      message: "If an account with that email exists, a password reset OTP has been sent to your email." 
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Verify OTP and Reset Password
export const verifyOTPAndResetPassword = async(req,res)=>{
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, OTP, and new password are required" 
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetOTP: otp,
      passwordResetOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({ 
      success: true, 
      message: "Password reset successfully. You can now login with your new password." 
    });
  } catch (error) {
    console.log("Error in verifyOTPAndResetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Check Auth
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      data: {
        user: {
          ...user._doc,
          name: `${user.firstName} ${user.lastName}`
        }
      }
    });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
