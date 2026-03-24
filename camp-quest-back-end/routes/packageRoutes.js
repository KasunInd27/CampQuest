import express from 'express';
import { protect, adminOnly as admin } from '../middleware/auth-middleware.js';
import {
    createPackage,
    getPackages,
    getPackage,
    updatePackage,
    deletePackage
} from '../controllers/packageController.js';

const router = express.Router();

// Public routes
router.get('/', getPackages);

router.get('/:id', getPackage);

// Admin routes
router.post('/', protect, admin, createPackage);
router.put('/:id', protect, admin, updatePackage);
router.delete('/:id', protect, admin, deletePackage);

export default router;
