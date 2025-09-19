// components/layout/Header.jsx
import React, { useEffect, useState, useRef } from 'react'
import { Menu, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import './AdminHeader.css'

export function Header({ sidebarOpen, setSidebarOpen }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    console.log('Logging out...')
    alert('Logout functionality would go here')
  }

  return (
    <header className="header">
      <button
        onClick={() => setSidebarOpen(true)}
        className="header-menu-btn mobile-only"
      >
        <Menu size={24} />
      </button>
      <h1 className="header-title">Admin Dashboard</h1>
      <div className="header-actions">
        <button className="header-notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div className="header-user-menu" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="header-user-btn"
          >
            <div className="user-avatar">
              <User size={16} />
            </div>
            <span className="user-name">Admin User</span>
            <ChevronDown size={16} className="chevron" />
          </button>
          {userMenuOpen && (
            <div className="user-dropdown">
              <a href="/settings" className="dropdown-item">
                <Settings size={16} />
                Settings
              </a>
              <button onClick={handleLogout} className="dropdown-item">
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}