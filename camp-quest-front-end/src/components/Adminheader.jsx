import React, { useEffect, useState, useRef } from 'react'
import { Menu, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Header({ sidebarOpen, setSidebarOpen }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-neutral-900 border-b border-neutral-700/50 h-16 flex items-center px-4 flex-shrink-0 gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors lg:hidden flex-shrink-0"
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>

      {/* Title */}
      <h1 className="text-base sm:text-xl font-semibold text-white truncate flex-1">Admin Dashboard</h1>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notification bell */}
        <button className="relative p-2.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-lime-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <div className="w-8 h-8 bg-lime-500/20 border border-lime-500/40 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={15} className="text-lime-400" />
            </div>
            <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
              {user?.name || 'Admin'}
            </span>
            <ChevronDown size={14} className={`hidden sm:block transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 py-1 bg-neutral-800 rounded-xl shadow-xl border border-neutral-700 z-50">
              <div className="px-4 py-2.5 border-b border-neutral-700">
                <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                <p className="text-neutral-400 text-xs truncate">{user?.email || 'admin@campquest.com'}</p>
              </div>
              <a
                href="/admin/settings"
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                onClick={() => setUserMenuOpen(false)}
              >
                <Settings size={15} />
                Settings
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-700 hover:text-red-300 transition-colors"
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}