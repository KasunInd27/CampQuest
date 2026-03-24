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



const router = express.Router();

// Public routes
router.get('/', getSalesProducts);
router.get('/stats', getSalesProductStats);
router.get('/:id', getSalesProduct);

// Protected routes (Admin only) - Made public for testing
router.post('/', createSalesProduct);
router.put('/:id', updateSalesProduct);
router.delete('/:id', deleteSalesProduct);

export default router;