import React, { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
  LifeBuoy,
} from 'lucide-react'

const navGroups = [
  {
    label: 'Orders',
    items: [
      { to: '/admin/rental-orders', icon: CalendarClock, label: 'Rental Orders' },
      { to: '/admin/sales-orders', icon: ShoppingCart, label: 'Sales Orders' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { to: '/admin/rental-products', icon: Package, label: 'Rental Products' },
      { to: '/admin/sales-products', icon: ShoppingCart, label: 'Sales Products' },
      { to: '/admin/categories', icon: Folder, label: 'Categories' },
      { to: '/admin/packages', icon: Package, label: 'Special Packages' },
    ],
  },
  {
    label: 'Customer',
    items: [
      { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
      { to: '/admin/support-tickets', icon: LifeBuoy, label: 'Support Tickets' },
      { to: '/admin/users', icon: Users, label: 'Users' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/blog-posts', icon: FileText, label: 'Blog Posts' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation()
  const close = () => setSidebarOpen(false)

  // Automatically close sidebar when route changes on mobile
  useEffect(() => {
    close()
  }, [location.pathname])

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-72 bg-neutral-900 border-r border-neutral-700/50
          flex flex-col shadow-2xl
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0 lg:w-64 lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar Header — branding + close */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-neutral-700/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-neutral-900 text-xs font-black">CQ</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm leading-tight block">CampQuest</span>
              <span className="text-neutral-400 text-xs leading-tight block">Admin Panel</span>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={close}
            className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-6 px-2">
          {/* Dashboard Link — Moved to top for visibility */}
          <div className="space-y-1">
            <NavLink
              to="/admin/dashboard"
              end
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-150 group
                ${isActive
                  ? 'bg-lime-500/10 text-lime-400 border-l-2 border-lime-500 pl-[10px]'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800 border-l-2 border-transparent'
                }`
              }
            >
              <LayoutDashboard size={18} />
              <span>Dashboard Overview</span>
            </NavLink>
          </div>

          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, end, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={close}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-150 group
                      ${isActive
                        ? 'bg-lime-500/10 text-lime-400 border-l-2 border-lime-500 pl-[10px]'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800 border-l-2 border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} className={isActive ? 'text-lime-400' : 'text-neutral-400 group-hover:text-white'} />
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-neutral-700/50 flex-shrink-0">
          <p className="text-xs text-neutral-500 text-center">CampQuest &copy; 2025</p>
        </div>
      </aside>
    </>
  )
}