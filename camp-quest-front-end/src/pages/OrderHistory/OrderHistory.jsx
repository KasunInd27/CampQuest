// pages/OrderHistory/OrderHistory.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './OrderHistory.css';

export function OrderHistory() {
  const { orders } = useOrder();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const filteredOrders = orders.filter((order) => {
    // Filter by search query (order ID)
    const matchesSearch = order.id
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'processing':
        return 'status-processing';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="order-history-page">
      <Header />
      <div className="history-container">
        <div className="history-content">
          <h1 className="history-title">Order History</h1>
          
          <div className="history-card">
            <div className="filters-section">
              <div className="filters-content">
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      placeholder="Search by order number..."
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
                
                <div className="filter-container">
                  <svg
                    className="filter-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
                  </svg>
                  <label className="filter-label">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="no-orders">
                <p className="no-orders-text">
                  No orders found matching your criteria.
                </p>
                <Link to="/shop" className="shop-link">
                  Go Shopping
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div
                      className="order-header"
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      <div className="order-basic-info">
                        <div className="order-id-status">
                          <h3 className="order-id">{order.id}</h3>
                          <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="order-date">
                          Ordered on {formatDate(order.orderDate)}
                        </p>
                      </div>
                      
                      <div className="order-summary-info">
                        <div className="order-total-info">
                          <p className="order-total">Rs.{order.totalAmount.toFixed(2)}</p>
                          <p className="items-count">{order.items.length} items</p>
                        </div>
                        <div className="expand-icon">
                          {expandedOrderId === order.id ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18,15 12,9 6,15"></polyline>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6,9 12,15 18,9"></polyline>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedOrderId === order.id && (
                      <div className="order-details">
                        <div className="details-grid">
                          <div className="address-section">
                            <h4 className="detail-title">Delivery Address</h4>
                            <div className="address-text">
                              <p>{order.deliveryAddress.firstName} {order.deliveryAddress.lastName}</p>
                              <p>{order.deliveryAddress.street}</p>
                              <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                            </div>
                          </div>
                          
                          <div className="order-info-section">
                            <h4 className="detail-title">Order Information</h4>
                            <div className="order-info-text">
                              <p>
                                <span className="info-label">Payment Method:</span> {order.paymentMethod}
                              </p>
                              <p>
                                <span className="info-label">Estimated Delivery:</span> {formatDate(order.estimatedDeliveryDate)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <h4 className="detail-title items-title">Items</h4>
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

                        <div className="view-details-link">
                          <Link
                            to={`/order-confirmation/${order.id}`}
                            className="details-link"
                          >
                            View Details
                            <svg className="external-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15,3 21,3 21,9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}