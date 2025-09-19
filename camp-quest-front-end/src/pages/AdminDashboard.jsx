// pages/Dashboard.jsx
import React from 'react'
import { Package, AlertCircle, DollarSign, Users } from 'lucide-react'
import './AdminDashboard.css'

export function AdminDashboard() {
  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard Overview</h1>
      <div className="dashboard-cards">
        <DashboardCard
          title="Total Products"
          value="124"
          icon={<Package className="icon-blue" />}
          change="+4%"
          positive={true}
        />
        <DashboardCard
          title="Low Stock Items"
          value="7"
          icon={<AlertCircle className="icon-red" />}
          change="+2"
          positive={false}
        />
        <DashboardCard
          title="Revenue (Monthly)"
          value="$12,580"
          icon={<DollarSign className="icon-green" />}
          change="+12%"
          positive={true}
        />
        <DashboardCard
          title="Active Users"
          value="342"
          icon={<Users className="icon-purple" />}
          change="+5%"
          positive={true}
        />
      </div>
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2 className="section-title">Recent Inventory Updates</h2>
          <div className="inventory-list">
            <InventoryItem
              name="Camping Tent - 4 Person"
              status="In Stock"
              quantity={24}
              date="2023-11-15"
            />
            <InventoryItem
              name="Portable Camping Stove"
              status="Low Stock"
              quantity={5}
              date="2023-11-14"
            />
            <InventoryItem
              name="Sleeping Bag - Winter"
              status="In Stock"
              quantity={18}
              date="2023-11-12"
            />
            <InventoryItem
              name="Hiking Backpack - 65L"
              status="Low Stock"
              quantity={3}
              date="2023-11-10"
            />
          </div>
        </div>
        <div className="dashboard-section">
          <h2 className="section-title">Recent Customer Feedback</h2>
          <div className="feedback-list">
            <FeedbackItem
              name="John Smith"
              rating={5}
              message="Great service and quality equipment! Will definitely rent again."
              date="2023-11-14"
            />
            <FeedbackItem
              name="Sarah Johnson"
              rating={4}
              message="The tent was in excellent condition. Pickup was easy."
              date="2023-11-13"
            />
            <FeedbackItem
              name="Mike Brown"
              rating={3}
              message="Good equipment but would appreciate more detailed instructions."
              date="2023-11-10"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ title, value, icon, change, positive }) {
  return (
    <div className="dashboard-card">
      <div className="card-content">
        <div className="card-info">
          <p className="card-title">{title}</p>
          <h3 className="card-value">{value}</h3>
        </div>
        <div className="card-icon">
          {icon}
        </div>
      </div>
      <div className={`card-change ${positive ? 'positive' : 'negative'}`}>
        {change} {positive ? 'increase' : 'decrease'} from last month
      </div>
    </div>
  )
}

function InventoryItem({ name, status, quantity, date }) {
  return (
    <div className="inventory-item">
      <div className="item-info">
        <p className="item-name">{name}</p>
        <p className={`item-status ${status === 'Low Stock' ? 'low-stock' : 'in-stock'}`}>
          {status}
        </p>
      </div>
      <div className="item-details">
        <p className="item-quantity">{quantity} units</p>
        <p className="item-date">{date}</p>
      </div>
    </div>
  )
}

function FeedbackItem({ name, rating, message, date }) {
  return (
    <div className="feedback-item">
      <div className="feedback-header">
        <p className="feedback-name">{name}</p>
        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? 'star filled' : 'star'}>
              ★
            </span>
          ))}
        </div>
      </div>
      <p className="feedback-message">{message}</p>
      <p className="feedback-date">{date}</p>
    </div>
  )
}