// pages/Settings.jsx
import React, { useState } from 'react'
import {
  Save,
  User,
  Bell,
  Shield,
  CreditCard,
  FileText,
  Mail,
  Globe,
} from 'lucide-react'
import './Settings.css'

export function Settings() {
  const [activeTab, setActiveTab] = useState('account')

  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>
      <div className="settings-container">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button
              onClick={() => setActiveTab('account')}
              className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
            >
              <User size={18} />
              Account Settings
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            >
              <Bell size={18} />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            >
              <Shield size={18} />
              Security
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`settings-nav-item ${activeTab === 'payment' ? 'active' : ''}`}
            >
              <CreditCard size={18} />
              Payment Methods
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`settings-nav-item ${activeTab === 'email' ? 'active' : ''}`}
            >
              <Mail size={18} />
              Email Templates
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`settings-nav-item ${activeTab === 'system' ? 'active' : ''}`}
            >
              <Globe size={18} />
              System Settings
            </button>
          </nav>
        </div>
        
        <div className="settings-content">
          {activeTab === 'account' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Account Settings</h2>
              <div className="profile-section">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <User size={32} />
                  </div>
                  <div className="profile-info">
                    <h3>Admin User</h3>
                    <p className="profile-email">admin@campquest.com</p>
                    <a href="#" className="profile-change-link">Change profile picture</a>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" defaultValue="Admin" />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" defaultValue="User" />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" defaultValue="admin@campquest.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" defaultValue="(555) 123-4567" />
                  </div>
                </div>
                <button className="btn btn-primary">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Notification Settings</h2>
              <div className="settings-list">
                <div className="settings-item">
                  <div className="settings-item-info">
                    <h3>New Orders</h3>
                    <p className="settings-item-description">
                      Receive email notifications for new orders
                    </p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="settings-item">
                  <div className="settings-item-info">
                    <h3>Low Stock Alerts</h3>
                    <p className="settings-item-description">
                      Get notified when inventory is running low
                    </p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              <button className="btn btn-primary">
                <Save size={16} />
                Save Preferences
              </button>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Security Settings</h2>
              <div>
                <h3>Change Password</h3>
                <div className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" placeholder="Enter current password" />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" placeholder="Enter new password" />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" placeholder="Confirm new password" />
                  </div>
                </div>
                <button className="btn btn-primary">Update Password</button>
              </div>
            </div>
          )}
          
          {activeTab === 'email' && (
            <div className="settings-section">
              <h2 className="settings-section-title">Email Templates</h2>
              <div className="settings-list">
                <div className="template-card">
                  <div className="template-header">
                    <h3 className="template-title">Order Confirmation</h3>
                    <a href="#" className="template-edit-link">Edit Template</a>
                  </div>
                  <p className="template-description">
                    Sent automatically when a customer places an order
                  </p>
                  <div className="template-file">
                    <FileText size={16} />
                    <span className="template-filename">order_confirmation.html</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}