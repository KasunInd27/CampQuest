// pages/Payment/Payment.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { Link } from 'react-router-dom';
import './Payment.css';

export function Payment() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { createOrder } = useOrder();
  
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState(null);

  useEffect(() => {
    // Retrieve delivery details from sessionStorage
    const details = sessionStorage.getItem('deliveryDetails');
    if (!details) {
      // Redirect back to checkout if no delivery details
      navigate('/checkout');
      return;
    }
    setDeliveryDetails(JSON.parse(details));
  }, [navigate]);

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
    }

    // Format expiry date with slash
    if (name === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substr(0, 5);
    }

    setCardDetails((prev) => ({
      ...prev,
      [name]: formattedValue,
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

    if (paymentMethod === 'creditCard') {
      if (!cardDetails.cardNumber.trim()) {
        errors.cardNumber = 'Card number is required';
      } else if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        errors.cardNumber = 'Card number must be 16 digits';
      }

      if (!cardDetails.cardName.trim()) {
        errors.cardName = 'Name on card is required';
      }

      if (!cardDetails.expiryDate.trim()) {
        errors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
        errors.expiryDate = 'Expiry date must be in MM/YY format';
      }

      if (!cardDetails.cvv.trim()) {
        errors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        errors.cvv = 'CVV must be 3 or 4 digits';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Create mock payment ID
      const paymentId = `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // Create order
      const order = createOrder(
        cartItems,
        {
          firstName: deliveryDetails.firstName,
          lastName: deliveryDetails.lastName,
          email: deliveryDetails.email,
          street: deliveryDetails.street,
          city: deliveryDetails.city,
          state: deliveryDetails.state,
          zipCode: deliveryDetails.zipCode,
          phone: deliveryDetails.phone,
        },
        paymentMethod === 'creditCard'
          ? 'Credit Card'
          : paymentMethod === 'paypal'
            ? 'PayPal'
            : 'Apple Pay',
        paymentId,
      );

      // Clear cart
      clearCart();
      // Clear session storage
      sessionStorage.removeItem('deliveryDetails');
      // Navigate to order confirmation
      navigate(`/order-confirmation/${order.id}`);
    }, 2000);
  };

  const subtotal = getTotalPrice();
  const deliveryCharges = 450;
  const total = subtotal + deliveryCharges;

  if (!deliveryDetails) {
    return null; // Loading or redirect will happen in useEffect
  }

  return (
    <div className="payment-page">
      <Header />
      <div className="payment-container">
        <div className="payment-content">
          <div className="payment-header">
            <h1 className="payment-title">Payment</h1>
            <Link to="/checkout" className="back-to-checkout-link">
              <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
              Back to Delivery Details
            </Link>
          </div>

          <div className="payment-layout">
            {/* Payment Form */}
            <div className="payment-form-section">
              <div className="payment-form-card">
                <h2 className="form-section-title">Payment Method</h2>
                
                <div className="payment-methods">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('creditCard')}
                    className={`payment-method-btn ${paymentMethod === 'creditCard' ? 'active' : ''}`}
                  >
                    <svg className="payment-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    <span className="payment-method-text">Credit Card</span>
                    {paymentMethod === 'creditCard' && (
                      <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`payment-method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                  >
                    <span className="paypal-text">
                      <span className="paypal-pay">Pay</span>
                      <span className="paypal-pal">Pal</span>
                    </span>
                    {paymentMethod === 'paypal' && (
                      <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('applePay')}
                    className={`payment-method-btn ${paymentMethod === 'applePay' ? 'active' : ''}`}
                  >
                    <span className="payment-method-text">Apple Pay</span>
                    {paymentMethod === 'applePay' && (
                      <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>
                    )}
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {paymentMethod === 'creditCard' && (
                    <div className="credit-card-form">
                      <div className="form-group full-width">
                        <label htmlFor="cardNumber" className="form-label">
                          Card Number*
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.cardNumber}
                          onChange={handleCardDetailsChange}
                          maxLength={19}
                          className={`form-input ${formErrors.cardNumber ? 'error' : ''}`}
                        />
                        {formErrors.cardNumber && (
                          <p className="error-message">{formErrors.cardNumber}</p>
                        )}
                      </div>

                      <div className="form-group full-width">
                        <label htmlFor="cardName" className="form-label">
                          Name on Card*
                        </label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={cardDetails.cardName}
                          onChange={handleCardDetailsChange}
                          className={`form-input ${formErrors.cardName ? 'error' : ''}`}
                        />
                        {formErrors.cardName && (
                          <p className="error-message">{formErrors.cardName}</p>
                        )}
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="expiryDate" className="form-label">
                            Expiry Date*
                          </label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={cardDetails.expiryDate}
                            onChange={handleCardDetailsChange}
                            className={`form-input ${formErrors.expiryDate ? 'error' : ''}`}
                          />
                          {formErrors.expiryDate && (
                            <p className="error-message">{formErrors.expiryDate}</p>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="cvv" className="form-label">
                            CVV*
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={handleCardDetailsChange}
                            maxLength={4}
                            className={`form-input ${formErrors.cvv ? 'error' : ''}`}
                          />
                          {formErrors.cvv && (
                            <p className="error-message">{formErrors.cvv}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="alternative-payment">
                      <p className="alternative-text">
                        You'll be redirected to PayPal to complete your payment.
                      </p>
                      <div className="alternative-logo paypal-logo">
                        <span className="paypal-pay">Pay</span>
                        <span className="paypal-pal">Pal</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'applePay' && (
                    <div className="alternative-payment">
                      <p className="alternative-text">
                        You'll be redirected to Apple Pay to complete your payment.
                      </p>
                      <div className="alternative-logo apple-logo">
                        Apple Pay
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`pay-btn ${isProcessing ? 'processing' : ''}`}
                  >
                    {isProcessing ? 'Processing Payment...' : `Pay Rs.${total.toFixed(2)}`}
                  </button>

                  <div className="payment-security">
                    <p>Your payment information is encrypted and secure.</p>
                    <p>By completing this purchase, you agree to our Terms of Service and Privacy Policy.</p>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="payment-summary-section">
              <div className="payment-summary-card">
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

                <div className="delivery-address">
                  <h3 className="address-title">Delivery Address</h3>
                  <div className="address-details">
                    <p>{deliveryDetails.firstName} {deliveryDetails.lastName}</p>
                    <p>{deliveryDetails.street}</p>
                    <p>{deliveryDetails.city}, {deliveryDetails.state} {deliveryDetails.zipCode}</p>
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