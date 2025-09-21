import express from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserActivity,
    unlockUser,
    forceLogoutUser
} from '../controllers/adminController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeAdmin);
router.use(generalLimiter);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// User activity and security routes
router.get('/users/:id/activity', getUserActivity);
router.post('/users/:id/unlock', unlockUser);
router.post('/users/:id/force-logout', forceLogoutUser);

export default router;
