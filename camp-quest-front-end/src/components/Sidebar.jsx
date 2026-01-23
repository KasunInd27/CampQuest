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
  FileText,
  Folder,
} from 'lucide-react'

export function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`fixed top-0 h-96 left-0 bottom-0 z-50 w-64 bg-neutral-900 border-r border-neutral-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>

        <div className="py-4 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
            Main
          </p>
          <nav className="mt-2 space-y-1">
            <NavLink
              to="/admin/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>

            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wide mt-6 mb-2">
              Orders
            </p>
            <NavLink
              to="/admin/rental-orders"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <CalendarClock size={18} />
              Rental Orders
            </NavLink>
            <NavLink
              to="/admin/sales-orders"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <ShoppingCart size={18} />
              Sales Orders
            </NavLink>

            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wide mt-6 mb-2">
              Inventory
            </p>
            <NavLink
              to="/admin/rental-products"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <Package size={18} />
              Rental Products
            </NavLink>
            <NavLink
              to="/admin/sales-products"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <ShoppingCart size={18} />
              Sales Products
            </NavLink>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <Folder size={18} />
              Categories
            </NavLink>
            <NavLink
              to="/admin/packages"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <Package size={18} />
              Special Packages
            </NavLink>

            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wide mt-6 mb-2">
              Customer
            </p>
            <NavLink
              to="/admin/feedback"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <MessageSquare size={18} />
              Feedback
            </NavLink>
            <NavLink
              to="/admin/support-tickets"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <MessageSquare size={18} />
              Support Tickets
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <Users size={18} />
              Users
            </NavLink>

            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wide mt-6 mb-2">
              Content Creator
            </p>
            <NavLink
              to="/admin/blog-posts"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <FileText size={18} />
              Blog Post
            </NavLink>

            <p className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wide mt-6 mb-2">
              Admin
            </p>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors ${isActive ? 'text-lime-500 bg-neutral-800' : ''
                }`
              }
            >
              <Settings size={18} />
              Settings
            </NavLink>
          </nav>
        </div>
      </div>
    </>
  )
}