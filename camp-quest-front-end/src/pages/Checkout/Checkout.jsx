// pages/Checkout/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { Link } from 'react-router-dom';
import './Checkout.css';

export function Checkout() {
  const { cartItems, getTotalPrice } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      errors.phone = 'Phone number is invalid';
    }
    if (!formData.street.trim()) errors.street = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'District is required';
    if (!formData.zipCode.trim()) {
      errors.zipCode = 'Postal code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      errors.zipCode = 'Postal code is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Store delivery details in sessionStorage
      sessionStorage.setItem('deliveryDetails', JSON.stringify(formData));
      // Navigate to payment page
      navigate('/payment');
    }
  };

  const subtotal = getTotalPrice();
  const deliveryCharges = 450;
  const total = subtotal + deliveryCharges;

  return (
    <div className="checkout-page">
      <Header />
      <div className="checkout-container">
        <div className="checkout-content">
          <div className="checkout-header">
            <h1 className="checkout-title">Checkout</h1>
            <Link to="/cart" className="back-to-cart-link">
              <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
              Back to Cart
            </Link>
          </div>
          
          <div className="checkout-layout">
            {/* Delivery Details Form */}
            <div className="delivery-section">
              <div className="delivery-form-card">
                <h2 className="form-section-title">Delivery Details</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label">
                        First Name*
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`form-input ${formErrors.firstName ? 'error' : ''}`}
                      />
                      {formErrors.firstName && (
                        <p className="error-message">{formErrors.firstName}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="lastName" className="form-label">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`form-input ${formErrors.lastName ? 'error' : ''}`}
                      />
                      {formErrors.lastName && (
                        <p className="error-message">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address*
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input ${formErrors.email ? 'error' : ''}`}
                      />
                      {formErrors.email && (
                        <p className="error-message">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        Phone Number*
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(123) 456-7890"
                        className={`form-input ${formErrors.phone ? 'error' : ''}`}
                      />
                      {formErrors.phone && (
                        <p className="error-message">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="street" className="form-label">
                      Street Address*
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      className={`form-input ${formErrors.street ? 'error' : ''}`}
                    />
                    {formErrors.street && (
                      <p className="error-message">{formErrors.street}</p>
                    )}
                  </div>
                  
                  <div className="form-grid-three">
                    <div className="form-group">
                      <label htmlFor="city" className="form-label">
                        City*
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`form-input ${formErrors.city ? 'error' : ''}`}
                      />
                      {formErrors.city && (
                        <p className="error-message">{formErrors.city}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="state" className="form-label">
                        District*
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`form-input ${formErrors.state ? 'error' : ''}`}
                      />
                      {formErrors.state && (
                        <p className="error-message">{formErrors.state}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="zipCode" className="form-label">
                        Postal Code*
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className={`form-input ${formErrors.zipCode ? 'error' : ''}`}
                      />
                      {formErrors.zipCode && (
                        <p className="error-message">{formErrors.zipCode}</p>
                      )}
                    </div>
                  </div>
                  
                  
                  <button type="submit" className="continue-payment-btn">
                    Continue to Payment
                    <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="order-summary-section">
              <div className="order-summary-card">
                <h2 className="form-section-title">Order Summary</h2>
                
                <div className="order-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="order-item">
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <p className="item-name">{item.name}</p>
                        <p className="item-quantity">Qty: {item.quantity}</p>
                      </div>
                      <p className="item-total">
                        Rs.{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="order-totals">
                  <div className="total-row">
                    <span className="total-label">Subtotal</span>
                    <span className="total-value">Rs.{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">Delivery Charges</span>
                    <span className="total-value">Rs.450</span>
                  </div>
                  <div className="total-row final-total">
                    <span className="total-label">Total</span>
                    <span className="total-value">Rs.{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}