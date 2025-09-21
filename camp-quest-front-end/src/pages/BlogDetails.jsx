import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, ThumbsUp, Heart, Smile, Star } from 'lucide-react';
import './Blog.css';
import { api } from '../services/api';

export function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [reacting, setReacting] = React.useState(false);
  const isAdmin = React.useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('admin') === '1';
    } catch {
      return false;
    }
  }, []);

  const fetchBlog = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getBlogById(id);
      const item = res?.data || null;
      setBlog(item);
    } catch (e) {
      setError(e.message || 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  // Users can react on details page (admin cannot)
  const handleReact = async (reactionType) => {
    if (isAdmin || !blog || reacting) return;
    try {
      setReacting(true);
      // optimistic UI update
      setBlog((prev) => ({
        ...prev,
        reactions: {
          likes: reactionType === 'likes' ? (prev.reactions?.likes || 0) + 1 : (prev.reactions?.likes || 0),
          loves: reactionType === 'loves' ? (prev.reactions?.loves || 0) + 1 : (prev.reactions?.loves || 0),
          smiles: reactionType === 'smiles' ? (prev.reactions?.smiles || 0) + 1 : (prev.reactions?.smiles || 0),
          stars: reactionType === 'stars' ? (prev.reactions?.stars || 0) + 1 : (prev.reactions?.stars || 0),
        },
      }));
      const res = await api.reactToBlog(id, reactionType);
      const newReactions = res?.reactions;
      if (newReactions) setBlog((prev) => ({ ...prev, reactions: newReactions }));
    } catch (e) {
      // revert by refetch
      await fetchBlog();
      alert(e.message || 'Failed to react');
    } finally {
      setReacting(false);
    }
  };

  const handleEdit = () => {
    // pass context so EditBlog can return to details and know admin flag
    navigate(`/blog/edit/${id}`, { state: { blog, from: 'details', admin: isAdmin } });
  };

  const handleDelete = async () => {
    const ok = window.confirm('Are you sure you want to delete this blog?');
    if (!ok) return;
    try {
      await api.deleteBlog(id);
      navigate('/blog?admin=1');
    } catch (e) {
      alert(e.message || 'Failed to delete blog');
    }
  };

  if (loading) return <div className="blog-page"><div className="no-results"><p>Loading...</p></div></div>;
  if (error) return <div className="blog-page"><div className="no-results"><p>{error}</p></div></div>;
  if (!blog) return null;

  const imageSrc = blog.featuredImage ? `${api.baseUrl}${blog.featuredImage}` : (blog.imageUrl || '');
  const publishDate = blog.formattedDate || (blog.publishDate ? new Date(blog.publishDate).toLocaleDateString('en-US') : '');

  return (
    <div className="blog-page">
      <div className="blog-header">
        <button className="add-blog-btn" onClick={() => navigate(isAdmin ? '/blog?admin=1' : '/blog')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={18} /> Back to Blog
        </button>
      </div>

      <div className="blog-container">
        <article className="blog-detail">
          {imageSrc && (
            <div className="blog-detail-image">
              <img src={imageSrc} alt={blog.title} />
            </div>
          )}

          <h1 className="blog-title" style={{ marginTop: 12 }}>{blog.title}</h1>
          <div className="blog-card-header" style={{ marginBottom: 16 }}>
            <span className="blog-card-category">{(blog.category || '').toUpperCase()}</span>
            <span className="blog-card-date">{publishDate}</span>
          </div>

          {blog.author && (
            <p style={{ opacity: 0.8, marginBottom: 16 }}>By {blog.author}</p>
          )}

          <div className="blog-content" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {blog.content}
          </div>

          {!isAdmin && (
            <div className="blog-card-reactions" style={{ marginTop: 24 }}>
              <div className="reactions-buttons">
                <button className="reaction-btn reaction-likes" disabled={reacting} onClick={() => handleReact('likes')}>
                  <ThumbsUp size={18} /> <span>{blog.reactions?.likes || 0}</span>
                </button>
                <button className="reaction-btn reaction-loves" disabled={reacting} onClick={() => handleReact('loves')}>
                  <Heart size={18} /> <span>{blog.reactions?.loves || 0}</span>
                </button>
                <button className="reaction-btn reaction-smiles" disabled={reacting} onClick={() => handleReact('smiles')}>
                  <Smile size={18} /> <span>{blog.reactions?.smiles || 0}</span>
                </button>
                <button className="reaction-btn reaction-stars" disabled={reacting} onClick={() => handleReact('stars')}>
                  <Star size={18} /> <span>{blog.reactions?.stars || 0}</span>
                </button>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="blog-card-reactions" style={{ marginTop: 24 }}>
              <div className="reactions-static" style={{ display: 'flex', gap: 10, opacity: 0.9 }}>
                <span title="Likes" className="reaction-static"><ThumbsUp size={16} /> {blog.reactions?.likes || 0}</span>
                <span title="Loves" className="reaction-static"><Heart size={16} /> {blog.reactions?.loves || 0}</span>
                <span title="Smiles" className="reaction-static"><Smile size={16} /> {blog.reactions?.smiles || 0}</span>
                <span title="Stars" className="reaction-static"><Star size={16} /> {blog.reactions?.stars || 0}</span>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="blog-card-actions" style={{ marginTop: 24, display: 'flex', gap: 8 }}>
              <button className="action-btn edit-btn" onClick={handleEdit}>
                <Edit2 size={18} /> Edit
              </button>
              <button className="action-btn delete-btn" onClick={handleDelete}>
                <Trash2 size={18} /> Delete
              </button>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
