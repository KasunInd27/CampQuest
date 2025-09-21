import express from 'express';
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryTree
} from '../controllers/categoryController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { uploadSingle, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategoryById);

// Admin routes (require authentication and admin role)
router.post('/',
    authenticate,
    authorizeAdmin,
    uploadSingle('categoryImage'),
    handleMulterError,
    createCategory
);

router.put('/:id',
    authenticate,
    authorizeAdmin,
    uploadSingle('categoryImage'),
    handleMulterError,
    updateCategory
);

router.delete('/:id', authenticate, authorizeAdmin, deleteCategory);

export default router;
