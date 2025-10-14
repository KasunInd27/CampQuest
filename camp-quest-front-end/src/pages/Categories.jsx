// pages/Categories.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Tag, Calendar, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Validation Schema
const CategorySchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must not exceed 50 characters')
    .required('Category name is required'),
  description: Yup.string().max(200, 'Description too long'),
  icon: Yup.string().max(20, 'Icon name is too long')
});

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null); // for delete modal

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formik
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      icon: '',
      isActive: true
    },
    validationSchema: CategorySchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (editingCategory) {
          await axios.put(`/categories/${editingCategory._id}`, values);
          toast.success('Category updated successfully');
        } else {
          await axios.post('/categories', values);
          toast.success('Category created successfully');
        }
        resetForm();
        fetchCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to save category');
        console.error('Error saving category:', error);
      }
    }
  });

  const resetForm = () => {
    formik.resetForm();
    setEditingCategory(null);
    setShowCreateForm(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    formik.setValues({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      isActive: category.isActive
    });
    setShowCreateForm(true);
  };

  const handleDelete = async () => {
    if (!deleteCategoryId) return;
    try {
      await axios.delete(`/categories/${deleteCategoryId}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
      console.error('Error deleting category:', error);
    } finally {
      setDeleteCategoryId(null);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-neutral-400">Manage your camping equipment categories</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-500 font-medium transition-colors"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-lime-500"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            onEdit={handleEdit}
            onDelete={() => setDeleteCategoryId(category._id)}
          />
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="mx-auto h-12 w-12 text-neutral-600" />
          <h3 className="mt-2 text-sm font-medium text-neutral-400">No categories found</h3>
          <p className="mt-1 text-sm text-neutral-500">Get started by creating a new category.</p>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-lime-500"
                  placeholder="e.g., Tents, Sleeping Bags"
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-400 text-sm mt-1">{formik.errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-lime-500"
                  placeholder="Brief description of the category"
                  rows="3"
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-red-400 text-sm mt-1">{formik.errors.description}</p>
                )}
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Icon (Optional)</label>
                <input
                  type="text"
                  name="icon"
                  value={formik.values.icon}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-lime-500"
                  placeholder="Icon name or emoji"
                />
                {formik.touched.icon && formik.errors.icon && (
                  <p className="text-red-400 text-sm mt-1">{formik.errors.icon}</p>
                )}
              </div>

              {/* Active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formik.values.isActive}
                  onChange={formik.handleChange}
                  className="h-4 w-4 text-lime-500 focus:ring-lime-500 border-neutral-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-neutral-300">Active Category</label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-500 font-medium transition-colors"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCategoryId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-sm text-center">
            <AlertTriangle className="mx-auto text-red-400 mb-4" size={40} />
            <h2 className="text-lg font-bold text-white mb-2">Delete Category?</h2>
            <p className="text-neutral-400 mb-6">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteCategoryId(null)}
                className="px-4 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, onEdit, onDelete }) => {
  return (
    <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700 hover:border-lime-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lime-500 rounded-lg flex items-center justify-center text-neutral-900 font-bold">
            {category.icon || category.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-white">{category.name}</h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              category.isActive 
                ? 'bg-lime-500/20 text-lime-500' 
                : 'bg-neutral-700 text-neutral-400'
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-neutral-400 hover:text-lime-500 hover:bg-neutral-800 rounded transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {category.description && (
        <p className="text-neutral-400 text-sm mb-4">{category.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-neutral-500">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{new Date(category.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Categories;
