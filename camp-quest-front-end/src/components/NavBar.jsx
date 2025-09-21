import React from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import './NavBar.css';

export function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <a href="/" className="navbar-logo">
            <span className="logo-text">
              Camp<span className="logo-highlight">Quest</span>
            </span>
          </a>
          <nav className="navbar-nav">
            <a href="/" className="nav-link">
              Home
            </a>
            <a href="/rent" className="nav-link">
              Rent
            </a>
            <a href="/blog" className="nav-link nav-link-active">
              Blog
            </a>
            <a href="/about" className="nav-link">
              About
            </a>
            <a href="/contact" className="nav-link">
              Contact
            </a>
            <div className="navbar-actions">
              <button className="action-btn">
                <Search size={20} />
              </button>
              <button className="action-btn cart-btn">
                <ShoppingCart size={20} />
                <span className="cart-badge">1</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}