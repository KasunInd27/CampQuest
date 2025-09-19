import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tags,
  MessageSquare,
  Users,
  X,
  ShoppingCart,
  CalendarClock,
  Settings,
} from 'lucide-react'
import './Sidebar.css'

export function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-text">
              <span className="logo-highlight">Camp</span>Quest
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="sidebar-close mobile-only"
          >
            <X size={20} />
          </button>
        </div>
        <div className="sidebar-content">
          <p className="sidebar-section-title">Main</p>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <p className="sidebar-section-title">Orders</p>
            <NavLink to="/rental-orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CalendarClock size={18} />
              Rental Orders
            </NavLink>
            <NavLink to="/sales-orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShoppingCart size={18} />
              Sales Orders
            </NavLink>
            <p className="sidebar-section-title">Inventory</p>
            <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Package size={18} />
              Products
            </NavLink>
            <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Tags size={18} />
              Categories
            </NavLink>
            <p className="sidebar-section-title">Customer</p>
            <NavLink to="/feedback" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <MessageSquare size={18} />
              Feedback
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              Users
            </NavLink>
            <p className="sidebar-section-title">Admin</p>
            <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Settings size={18} />
              Settings
            </NavLink>
          </nav>
        </div>
      </div>
    </>
  )
}