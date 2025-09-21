import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    addReview,
    getFeaturedProducts,
    searchProducts
} from '../controllers/productController.js';
import { authenticate, authorizeAdmin, optionalAuth } from '../middleware/auth.js';
import { uploadMultiple, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Protected routes (require authentication)
router.post('/:id/reviews', authenticate, addReview);

// Admin routes (require authentication and admin role)
router.post('/',
    authenticate,
    authorizeAdmin,
    uploadMultiple('productImages', 5),
    handleMulterError,
    createProduct
);

router.put('/:id',
    authenticate,
    authorizeAdmin,
    uploadMultiple('productImages', 5),
    handleMulterError,
    updateProduct
);

router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

export default router;
