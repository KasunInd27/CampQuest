// HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios, { BASE_URL } from '../lib/axios';
import toast from 'react-hot-toast';
import { getValidImageUrl } from '../lib/imageHelper';

// Hero Component
function Hero() {
  return (
    <section className="relative bg-neutral-900 py-20 sm:py-28">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
          alt="Night camping under stars"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-left">
            <span className="inline-block px-4 py-1 rounded-full bg-lime-500 text-gray-900 text-sm font-bold mb-6">
              Premium Camping Experience
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
              Your Adventure <span className="text-lime-500">Starts</span> With Quality Gear
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              Rent or buy premium camping equipment for your next outdoor adventure. We've got everything you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/rent"
                className="px-8 py-3 bg-lime-500 text-gray-900 font-semibold rounded-lg hover:bg-lime-400 transition-colors text-center"
              >
                Rent Equipment
              </Link>
              <Link
                to="/shop"
                className="px-8 py-3 border-2 border-lime-500 text-lime-500 font-semibold rounded-lg hover:bg-lime-500 hover:text-gray-900 transition-colors text-center"
              >
                Shop Collection
              </Link>
            </div>
          </div>

          {/* Product Image */}
          <div className="hidden lg:flex justify-end">
            <div className="bg-lime-500 p-2 rounded-lg shadow-2xl transform rotate-3">
              <img
                src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                alt="Camping gear and equipment"
                className="w-full h-auto rounded-lg shadow-lg transform -rotate-3"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Featured Products Component
function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState('all');
  const [rentalProducts, setRentalProducts] = useState([]);
  const [salesProducts, setSalesProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both rental and sales products
      const [rentalResponse, salesResponse] = await Promise.all([
        axios.get('/rental-products?limit=4&page=1'),
        axios.get('/sales-products?limit=4&page=1')
      ]);

      if (rentalResponse.data.success) {
        setRentalProducts(rentalResponse.data.data || []);
      }

      if (salesResponse.data.success) {
        setSalesProducts(salesResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'rent':
        return rentalProducts.map(product => ({
          ...product,
          type: 'rental',
          displayPrice: `LKR: ${product.dailyRate}/day`,
          buttonText: 'Rent Now'
        }));
      case 'sale':
        return salesProducts.map(product => ({
          ...product,
          type: 'sales',
          displayPrice: `LKR: ${product.price}`,
          buttonText: 'Add to Cart'
        }));
      case 'all':
      default:
        const rental = rentalProducts.slice(0, 2).map(product => ({
          ...product,
          type: 'rental',
          displayPrice: `LKR: ${product.dailyRate}/day`,
          buttonText: 'Rent Now'
        }));
        const sales = salesProducts.slice(0, 2).map(product => ({
          ...product,
          type: 'sales',
          displayPrice: `LKR: ${product.price}`,
          buttonText: 'Add to Cart'
        }));
        return [...rental, ...sales];
    }
  };

  const filteredProducts = getFilteredProducts();

  const renderStars = (rating = 4.5) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
        stroke={i < Math.floor(rating) ? '#fbbf24' : '#d1d5db'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
      </svg>
    ));
  };

  if (loading) {
    return (
      <section className="py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
            <p className="text-white mt-4">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-2 bg-lime-500 text-gray-900 rounded-lg hover:bg-lime-400 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4 sm:mb-0">
            Featured Equipment
          </h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('rent')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'rent'
                ? 'bg-lime-500 text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              For Rent
            </button>
            <button
              onClick={() => setActiveTab('sale')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'sale'
                ? 'bg-lime-500 text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'all'
                ? 'bg-lime-500 text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              View All
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No products available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {filteredProducts.map((product, index) => (
                <div key={`${product.type}-${product._id}-${index}`} className="bg-neutral-900 border border-lime-500 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={getValidImageUrl(product, product.type === 'rental' ? 'rental-products' : 'sales-products')}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded ${product.type === 'rental'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                      }`}>
                      {product.type === 'rental' ? 'RENTAL' : 'FOR SALE'}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {renderStars(4.5)}
                      </div>
                      <span className="ml-2 text-sm text-white">
                        (50+ reviews)
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="text-lg font-bold text-white mb-3">
                      {product.displayPrice}
                    </div>
                    <Link
                      to={product.type === 'rental' ? `/rent/${product._id}` : `/shop/${product._id}`}
                      className="block w-full px-4 py-2 bg-lime-500 text-gray-900 font-semibold rounded-lg hover:bg-lime-400 transition-colors text-center"
                    >
                      {product.buttonText}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center">
              <Link
                to={activeTab === 'rent' ? '/rent' : activeTab === 'sale' ? '/shop' : '/rent'}
                className="px-8 py-3 border-2 border-lime-500 text-lime-500 font-semibold rounded-lg hover:border-lime-400 hover:text-lime-400 transition-colors"
              >
                View All Equipment
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// Featured Categories Component
function FeaturedCategories() {
  const categories = [
    {
      name: 'Tents & Shelters',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 21 14 3l10.5 18H3.5Z"></path>
          <path d="M12 13.5 7.5 21"></path>
          <path d="M16.5 21 12 13.5"></path>
        </svg>
      ),
    },
    {
      name: 'Navigation Tools',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"></polygon>
        </svg>
      ),
    },
    {
      name: 'Cooking Equipment',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
          <path d="M7 2v20"></path>
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
        </svg>
      ),
    },
    {
      name: 'Campfire Essentials',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">
          Explore Our Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="bg-neutral-900 border-l-2 border-lime-500 p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-lime-500 mb-4 flex justify-center">
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Call to Action Component
function CallToAction() {
  return (
    <section className="py-16 bg-lime-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          Ready for Your Next Adventure?
        </h2>
        <p className="text-xl text-black mb-10 max-w-2xl mx-auto">
          Whether you need to rent equipment for a weekend getaway or want to purchase quality gear for your outdoor lifestyle, we've got you covered.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/rent"
            className="px-8 py-3 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-lime-400 transition-colors"
          >
            Browse Rental Equipment
          </Link>
          <Link
            to="/shop"
            className="px-8 py-3 border-2 border-neutral-900 text-black font-semibold rounded-lg hover:bg-lime-500 hover:text-gray-900 transition-colors"
          >
            Shop Our Collection
          </Link>
        </div>
      </div>
    </section>
  );
}

// Blog Preview Component
function BlogPreview() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/blog-posts?limit=4&page=1&status=published');

      if (response.data.success) {
        setBlogPosts(response.data.blogPosts || []);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'gear reviews': 'bg-blue-100 text-blue-800',
      'camping tips': 'bg-green-100 text-green-800',
      'camping recipes': 'bg-orange-100 text-orange-800',
      'destinations & locations': 'bg-purple-100 text-purple-800',
      'beginner guides': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <section className="py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
            <p className="text-white mt-4">Loading articles...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4 sm:mb-0">
            Camping Tips & <span className="text-lime-500">Guides</span>
          </h2>
          <Link
            to="/blog"
            className="flex items-center text-lime-600 hover:text-lime-500 font-medium transition-colors"
          >
            View all articles
            <svg className="ml-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12,5 19,12 12,19"></polyline>
            </svg>
          </Link>
        </div>

        {/* Blog Grid */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchBlogPosts}
              className="px-6 py-2 bg-lime-500 text-gray-900 rounded-lg hover:bg-lime-400 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No blog posts available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {blogPosts.slice(0, 4).map((post) => (
              <div key={post._id} className="bg-neutral-900 border border-lime-500 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={post.image.startsWith('http') ? post.image : `${BASE_URL}/uploads/blog-images/${post.image}`}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded capitalize ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-white mb-3">
                    <span>{formatDate(post.publishedDate)}</span>
                    <span className="mx-2">•</span>
                    <span>By {post.author}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-white mb-4 line-clamp-3 text-sm">
                    {truncateContent(post.content)}
                  </p>
                  <Link
                    to={`/blog/${post._id}`}
                    className="flex items-center text-lime-600 hover:text-lime-500 font-medium transition-colors text-sm"
                  >
                    Read Article
                    <svg className="ml-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12,5 19,12 12,19"></polyline>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Footer */}
        <div className="text-center mt-12 sm:hidden">
          <Link
            to="/blog"
            className="px-8 py-3 border-2 border-lime-500 text-lime-500 font-semibold rounded-lg hover:border-lime-400 hover:text-lime-400 transition-colors"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
}

// Main HomePage Component
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <FeaturedProducts />
      <FeaturedCategories />
      <CallToAction />
      <BlogPreview />
    </div>
  );
}