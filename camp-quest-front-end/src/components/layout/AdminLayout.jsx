// components/layout/AdminLayout.jsx
import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './AdminHeader'
import './AdminLayout.css'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <div className="admin-layout">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="admin-content">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="admin-main">
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}