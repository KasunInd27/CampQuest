// models/BlogPost.js
import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'gear reviews',
      'camping tips', 
      'camping recipes',
      'destinations & locations',
      'beginner guides'
    ]
  },
  publishedDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Add indexes for better search performance
blogPostSchema.index({ title: 'text', content: 'text' });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ publishedDate: -1 });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;