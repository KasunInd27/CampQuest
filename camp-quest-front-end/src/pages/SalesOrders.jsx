// pages/SalesOrders.jsx
import React, { useState } from 'react'
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Printer,
  Mail,
  Package,
  Truck,
} from 'lucide-react'
import './SalesOrders.css'

const mockSalesOrders = [
  {
    id: 'SLS-2023-2001',
    customer: 'John Smith',
    items: [
      { name: 'Camping Tent - 4 Person', quantity: 1, price: 199.99 },
      { name: 'Sleeping Bag - Winter', quantity: 1, price: 89.99 },
    ],
    totalItems: 2,
    orderDate: '2023-11-18',
    total: 289.98,
    status: 'Delivered',
    paymentStatus: 'Paid',
    shippingMethod: 'Standard Shipping',
  },
  {
    id: 'SLS-2023-2002',
    customer: 'Sarah Johnson',
    items: [
      { name: 'Hiking Backpack - 65L', quantity: 1, price: 129.99 },
      { name: 'Trekking Poles', quantity: 1, price: 45.99 },
    ],
    totalItems: 2,
    orderDate: '2023-11-19',
    total: 175.98,
    status: 'Processing',
    paymentStatus: 'Paid',
    shippingMethod: 'Express Shipping',
  },
]

export function SalesOrders() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(null)

  const filteredOrders = mockSalesOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="sales-orders-page">
      <div className="page-header">
        <h1 className="page-title">Sales Orders</h1>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Printer size={16} />
            Print Report
          </button>
        </div>
      </div>
      
      <div className="order-summary">
        <div className="summary-card">
          <h3>Processing</h3>
          <p className="summary-value">3</p>
          <div className="summary-note processing">1 awaiting payment</div>
        </div>
        <div className="summary-card">
          <h3>Shipped/In Transit</h3>
          <p className="summary-value">1</p>
          <div className="summary-note shipped">Estimated delivery: Nov 25</div>
        </div>
        <div className="summary-card">
          <h3>Delivered This Month</h3>
          <p className="summary-value">2</p>
          <div className="summary-note">$419.96 in revenue</div>
        </div>
      </div>

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
                <th>Items</th>
                <th>Date</th>
                <th>Delivery Address</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <button className="order-link">{order.id}</button>
                  </td>
                  <td>{order.customer}</td>
                  <td>{order.itemName}</td>
                  <td>{order.orderDate}</td>
                  <td>{order.deliveryaddress}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    <span className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-status ${order.paymentStatus.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <button className="action-menu-btn">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
