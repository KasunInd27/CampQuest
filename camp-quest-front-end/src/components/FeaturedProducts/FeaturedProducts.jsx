// components/FeaturedProducts.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useRental } from '../../context/RentalContext';
import './FeaturedProducts.css';

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState('rent');
  const { addToCart } = useCart();
  const { addRentalItem } = useRental();

  const products = [
    {
      name: '4-Person Camping Tent',
      price: 'Rs.45.99',
      rentalPrice: 'Rs.12.99/day',
      rating: 4.8,
      reviewCount: 124,
      image:
        'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
      category: 'rent',
    },
    {
      name: 'Portable Camping Stove',
      price: 'Rs.89.99',
      rentalPrice: 'Rs.15.99/day',
      rating: 4.7,
      reviewCount: 86,
      image:
        'https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80',
      category: 'sale',
    },
    {
      name: 'Sleeping Bag',
      price: 'Rs.65.99',
      rentalPrice: 'Rs.8.99/day',
      rating: 4.9,
      reviewCount: 215,
      image:
        'https://images.unsplash.com/photo-1606851682837-019baf2e8da4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
      category: 'rent',
    },
    {
      name: 'Hiking Backpack',
      price: 'Rs.129.99',
      rentalPrice: 'Rs.18.99/day',
      rating: 4.6,
      reviewCount: 92,
      image:
        'https://images.unsplash.com/photo-1622260614153-03223fb3ffc1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80',
      category: 'sale',
    },
  ];

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter((product) => product.category === activeTab);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
        stroke={i < Math.floor(rating) ? '#fbbf24' : '#d1d5db'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
      </svg>
    ));
  };

  const handleProductAction = (product) => {
    if (product.category === 'rent') {
      // Convert price string to number for rental items
      const rentalPrice = parseFloat(product.rentalPrice.replace('Rs.', '').replace('/day', ''));
      addRentalItem({
        id: `rental-${Date.now()}`,
        name: product.name,
        price: rentalPrice,
        image: product.image,
        quantity: 1,
        reviews: product.reviewCount,
        rating: product.rating,
      });
    } else {
      // Convert price string to number for sale items
      const salePrice = parseFloat(product.price.replace('Rs.', ''));
      addToCart({
        id: `sale-${Date.now()}`,
        name: product.name,
        price: salePrice,
        image: product.image,
        quantity: 1,
        reviews: product.reviewCount,
        rating: product.rating,
      });
    }
  };


  return (
    <section className="featured-products">
      <div className="products-container">
        <div className="products-header">
          <h2 className="products-title">
            Featured Equipment
          </h2>
          <div className="tab-selector">
            <button
              onClick={() => setActiveTab('rent')}
              className={`tab-btn ${activeTab === 'rent' ? 'active' : ''}`}
            >
              For Rent
            </button>
            <button
              onClick={() => setActiveTab('sale')}
              className={`tab-btn ${activeTab === 'sale' ? 'active' : ''}`}
            >
              For Sale
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            >
              View All
            </button>
          </div>
        </div>
        <div className="products-grid">
          {filteredProducts.map((product, index) => (
            <div key={index} className="product-card">
              <div className="product-image">
                <img
                  src={product.image}
                  alt={product.name}
                />
                <span className="product-badge">
                  {product.category === 'rent' ? 'RENTAL' : 'FOR SALE'}
                </span>
              </div>
              <div className="product-info">
                <div className="product-rating">
                  <div className="stars">
                    {renderStars(product.rating)}
                  </div>
                  <span className="review-count">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                <h3 className="product-name">
                  {product.name}
                </h3>
                <div className="product-price">
                  {product.category === 'rent' ? product.rentalPrice : product.price}
                </div>
                <button 
                  className="product-btn"
                  onClick={() => handleProductAction(product)}
                >
                  {product.category === 'rent' ? 'Add to Rent' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="products-footer">
          <Link to="/shop" className="view-all-btn">
            View All Equipment
          </Link>
        </div>
      </div>
    </section>
  );
}