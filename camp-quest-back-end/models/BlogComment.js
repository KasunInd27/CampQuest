// models/BlogComment.js
import mongoose from 'mongoose';

const blogCommentSchema = new mongoose.Schema({
  blogPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  userIdentifier: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true
});

blogCommentSchema.index({ blogPost: 1, createdAt: -1 });

const BlogComment = mongoose.model('BlogComment', blogCommentSchema);
export default BlogComment;