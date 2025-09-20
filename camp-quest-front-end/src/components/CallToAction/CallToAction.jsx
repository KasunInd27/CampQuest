// components/CallToAction.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './CallToAction.css';

export function CallToAction() {
  return (
    <section className="call-to-action">
      <div className="cta-container">
        <div className="cta-content">
          <h2 className="cta-title">
            Ready for Your Next Adventure?
          </h2>
          <p className="cta-description">
            Whether you need to rent equipment for a weekend getaway or want to
            purchase quality gear for your outdoor lifestyle, we've got you
            covered.
          </p>
          <div className="cta-buttons">
            <Link to="/rental-list" className="cta-btn-primary">
              Browse Rental Equipment
            </Link>
            <Link to="/shop" className="cta-btn-secondary">
              Shop Our Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}