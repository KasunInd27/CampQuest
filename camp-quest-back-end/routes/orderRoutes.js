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
  bulkUpdateOrders
} from '../controllers/orderController.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/', createOrder);

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