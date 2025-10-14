// routes/salesProductRoutes.js
import express from 'express';
import {
  getSalesProducts,
  getSalesProduct,
  createSalesProduct,
  updateSalesProduct,
  deleteSalesProduct,
  getSalesProductStats
} from '../controllers/salesProductController.js';

import { uploadSalesProductImages } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getSalesProducts);
router.get('/stats', getSalesProductStats);
router.get('/:id', getSalesProduct);

// Protected routes (Admin only) - Made public for testing
router.post('/', uploadSalesProductImages.array('images', 10), createSalesProduct);
router.put('/:id', uploadSalesProductImages.array('images', 10), updateSalesProduct);
router.delete('/:id', deleteSalesProduct);

export default router;