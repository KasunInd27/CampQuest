// pages/RentalPolicies/RentalPolicies.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import './RentalPolicies.css';

export function RentalPolicies() {
  return (
    <div className="rental-policies-page">
      <Header />
      
      {/* Hero Section */}
      <div className="policies-hero-section">
        <div className="policies-hero-overlay"></div>
        <div className="policies-hero-content">
          <h1 className="policies-hero-title">Rental Policies</h1>
          <p className="policies-hero-subtitle">
            Everything you need to know about renting from CampQuest
          </p>
        </div>
      </div>

      <div className="policies-container">
        {/* Back to Rentals */}
        <div className="back-link-container">
          <Link to="/rent" className="back-link">
            <svg className="back-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            <span>Back to Rental Equipment</span>
          </Link>
        </div>

        {/* Table of Contents */}
        <div className="toc-card">
          <h2 className="toc-title">Table of Contents</h2>
          <div className="toc-grid">
            <a href="#reservation-policy" className="toc-link">
              <svg className="toc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Reservation Policy
            </a>
            <a href="#rental-periods" className="toc-link">
              <svg className="toc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Rental Periods & Extensions
            </a>
            <a href="#payment" className="toc-link">
              <svg className="toc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="M7 15h0M2 9.5h20"></path>
              </svg>
              Payment & Deposits
            </a>
            <a href="#damage" className="toc-link">
              <svg className="toc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Damage & Loss Policy
            </a>
            <a href="#pickup" className="toc-link">
              <svg className="toc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <path d="m16 8 4-4-4-4"></path>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                <path d="M5 15h9l-1-1v-3a2 2 0 0 0-2-2h-2l3.5-2.5"></path>
              </svg>
              Pickup & Return
            </a>
            <a href="#cancellation" className="toc-link">
              <svg className="toc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              Cancellation Policy
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div className="policies-content">
          <section id="reservation-policy" className="policy-section">
            <div className="section-header">
              <svg className="section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              <h2 className="section-title">Reservation Policy</h2>
            </div>
            <div className="section-content">
              <p className="section-text">
                Reservations can be made online, by phone, or in person at any of our locations. We recommend making reservations at least 48 hours in advance, especially during peak season (May-September) to ensure equipment availability.
              </p>
              <p className="section-text">To confirm your reservation, we require:</p>
              <ul className="policy-list">
                <li>Valid government-issued photo ID</li>
                <li>Credit card for the security deposit</li>
                <li>Completed rental agreement form</li>
              </ul>
              <div className="info-box warning">
                <p className="info-text">
                  <strong>Note:</strong> For group rentals of 10 or more items, please contact our customer service team directly for special arrangements and potential discounts.
                </p>
              </div>
            </div>
          </section>

          <section id="rental-periods" className="policy-section">
            <div className="section-header">
              <svg className="section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h2 className="section-title">Rental Periods & Extensions</h2>
            </div>
            <div className="section-content">
              <p className="section-text">Our standard rental periods are:</p>
              <div className="rental-periods-table">
                <div className="period-row">
                  <span className="period-name">Daily</span>
                  <span className="period-duration">24-hour period</span>
                </div>
                <div className="period-row">
                  <span className="period-name">Weekend</span>
                  <span className="period-duration">Friday 4pm - Monday 10am</span>
                </div>
                <div className="period-row">
                  <span className="period-name">Weekly</span>
                  <span className="period-duration">7 consecutive days</span>
                </div>
                <div className="period-row">
                  <span className="period-name">Monthly</span>
                  <span className="period-duration">30 consecutive days</span>
                </div>
              </div>
              <p className="section-text">
                Extensions are available based on equipment availability. Please contact us at least 24 hours before your scheduled return time to request an extension. Late returns without prior approval will incur additional fees.
              </p>
            </div>
          </section>

          <section id="payment" className="policy-section">
            <div className="section-header">
              <svg className="section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="M7 15h0M2 9.5h20"></path>
              </svg>
              <h2 className="section-title">Payment & Deposits</h2>
            </div>
            <div className="section-content">
              <p className="section-text">
                We accept all major credit cards, debit cards, and cash payments for in-store rentals. Online reservations require a credit card.
              </p>
              <p className="section-text">A security deposit is required for all rentals:</p>
              <ul className="policy-list">
                <li>Small items (under $100 value): $50 deposit</li>
                <li>Medium items ($100-$300 value): $100 deposit</li>
                <li>Large items (over $300 value): $200 deposit</li>
                <li>Specialty equipment: 50% of item value</li>
              </ul>
              <p className="section-text">
                The security deposit will be refunded upon return of the equipment in the same condition as when it was rented. Any damage or cleaning fees will be deducted from the deposit.
              </p>
            </div>
          </section>

          <section id="damage" className="policy-section">
            <div className="section-header">
              <svg className="section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <h2 className="section-title">Damage & Loss Policy</h2>
            </div>
            <div className="section-content">
              <p className="section-text">
                You are responsible for all equipment rented during the rental period. Before leaving our store, please inspect all equipment and report any damage or issues.
              </p>
              <p className="section-text">In case of damage:</p>
              <ul className="policy-list">
                <li>Minor damage: Repair costs will be charged</li>
                <li>Significant damage: Repair costs plus a service fee will be charged</li>
                <li>Irreparable damage or loss: Full replacement cost will be charged</li>
              </ul>
              <div className="info-box tip">
                <p className="info-text">
                  <strong>Tip:</strong> We offer optional damage protection for an additional fee of 10% of the rental cost. This covers accidental damage but not loss or theft.
                </p>
              </div>
            </div>
          </section>

          <section id="pickup" className="policy-section">
            <div className="section-header">
              <svg className="section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <path d="m16 8 4-4-4-4"></path>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                <path d="M5 15h9l-1-1v-3a2 2 0 0 0-2-2h-2l3.5-2.5"></path>
              </svg>
              <h2 className="section-title">Pickup & Return</h2>
            </div>
            <div className="section-content">
              <p className="section-text">
                Equipment pickup and return must be done during our regular business hours:
              </p>
              <div className="hours-table">
                <div className="hours-row">
                  <span className="day">Monday - Friday</span>
                  <span className="hours">9:00 AM - 7:00 PM</span>
                </div>
                <div className="hours-row">
                  <span className="day">Saturday</span>
                  <span className="hours">10:00 AM - 6:00 PM</span>
                </div>
                <div className="hours-row">
                  <span className="day">Sunday</span>
                  <span className="hours">11:00 AM - 5:00 PM</span>
                </div>
              </div>
              <p className="section-text">
                Late returns will be charged an additional day's rental fee, plus a $20 late fee per item. If you know you'll be late, please call us to make arrangements.
              </p>
              <p className="section-text">
                For select large items and for orders over $300, we offer local delivery and pickup for an additional fee based on distance.
              </p>
            </div>
          </section>

          <section id="cancellation" className="policy-section">
            <div className="section-header">
              <svg className="section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <h2 className="section-title">Cancellation Policy</h2>
            </div>
            <div className="section-content">
              <p className="section-text">
                Our cancellation policy is designed to be fair while allowing us to manage our inventory effectively:
              </p>
              <div className="cancellation-table">
                <div className="cancellation-row">
                  <span className="timing">More than 72 hours before pickup</span>
                  <span className="refund full">Full refund</span>
                </div>
                <div className="cancellation-row">
                  <span className="timing">24-72 hours before pickup</span>
                  <span className="refund partial">75% refund</span>
                </div>
                <div className="cancellation-row">
                  <span className="timing">Less than 24 hours before pickup</span>
                  <span className="refund minimal">50% refund</span>
                </div>
                <div className="cancellation-row">
                  <span className="timing">No-show</span>
                  <span className="refund none">No refund</span>
                </div>
              </div>
              <div className="info-box success">
                <p className="info-text">
                  <strong>Weather Policy:</strong> If your trip is affected by severe weather conditions (as determined by official weather advisories), we offer free rescheduling or a full credit for a future rental.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <div className="faq-card">
            <div className="faq-content">
              <div className="faq-item">
                <h3 className="faq-question">Can I reserve equipment for someone else?</h3>
                <p className="faq-answer">
                  Yes, but the person picking up the equipment must present their own valid ID and credit card for the security deposit.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">What if I return equipment early?</h3>
                <p className="faq-answer">
                  We do not offer refunds for early returns, but we appreciate knowing if you'll return items early as it helps us manage inventory.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">Do you provide setup instructions?</h3>
                <p className="faq-answer">
                  Yes, all equipment comes with basic setup instructions. For more complex items like tents, our staff will provide a brief demonstration during pickup.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">Can I extend my rental while I'm on my trip?</h3>
                <p className="faq-answer">
                  Yes, subject to availability. Call our customer service line, and we'll do our best to accommodate your request. Extension fees will apply.
                </p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">What condition should I return the equipment in?</h3>
                <p className="faq-answer">
                  Equipment should be returned clean and dry. Tents and sleeping bags should be free of dirt and debris. A cleaning fee may be applied if items require excessive cleaning.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="contact-section">
          <h2 className="contact-title">Still Have Questions?</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3 className="contact-method">Call Us</h3>
              <p className="contact-info">(800) 555-CAMP</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <h3 className="contact-method">Email Us</h3>
              <p className="contact-info">rentals@campquest.com</p>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3 className="contact-method">Visit Us</h3>
              <p className="contact-info">Find a store near you</p>
            </div>
          </div>
          <div className="contact-button-container">
            <Link to="/contact" className="contact-button">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}