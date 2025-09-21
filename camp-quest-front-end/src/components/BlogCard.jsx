import React from 'react';
import { Link } from 'react-router-dom';
import {
  Edit2,
  Trash2,
  ThumbsUp,
  Heart,
  Smile,
  Star,
} from 'lucide-react';
import './BlogCard.css';

export function BlogCard({
  id,
  title,
  excerpt,
  imageUrl,
  category,
  date,
  author,
  reactions = {
    likes: 0,
    loves: 0,
    smiles: 0,
    stars: 0,
  },
  onReact,
  onEdit,
  onDelete,
}) {
  const handleReaction = (reactionType) => {
    if (onReact) {
      onReact(id, reactionType);
    }
  };

  return (
    <div className="blog-card">
      <div className="blog-card-image">
        <Link to={`/blog/${id}`}>
          <img
            src={imageUrl}
            alt={title}
          />
        </Link>
      </div>
      <div className="blog-card-content">
        <div className="blog-card-header">
          <span className="blog-card-category">
            {category.toUpperCase()}
          </span>
          <span className="blog-card-date">{date}</span>
        </div>
        <h3 className="blog-card-title"><Link to={`/blog/${id}`}>{title}</Link></h3>
        <p className="blog-card-excerpt">{excerpt}</p>
        
        {/* Reactions section */}
        <div className="blog-card-reactions">
          {onReact ? (
            <div className="reactions-buttons">
              <button
                onClick={() => handleReaction('likes')}
                className="reaction-btn reaction-likes"
              >
                <ThumbsUp size={18} />
                <span>{reactions.likes}</span>
              </button>
              <button
                onClick={() => handleReaction('loves')}
                className="reaction-btn reaction-loves"
              >
                <Heart size={18} />
                <span>{reactions.loves}</span>
              </button>
              <button
                onClick={() => handleReaction('smiles')}
                className="reaction-btn reaction-smiles"
              >
                <Smile size={18} />
                <span>{reactions.smiles}</span>
              </button>
              <button
                onClick={() => handleReaction('stars')}
                className="reaction-btn reaction-stars"
              >
                <Star size={18} />
                <span>{reactions.stars}</span>
              </button>
            </div>
          ) : (
            <div className="reactions-static" style={{ display: 'flex', gap: 10, opacity: 0.85 }}>
              <span title="Likes" className="reaction-static"><ThumbsUp size={16} /> {reactions.likes ?? 0}</span>
              <span title="Loves" className="reaction-static"><Heart size={16} /> {reactions.loves ?? 0}</span>
              <span title="Smiles" className="reaction-static"><Smile size={16} /> {reactions.smiles ?? 0}</span>
              <span title="Stars" className="reaction-static"><Star size={16} /> {reactions.stars ?? 0}</span>
            </div>
          )}
        </div>
        
        {(onEdit || onDelete) && (
          <div className="blog-card-actions">
            {onEdit && (
              <button className="action-btn edit-btn" onClick={() => onEdit(id)}>
                <Edit2 size={18} />
              </button>
            )}
            {onDelete && (
              <button className="action-btn delete-btn" onClick={() => onDelete(id)}>
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}