// pages/BlogPosts.jsx
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Eye,
  X,
  Clock,
  Search,
  Star,
  Heart,
  MessageCircle,
  Send
} from 'lucide-react';
import axios from '../lib/axios'; // Import the configured axios
import toast from 'react-hot-toast';

const BlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'gear reviews', label: 'Gear Reviews' },
    { value: 'camping tips', label: 'Camping Tips' },
    { value: 'camping recipes', label: 'Camping Recipes' },
    { value: 'destinations & locations', label: 'Destinations & Locations' },
    { value: 'beginner guides', label: 'Beginner Guides' }
  ];

  useEffect(() => {
    fetchBlogPosts();
  }, [currentPage, selectedCategory, searchQuery]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 6,
        status: 'published'
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await axios.get(`/blog-posts?${params}`);

      if (response.data.success) {
        setBlogPosts(response.data.blogPosts);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchQuery('');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const openModal = async (postId) => {
    try {
      const response = await axios.get(`/blog-posts/${postId}`);
      if (response.data.success) {
        setSelectedPost(response.data.blogPost);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching blog post details:', error);
      toast.error('Failed to load blog post details');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'gear reviews': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      'camping tips': 'bg-green-500/20 text-green-500 border-green-500/30',
      'camping recipes': 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      'destinations & locations': 'bg-purple-500/20 text-purple-500 border-purple-500/30',
      'beginner guides': 'bg-pink-500/20 text-pink-500 border-pink-500/30'
    };
    return colors[category] || 'bg-neutral-500/20 text-neutral-500 border-neutral-500/30';
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-neutral-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Our Blog</h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Discover the latest tips, guides, and stories about camping and outdoor adventures
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter keywords to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={!searchTerm.trim()}
                className="px-6 py-3 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-400 transition-colors font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </form>

            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-lime-500 min-w-48"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {blogPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-neutral-400 text-lg mb-4">
                No blog posts available at the moment.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {blogPosts.map((post) => (
                <BlogCard
                  key={post._id}
                  post={post}
                  onRead={() => openModal(post._id)}
                  formatDate={formatDate}
                  truncateContent={truncateContent}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === page
                        ? 'bg-lime-500 text-neutral-900'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {showModal && selectedPost && (
          <BlogModal
            post={selectedPost}
            onClose={closeModal}
            formatDate={formatDate}
            getCategoryColor={getCategoryColor}
          />
        )}
      </div>
    </div>
  );
};

const BlogCard = ({ post, onRead, formatDate, truncateContent, getCategoryColor }) => {
  return (
    <div className="bg-neutral-800 rounded-xl border border-neutral-700 hover:border-neutral-600 transition-all duration-300 group overflow-hidden">
      <div className="relative h-48 w-full">
        <img
          src={`/uploads/blog-images/${post.image}`}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent"></div>

        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
          {post.title}
        </h3>

        <div className="flex items-center space-x-4 text-sm text-neutral-400 mb-4">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.publishedDate)}</span>
          </div>
        </div>

        {post.stats && (
          <div className="flex items-center space-x-4 text-sm text-neutral-400 mb-4 pb-4 border-b border-neutral-700">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{post.stats.averageRating > 0 ? post.stats.averageRating.toFixed(1) : '0.0'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>{post.stats.totalLikes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span>{post.stats.totalComments}</span>
            </div>
          </div>
        )}

        <p className="text-neutral-300 mb-6 leading-relaxed line-clamp-3">
          {truncateContent(post.content)}
        </p>

        <button
          onClick={onRead}
          className="flex items-center space-x-2 text-lime-500 hover:text-lime-300 font-medium transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>Read More</span>
        </button>
      </div>
    </div>
  );
};

const BlogModal = ({ post, onClose, formatDate, getCategoryColor }) => {
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.stats?.totalLikes || 0);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    comment: ''
  });
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [stats, setStats] = useState(post.stats || {});

  useEffect(() => {
    if (post && post._id) {
      fetchUserRating();
      fetchLikeStatus();
      fetchComments();
    }
  }, [post?._id]);

  const fetchUserRating = async () => {
    try {
      const response = await axios.get(`/blog-interactions/${post._id}/ratings/user`);
      if (response.data.success && response.data.rating) {
        setUserRating(response.data.rating);
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const response = await axios.get(`/blog-interactions/${post._id}/likes/status`);
      if (response.data.success) {
        setLiked(response.data.liked);
        setLikeCount(response.data.totalLikes);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await axios.get(`/blog-interactions/${post._id}/comments?limit=50`);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleRatingClick = async (rating) => {
    if (submittingRating) return;

    try {
      setSubmittingRating(true);
      const response = await axios.post(`/blog-interactions/${post._id}/ratings`, { rating });

      if (response.data.success) {
        setUserRating(rating);
        toast.success('Rating submitted successfully! ⭐');

        if (response.data.stats) {
          setStats(prevStats => ({
            ...prevStats,
            ...response.data.stats
          }));
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleLikeToggle = async () => {
    try {
      const response = await axios.post(`/blog-interactions/${post._id}/likes/toggle`);

      if (response.data.success) {
        setLiked(response.data.liked);
        setLikeCount(response.data.totalLikes);
        toast.success(response.data.liked ? 'Post liked! ❤️' : 'Like removed');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error(error.response?.data?.message || 'Failed to update like');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentForm.name.trim() || !commentForm.email.trim() || !commentForm.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(commentForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await axios.post(`/blog-interactions/${post._id}/comments`, commentForm);

      if (response.data.success) {
        toast.success('Comment added successfully! 💬');
        setCommentForm({ name: '', email: '', comment: '' });
        fetchComments();

        setStats(prevStats => ({
          ...prevStats,
          totalComments: (prevStats.totalComments || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error(error.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-neutral-800 border border-lime-500 rounded-xl max-w-4xl w-full my-8">
        <div className="flex justify-between items-start p-6 border-b border-neutral-700 sticky top-0 bg-neutral-800 z-10">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
              {post.title}
            </h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border capitalize ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="relative h-64 md:h-80">
            <img
              src={`/uploads/blog-images/${post.image}`}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-400 mb-6 pb-4 border-b border-neutral-700">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>By {post.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.publishedDate)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Created {formatDate(post.createdAt)}</span>
              </div>
            </div>

            <div className="mb-6 p-6 bg-neutral-900 rounded-lg border border-neutral-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Rate this post</h3>
                  <div className="flex items-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        disabled={submittingRating}
                        className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${star <= (hoveredRating || userRating)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-neutral-600'
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                  {userRating > 0 && (
                    <p className="text-sm text-neutral-400 mt-2">
                      You rated this {userRating} star{userRating !== 1 ? 's' : ''}
                    </p>
                  )}
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 text-neutral-300">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xl font-bold">{stats.averageRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-neutral-400">
                        ({stats.totalRatings || 0} rating{stats.totalRatings !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Like this post</h3>
                  <button
                    onClick={handleLikeToggle}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all ${liked
                        ? 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-red-500/30 hover:text-red-500'
                      }`}
                  >
                    <Heart className={`w-6 h-6 transition-all ${liked ? 'fill-red-500 scale-110' : ''}`} />
                    <span className="font-medium">
                      {liked ? 'Liked' : 'Like'}
                    </span>
                    <span className="px-2 py-1 bg-neutral-800 rounded-full text-sm">
                      {likeCount}
                    </span>
                  </button>
                </div>
              </div>

              {stats.ratingDistribution && stats.totalRatings > 0 && (
                <div className="mt-6 pt-6 border-t border-neutral-700">
                  <h4 className="text-sm font-semibold text-white mb-3">Rating Distribution</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = stats.ratingDistribution[rating] || 0;
                      const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;

                      return (
                        <div key={rating} className="flex items-center space-x-3">
                          <span className="text-sm text-neutral-400 w-12">{rating} stars</span>
                          <div className="flex-1 h-2 bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-neutral-400 w-12 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-invert max-w-none mb-8">
              <div className="text-neutral-300 leading-relaxed text-lg whitespace-pre-wrap">
                {post.content}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-700">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <MessageCircle className="w-6 h-6 mr-2" />
                Comments ({comments.length})
              </h3>

              <form onSubmit={handleCommentSubmit} className="mb-8 p-6 bg-neutral-900 rounded-lg border border-neutral-700">
                <h4 className="text-lg font-semibold text-white mb-4">Leave a Comment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                    className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your Email *"
                    value={commentForm.email}
                    onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                    className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500"
                    required
                  />
                </div>
                <textarea
                  placeholder="Your Comment *"
                  value={commentForm.comment}
                  onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none mb-4"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="flex items-center space-x-2 px-6 py-3 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingComment ? 'Submitting...' : 'Submit Comment'}</span>
                </button>
              </form>

              <div className="space-y-4">
                {loadingComments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mx-auto"></div>
                    <p className="text-neutral-400 mt-2">Loading comments...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 bg-neutral-900 rounded-lg border border-neutral-700">
                    <MessageCircle className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-400">No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="p-4 bg-neutral-900 rounded-lg border border-neutral-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-semibold text-white">{comment.name}</h5>
                          <p className="text-sm text-neutral-400">{formatDate(comment.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-neutral-300 leading-relaxed">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPosts;