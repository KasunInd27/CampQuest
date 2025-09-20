// pages/SalesProducts.jsx
import React, { useState } from 'react'
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import './Products.css'

const mockSalesProducts = [
  {
    id: 3,
    name: 'Camping Chair',
    category: 'Furniture',
    stock: 15,
    sale_price: 49.99,
    status: 'In Stock',
  },
  {
    id: 4,
    name: 'LED Headlamp',
    category: 'Lighting',
    stock: 3,
    sale_price: 24.99,
    status: 'Low Stock',
  },
  // Add more sales products as needed
]

export function SalesProducts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddProduct, setShowAddProduct] = useState(false)
  
  const filteredProducts = mockSalesProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="products-page">
      <div className="page-header">
        <h1 className="page-title">Sales Products</h1>
        <button
          onClick={() => setShowAddProduct(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add Sales Product
        </button>
      </div>
      <div className="products-container">
        <div className="products-controls">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search sales products..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <button className="btn btn-secondary">
              <Filter size={16} />
              Filter
            </button>
            <button className="btn btn-secondary">
              <ArrowUpDown size={16} />
              Sort
            </button>
          </div>
        </div>
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Sale Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.stock}</td>
                  <td>${product.sale_price}</td>
                  <td>
                    <span className={`status ${product.status === 'In Stock' ? 'in-stock' : 'low-stock'}`}>
                      {product.status}
                    </span>
                  </td>
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
            Showing {filteredProducts.length} of {mockSalesProducts.length} sales products
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
      
      {showAddProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Add New Sales Product</h2>
            <div className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" placeholder="Enter product name" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select>
                    <option value="">Select category</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Clothing">Clothing</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input type="number" placeholder="Enter quantity" />
                </div>
                <div className="form-group">
                  <label>Sale Price ($)</label>
                  <input type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Product Image</label>
                <input type="file" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  placeholder="Enter product description"
                ></textarea>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowAddProduct(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button className="btn btn-primary">
                Save Sales Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
