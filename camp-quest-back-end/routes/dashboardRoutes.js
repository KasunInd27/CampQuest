// routes/dashboardRoutes.js
import express from 'express';
const router = express.Router();

import {
  getDashboardStats,
  getRecentInventory,
  getRecentFeedback,
  getRecentOrders,
  getRevenueChartData,
  getSupportTicketStats,
  getLowStockAlerts
} from '../controllers/dashboardController.js';

// Dashboard routes (no auth as requested, but you can add protect middleware if needed)
router.get('/stats', getDashboardStats);
router.get('/inventory/recent', getRecentInventory);
router.get('/feedback/recent', getRecentFeedback);
router.get('/orders/recent', getRecentOrders);
router.get('/revenue/chart', getRevenueChartData);
router.get('/support/stats', getSupportTicketStats);
router.get('/alerts/low-stock', getLowStockAlerts);

export default router;