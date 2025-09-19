// pages/RentalOrders.jsx
import React, { useState } from 'react'
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Printer,
  Mail,
} from 'lucide-react'
import './RentalOrders.css'

const mockRentalOrders = [
  {
    id: 'RNT-2023-1001',
    customer: 'John Smith',
    items: [
      { name: 'Camping Tent - 4 Person', quantity: 1 },
      { name: 'Sleeping Bag - Winter', quantity: 2 },
    ],
    totalItems: 2,
    startDate: '2023-11-20',
    endDate: '2023-11-25',
    total: 129.95,
    status: 'Active',
    paymentStatus: 'Paid',
  },
  {
    id: 'RNT-2023-1002',
    customer: 'Sarah Johnson',
    items: [
      { name: 'Hiking Backpack - 65L', quantity: 1 },
      { name: 'Portable Camping Stove', quantity: 1 },
      { name: 'Water Filter System', quantity: 1 },
    ],
    totalItems: 3,
    startDate: '2023-11-22',
    endDate: '2023-11-28',
    total: 89.97,
    status: 'Reserved',
    paymentStatus: 'Pending',
  },
]

export function RentalOrders() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(null)

  const filteredOrders = mockRentalOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const orderDetails = mockRentalOrders.find(
    (order) => order.id === selectedOrder,
  )

  const handleActionClick = (orderId) => {
    setActionMenuOpen(actionMenuOpen === orderId ? null : orderId)
  }

  return (
    <div className="rental-orders-page">
      <div className="page-header">
        <h1 className="page-title">Rental Orders</h1>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Printer size={16} />
            Print Report
          </button>
        </div>
      </div>
      
      <div className="order-summary">
        <div className="summary-card">
          <h3>Active Rentals</h3>
          <p className="summary-value">1</p>
          <div className="summary-note active">1 due for return today</div>
        </div>
        <div className="summary-card">
          <h3>Reserved Rentals</h3>
          <p className="summary-value">3</p>
          <div className="summary-note reserved">1 pickup scheduled today</div>
        </div>
        <div className="summary-card">
          <h3>Completed This Month</h3>
          <p className="summary-value">2</p>
          <div className="summary-note">$134.91 in revenue</div>
        </div>
      </div>

      {selectedOrder ? (
        <div className="order-details">
          <div className="order-details-header">
            <div className="order-details-title">
              <button
                onClick={() => setSelectedOrder(null)}
                className="back-btn"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2>Order {orderDetails?.id}</h2>
                <p>Customer: {orderDetails?.customer}</p>
              </div>
            </div>
            <div className="order-details-actions">
              <button className="btn btn-secondary">
                <Mail size={16} />
                Email Receipt
              </button>
              <button className="btn btn-primary">Update Status</button>
            </div>
          </div>
          
          <div className="order-info-grid">
            <div className="order-info-card">
              <h3>Rental Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <p className="info-label">Start Date</p>
                  <p className="info-value">
                    <Calendar size={16} />
                    {orderDetails?.startDate}
                  </p>
                </div>
                <div className="info-item">
                  <p className="info-label">End Date</p>
                  <p className="info-value">
                    <Calendar size={16} />
                    {orderDetails?.endDate}
                  </p>
                </div>
                <div className="info-item">
                  <p className="info-label">Duration</p>
                  <p className="info-value">
                    <Clock size={16} />
                    5 days
                  </p>
                </div>
                <div className="info-item">
                  <p className="info-label">Status</p>
                  <p className={`info-value status-${orderDetails?.status?.toLowerCase()}`}>
                    <CheckCircle size={16} />
                    {orderDetails?.status}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="order-info-card">
              <h3>Payment Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <p className="info-label">Payment Status</p>
                  <p className={`info-value payment-${orderDetails?.paymentStatus?.toLowerCase()}`}>
                    <CheckCircle size={16} />
                    {orderDetails?.paymentStatus}
                  </p>
                </div>
                <div className="info-item">
                  <p className="info-label">Total Amount</p>
                  <p className="info-value">${orderDetails?.total.toFixed(2)}</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Deposit</p>
                  <p className="info-value">$50.00</p>
                </div>
                <div className="info-item">
                  <p className="info-label">Payment Method</p>
                  <p className="info-value">Credit Card</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="orders-container">
          <div className="orders-controls">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search orders..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <button className="btn btn-secondary">
                <Filter size={16} />
                Filter
              </button>
              <button className="btn btn-secondary">
                <ArrowUpDown size={16} />
                Sort
              </button>
            </div>
          </div>
          
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(order.id)}
                        className="order-link"
                      >
                        {order.id}
                      </button>
                    </td>
                    <td>{order.customer}</td>
                    <td>{order.startDate}</td>
                    <td>{order.endDate}</td>
                    <td>{order.totalItems} items</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <span className={`status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-menu">
                        <button
                          onClick={() => handleActionClick(order.id)}
                          className="action-menu-btn"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {actionMenuOpen === order.id && (
                          <div className="action-dropdown">
                            <button onClick={() => setSelectedOrder(order.id)}>
                              View Details
                            </button>
                            <button>Update Status</button>
                            <button>Send Email</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}