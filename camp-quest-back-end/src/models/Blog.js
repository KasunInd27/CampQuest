import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Gear Reviews', 'Camping Tips', 'Camping Recipes', 'Destinations & Locations', 'Beginner Guides']
  },
  imageUrl: {
    type: String,
    validate: {
      validator: v => !v || /^https?:\/\/.+/.test(v),
      message: 'Image URL must be valid'
    }
  },
  featuredImage: { type: String, default: null },
  author: { type: String, default: 'CampQuest Admin', trim: true },
  publishDate: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: true },
  reactions: {
    likes: { type: Number, default: 0, min: 0 },
    loves: { type: Number, default: 0, min: 0 },
    smiles: { type: Number, default: 0, min: 0 },
    stars: { type: Number, default: 0, min: 0 }
  },
  tags: [{ type: String, trim: true, lowercase: true }],
  slug: { type: String, unique: true, lowercase: true },
  views: { type: Number, default: 0, min: 0 },
  readTime: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes
blogSchema.index({ category: 1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ publishDate: -1 });
blogSchema.index({ isPublished: 1 });
blogSchema.index({ title: 'text', content: 'text' });

// Pre-save: slug, excerpt, read time
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }
  if (this.isModified('content')) {
    if (!this.excerpt) this.excerpt = this.content.substring(0, 150) + (this.content.length > 150 ? '...' : '');
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  next();
});

// Virtual for formatted date
blogSchema.virtual('formattedDate').get(function() {
  return this.publishDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
});

blogSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Blog', blogSchema);
