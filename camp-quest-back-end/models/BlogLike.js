// models/BlogLike.js
import mongoose from 'mongoose';

const blogLikeSchema = new mongoose.Schema({
  blogPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
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

// Ensure one like per user per blog post
blogLikeSchema.index({ blogPost: 1, userIdentifier: 1 }, { unique: true });

const BlogLike = mongoose.model('BlogLike', blogLikeSchema);
export default BlogLike;