// routes/blogPostRoutes.js
import express from 'express';
const router = express.Router();

import {
  getAllBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogStats,
  getCategories
} from '../controllers/blogPostController.js';
import { uploadBlogImages } from '../middleware/upload.js';

// Public routes
router.get('/', getAllBlogPosts);
router.get('/stats', getBlogStats);
router.get('/categories', getCategories);
router.get('/:id', getBlogPostById);

// Admin routes (no auth as requested)
router.post('/', uploadBlogImages.single('image'), createBlogPost);
router.put('/:id', uploadBlogImages.single('image'), updateBlogPost);
router.delete('/:id', deleteBlogPost);

export default router;