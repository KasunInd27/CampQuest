// routes/blogInteractionRoutes.js
import express from 'express';
const router = express.Router();

import {
  addRating,
  getUserRating,
  getBlogRatingStats,
  toggleLike,
  getLikeStatus,
  addComment,
  getComments,
  deleteComment,
  updateCommentStatus,
  getBlogPostStats
} from '../controllers/blogInteractionController.js';
import { getUserIdentifier } from '../middleware/userIdentifier.js';

// Apply user identifier middleware to all routes
router.use(getUserIdentifier);

// Rating routes
router.post('/:blogPostId/ratings', addRating);
router.get('/:blogPostId/ratings/user', getUserRating);
router.get('/:blogPostId/ratings/stats', getBlogRatingStats);

// Like routes
router.post('/:blogPostId/likes/toggle', toggleLike);
router.get('/:blogPostId/likes/status', getLikeStatus);

// Comment routes
router.post('/:blogPostId/comments', addComment);
router.get('/:blogPostId/comments', getComments);
router.delete('/comments/:commentId', deleteComment);
router.patch('/comments/:commentId/status', updateCommentStatus);

// Combined stats
router.get('/:blogPostId/stats', getBlogPostStats);

export default router;