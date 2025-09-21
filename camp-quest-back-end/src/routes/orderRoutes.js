import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder
} from '../controllers/orderController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/cancel', authenticate, cancelOrder);

// Admin routes
router.get('/', authenticate, authorizeAdmin, getAllOrders);
router.put('/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

export default router;
