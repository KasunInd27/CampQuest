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


// Public routes
router.get('/', getAllBlogPosts);
router.get('/stats', getBlogStats);
router.get('/categories', getCategories);
router.get('/:id', getBlogPostById);

// Admin routes (no auth as requested)
router.post('/', createBlogPost);
router.put('/:id', updateBlogPost);
router.delete('/:id', deleteBlogPost);

export default router;