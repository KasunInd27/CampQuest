import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Upload } from 'lucide-react';
import './AddBlog.css';
import { api } from '../services/api';

export function EditBlog() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const initialBlog = location.state?.blog;
  const cameFromDetails = location.state?.from === 'details';
  const cameFromAdmin = Boolean(location.state?.admin);

  const [blogPost, setBlogPost] = useState({
    title: initialBlog?.title || '',
    category: initialBlog?.category || 'Camping Tips',
    content: initialBlog?.content || '',
    imageUrl: initialBlog?.imageUrl || '',
  });
  const [existingFeaturedPath, setExistingFeaturedPath] = useState(initialBlog?.featuredImage || '');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!initialBlog);

  // Fallback: load blogs and find by id if navigated directly
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (initialBlog) return;
      try {
        setLoading(true);
        const res = await api.getBlogs();
        const items = Array.isArray(res?.data) ? res.data : [];
        const found = items.find((b) => (b._id === id || b.id === id));
        if (isMounted && found) {
          setBlogPost({
            title: found.title || '',
            category: found.category || 'Camping Tips',
            content: found.content || '',
            imageUrl: found.imageUrl || '',
          });
          setExistingFeaturedPath(found.featuredImage || '');
        }
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load blog');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [id, initialBlog]);

  const displayImageUrl = useMemo(() => {
    if (featuredImage) return URL.createObjectURL(featuredImage);
    if (existingFeaturedPath) return `${api.baseUrl}${existingFeaturedPath}`;
    return blogPost.imageUrl || '';
  }, [featuredImage, existingFeaturedPath, blogPost.imageUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlogPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        title: blogPost.title,
        category: blogPost.category,
        content: blogPost.content,
        imageUrl: blogPost.imageUrl,
      };
      if (featuredImage) payload.featuredImage = featuredImage; // send multipart
      // Note: if no new file picked, backend should keep existing featuredImage when not provided
      await api.updateBlog(id, payload);
      // If we came from details, go back to details and preserve admin flag for visibility
      if (cameFromDetails) {
        navigate(cameFromAdmin ? `/blog/${id}?admin=1` : `/blog/${id}`);
      } else {
        navigate('/blog');
      }
    } catch (err) {
      setError(err.message || 'Failed to update blog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/blog');

  if (loading) return <div className="add-blog-page"><div className="no-results"><p>Loading blog...</p></div></div>;

  return (
    <div className="add-blog-page">
      <div className="add-blog-header">
        <h1 className="add-blog-title">
          Edit <span className="title-highlight">Blog Post</span>
        </h1>
        <p className="add-blog-subtitle">Update your blog content</p>
      </div>

      <div className="add-blog-container">
        <div className="add-blog-form-container">
          <form onSubmit={handleSubmit}>
            {!!error && (
              <div className="form-error" role="alert" style={{ color: 'crimson', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={blogPost.title}
                onChange={handleChange}
                placeholder="Enter blog title"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                id="category"
                name="category"
                value={blogPost.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Camping Tips">Camping Tips</option>
                <option value="Gear Reviews">Gear Reviews</option>
                <option value="Camping Recipes">Camping Recipes</option>
                <option value="Destinations & Locations">Destinations & Locations</option>
                <option value="Beginner Guides">Beginner Guides</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">Content</label>
              <textarea
                id="content"
                name="content"
                value={blogPost.content}
                onChange={handleChange}
                placeholder="Write your blog content here..."
                className="form-textarea"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Featured Image</label>
              <div className="image-upload-area">
                <div className="image-upload-content">
                  <Upload size={48} className="upload-icon" />
                  <p className="upload-text">Upload a featured image for your blog</p>
                  <label className="upload-button" style={{ cursor: 'pointer' }}>
                    Select Image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
              <div className="url-input-section">
                <p className="url-label">Or enter image URL:</p>
                <input
                  type="url"
                  name="imageUrl"
                  value={blogPost.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="form-input"
                />
              </div>
              {displayImageUrl && (
                <div style={{ marginTop: 12 }}>
                  <img src={displayImageUrl} alt="Preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="cancel-button">Cancel</button>
              <button type="submit" className="submit-button" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
