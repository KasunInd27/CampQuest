// routes/UserRoutes.js
import express from 'express';
import { 
  updateProfile, 
  updatePassword, 
  deleteAccount,
  searchUsers,
  getUserStats,
  updateUserRole,
  getAllUsers,
  deleteUser,
  getUserById,
  forgotPassword,
  verifyOTP,
  resetPassword
} from '../controllers/UserController.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
router.use(protect); // Apply authentication middleware to all routes below

router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.delete('/account', deleteAccount);
router.get('/search', searchUsers);

router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;