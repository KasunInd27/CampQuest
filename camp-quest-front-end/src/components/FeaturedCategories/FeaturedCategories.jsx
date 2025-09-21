// components/FeaturedCategories.jsx
import React from 'react';
import './FeaturedCategories.css';

export function FeaturedCategories() {
  const categories = [
    {
      name: 'Tents & Shelters',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 21 14 3l10.5 18H3.5Z"></path>
          <path d="M12 13.5 7.5 21"></path>
          <path d="M16.5 21 12 13.5"></path>
        </svg>
      ),
    },
    {
      name: 'Navigation Tools',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"></polygon>
        </svg>
      ),
    },
    {
      name: 'Cooking Equipment',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
          <path d="M7 2v20"></path>
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </svg>
      ),
    },
    {
      name: 'Campfire Essentials',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
      ),
    },
  ];

  return (
    <section className="featured-categories">
      <div className="featured-categories-container">
        <h2 className="featured-categories-title">
          Explore Our Categories
        </h2>
        <div className="featured-categories-grid">
          {categories.map((category, index) => (
            <div key={index} className="category-card">
              <div className="category-icon">
                {category.icon}
              </div>
              <h3 className="category-name">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}