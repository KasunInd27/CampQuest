// models/BlogRating.js
import mongoose from 'mongoose';

const blogRatingSchema = new mongoose.Schema({
  blogPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  userIdentifier: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String
}, {
  timestamps: true
});

// Ensure one rating per user per blog post
blogRatingSchema.index({ blogPost: 1, userIdentifier: 1 }, { unique: true });

const BlogRating = mongoose.model('BlogRating', blogRatingSchema);
export default BlogRating;