import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  getUserOrders,
  getUserOrder,
  updateOrderDeliveryDetails,
  cancelUserOrder,
  getUserOrderStats,
  getAdminOrders,
  getAdminOrderStats,
  updateAdminOrder,
  deleteAdminOrder,
  bulkUpdateOrders,
  uploadSlip
} from '../controllers/orderController.js';

import multer from 'multer';
import path from 'path';
import { protect, adminOnly } from '../middleware/auth-middleware.js';

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/payment-slips/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 24 * 1024 * 1024 }, // 24MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, JPEG, PNG are allowed.'), false);
    }
  },
});

// Public routes (none for creating/viewing orders)
// router.post('/:id/upload-slip', upload.single('paymentSlip'), uploadSlip); // Keep this public as it's called after redirect sometimes

// User routes (Authenticated)
router.post('/', protect, createOrder);
router.post('/:id/upload-slip', protect, upload.single('paymentSlip'), uploadSlip);
router.get('/user/orders', protect, getUserOrders);
router.get('/user/orders/stats', protect, getUserOrderStats);
router.get('/user/orders/:id', protect, getUserOrder);
router.put('/user/orders/:id/delivery', protect, updateOrderDeliveryDetails);
router.put('/user/orders/:id/cancel', protect, cancelUserOrder);

// Admin routes (Authenticated + Admin Only)
router.get('/admin/orders', protect, adminOnly, getAdminOrders);
router.get('/admin/orders/stats', protect, adminOnly, getAdminOrderStats);
router.put('/admin/orders/bulk-update', protect, adminOnly, bulkUpdateOrders);
router.get('/admin/orders/:id', protect, adminOnly, getOrder);
router.put('/admin/orders/:id', protect, adminOnly, updateAdminOrder);
router.delete('/admin/orders/:id', protect, adminOnly, deleteAdminOrder);

// General Admin/Base routes
router.get('/', protect, adminOnly, getOrders);
router.get('/stats', protect, adminOnly, getOrderStats);
router.get('/:id', protect, adminOnly, getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/cancel', protect, adminOnly, cancelOrder);

export default router;