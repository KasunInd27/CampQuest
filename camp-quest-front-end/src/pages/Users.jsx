// pages/Users.jsx
import React, { useState } from 'react'
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import './Users.css'

const mockUsers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    location: 'Seattle, WA',
    orders: 8,
    status: 'Active',
    joined: '2023-06-15',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 234-5678',
    location: 'Portland, OR',
    orders: 5,
    status: 'Active',
    joined: '2023-07-22',
  },
  {
    id: 3,
    name: 'Mike Brown',
    email: 'mike.brown@example.com',
    phone: '(555) 345-6789',
    location: 'Vancouver, BC',
    orders: 2,
    status: 'Inactive',
    joined: '2023-08-10',
  },
  {
    id: 4,
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    phone: '(555) 456-7890',
    location: 'Bellevue, WA',
    orders: 12,
    status: 'Active',
    joined: '2023-03-05',
  },
  {
    id: 5,
    name: 'David Lee',
    email: 'david.lee@example.com',
    phone: '(555) 567-8901',
    location: 'Tacoma, WA',
    orders: 3,
    status: 'Active',
    joined: '2023-09-18',
  },
  {
    id: 6,
    name: 'Lisa Chen',
    email: 'lisa.chen@example.com',
    phone: '(555) 678-9012',
    location: 'Seattle, WA',
    orders: 0,
    status: 'Inactive',
    joined: '2023-10-30',
  },
]

export function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="users-page">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <button className="btn btn-primary">
          <UserPlus size={18} />
          Add User
        </button>
      </div>
      <div className="users-container">
        <div className="users-controls">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <button className="btn btn-secondary">Filter Users</button>
          </div>
        </div>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>
                    <div className="contact-info">
                      <div className="contact-item">
                        <Mail size={14} />
                        {user.email}
                      </div>
                      <div className="contact-item">
                        <Phone size={14} />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="location-info">
                      <MapPin size={16} />
                      {user.location}
                    </div>
                  </td>
                  <td>
                    <div className="orders-info">
                      <ShoppingBag size={16} />
                      {user.orders}
                    </div>
                  </td>
                  <td>
                    <span className={`user-status ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="user-date">{user.joined}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit">
                        <Edit size={16} />
                      </button>
                      <button className="action-btn delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <p className="table-info">
            Showing {filteredUsers.length} of {mockUsers.length} users
          </p>
          <div className="pagination">
            <button className="pagination-btn">
              <ChevronLeft size={18} />
            </button>
            <button className="pagination-btn">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
