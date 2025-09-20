// pages/Categories.jsx
import React, { useState } from 'react'
import { Plus, Edit, Trash2, X, Save } from 'lucide-react'
import './Categories.css'

const mockCategories = [
  {
    id: 1,
    name: 'Tents',
    products: 12,
    description: 'All types of camping tents from 1-person to large family tents',
  },
  {
    id: 2,
    name: 'Sleeping Gear',
    products: 24,
    description: 'Sleeping bags, pads, hammocks, and other sleeping equipment',
  },
  {
    id: 3,
    name: 'Cooking Equipment',
    products: 18,
    description: 'Stoves, grills, cookware, and utensils for outdoor cooking',
  },
  {
    id: 4,
    name: 'Bags & Storage',
    products: 15,
    description: 'Backpacks, dry bags, storage containers, and organization',
  },
  {
    id: 5,
    name: 'Furniture',
    products: 9,
    description: 'Chairs, tables, cots, and other camp furniture',
  },
  {
    id: 6,
    name: 'Lighting',
    products: 14,
    description: 'Headlamps, lanterns, flashlights, and other lighting solutions',
  },
  {
    id: 7,
    name: 'Water Equipment',
    products: 8,
    description: 'Water filters, containers, and hydration systems',
  },
  {
    id: 8,
    name: 'Navigation',
    products: 6,
    description: 'Compasses, GPS devices, and maps',
  },
]

export function Categories() {
  const [categories, setCategories] = useState(mockCategories)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in all fields')
      return
    }

    // Create new category
    const newCategory = {
      id: Math.max(...categories.map(c => c.id)) + 1,
      name: formData.name.trim(),
      products: 0,
      description: formData.description.trim(),
    }

    // Add to categories list
    setCategories(prev => [newCategory, ...prev])
    
    // Reset form and hide it
    setFormData({ name: '', description: '' })
    setShowForm(false)
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '' })
    setShowForm(false)
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1 className="page-title">Product Categories</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showForm && (
        <div className="add-category-form">
          <div className="form-header">
            <h3>Add New Category</h3>
            <button 
              className="close-btn"
              onClick={handleCancel}
              type="button"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="categoryName">Category Name</label>
              <input
                type="text"
                id="categoryName"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="categoryDescription">Description</label>
              <textarea
                id="categoryDescription"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                className="form-textarea"
                rows="3"
                required
              />
            </div>

            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                <Save size={18} />
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-header">
              <h3 className="category-title">{category.name}</h3>
              <div className="category-actions">
                <button className="action-btn edit">
                  <Edit size={16} />
                </button>
                <button className="action-btn delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="category-description">{category.description}</p>
            <div className="category-footer">
              <span className="category-count">{category.products} products</span>
              <a href="#" className="category-link">View Products</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}