// pages/Products.jsx
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

const mockProducts = [
  {
    id: 1,
    name: 'Camping Tent - 4 Person',
    category: 'Tents',
    stock: 24,
    rental_price: 45.99,
    sale_price: 199.99,
    status: 'In Stock',
  },
  {
    id: 2,
    name: 'Portable Camping Stove',
    category: 'Cooking Equipment',
    stock: 5,
    rental_price: 12.99,
    sale_price: 59.99,
    status: 'Low Stock',
  },
  // ... more mock data
]

export function Products() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddProduct, setShowAddProduct] = useState(false)
  
  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="products-page">
      <div className="page-header">
        <h1 className="page-title">Product Inventory</h1>
        <button
          onClick={() => setShowAddProduct(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>
      <div className="products-container">
        <div className="products-controls">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
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
                <th>Rental Price</th>
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
                  <td>${product.rental_price}</td>
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
            Showing {filteredProducts.length} of {mockProducts.length} products
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
            <h2 className="modal-title">Add New Product</h2>
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
                    <option value="Tents">Tents</option>
                    <option value="Sleeping Gear">Sleeping Gear</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input type="number" placeholder="Enter quantity" />
                </div>
                <div className="form-group">
                  <label>Rental Price ($)</label>
                  <input type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
               <div className="form-row">
                <div className="form-group">
                  <label>Sale Price ($)</label>
                  <input type="number" step="0.01" placeholder="0.00" />
                </div>
                <div className="form-group">
                <label className="form-label">Product Image</label>
                <input type="file" className="form-input" />
              </div>
              </div>
            </div>

             <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={4}
                className="form-textarea"
                placeholder="Enter product description"
              ></textarea>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowAddProduct(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button className="btn btn-primary">
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}