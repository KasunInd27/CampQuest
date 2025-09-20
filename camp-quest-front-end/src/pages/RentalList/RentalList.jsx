// pages/RentalList/RentalList.jsx
import React, { useState } from 'react';
import { useRental } from '../../context/RentalContext';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './RentalList.css';

export function RentalList() {
  const {
    rentalItems,
    removeRentalItem,
    updateQuantity,
    startDate,
    endDate,
    setDates,
    getTotalPrice,
    //clearRentals,
  } = useRental();
  
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);

  const handleDateChange = (e, isStart) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    if (isStart) {
      setDates(date, endDate);
    } else {
      setDates(startDate, date);
    }
  };

  const handleGenerateBill = () => {
    setIsGeneratingBill(true);
    // Simulate bill generation
    setTimeout(() => {
      setIsGeneratingBill(false);
      setBillGenerated(true);
    }, 1000);
  };

  const handleDownloadBill = () => {
    // In a real app, this would generate a PDF or other document
    alert('Bill downloaded successfully!');
    setBillGenerated(false);
  };

  const getDayCount = () => {
    if (!startDate || !endDate) return 1;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="rental-list-container">
      <Header />
      <main className="rental-list-main">
        <div className="container">
          <h1 className="rental-list-title">Your Rental List</h1>
          
          {rentalItems.length === 0 ? (
            <div className="empty-rental-list">
              <h2 className="empty-title">Your rental list is empty</h2>
              <p className="empty-description">
                Browse our equipment collection and add items to your rental list.
              </p>
              <button className="btn-primary">Browse Equipment</button>
            </div>
          ) : (
            <div className="rental-list-grid">
              <div className="rental-items-section">
                <div className="rental-items-card">
                  <h2 className="section-title">Rental Items</h2>
                  <div className="rental-items-list">
                    {rentalItems.map((item) => (
                      <div key={item.id} className="rental-item">
                        <div className="item-image">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="item-img"
                          />
                        </div>
                        <div className="item-details">
                          <h3 className="item-name">{item.name}</h3>
                          <p className="item-price">Rs.{item.price.toFixed(2)}/day</p>
                        </div>
                        <div className="quantity-controls">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="quantity-btn"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="quantity-btn"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => removeRentalItem(item.id)}
                          className="remove-btn"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="rental-summary-section">
                <div className="rental-summary-card">
                  <h2 className="section-title">Rental Summary</h2>
                  <div className="date-inputs">
                    <div className="date-input-group">
                      <label className="date-label">Start Date</label>
                      <input
                        type="date"
                        value={formatDate(startDate)}
                        onChange={(e) => handleDateChange(e, true)}
                        className="date-input"
                      />
                    </div>
                    <div className="date-input-group">
                      <label className="date-label">End Date</label>
                      <input
                        type="date"
                        value={formatDate(endDate)}
                        onChange={(e) => handleDateChange(e, false)}
                        className="date-input"
                      />
                    </div>
                  </div>
                  
                  <div className="summary-details">
                    <div className="summary-row">
                      <span className="summary-label">Rental Days:</span>
                      <span className="summary-value">{getDayCount()} days</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Items:</span>
                      <span className="summary-value">
                        {rentalItems.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="summary-total">
                      <span className="total-label">Total:</span>
                      <span className="total-value">Rs.{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {billGenerated ? (
                    <button
                      onClick={handleDownloadBill}
                      className="action-btn1 download-btn"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download Bill
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateBill}
                      disabled={isGeneratingBill}
                      className="action-btn1 order-btn"
                    >
                      {isGeneratingBill ? 'Generating...' : 'Order Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}