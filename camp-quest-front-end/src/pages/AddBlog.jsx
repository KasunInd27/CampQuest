import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload } from 'lucide-react';
import './AddBlog.css';
import { api } from '../services/api';

export function AddBlog() {
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState({
    title: '',
    category: 'Camping Tips',
    content: '',
    imageUrl: '',
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlogPost((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        isPublished: true,
      };
      if (featuredImage) payload.featuredImage = featuredImage;
      await api.createBlog(payload);
      navigate('/blog');
    } catch (err) {
      setError(err.message || 'Failed to publish blog');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/blog');
  };

  return (
    <div className="add-blog-page">
      <div className="add-blog-header">
        <h1 className="add-blog-title">
          Create New <span className="title-highlight">Blog Post</span>
        </h1>
        <p className="add-blog-subtitle">
          Share your camping knowledge and experiences
        </p>
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
              <label htmlFor="title" className="form-label">
                Title
              </label>
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
              <label htmlFor="category" className="form-label">
                Category
              </label>
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
                <option value="Destinations & Locations">
                  Destinations & Locations
                </option>
                <option value="Beginner Guides">Beginner Guides</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Content
              </label>
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
                  <p className="upload-text">
                    Upload a featured image for your blog
                  </p>
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
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-button"
              >
                Cancel
              </button>
              <button type="submit" className="submit-button" disabled={submitting}>
                {submitting ? 'Publishing...' : 'Publish Blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}