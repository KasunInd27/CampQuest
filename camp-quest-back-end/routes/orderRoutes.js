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

// Public routes (no authentication required)
router.post('/', createOrder);
router.post('/:id/upload-slip', upload.single('paymentSlip'), uploadSlip);

// User routes (no authentication required - using userId from query/body)
router.get('/user/orders', getUserOrders);
router.get('/user/orders/stats', getUserOrderStats);
router.get('/user/orders/:id', getUserOrder);
router.put('/user/orders/:id/delivery', updateOrderDeliveryDetails);
router.put('/user/orders/:id/cancel', cancelUserOrder);

router.get('/admin/orders', getAdminOrders);
router.get('/admin/orders/stats', getAdminOrderStats);
router.put('/admin/orders/bulk-update', bulkUpdateOrders);
router.get('/admin/orders/:id', getOrder);
router.put('/admin/orders/:id', updateAdminOrder);
router.delete('/admin/orders/:id', deleteAdminOrder);

// Admin routes (no authentication required)
router.get('/', getOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;