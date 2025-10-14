// controllers/blogInteractionController.js
import BlogRating from '../models/BlogRating.js';
import BlogLike from '../models/BlogLike.js';
import BlogComment from '../models/BlogComment.js';
import BlogPost from '../models/BlogPost.js';

// Helper function to get rating stats
const getRatingStats = async (blogPostId) => {
  const ratings = await BlogRating.find({ blogPost: blogPostId });
  
  if (ratings.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const totalRatings = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = sum / totalRatings;
  
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(r => {
    ratingDistribution[r.rating]++;
  });

  return {
    averageRating: Number(averageRating.toFixed(1)),
    totalRatings,
    ratingDistribution
  };
};

// ==================== RATINGS ====================

export const addRating = async (req, res) => {
  try {
    const { blogPostId } = req.params;
    const { rating } = req.body;
    
    console.log('Adding rating:', { blogPostId, rating, userIdentifier: req.userIdentifier });
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const blogPost = await BlogPost.findById(blogPostId);
    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const existingRating = await BlogRating.findOneAndUpdate(
      {
        blogPost: blogPostId,
        userIdentifier: req.userIdentifier
      },
      {
        rating,
        ipAddress: req.ipAddress,
        userAgent: req.userAgent
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    const stats = await getRatingStats(blogPostId);

    console.log('Rating added successfully:', { rating: existingRating._id, stats });

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      rating: existingRating,
      stats
    });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserRating = async (req, res) => {
  try {
    const { blogPostId } = req.params;

    const rating = await BlogRating.findOne({
      blogPost: blogPostId,
      userIdentifier: req.userIdentifier
    });

    res.json({
      success: true,
      rating: rating?.rating || null
    });
  } catch (error) {
    console.error('Error getting user rating:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getBlogRatingStats = async (req, res) => {
  try {
    const { blogPostId } = req.params;
    const stats = await getRatingStats(blogPostId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting rating stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== LIKES ====================

export const toggleLike = async (req, res) => {
  try {
    const { blogPostId } = req.params;
    
    console.log('Toggling like:', { blogPostId, userIdentifier: req.userIdentifier });

    const blogPost = await BlogPost.findById(blogPostId);
    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const existingLike = await BlogLike.findOne({
      blogPost: blogPostId,
      userIdentifier: req.userIdentifier
    });

    let liked;
    if (existingLike) {
      await BlogLike.deleteOne({ _id: existingLike._id });
      liked = false;
      console.log('Like removed');
    } else {
      await BlogLike.create({
        blogPost: blogPostId,
        userIdentifier: req.userIdentifier,
        ipAddress: req.ipAddress,
        userAgent: req.userAgent
      });
      liked = true;
      console.log('Like added');
    }

    const totalLikes = await BlogLike.countDocuments({ blogPost: blogPostId });

    res.json({
      success: true,
      liked,
      totalLikes,
      message: liked ? 'Post liked successfully' : 'Like removed successfully'
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getLikeStatus = async (req, res) => {
  try {
    const { blogPostId } = req.params;

    const liked = await BlogLike.exists({
      blogPost: blogPostId,
      userIdentifier: req.userIdentifier
    });

    const totalLikes = await BlogLike.countDocuments({ blogPost: blogPostId });

    res.json({
      success: true,
      liked: !!liked,
      totalLikes
    });
  } catch (error) {
    console.error('Error getting like status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== COMMENTS ====================

export const addComment = async (req, res) => {
  try {
    const { blogPostId } = req.params;
    const { name, email, comment } = req.body;

    console.log('Adding comment:', { blogPostId, name, email, userIdentifier: req.userIdentifier });

    if (!name || !email || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and comment are required'
      });
    }

    const blogPost = await BlogPost.findById(blogPostId);
    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const newComment = await BlogComment.create({
      blogPost: blogPostId,
      name: name.trim(),
      email: email.trim(),
      comment: comment.trim(),
      userIdentifier: req.userIdentifier,
      ipAddress: req.ipAddress
    });

    console.log('Comment added successfully:', newComment._id);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const { blogPostId } = req.params;
    const { page = 1, limit = 10, status = 'approved' } = req.query;

    const query = { blogPost: blogPostId };
    if (status !== 'all') {
      query.status = status;
    }

    const comments = await BlogComment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BlogComment.countDocuments(query);

    res.json({
      success: true,
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await BlogComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    await BlogComment.deleteOne({ _id: commentId });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCommentStatus = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const comment = await BlogComment.findByIdAndUpdate(
      commentId,
      { status },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.json({
      success: true,
      message: 'Comment status updated',
      comment
    });
  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getBlogPostStats = async (req, res) => {
  try {
    const { blogPostId } = req.params;

    const blogPost = await BlogPost.findById(blogPostId);
    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const ratingStats = await getRatingStats(blogPostId);
    const totalLikes = await BlogLike.countDocuments({ blogPost: blogPostId });
    const totalComments = await BlogComment.countDocuments({ 
      blogPost: blogPostId,
      status: 'approved'
    });

    res.json({
      success: true,
      stats: {
        ...ratingStats,
        totalLikes,
        totalComments
      }
    });
  } catch (error) {
    console.error('Error getting blog post stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};