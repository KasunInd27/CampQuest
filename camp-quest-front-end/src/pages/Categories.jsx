// pages/Categories.jsx
import React from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
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
  return (
    <div className="categories-page">
      <div className="page-header">
        <h1 className="page-title">Product Categories</h1>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add Category
        </button>
      </div>
      <div className="categories-grid">
        {mockCategories.map((category) => (
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