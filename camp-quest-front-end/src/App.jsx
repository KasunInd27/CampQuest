// App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { AdminDashboard } from './pages/AdminDashboard'
import { RentalProducts } from './pages/RentalProducts'
import { SalesProducts } from './pages/SalesProducts'
import { Categories } from './pages/Categories'
import { Feedback } from './pages/Feedback'
import { Users } from './pages/Users'
import { RentalOrders } from './pages/RentalOrders'
import { SalesOrders } from './pages/SalesOrders'
import { Settings } from './pages/Settings'
import './App.css'

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="rental-products" element={<RentalProducts />} />
          <Route path="sales-products" element={<SalesProducts />} />
          <Route path="categories" element={<Categories />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="users" element={<Users />} />
          <Route path="rental-orders" element={<RentalOrders />} />
          <Route path="sales-orders" element={<SalesOrders />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}
