// pages/Shop.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Star, Package } from 'lucide-react';
import axios, { BASE_URL } from '../lib/axios';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

// (API_BASE_URL redundant, using BASE_URL directly for images)

const Shop = () => {
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
      const response = await axios.get('/sales-products', { params });
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

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    addToCart(product, 'sale');
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
          <h1 className="text-4xl font-bold text-white mb-4">Shop Camping Gear</h1>
          <p className="text-neutral-400 text-lg">Find the perfect equipment for your outdoor adventures</p>
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
              placeholder="Search products..."
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
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-neutral-600 mb-4" />
            <h3 className="text-lg font-medium text-neutral-400">No products found</h3>
            <p className="text-neutral-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductCard = ({ product, onAddToCart }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-neutral-800 rounded-lg  hover:shadow-xl transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-neutral-700">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].startsWith('http') ? product.images[0] : `${BASE_URL}/uploads/sales-products/${product.images[0]}`}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-neutral-600" />
          </div>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-neutral-900 px-2 py-1 rounded text-xs font-bold">
            Low Stock
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            Out of Stock
          </span>
        )}
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

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <span className="text-lime-500 text-xl font-bold">LKR {product.price}.00/=</span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${product.stock === 0
              ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
              : 'bg-lime-500 text-neutral-900 hover:bg-lime-500'
              }`}
          >
            <ShoppingCart size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shop;