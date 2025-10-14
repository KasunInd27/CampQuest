import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Star, Package, Download } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const Rent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await axios.get('/rental-products', { params });
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch products');
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(132, 204, 22); // lime-500
    doc.text('Rental Equipment Catalog', 14, 22);
    
    // Add generated date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Add summary
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Products: ${filteredProducts.length}`, 14, 38);
    doc.text(`Available: ${filteredProducts.filter(p => p.availabilityStatus === 'available').length}`, 14, 44);
    
    // Prepare table data
    const tableData = filteredProducts.map(product => [
      product.name,
      product.category?.name || 'N/A',
      `LKR ${product.dailyRate}`,
      product.weeklyRate ? `LKR ${product.weeklyRate}` : 'N/A',
      `${product.availableQuantity}/${product.quantity}`,
      product.condition,
      product.availabilityStatus
    ]);
    
    // Add table using autoTable
    autoTable(doc, {
      head: [['Product', 'Category', 'Daily', 'Weekly', 'Available', 'Condition', 'Status']],
      body: tableData,
      startY: 50,
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [132, 204, 22],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`rental-catalog-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF exported successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Header Section */}
      <div className="bg-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Rent Camping Equipment</h1>
              <p className="text-neutral-400 text-lg">Affordable rentals for your next adventure</p>
            </div>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-neutral-900 rounded-lg hover:bg-lime-400 font-medium transition-colors"
            >
              <Download size={20} />
              Export Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-lime-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-lime-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <RentalProductCard 
              key={product._id} 
              product={product}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-neutral-600 mb-4" />
            <h3 className="text-lg font-medium text-neutral-400">No equipment found</h3>
            <p className="text-neutral-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RentalProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const [rentalDays, setRentalDays] = useState(1);
  const { addToCart } = useCart();

  const handleRent = async () => {
    if (product.availabilityStatus !== 'available' || product.availableQuantity < 1) {
      toast.error('This item is currently unavailable');
      return;
    }

    try {
      // Add to cart
      await addToCart(product, 'rental', rentalDays);
      
      // Update product quantity
      await axios.put(`/rental-products/${product._id}/quantity`, {
        quantity: 1
      });
      
      toast.success('Item added to cart');
      
      // Refresh the page or update the product list
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const calculatePrice = () => {
    if (rentalDays >= 7 && product.weeklyRate) {
      return Math.ceil(rentalDays / 7) * product.weeklyRate;
    }
    return rentalDays * product.dailyRate;
  };

  return (
    <div className="bg-neutral-800 rounded-lg hover:shadow-xl transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-neutral-700 rounded-t-lg overflow-hidden">
        {product.images && product.images.length > 0 && !imageError ? (
          <img
            src={`/uploads/rental-products/${product.images[0]}`}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-neutral-600" />
          </div>
        )}
        <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
          product.availabilityStatus === 'available' && product.availableQuantity > 0
            ? 'bg-lime-500 text-neutral-900' 
            : 'bg-red-500 text-white'
        }`}>
          {product.availabilityStatus === 'available' && product.availableQuantity > 0
            ? `${product.availableQuantity} Available` 
            : 'Unavailable'}
        </span>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              className={i < 4 ? 'text-yellow-400 fill-current' : 'text-neutral-600'} 
            />
          ))}
          <span className="text-neutral-400 text-xs ml-2">(4.0)</span>
        </div>

        {/* Rental Rates */}
        <div className="text-sm text-neutral-400 mb-3">
          <div className="flex justify-between">
            <span>Daily:</span>
            <span className="text-lime-500 font-bold">LKR {product.dailyRate}/day</span>
          </div>
          {product.weeklyRate && (
            <div className="flex justify-between">
              <span>Weekly:</span>
              <span className="text-lime-500 font-bold">LKR {product.weeklyRate}/week</span>
            </div>
          )}
        </div>

        {/* Days Selector */}
        <div className="flex items-center gap-2 mb-3">
          <label className="text-neutral-400 text-sm">Days:</label>
          <input
            type="number"
            min="1"
            max="365"
            value={rentalDays}
            onChange={(e) => setRentalDays(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-lime-500"
          />
          <span className="text-lime-500 font-bold flex-1 text-right">LKR {calculatePrice()}</span>
        </div>

        {/* Rent Button */}
        <button
          onClick={handleRent}
          disabled={product.availabilityStatus !== 'available' || product.availableQuantity < 1}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
            product.availabilityStatus !== 'available' || product.availableQuantity < 1
              ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
              : 'bg-lime-500 text-neutral-900 hover:bg-lime-400'
          }`}
        >
          <Calendar size={16} />
          Rent Now
        </button>
      </div>
    </div>
  );
};

export default Rent;