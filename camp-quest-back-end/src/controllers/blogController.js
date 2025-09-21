import Blog from '../models/Blog.js';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlogController {
  // Seed initial blogs if none exist
  static async seedBlogs(req, res) {
    try {
      const count = await Blog.countDocuments();
      if (count > 0) {
        return res.json({ success: true, message: 'Blogs already seeded', total: count });
      }

      const samples = [
        {
          title: 'Top 10 Essential Camping Gear for Beginners',
          content: 'Camping is a wonderful way to enjoy nature and disconnect from the hustle and bustle of everyday life. Here are the top 10 essentials you should pack before you go camping. From tents to lanterns, we cover everything you need...',
          category: 'Gear Reviews',
          imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80',
          tags: ['gear','essentials','beginner']
        },
        {
          title: 'How to Choose the Perfect Campsite',
          content: 'Selecting the right campsite can make or break your camping experience. Consider terrain, water sources, safety, and proximity to facilities. In this guide, we walk you through a practical checklist...',
          category: 'Camping Tips',
          imageUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=1000&q=80',
          tags: ['tips','site','planning']
        },
        {
          title: 'Campfire Cooking: 5 Easy Recipes for Your Next Trip',
          content: 'There\'s something magical about cooking over an open fire. These five easy recipes use minimal ingredients but deliver maximum flavor. Try foil packet potatoes, campfire nachos, and more...',
          category: 'Camping Recipes',
          imageUrl: 'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=1000&q=80',
          tags: ['recipes','food','campfire']
        }
      ];

      const created = await Blog.insertMany(samples);
      return res.status(201).json({ success: true, message: 'Seeded blogs', total: created.length, data: created });
    } catch (error) {
      console.error('Error seeding blogs:', error);
      return res.status(500).json({ success: false, message: 'Error seeding blogs', error: error.message });
    }
  }
  // Get all blogs with search, filter, pagination
  static async getAllBlogs(req, res) {
    try {
      const { category, search, page = 1, limit = 10, sortBy = 'publishDate', sortOrder = 'desc', published = 'true' } = req.query;
      const query = {};

      if (category && category !== 'All Categories') query.category = category;
      if (published !== 'all') query.isPublished = published === 'true';
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const limitNum = Math.min(parseInt(limit), 50);
      const blogs = await Blog.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limitNum)
        .skip((parseInt(page) - 1) * limitNum);

      const total = await Blog.countDocuments(query);

      res.json({
        success: true,
        data: blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limitNum),
          totalBlogs: total,
          limit: limitNum,
          hasNextPage: page < Math.ceil(total / limitNum),
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ success: false, message: 'Error fetching blogs', error: error.message });
    }
  }

  // Get single blog by ID
  static async getBlogById(req, res) {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found' });

      try { await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }); } catch {}
      res.json({ success: true, data: blog });
    } catch (error) {
      console.error('Error fetching blog:', error);
      res.status(500).json({ success: false, message: 'Error fetching blog', error: error.message });
    }
  }

  // Create blog
  static async createBlog(req, res) {
    try {
      const { title, content, category, imageUrl, tags, author, isPublished } = req.body;
      if (!title || !content || !category) return res.status(400).json({ success: false, message: 'Title, content, category required' });

      const blogData = {
        title,
        content,
        category,
        imageUrl: imageUrl || null,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        author: author || 'CampQuest Admin'
      };

      if (req.file) blogData.featuredImage = `/uploads/${req.file.filename}`;
      // Respect isPublished flag if provided; allow drafts
      if (typeof isPublished !== 'undefined') {
        blogData.isPublished = (isPublished === true || isPublished === 'true');
      }

      const newBlog = new Blog(blogData);
      await newBlog.save();
      res.status(201).json({ success: true, message: 'Blog created', data: newBlog });
    } catch (error) {
      console.error('Error creating blog:', error);
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      res.status(400).json({ success: false, message: error.message, error: error.message });
    }
  }

  // Update blog
  static async updateBlog(req, res) {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

      const { title, content, category, imageUrl, tags, author, isPublished } = req.body;
      const updateData = {
        ...(title && { title }),
        ...(content && { content }),
        ...(category && { category }),
        ...(imageUrl && { imageUrl }),
        ...(tags && { tags: tags.split(',').map(tag => tag.trim()).filter(Boolean) }),
        ...(author && { author }),
        ...(isPublished !== undefined && { isPublished: isPublished === 'true' })
      };

      if (req.file) {
        if (blog.featuredImage) {
          await fs.unlink(path.join(__dirname, '..', 'public', blog.featuredImage.replace(/^\/+/, ''))).catch(() => {});
        }
        updateData.featuredImage = `/uploads/${req.file.filename}`;
      }

      const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
      res.json({ success: true, message: 'Blog updated', data: updatedBlog });
    } catch (error) {
      console.error('Error updating blog:', error);
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      res.status(400).json({ success: false, message: error.message, error: error.message });
    }
  }

  // Delete blog
  static async deleteBlog(req, res) {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

      if (blog.featuredImage) {
        await fs.unlink(path.join(__dirname, '..', 'public', blog.featuredImage.replace(/^\/+/, ''))).catch(() => {});
      }

      await Blog.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Blog deleted' });
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ success: false, message: 'Error deleting blog', error: error.message });
    }
  }

  // Reactions
  static async reactToBlog(req, res) {
    try {
      const { reactionType } = req.body;
      const validReactions = ['likes', 'loves', 'smiles', 'stars'];
      if (!validReactions.includes(reactionType)) return res.status(400).json({ success: false, message: 'Invalid reaction type' });

      const updateField = `reactions.${reactionType}`;
      const blog = await Blog.findByIdAndUpdate(req.params.id, { $inc: { [updateField]: 1 } }, { new: true });
      if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

      const messages = { likes: 'liked', loves: 'loved', smiles: 'smiled', stars: 'starred' };
      res.json({ success: true, message: `Blog ${messages[reactionType]} successfully`, reactions: blog.reactions });
    } catch (error) {
      console.error('Error reacting:', error);
      res.status(500).json({ success: false, message: 'Error adding reaction', error: error.message });
    }
  }

  // Stats
  static async getBlogStats(req, res) {
    try {
      const stats = await Blog.aggregate([
        { $match: { isPublished: true } },
        { $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalLikes: { $sum: '$reactions.likes' },
            totalLoves: { $sum: '$reactions.loves' },
            totalSmiles: { $sum: '$reactions.smiles' },
            totalStars: { $sum: '$reactions.stars' },
            totalViews: { $sum: '$views' }
          } },
        { $sort: { count: -1 } }
      ]);

      const totalBlogs = await Blog.countDocuments({ isPublished: true });
      const totalViews = await Blog.aggregate([{ $match: { isPublished: true } }, { $group: { _id: null, total: { $sum: '$views' } } }]);

      res.json({ success: true, data: { categoryStats: stats, totalBlogs, totalViews: totalViews[0]?.total || 0 } });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
    }
  }
}

export default BlogController;
