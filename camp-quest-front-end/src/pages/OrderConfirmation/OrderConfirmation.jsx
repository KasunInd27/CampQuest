// pages/OrderConfirmation/OrderConfirmation.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './OrderConfirmation.css';

export function OrderConfirmation() {
  const { orderId } = useParams();
  const { getOrderById } = useOrder();
  const [order, setOrder] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrderById(orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [orderId, getOrderById]);

  const handleDownloadReceipt = () => {
    setIsDownloading(true);
    // Simulate download delay
    setTimeout(() => {
      setIsDownloading(false);
      // In a real app, this would generate a PDF or other document
      alert('Receipt downloaded successfully!');
    }, 1500);
  };

  if (!order) {
    return (
      <div className="order-confirmation-page">
        <Header />
        <div className="not-found-container">
          <div className="not-found-content">
            <h1 className="not-found-title">Order not found</h1>
            <Link to="/" className="home-link">
              Return to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="order-confirmation-page">
      <Header />
      <div className="confirmation-container">
        <div className="confirmation-content">
          <div className="confirmation-card">
            <div className="success-section">
              <div className="success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
              <h1 className="success-title">Order Confirmed!</h1>
              <p className="success-message">
                Thank you for your purchase. Your order has been received.
              </p>
              <p className="email-confirmation">
                A confirmation email has been sent to {order.deliveryAddress.email}.
              </p>
            </div>

            <div className="order-summary-section">
              <div className="order-info-grid">
                <div className="info-item">
                  <p className="info-label">Order Number</p>
                  <p className="info-value">{order.id}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Date</p>
                  <p className="info-value">{formatDate(order.orderDate)}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Total</p>
                  <p className="info-value">Rs.{order.totalAmount.toFixed(2)}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Payment Method</p>
                  <p className="info-value">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            <div className="order-details-section">
              <h2 className="section-title">Order Details</h2>
              
              <div className="order-items">
                {order.items.map((item) => (
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
                  <span className="total-value">Rs.{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span className="total-label">Delivery Charges</span>
                  <span className="total-value">Rs.450</span>
                </div>
                <div className="total-row final-total">
                  <span className="total-label">Total</span>
                  <span className="total-value">Rs.{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="address-delivery-section">
              <div className="address-column">
                <h3 className="column-title">Delivery Address</h3>
                <div className="address-details">
                  <p>{order.deliveryAddress.firstName} {order.deliveryAddress.lastName}</p>
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                </div>
              </div>
              
              <div className="delivery-column">
                <h3 className="column-title">Estimated Delivery</h3>
                <p className="delivery-date">{formatDate(order.estimatedDeliveryDate)}</p>
                <p className="delivery-note">
                  Your order is being processed and will be shipped soon.
                </p>
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={handleDownloadReceipt}
                disabled={isDownloading}
                className="download-btn"
              >
                {isDownloading ? (
                  'Downloading...'
                ) : (
                  <>
                    <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7,10 12,15 17,10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Receipt
                  </>
                )}
              </button>
              
              <Link to="/shop" className="continue-shopping-btn">
                <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
          
          <div className="order-history-link">
            <Link to="/order-history" className="history-link">
              View Order History
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}