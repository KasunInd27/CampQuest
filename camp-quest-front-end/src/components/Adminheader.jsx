import React, { useEffect, useState, useRef } from 'react'
import { Menu, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react'

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
    <header className="bg-neutral-900 border-b border-neutral-700 h-16 flex items-center px-4">
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-1 mr-4 text-white rounded-md hover:bg-neutral-800 transition-colors lg:hidden"
      >
        <Menu size={24} />
      </button>
      
      <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
      
      <div className="ml-auto flex items-center gap-4">
        <button className="relative p-2 text-white rounded-md hover:bg-neutral-800 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-lime-500 rounded-full"></span>
        </button>
        
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="text-sm font-medium hidden sm:block">Admin User</span>
            <ChevronDown size={16} className="hidden sm:block" />
          </button>
          
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 z-10">
              <a 
                href="/settings" 
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                <Settings size={16} />
                Settings
              </a>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
              >
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