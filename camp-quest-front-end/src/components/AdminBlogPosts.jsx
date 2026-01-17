// pages/AdminBlogPosts.jsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  Star,
  Heart,
  MessageCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useFormik } from 'formik';
import { blogPostSchema, blogPostUpdateSchema, blogCategories } from '../utils/blogValidationSchemas';
import axios, { BASE_URL } from '../lib/axios';
import toast from 'react-hot-toast';

const AdminBlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [stats, setStats] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPostForDetails, setSelectedPostForDetails] = useState(null);

  useEffect(() => {
    fetchBlogPosts();
    fetchStats();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/blog-posts?status=all&limit=100');

      if (response.data.success) {
        setBlogPosts(response.data.blogPosts);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/blog-posts/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const openModal = (post = null) => {
    setEditingPost(post);
    setImagePreview(post ? `${BASE_URL}/uploads/blog-images/${post.image}` : null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPost(null);
    setImagePreview(null);
    formik.resetForm();
  };

  const openDetailsModal = (post) => {
    setSelectedPostForDetails(post);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPostForDetails(null);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    formik.setFieldValue('image', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(editingPost ? `${BASE_URL}/uploads/blog-images/${editingPost.image}` : null);
    }
  };

  const deleteBlogPost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post? This will also delete all associated ratings, likes, and comments.')) {
      return;
    }

    try {
      const response = await axios.delete(`/blog-posts/${id}`);
      if (response.data.success) {
        toast.success('Blog post deleted successfully');
        fetchBlogPosts();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  const formik = useFormik({
    initialValues: {
      title: editingPost?.title || '',
      author: editingPost?.author || '',
      content: editingPost?.content || '',
      category: editingPost?.category || '',
      publishedDate: editingPost ? new Date(editingPost.publishedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: editingPost?.status || 'published',
      image: null
    },
    validationSchema: editingPost ? blogPostUpdateSchema : blogPostSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('author', values.author);
        formData.append('content', values.content);
        formData.append('category', values.category);
        formData.append('publishedDate', values.publishedDate);
        formData.append('status', values.status);

        if (values.image) {
          formData.append('image', values.image);
        }

        const url = editingPost ? `/blog-posts/${editingPost._id}` : '/blog-posts';
        const method = editingPost ? 'put' : 'post';

        const response = await axios[method](url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          toast.success(`Blog post ${editingPost ? 'updated' : 'created'} successfully`);
          closeModal();
          fetchBlogPosts();
          fetchStats();
        }
      } catch (error) {
        console.error('Error saving blog post:', error);
        toast.error(error.response?.data?.message || 'Failed to save blog post');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'gear reviews': 'bg-blue-500/20 text-blue-500',
      'camping tips': 'bg-green-500/20 text-green-500',
      'camping recipes': 'bg-orange-500/20 text-orange-500',
      'destinations & locations': 'bg-purple-500/20 text-purple-500',
      'beginner guides': 'bg-pink-500/20 text-pink-500'
    };
    return colors[category] || 'bg-neutral-500/20 text-neutral-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Management</h1>
          <p className="text-neutral-400">Create and manage blog posts</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-400 transition-colors font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Blog Post
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={<BarChart3 className="w-6 h-6 text-lime-500" />}
          />
          <StatsCard
            title="Published"
            value={stats.publishedPosts}
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          />
          <StatsCard
            title="Drafts"
            value={stats.draftPosts}
            icon={<Edit className="w-6 h-6 text-yellow-500" />}
          />
          <StatsCard
            title="Recent (30 days)"
            value={stats.recentPosts}
            icon={<Star className="w-6 h-6 text-blue-500" />}
          />
        </div>
      )}

      {/* Category Breakdown */}
      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Posts by Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.categoryBreakdown.map((item) => (
              <div key={item._id} className="text-center p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                <p className="text-sm text-neutral-400 capitalize mb-1">{item._id}</p>
                <p className="text-2xl font-bold text-white">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blog Posts List */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">All Blog Posts</h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400">No blog posts yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <BlogPostCard
                  key={post._id}
                  post={post}
                  onEdit={() => openModal(post)}
                  onDelete={() => deleteBlogPost(post._id)}
                  onViewDetails={() => openDetailsModal(post)}
                  formatDate={formatDate}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <BlogPostModal
          isOpen={showModal}
          onClose={closeModal}
          formik={formik}
          editingPost={editingPost}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
        />
      )}

      {showDetailsModal && selectedPostForDetails && (
        <BlogDetailsModal
          post={selectedPostForDetails}
          isOpen={showDetailsModal}
          onClose={closeDetailsModal}
        />
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon }) => (
  <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-neutral-400">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      {icon}
    </div>
  </div>
);

// Blog Post Card Component
const BlogPostCard = ({ post, onEdit, onDelete, onViewDetails, formatDate, getCategoryColor }) => (
  <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
    <div className="flex items-center space-x-4 flex-1">
      <img
        src={`${BASE_URL}/uploads/blog-images/${post.image}`}
        alt={post.title}
        className="w-20 h-20 object-cover rounded-lg"
        onError={(e) => {
          e.target.src = '/placeholder/80/80';
        }}
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white truncate mb-1">{post.title}</h3>
        <div className="flex items-center flex-wrap gap-3 text-sm text-neutral-400 mb-2">
          <span className="flex items-center">
            <span className="mr-1">By</span> {post.author}
          </span>
          <span>•</span>
          <span>{formatDate(post.publishedDate)}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.status === 'published'
            ? 'bg-lime-500/20 text-lime-500'
            : 'bg-yellow-400/20 text-yellow-400'
            }`}>
            {post.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>

        {/* Interaction Stats */}
        {post.stats && (
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 mr-1 fill-yellow-500" />
              <span className="font-medium">
                {post.stats.averageRating > 0 ? post.stats.averageRating.toFixed(1) : '0.0'}
              </span>
              <span className="text-neutral-500 ml-1">({post.stats.totalRatings})</span>
            </span>
            <span className="flex items-center text-red-500">
              <Heart className="w-4 h-4 mr-1" />
              <span className="font-medium">{post.stats.totalLikes}</span>
            </span>
            <span className="flex items-center text-blue-500">
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="font-medium">{post.stats.totalComments}</span>
            </span>
          </div>
        )}
      </div>
    </div>

    <div className="flex items-center space-x-2 ml-4">
      <button
        onClick={onViewDetails}
        className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
        title="View Details & Comments"
      >
        <Eye className="w-5 h-5" />
      </button>
      <button
        onClick={onEdit}
        className="p-2 text-neutral-400 hover:text-lime-500 hover:bg-lime-500/10 rounded-lg transition-colors"
        title="Edit Post"
      >
        <Edit className="w-5 h-5" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        title="Delete Post"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// Blog Post Modal Component
const BlogPostModal = ({ isOpen, onClose, formik, editingPost, imagePreview, onImageChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-neutral-800 border border-lime-500 rounded-xl max-w-4xl w-full my-8">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-700">
          <h2 className="text-xl font-bold text-white">
            {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors ${formik.touched.title && formik.errors.title
                    ? 'border-red-500'
                    : 'border-neutral-600'
                    }`}
                  placeholder="Enter blog post title"
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="mt-1 text-sm text-red-400">{formik.errors.title}</p>
                )}
              </div>

              {/* Author */}
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-neutral-300 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formik.values.author}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors ${formik.touched.author && formik.errors.author
                    ? 'border-red-500'
                    : 'border-neutral-600'
                    }`}
                  placeholder="Enter author name"
                />
                {formik.touched.author && formik.errors.author && (
                  <p className="mt-1 text-sm text-red-400">{formik.errors.author}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-neutral-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors ${formik.touched.category && formik.errors.category
                    ? 'border-red-500'
                    : 'border-neutral-600'
                    }`}
                >
                  <option value="">Select a category</option>
                  {blogCategories.map((category) => (
                    <option key={category} value={category} className="capitalize">
                      {category}
                    </option>
                  ))}
                </select>
                {formik.touched.category && formik.errors.category && (
                  <p className="mt-1 text-sm text-red-400">{formik.errors.category}</p>
                )}
              </div>

              {/* Published Date */}
              <div>
                <label htmlFor="publishedDate" className="block text-sm font-medium text-neutral-300 mb-2">
                  Published Date *
                </label>
                <input
                  type="date"
                  id="publishedDate"
                  name="publishedDate"
                  value={formik.values.publishedDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors ${formik.touched.publishedDate && formik.errors.publishedDate
                    ? 'border-red-500'
                    : 'border-neutral-600'
                    }`}
                />
                {formik.touched.publishedDate && formik.errors.publishedDate && (
                  <p className="mt-1 text-sm text-red-400">{formik.errors.publishedDate}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-neutral-300 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors ${formik.touched.status && formik.errors.status
                    ? 'border-red-500'
                    : 'border-neutral-600'
                    }`}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <p className="mt-1 text-sm text-red-400">{formik.errors.status}</p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-neutral-300 mb-2">
                Blog Image {!editingPost && '*'}
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={onImageChange}
                  className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-lime-500 file:text-neutral-900 hover:file:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors ${formik.touched.image && formik.errors.image
                    ? 'border-red-500'
                    : 'border-neutral-600'
                    }`}
                />
                {formik.touched.image && formik.errors.image && (
                  <p className="mt-1 text-sm text-red-400">{formik.errors.image}</p>
                )}

                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-neutral-400 mb-2">Image Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border border-neutral-700"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-neutral-300 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                rows={12}
                value={formik.values.content}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors resize-none ${formik.touched.content && formik.errors.content
                  ? 'border-red-500'
                  : 'border-neutral-600'
                  }`}
                placeholder="Write your blog post content here..."
              />
              {formik.touched.content && formik.errors.content && (
                <p className="mt-1 text-sm text-red-400">{formik.errors.content}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-neutral-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="px-6 py-3 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-400 focus:outline-none focus:ring-4 focus:ring-lime-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {formik.isSubmitting
                  ? (editingPost ? 'Updating...' : 'Creating...')
                  : (editingPost ? 'Update Post' : 'Create Post')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Blog Details Modal Component
const BlogDetailsModal = ({ post, isOpen, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'comments'

  useEffect(() => {
    if (isOpen && post) {
      fetchComments();
    }
  }, [isOpen, post]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await axios.get(`/blog-interactions/${post._id}/comments?status=all&limit=100`);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await axios.delete(`/blog-interactions/comments/${commentId}`);
      if (response.data.success) {
        toast.success('Comment deleted successfully');
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-neutral-800 border border-lime-500 rounded-xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-neutral-700">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
            <p className="text-neutral-400">By {post.author}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-700">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${activeTab === 'stats'
              ? 'text-lime-500 border-b-2 border-lime-500 bg-neutral-900/50'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/30'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Statistics & Ratings</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${activeTab === 'comments'
              ? 'text-lime-500 border-b-2 border-lime-500 bg-neutral-900/50'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/30'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Comments ({comments.length})</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6">
          {activeTab === 'stats' ? (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-neutral-400">Average Rating</p>
                      <p className="text-3xl font-bold text-white">
                        {post.stats?.averageRating ? post.stats.averageRating.toFixed(1) : '0.0'}
                      </p>
                    </div>
                    <Star className="w-10 h-10 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="text-xs text-neutral-500">
                    {post.stats?.totalRatings || 0} rating{post.stats?.totalRatings !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-neutral-400">Total Likes</p>
                      <p className="text-3xl font-bold text-white">{post.stats?.totalLikes || 0}</p>
                    </div>
                    <Heart className="w-10 h-10 text-red-500" />
                  </div>
                  <p className="text-xs text-neutral-500">Unique users</p>
                </div>

                <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-neutral-400">Total Comments</p>
                      <p className="text-3xl font-bold text-white">{post.stats?.totalComments || 0}</p>
                    </div>
                    <MessageCircle className="w-10 h-10 text-blue-500" />
                  </div>
                  <p className="text-xs text-neutral-500">Approved comments</p>
                </div>
              </div>

              {/* Rating Distribution */}
              {post.stats?.ratingDistribution && post.stats.totalRatings > 0 && (
                <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Rating Distribution
                  </h3>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = post.stats.ratingDistribution[rating] || 0;
                      const percentage = post.stats.totalRatings > 0
                        ? (count / post.stats.totalRatings) * 100
                        : 0;

                      return (
                        <div key={rating} className="flex items-center space-x-3">
                          <div className="flex items-center w-20">
                            <span className="text-sm text-neutral-400 mr-2">{rating}</span>
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          </div>
                          <div className="flex-1 h-4 bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-neutral-400 w-24 text-right">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Engagement Insights */}
              <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-700">
                <h3 className="text-lg font-semibold text-white mb-4">Engagement Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-400 mb-1">Total Interactions</p>
                    <p className="text-2xl font-bold text-white">
                      {(post.stats?.totalRatings || 0) + (post.stats?.totalLikes || 0) + (post.stats?.totalComments || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-400 mb-1">Engagement Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {post.stats?.totalRatings > 0 || post.stats?.totalLikes > 0 || post.stats?.totalComments > 0 ? 'High' : 'Low'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {loadingComments ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lime-500 mx-auto"></div>
                  <p className="text-neutral-400 mt-4">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-400 text-lg">No comments yet</p>
                  <p className="text-neutral-500 text-sm mt-2">Be patient, comments will appear here once users start engaging with your post.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      All Comments ({comments.length})
                    </h3>
                  </div>

                  {comments.map((comment) => (
                    <div key={comment._id} className="p-4 bg-neutral-900 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h5 className="font-semibold text-white">{comment.name}</h5>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${comment.status === 'approved'
                              ? 'bg-green-500/20 text-green-500'
                              : comment.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                              }`}>
                              {comment.status}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-400">{comment.email}</p>
                          <p className="text-xs text-neutral-500 mt-1">{formatDate(comment.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-neutral-300 leading-relaxed">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogPosts;