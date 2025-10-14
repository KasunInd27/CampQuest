import Feedback from '../models/Feedback.js';

// Create new feedback
export const createFeedback = async (req, res) => {
  try {
    const { subject, category, rating, message, isAnonymous } = req.body;
    
    const feedback = await Feedback.create({
      user: req.user._id,
      subject,
      category,
      rating,
      message,
      isAnonymous: isAnonymous || false
    });
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's own feedback
export const getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all feedback (Admin) with filters and search
export const getAllFeedback = async (req, res) => {
  try {
    const { category, rating, search, page = 1, limit = 10 } = req.query;
    
    // Build filter query
    let query = {};
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Rating filter
    if (rating && rating !== 'all') {
      query.rating = parseInt(rating);
    }
    
    // Search filter (search in subject and message)
    if (search && search.trim() !== '') {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');
    
    const total = await Feedback.countDocuments(query);
    
    res.json({
      success: true,
      feedback,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update feedback
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, category, rating, message, isAnonymous } = req.body;
    
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Check if user owns the feedback
    if (feedback.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this feedback'
      });
    }
    
    feedback.subject = subject || feedback.subject;
    feedback.category = category || feedback.category;
    feedback.rating = rating || feedback.rating;
    feedback.message = message || feedback.message;
    feedback.isAnonymous = isAnonymous !== undefined ? isAnonymous : feedback.isAnonymous;
    
    await feedback.save();
    
    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Check if user owns the feedback or is admin
    if (feedback.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this feedback'
      });
    }
    
    await Feedback.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get feedback statistics
export const getFeedbackStats = async (req, res) => {
  try {
    // Total feedback count
    const totalFeedback = await Feedback.countDocuments();
    
    // Average rating
    const ratingStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);
    
    // Rating breakdown
    const ratingBreakdown = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);
    
    // Category breakdown with average ratings
    const categoryBreakdown = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Recent feedback (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentFeedbackCount = await Feedback.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    res.json({
      success: true,
      stats: {
        totalFeedback,
        overallRating: ratingStats[0]?.averageRating || 0,
        ratingBreakdown,
        categoryBreakdown,
        recentFeedbackCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};