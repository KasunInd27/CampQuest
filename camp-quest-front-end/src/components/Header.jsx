// components/Header.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const location = useLocation();
  const cartCount = getCartCount();
  
  // Derive authentication state from user
  const isAuthenticated = !!user;

  // Function to check if a path is active
  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const CartButton = () => (
    <Link to="/cart" className="relative p-2 text-[#8BE13B] hover:bg-gray-800 rounded-lg transition-colors duration-300" aria-label="Shopping cart">
      <svg className="w-5 h-5 xl:w-6 xl:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"></path>
        <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"></path>
        <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"></path>
      </svg>
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#8BE13B] text-[#1A1A1A] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {cartCount}
        </span>
      )}
    </Link>
  );

  // Determine dashboard route based on user role
  const getDashboardRoute = () => {
    if (user?.role === 'admin') {
      return '/admin/dashboard';
    }
    return '/dashboard';
  };

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/rent', label: 'Rent' },
    { path: '/shop', label: 'Shop' },
    { path: '/blog', label: 'Blog' },
    { path: '/about', label: 'About' },
    { path: '/support', label: 'Support' }
  ];

  return (
    <header className="sticky top-0 z-[9999] bg-[#1A1A1A] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-[#8BE13B] text-2xl lg:text-3xl font-bold">Camp</span>
              <span className="text-white text-2xl lg:text-3xl font-bold">Quest</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative font-medium transition-colors duration-300 text-sm xl:text-base pb-1 ${
                  isActivePath(item.path)
                    ? 'text-[#8BE13B]'
                    : 'text-gray-300 hover:text-[#8BE13B]'
                }`}
              >
                {item.label}
                {isActivePath(item.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8BE13B]"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {/* Cart Button */}
            <CartButton/>

            {/* Authentication Buttons / User Menu */}
            {!isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-300 hover:text-[#8BE13B] font-medium transition-colors duration-300 text-sm xl:text-base"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-[#8BE13B] text-[#1A1A1A] hover:bg-[#7acc32] font-medium rounded-lg transition-colors duration-300 text-sm xl:text-base"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 text-gray-300 hover:text-[#8BE13B] hover:bg-gray-800 rounded-lg transition-colors duration-300"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-[#8BE13B] text-[#1A1A1A] rounded-full flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden xl:block text-sm font-medium">{user?.name}</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#242424] border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                    <Link 
                      to={getDashboardRoute()} 
                      className="block px-4 py-2 text-gray-300 hover:text-[#8BE13B] hover:bg-gray-800 transition-colors duration-300"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Dashboard</span>
                      </div>
                    </Link>
                    <hr className="border-gray-700 my-2" />
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-800 transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16,17 21,12 16,7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile cart and menu button */}
          <div className="flex items-center space-x-3 lg:hidden">
            <CartButton/>
            
            <button 
              onClick={toggleMenu} 
              className="p-2 text-gray-300 hover:text-[#8BE13B] hover:bg-gray-800 rounded-lg transition-colors duration-300" 
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="bg-[#242424] border-t border-gray-700">
          {/* Mobile Navigation Links */}
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-3 font-medium transition-colors duration-300 rounded ${
                  isActivePath(item.path)
                    ? 'text-[#8BE13B] border-l-4 border-[#8BE13B] bg-gray-800/50 rounded-r'
                    : 'text-gray-300 hover:text-[#8BE13B] hover:bg-gray-800/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Mobile Actions */}
          <div className="px-4 py-4 border-t border-gray-700">
            {!isAuthenticated ? (
              <div className="space-y-3">
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 text-gray-300 hover:text-[#8BE13B] hover:bg-gray-800 rounded-lg transition-colors duration-300 font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 bg-[#8BE13B] text-[#1A1A1A] hover:bg-[#7acc32] rounded-lg transition-colors duration-300 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 bg-[#8BE13B] text-[#1A1A1A] rounded-full flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-[#8BE13B] font-medium">{user?.name}</div>
                    <div className="text-gray-400 text-sm">{user?.email}</div>
                  </div>
                </div>
                <Link 
                  to={getDashboardRoute()} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded transition-colors duration-300 ${
                    isActivePath(getDashboardRoute())
                      ? 'text-[#8BE13B] bg-gray-800'
                      : 'text-gray-300 hover:text-[#8BE13B] hover:bg-gray-800'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded transition-colors duration-300 ${
                    isActivePath('/profile')
                      ? 'text-[#8BE13B] bg-gray-800'
                      : 'text-gray-300 hover:text-[#8BE13B] hover:bg-gray-800'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profile
                </Link>
                <Link 
                  to="/orders" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded transition-colors duration-300 ${
                    isActivePath('/orders')
                      ? 'text-[#8BE13B] bg-gray-800'
                      : 'text-gray-300 hover:text-[#8BE13B] hover:bg-gray-800'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                  My Orders
                </Link>
                <Link 
                  to="/settings" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded transition-colors duration-300 ${
                    isActivePath('/settings')
                      ? 'text-[#8BE13B] bg-gray-800'
                      : 'text-gray-300 hover:text-[#8BE13B] hover:bg-gray-800'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-3 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-800 rounded transition-colors duration-300"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Search */}
          <div className="px-4 py-3 border-t border-gray-700">
            <button className="flex items-center justify-center w-full p-3 text-gray-300 hover:text-[#8BE13B] hover:bg-gray-800 rounded-lg transition-colors duration-300">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
}