import React, { useMemo, useState } from 'react';
import { BlogCard } from '../components/BlogCard';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Blog.css';
import { api } from '../services/api';

// Category definitions with descriptions
const categories = [
  {
    value: 'all',
    label: 'All Categories',
    description: 'View all blog posts',
  },
  {
    value: 'Gear Reviews',
    label: 'Gear Reviews',
    description: 'Reviews of tents, backpacks, sleeping bags, lanterns, etc.',
  },
  {
    value: 'Camping Tips',
    label: 'Camping Tips',
    description:
      'Practical advice, hacks, and how-to guides for better camping.',
  },
  {
    value: 'Camping Recipes',
    label: 'Camping Recipes',
    description: 'Food ideas and cooking methods for outdoor trips.',
  },
  {
    value: 'Destinations & Locations',
    label: 'Destinations & Locations',
    description: 'Best camping spots (mountains, beaches, forests, lakes).',
  },
  {
    value: 'Beginner Guides',
    label: 'Beginner Guides',
    description: 'Step-by-step guides for people new to camping.',
  },
];

export function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isAdmin = React.useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('admin') === '1';
    } catch {
      return false;
    }
  }, []);

  // Fetch blogs from backend once when component mounts
  const fetchBlogs = React.useCallback(async () => {
    let cancelled = false;
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      params.published = isAdmin ? 'all' : 'true';
      const res = await api.getBlogs(params);
      if (cancelled) return;
      const items = Array.isArray(res?.data) ? res.data : [];
      setBlogPosts(items);
    } catch (e) {
      if (!cancelled) setError(e.message || 'Failed to load blogs');
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => { cancelled = true; };
  }, [searchTerm, selectedCategory, isAdmin]);

  React.useEffect(() => {
    let dispose = () => {};
    fetchBlogs().then((d) => { if (typeof d === 'function') dispose = d; });
    return () => dispose();
  }, [fetchBlogs]);

  // Handle reactions
  const handleReaction = async (blogId, reactionType) => {
    try {
      const res = await api.reactToBlog(blogId, reactionType);
      const newReactions = res?.reactions;
      setBlogPosts((prev) => prev.map((p) => (
        (p._id === blogId || p.id === blogId)
          ? { ...p, reactions: newReactions || p.reactions }
          : p
      )));
    } catch (e) {
      console.error('Failed to react:', e);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    const ok = window.confirm('Are you sure you want to delete this blog?');
    if (!ok) return;
    try {
      await api.deleteBlog(id);
      await fetchBlogs();
    } catch (e) {
      console.error('Failed to delete blog:', e);
      alert(e.message || 'Failed to delete blog');
    }
  };

  // Filter blogs based on search term and category
  const filteredBlogs = useMemo(() => {
    return blogPosts.filter((blog) => {
      // Filter by search term
      const matchesSearch =
        searchTerm === '' ||
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by category
      const matchesCategory =
        selectedCategory === 'all' || blog.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, blogPosts]);

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1 className="blog-title">
          Camping <span className="title-highlight">Blog</span>
        </h1>
        <p className="blog-subtitle">
          Discover camping tips, gear reviews, and outdoor adventures
        </p>
      </div>

      <div className="blog-container">
        {loading && (
          <div className="no-results"><p>Loading blogs...</p></div>
        )}
        {!!error && (
          <div className="no-results"><p>{error}</p></div>
        )}
        <div className="blog-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <Search className="search-icon" size={18} />
            <button
              className="search-button"
              onClick={() => setSearchTerm(searchTerm)}
            >
              Search
            </button>
          </div>

          <div className="controls-right">
            <select
              className="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              title="Select a category"
            >
              {categories.map((category) => (
                <option
                  key={category.value}
                  value={category.value}
                  title={category.description}
                >
                  {category.label}
                </option>
              ))}
            </select>
            {isAdmin && (
              <button
                className="add-blog-btn"
                onClick={() => navigate('/blog/add')}
              >
                <Plus size={20} />
                <span>Add New Blog</span>
              </button>
            )}
          </div>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="no-results">
            <p>No blogs found matching your search criteria.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog._id || blog.id}
                id={blog._id || blog.id}
                title={blog.title}
                imageUrl={blog.featuredImage ? `${api.baseUrl}${blog.featuredImage}` : (blog.imageUrl || '')}
                category={blog.category}
                date={blog.formattedDate || (blog.publishDate ? new Date(blog.publishDate).toLocaleDateString('en-US') : '')}
                excerpt={blog.excerpt || ''}
                author={blog.author || 'Admin'}
                reactions={blog.reactions || { likes: 0, loves: 0, smiles: 0, stars: 0 }}
                {...(isAdmin ? { onEdit: (id) => navigate(`/blog/edit/${id}`, { state: { blog } }), onDelete: handleDelete } : {})}
              />
            ))}
          </div>
        )}

        {selectedCategory !== 'all' && (
          <div className="category-info">
            <h3>About {selectedCategory}</h3>
            <p>
              {
                categories.find((cat) => cat.value === selectedCategory)
                  ?.description
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}