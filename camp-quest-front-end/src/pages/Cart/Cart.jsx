// pages/Cart/Cart.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './Cart.css';

export function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <Header />
        <div className="cart-page-main">
          <div className="cart-page-content">
            <h1 className="cart-page-title">Your Shopping Cart</h1>
            <div className="cart-empty-state">
              <h2 className="cart-empty-title">Your cart is empty</h2>
              <p className="cart-empty-description">
                Browse our collection and add items to your cart.
              </p>
              <Link to="/shop" className="cart-shop-button">
                <svg className="cart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <Header />
      <div className="cart-page-main">
        <div className="cart-page-content">
          <div className="cart-page-header">
            <h1 className="cart-page-title">Your Shopping Cart</h1>
            <Link to="/shop" className="cart-continue-shopping-link">
              <svg className="cart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
              Continue Shopping
            </Link>
          </div>
          
          <div className="cart-page-grid">
            <div className="cart-items-section">
              <div className="cart-items-section-header">
                <div className="cart-items-section-info">
                  <h2 className="cart-items-section-title">
                    Cart Items ({cartItems.length})
                  </h2>
                  <button onClick={clearCart} className="cart-clear-button">
                    Clear Cart
                  </button>
                </div>
              </div>
              
              <div className="cart-items-container">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-product-item">
                    <div className="cart-product-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    
                    <div className="cart-product-details">
                      <h3 className="cart-product-name">{item.name}</h3>
                      <p className="cart-product-price">Rs.{item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="cart-product-quantity">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="cart-quantity-button"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <span className="cart-quantity-display">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="cart-quantity-button"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                    
                    <div className="cart-product-actions">
                      <span className="cart-product-total">
                        Rs.{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="cart-remove-button"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3,6 5,6 21,6"></polyline>
                          <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="cart-summary-section">
              <h2 className="cart-summary-title">Order Summary</h2>
              
              <div className="cart-summary-details">
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Subtotal</span>
                  <span className="cart-summary-value">Rs.{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Delivery Charges</span>
                  <span className="cart-summary-value">Rs.450</span>
                </div>
                <div className="cart-summary-total">
                  <div className="cart-summary-row">
                    <span className="cart-summary-label">Total</span>
                    <span className="cart-summary-value">Rs.{(getTotalPrice() + 450).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <Link to="/checkout" className="cart-checkout-button">
                Proceed to Checkout
              </Link>
              
              <div className="cart-checkout-info">
                <p>Secure checkout powered by Stripe</p>
                <p>Free delivery on all orders over Rs.5000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}