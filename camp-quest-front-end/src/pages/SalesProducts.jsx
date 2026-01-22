import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Tag, Upload, X, Eye, Download } from 'lucide-react';
import axios, { BASE_URL } from '../lib/axios';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import { salesProductValidationSchema } from '../utils/productValidations';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { uploadImage } from '../lib/uploadImage';
import { getValidImageUrl, resolveImageUrl } from '../lib/imageHelper';

const SalesProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      features: '',
      specifications: '',
      isActive: true
    },
    validationSchema: salesProductValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        let imageUrls = [];

        // 1. Upload new images to Cloudinary
        if (selectedImages && selectedImages.length > 0) {
          const uploadPromises = selectedImages.map(file => uploadImage(file));
          const uploadResults = await Promise.all(uploadPromises);
          imageUrls = uploadResults.map(res => res.url);
        }

        // 2. Combine with existing images if editing
        if (editingProduct && editingProduct.images) {
          // We need to keep existing images that weren't removed. 
          // BUT the current UI logic (removeImage) only modifies selectedImages (new ones) or implicitly assumes we replace?
          // Looking at previous logic: "updateData.images = [...(product.images || []), ...newImages];" in backend.
          // In frontend "removeImage" filtered selectedImages.
          // The "Current Images" section in UI (lines 596-608) just SHOWS them, didn't seem to have delete functionality?
          // Wait, I need to check the UI code for removing existing images. 
          // There is no UI to remove *existing* images in the form (only "selectedImages" which are new).
          // So we should preserve existing images.
          imageUrls = [...editingProduct.images, ...imageUrls];
        }

        // 3. Prepare JSON payload
        const payload = {
          ...values,
          features: values.features ? values.features.split('\n').filter(f => f.trim()) : [],
          images: imageUrls
        };

        // 4. Send JSON request
        if (editingProduct) {
          await axios.put(`/sales-products/${editingProduct._id}`, payload);
          toast.success('Product updated successfully');
        } else {
          await axios.post('/sales-products', payload);
          toast.success('Product created successfully');
        }

        resetForm();
        fetchProducts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to save product');
        console.error("Save error:", error);
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/sales-products');
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreview(newPreviews);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/sales-products/${productId}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    formik.setValues({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?._id || product.category || '',
      stock: product.stock,
      features: product.features.join('\n'),
      specifications: product.specifications,
      isActive: product.isActive
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    formik.resetForm();
    setEditingProduct(null);
    setShowCreateForm(false);
    setSelectedImages([]);
    setImagePreview([]);
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Colors
      const primaryColor = [132, 204, 22]; // Lime-500
      const darkColor = [23, 23, 23];
      const grayColor = [115, 115, 115];

      // ===== HEADER =====
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('CampQuest', 20, 20);

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('Sales Products Report', 20, 32);

      // ===== REPORT INFO =====
      doc.setFontSize(10);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 52);
      doc.text(`Total Products: ${filteredProducts.length}`, 20, 59);
      doc.text(`Active Products: ${filteredProducts.filter(p => p.isActive).length}`, 20, 66);
      doc.text(`Total Stock: ${filteredProducts.reduce((sum, p) => sum + (p.stock || 0), 0)} units`, 20, 73);

      // Calculate total inventory value
      const totalValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.stock || 0), 0);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`Total Inventory Value: LKR ${totalValue.toFixed(2)}`, 20, 80);

      // ===== PRODUCTS TABLE =====
      const tableData = filteredProducts.map((product, index) => [
        index + 1,
        product.name || 'N/A',
        product.category?.name || 'N/A',
        `LKR ${(product.price || 0).toFixed(2)}`,
        product.stock || 0,
        `LKR ${((product.price || 0) * (product.stock || 0)).toFixed(2)}`,
        product.isActive ? 'Active' : 'Inactive'
      ]);

      autoTable(doc, {
        startY: 90,
        head: [['#', 'Product Name', 'Category', 'Price', 'Stock', 'Value', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: darkColor,
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left'
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 45 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 25, halign: 'right' },
          7: { cellWidth: 20, halign: 'center' }
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        didDrawPage: function (data) {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          doc.text(
            `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      });

      // ===== SUMMARY SECTION =====
      const finalY = doc.lastAutoTable.finalY + 15;

      // Only add summary if there's space, otherwise add new page
      if (finalY > pageHeight - 60) {
        doc.addPage();
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Summary', 20, 10);
        var summaryY = 25;
      } else {
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(20, finalY, pageWidth - 40, 10, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('Summary', 25, finalY + 7);
        var summaryY = finalY + 20;
      }

      // Category breakdown
      const categoryStats = {};
      filteredProducts.forEach(product => {
        const catName = product.category?.name || 'Uncategorized';
        if (!categoryStats[catName]) {
          categoryStats[catName] = { count: 0, value: 0 };
        }
        categoryStats[catName].count++;
        categoryStats[catName].value += (product.price || 0) * (product.stock || 0);
      });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('Category Breakdown:', 20, summaryY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      let catY = summaryY + 7;
      Object.entries(categoryStats).forEach(([category, stats]) => {
        doc.text(
          `• ${category}: ${stats.count} products (LKR ${stats.value.toFixed(2)})`,
          25,
          catY
        );
        catY += 6;
      });

      // Stock status
      const lowStock = filteredProducts.filter(p => p.stock < 10).length;
      const outOfStock = filteredProducts.filter(p => p.stock === 0).length;

      catY += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Stock Status:', 20, catY);
      doc.setFont('helvetica', 'normal');
      catY += 7;
      doc.setTextColor(255, 165, 0); // Orange
      doc.text(`• Low Stock (< 10 units): ${lowStock} products`, 25, catY);
      catY += 6;
      doc.setTextColor(220, 38, 38); // Red
      doc.text(`• Out of Stock: ${outOfStock} products`, 25, catY);

      // ===== FOOTER =====
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);

      doc.setFontSize(8);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(
        'CampQuest Inc. | 123 Adventure Road, Mountain View, CA 94043',
        pageWidth / 2,
        pageHeight - 18,
        { align: 'center' }
      );
      doc.text(
        'Phone: (555) 123-4567 | Email: sales@campquest.com | www.campquest.com',
        pageWidth / 2,
        pageHeight - 13,
        { align: 'center' }
      );

      // Save PDF
      const fileName = `CampQuest_Sales_Products_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('PDF exported successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-white">Sales Products</h1>
          <p className="text-neutral-400">Manage your camping equipment for sale</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 font-medium transition-colors"
          >
            <Download size={20} />
            Export PDF
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-400 font-medium transition-colors"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-lime-500"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-neutral-600" />
          <h3 className="mt-2 text-sm font-medium text-neutral-400">No products found</h3>
          <p className="mt-1 text-sm text-neutral-500">Get started by adding a new product.</p>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-neutral-600'
                      }`}
                    placeholder="Product name"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-1 text-sm text-red-400">{formik.errors.name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-neutral-600'
                    }`}
                  placeholder="Product description"
                  rows="3"
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="mt-1 text-sm text-red-400">{formik.errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.price && formik.errors.price ? 'border-red-500' : 'border-neutral-600'
                      }`}
                    placeholder="0.00"
                  />
                  {formik.touched.price && formik.errors.price && (
                    <p className="mt-1 text-sm text-red-400">{formik.errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formik.values.stock}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:border-lime-500 ${formik.touched.stock && formik.errors.stock ? 'border-red-500' : 'border-neutral-600'
                      }`}
                    placeholder="0"
                  />
                  {formik.touched.stock && formik.errors.stock && (
                    <p className="mt-1 text-sm text-red-400">{formik.errors.stock}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-lime-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Features (one per line)
                </label>
                <textarea
                  name="features"
                  value={formik.values.features}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-lime-500"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Specifications
                </label>
                <textarea
                  name="specifications"
                  value={formik.values.specifications}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-lime-500"
                  placeholder="Product specifications"
                  rows="2"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  Product Images
                </label>
                <div className="border-2 border-dashed border-neutral-600 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
                    <p className="text-neutral-400">Click to upload images</p>
                  </label>
                </div>

                {/* Image Preview */}
                {imagePreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Existing Images (for edit mode) */}
                {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-neutral-400 mb-2">Current Images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {editingProduct.images.map((image, index) => (
                        <img
                          key={index}
                          src={resolveImageUrl(image, 'sales-products')}
                          alt={`Product ${index}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formik.values.isActive}
                  onChange={formik.handleChange}
                  className="h-4 w-4 text-lime-500 focus:ring-lime-500 border-neutral-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-neutral-300">
                  Active Product
                </label>
              </div>

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
                  disabled={formik.isSubmitting}
                  className="flex-1 px-4 py-2 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formik.isSubmitting ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ProductCard Component
const ProductCard = ({ product, onEdit, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="bg-neutral-900 rounded-lg border border-neutral-700 hover:border-lime-500 transition-colors">
        {/* Product Image */}
        <div className="relative h-48 bg-neutral-800">
          <img
            src={getValidImageUrl(product, 'sales-products')}
            alt={product.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={() => setShowDetails(true)}
              className="p-1.5 bg-neutral-900/80 text-neutral-400 hover:text-lime-500 rounded transition-colors"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onEdit(product)}
              className="p-1.5 bg-neutral-900/80 text-neutral-400 hover:text-lime-500 rounded transition-colors"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="p-1.5 bg-neutral-900/80 text-neutral-400 hover:text-red-400 rounded transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-white truncate">{product.name}</h3>
            </div>
            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.isActive
              ? 'bg-lime-500/20 text-lime-500'
              : 'bg-neutral-700 text-neutral-400'
              }`}>
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {product.description && (
            <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{product.description}</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-lime-500">
              <span className="font-bold">LKR {product.price}.00</span>
            </div>
            <div className="flex items-center gap-1 text-neutral-500">
              <Package size={14} />
              <span>{product.stock} in stock</span>
            </div>
          </div>

          {product.category && (
            <div className="mt-2 pt-2 border-t border-neutral-700">
              <div className="flex items-center gap-1 text-neutral-500 text-xs">
                <Tag size={12} />
                <span>{product.category.name || product.category}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{product.name}</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Product Images */}
            {product.images && product.images.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.startsWith('http') ? image : `${BASE_URL}/uploads/sales-products/${image}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Description</h3>
                <p className="text-neutral-400">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">Price</h3>
                  <p className="text-lime-500 text-lg font-bold">LKR {product.price}.00</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Stock</h3>
                  <p className="text-neutral-400">{product.stock} units</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Total Value: LKR {(product.price * product.stock).toFixed(2)}
                  </p>
                </div>
              </div>

              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Features</h3>
                  <ul className="list-disc list-inside text-neutral-400 space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.specifications && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Specifications</h3>
                  <p className="text-neutral-400">{product.specifications}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesProducts;