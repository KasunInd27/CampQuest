// routes/rentalProductRoutes.js
import express from 'express';
import {
  getRentalProducts,
  getRentalProduct,
  createRentalProduct,
  updateRentalProduct,
  deleteRentalProduct,
  getRentalProductStats
} from '../controllers/rentalProductController.js';

import { uploadRentalProductImages } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getRentalProducts);
router.get('/stats', getRentalProductStats);
router.get('/:id', getRentalProduct);

// Protected routes (Admin only) - Made public for testing
router.post('/', uploadRentalProductImages.array('images', 10), createRentalProduct);
router.put('/:id', uploadRentalProductImages.array('images', 10), updateRentalProduct);
router.delete('/:id', deleteRentalProduct);

export default router;