// pages/Shop/Shop.jsx
import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/products';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './Shop.css';

export function Shop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [activeCategory, setActiveCategory] = useState('All');
  const { addToCart } = useCart();

  const categories = [
    'All',
    ...new Set(products.map((product) => product.category)),
  ];

  useEffect(() => {
    let result = products;
    
    // Filter by category
    if (activeCategory !== 'All') {
      result = result.filter((product) => product.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query),
      );
    }
    
    // Only show products for sale
    result = result.filter((product) => product.forSale);
    setFilteredProducts(result);
  }, [searchQuery, activeCategory]);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
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
    <div className="shop-page">
      <Header />
      <div className="shop-container">
        <div className="shop-content">
          {/* Hero Banner */}
          <div className="hero-banner">
            <div className="hero-content">
              <h1 className="hero-title">
                Shop Premium <span className="hero-highlight">Camping Gear</span>
              </h1>
              <p className="hero-subtitle">
                Find high-quality equipment for your next adventure
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="search-filter-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search products..."
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

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p className="no-products-text">
                No products found matching your criteria.
              </p>
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
              >
                Clear Filters
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
                    <span className="product-badge">FOR SALE</span>
                  </div>
                  
                  <div className="product-info">
                    <div className="product-rating">
                      <div className="stars-container">
                        {renderStars(product.rating)}
                      </div>
                      <span className="reviews-count">
                        ({product.reviews} reviews)
                      </span>
                    </div>
                    
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">Rs.{product.price.toFixed(2)}</p>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="add-to-cart-btn"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}