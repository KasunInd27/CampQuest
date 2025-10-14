// controllers/blogPostController.js - UPDATE the getAllBlogPosts and getBlogPostById functions

import BlogPost from '../models/BlogPost.js';
import BlogRating from '../models/BlogRating.js';
import BlogLike from '../models/BlogLike.js';
import BlogComment from '../models/BlogComment.js';
import path from 'path';
import fs from 'fs';

// Get all blog posts with search and filter (UPDATED)
export const getAllBlogPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'published', 
      category, 
      search,
      sortBy = 'publishedDate',
      sortOrder = 'desc'
    } = req.query;
    
    let query = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const blogPosts = await BlogPost.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Add interaction stats to each blog post
    const blogPostsWithStats = await Promise.all(
      blogPosts.map(async (post) => {
        const [ratings, likes, comments] = await Promise.all([
          BlogRating.find({ blogPost: post._id }),
          BlogLike.countDocuments({ blogPost: post._id }),
          BlogComment.countDocuments({ blogPost: post._id, status: 'approved' })
        ]);

        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
          ? ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings
          : 0;

        return {
          ...post.toObject(),
          stats: {
            averageRating: Number(averageRating.toFixed(1)),
            totalRatings,
            totalLikes: likes,
            totalComments: comments
          }
        };
      })
    );
    
    const total = await BlogPost.countDocuments(query);
    
    res.json({
      success: true,
      blogPosts: blogPostsWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      filters: {
        status,
        category,
        search
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single blog post (UPDATED)
export const getBlogPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blogPost = await BlogPost.findById(id);
    
    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Get interaction stats
    const [ratings, likes, comments] = await Promise.all([
      BlogRating.find({ blogPost: id }),
      BlogLike.countDocuments({ blogPost: id }),
      BlogComment.countDocuments({ blogPost: id, status: 'approved' })
    ]);

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings
      : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => {
      ratingDistribution[r.rating]++;
    });
    
    res.json({
      success: true,
      blogPost: {
        ...blogPost.toObject(),
        stats: {
          averageRating: Number(averageRating.toFixed(1)),
          totalRatings,
          totalLikes: likes,
          totalComments: comments,
          ratingDistribution
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new blog post
export const createBlogPost = async (req, res) => {
  try {
    const { title, author, content, category, publishedDate, status } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }
    
    const blogPost = new BlogPost({
      title,
      author,
      content,
      category,
      image: req.file.filename,
      publishedDate: publishedDate || new Date(),
      status: status || 'published'
    });
    
    await blogPost.save();
    
    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      blogPost
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    
    // Delete uploaded file if blog post creation fails
    if (req.file) {
      const filePath = path.join(process.cwd(), '../camp-quest-front-end/public/uploads/blog-images', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update blog post
export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, content, category, publishedDate, status } = req.body;
    
    const blogPost = await BlogPost.findById(id);
    
    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    const updateData = {
      title,
      author,
      content,
      category,
      publishedDate,
      status
    };
    
    // If new image is uploaded, update image and delete old one
    if (req.file) {
      // Delete old image
      const oldImagePath = path.join(process.cwd(), '../camp-quest-front-end/public/uploads/blog-images', blogPost.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updateData.image = req.file.filename;
    }
    
    const updatedBlogPost = await BlogPost.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Blog post updated successfully',
      blogPost: updatedBlogPost
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    
    // Delete uploaded file if update fails
    if (req.file) {
      const filePath = path.join(process.cwd(), '../camp-quest-front-end/public/uploads/blog-images', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete blog post
export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blogPost = await BlogPost.findById(id);
    
    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }
    
    // Delete associated image
    const imagePath = path.join(process.cwd(), '../camp-quest-front-end/public/uploads/blog-images', blogPost.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    await BlogPost.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get blog post statistics
export const getBlogStats = async (req, res) => {
  try {
    const totalPosts = await BlogPost.countDocuments();
    const publishedPosts = await BlogPost.countDocuments({ status: 'published' });
    const draftPosts = await BlogPost.countDocuments({ status: 'draft' });
    
    // Recent posts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPosts = await BlogPost.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Category breakdown
    const categoryStats = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        recentPosts,
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = [
      'gear reviews',
      'camping tips', 
      'camping recipes',
      'destinations & locations',
      'beginner guides'
    ];
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};