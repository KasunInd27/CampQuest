import express from 'express';
import {
  addUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  logout,
  verifyEmail,
  forgetPassword,
  verifyOTPAndResetPassword,
  checkAuth
} from '../controllers/UserManagement/UserController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  authLimiter, 
  passwordResetLimiter, 
  emailVerificationLimiter,
  checkAccountLockout,
  ipBruteForceProtection
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting and brute force protection
router.post('/register', 
  authLimiter,
  ipBruteForceProtection,
  addUser
);

router.post('/login', 
  authLimiter,
  ipBruteForceProtection,
  checkAccountLockout,
  login
);

router.post('/verify-email',
  emailVerificationLimiter,
  verifyEmail
);

router.post('/forgot-password',
  passwordResetLimiter,
  forgetPassword
);

router.post('/verify-otp-reset-password',
  passwordResetLimiter,
  verifyOTPAndResetPassword
);

router.post('/logout', logout);

// Protected routes (require authentication)
router.use(authenticate); // Apply authentication middleware to all routes below

router.get('/profile', checkAuth);
router.get('/check-auth', checkAuth);
router.put('/profile', updateUser);

// Admin routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
