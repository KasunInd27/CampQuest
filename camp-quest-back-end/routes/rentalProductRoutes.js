// routes/rentalProductRoutes.js
import express from 'express';
import {
  getRentalProducts,
  getRentalProduct,
  createRentalProduct,
  updateRentalProduct,
  deleteRentalProduct,
  getRentalProductStats,
  updateProductQuantity
} from '../controllers/rentalProductController.js';



const router = express.Router();

// Public routes
router.get('/', getRentalProducts);
router.get('/stats', getRentalProductStats);
router.get('/:id', getRentalProduct);

// Protected routes (Admin only) - Made public for testing
router.post('/', createRentalProduct);
router.put('/:id', updateRentalProduct);
router.put('/:id/quantity', updateProductQuantity);
router.delete('/:id', deleteRentalProduct);

export default router;