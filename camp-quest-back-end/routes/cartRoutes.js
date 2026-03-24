import express from 'express';
import { getCart, addToCart, removeFromCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/auth-middleware.js';

const router = express.Router();

router.use(protect); // All cart routes are protected

router.route('/')
    .get(getCart)
    .post(addToCart)
    .delete(clearCart);

router.route('/:productId')
    .delete(removeFromCart);

export default router;
