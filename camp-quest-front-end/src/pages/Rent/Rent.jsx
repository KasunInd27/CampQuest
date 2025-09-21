// pages/Rent/Rent.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../../data/products';
import { useRental } from '../../context/RentalContext';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './Rent.css';

export function Rent() {
  const { addRentalItem } = useRental();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState(
    products.filter((product) => product.forRent),
  );

  // Get unique categories
  const categories = [
    'All',
    ...new Set(
      products
        .filter((product) => product.forRent)
        .map((product) => product.category),
    ),
  ];

  useEffect(() => {
    // Filter products based on search query and selected category
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === 'All' || product.category === activeCategory;
      return product.forRent && matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
  }, [searchQuery, activeCategory]);

  const handleAddToRental = (product) => {
    addRentalItem({
      id: product.id,
      name: product.name,
      price: product.price / 10,
      image: product.image,
      quantity: 1,
      reviews: product.reviews,
      rating: product.rating,
    });
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          className={`star ${i < rating ? 'star-filled' : 'star-empty'}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
        </svg>
      ));
  };

  return (
    <div className="rent-page">
      <Header />
      <div className="rent-container">
        {/* Hero Section */}
        <div className="rent-hero-section">
          <div className="rent-hero-overlay"></div>
          <div className="rent-hero-content">
            <h1 className="rent-hero-title">Rent Premium Camping Gear</h1>
            <p className="rent-hero-subtitle">
              Quality equipment for your next adventure, without the commitment of buying
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-container">
          <div className="search-filter-content">
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search rental equipment..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  className="search-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
            </div>
            <div className="categories-container">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${activeCategory === category ? 'category-btn-active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rental Items Section */}
        <div className="rental-items-section">
          <div className="section-header">
            <h2 className="section-title">Available Rental Equipment</h2>
            <div className="items-count">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'item' : 'items'} found
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-items-card">
              <h3 className="no-items-title">No matching items found</h3>
              <p className="no-items-text">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="reset-filters-btn"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                    <span className="product-badge">FOR RENT</span>
                  </div>
                  <div className="product-info">
                    <div className="product-header">
                      <h3 className="product-name">{product.name}</h3>
                      <span className="product-price">
                        ${(product.price / 10).toFixed(2)}/day
                      </span>
                    </div>
                    <div className="product-rating">
                      <div className="stars-container">
                        {renderStars(product.rating)}
                      </div>
                      <span className="reviews-count">({product.reviews})</span>
                    </div>
                    <p className="product-description">{product.description}</p>
                    <div className="product-footer">
                      <div className="availability-status">
                        {product.available !== false ? (
                          <div className="available">
                            <svg className="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                            <span>Available</span>
                          </div>
                        ) : (
                          <div className="unavailable">
                            <svg className="status-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="15" y1="9" x2="9" y2="15"></line>
                              <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            <span>Unavailable</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToRental(product)}
                        className={`add-to-rental-btn ${product.available === false ? 'disabled' : ''}`}
                        disabled={product.available === false}
                      >
                        <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add to Rental
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="how-it-works-section">
          <div className="how-it-works-container">
            <h2 className="how-it-works-title">How Renting Works</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h3 className="step-title">1. Choose Dates</h3>
                <p className="step-description">
                  Select your rental period, from a single day to multiple weeks
                </p>
              </div>
              <div className="step-card">
                <div className="step-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <h3 className="step-title">2. Add Equipment</h3>
                <p className="step-description">
                  Browse our selection and add items to your rental list
                </p>
              </div>
              <div className="step-card">
                <div className="step-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="M7 15h0M2 9.5h20"></path>
                  </svg>
                </div>
                <h3 className="step-title">3. Pay & Pickup</h3>
                <p className="step-description">
                  Complete your reservation and pick up your gear at our location
                </p>
              </div>
            </div>
            <div className="policies-link-container">
              <Link to="/rental-policies" className="policies-link">
                View Rental Policies
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}