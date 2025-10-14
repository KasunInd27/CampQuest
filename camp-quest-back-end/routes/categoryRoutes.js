// routes/categoryRoutes.js
import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} from '../controllers/categoryController.js';


const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/stats', getCategoryStats);
router.get('/:id', getCategory);

// Protected routes (Admin only)
router.post('/',  createCategory);
router.put('/:id', updateCategory);
router.delete('/:id',  deleteCategory);

export default router;