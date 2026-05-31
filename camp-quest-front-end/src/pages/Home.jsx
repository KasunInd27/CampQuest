// Home.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { BASE_URL } from '../lib/axios';
import toast from 'react-hot-toast';
import { getValidImageUrl, resolveImageUrl } from '../lib/imageHelper';
import { useAuth } from '../context/AuthContext';
import { savePendingAction } from '../utils/pendingActions';
import { Helmet } from "react-helmet-async";

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

// Special Packages Component
function SpecialPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active packages
      const response = await axios.get('/packages');

      if (response.data.success) {
        setPackages(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to load packages');
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPackages = () => {
    // Show top 4 packages
    return packages.slice(0, 4);
  };

  const filteredPackages = getFilteredPackages();

  const handleOrderPackage = (pkg) => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      savePendingAction({ 
        type: 'checkout', 
        state: { package: pkg, orderType: 'package' }, 
        returnPath: '/checkout' 
      });
      navigate('/login');
    } else {
      navigate('/checkout', {
        state: { package: pkg, orderType: 'package' }
      });
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
            <p className="text-white mt-4">Loading packages...</p>
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
              onClick={fetchPackages}
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
            Special Packages
          </h2>
          <Link
            to="/shop" // Or distinct packages page if we had one, but standard shop/rent or just linking to generic Rent is fine or omitting 'View All' if packages are few. 
            // Request says: "Clicking 'View Package Detail' navigates to /packages/:slug". 
            // Buttons on card: 1) "View Package Detail", 2) "Order Now"
            className="hidden sm:block px-4 py-2 text-sm font-medium text-lime-500 border border-lime-500 rounded-md hover:bg-lime-500 hover:text-gray-900 transition-colors">
            View All Equipment
          </Link>
        </div>

        {/* Packages Grid */}
        {filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No special packages available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {filteredPackages.map((pkg, index) => (
              <div key={pkg._id} className="bg-neutral-900 border border-lime-500 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col">
                <div className="relative h-48">
                  <img
                    src={resolveImageUrl(pkg.imageUrl)}
                    alt={pkg.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <span className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded bg-purple-100 text-purple-800">
                    PACKAGE
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2 text-lg">
                    {pkg.name}
                  </h3>
                  <p className="text-neutral-400 text-sm mb-4 line-clamp-2 flex-1">
                    {pkg.description}
                  </p>
                  <div className="text-lg font-bold text-white mb-3">
                    LKR {pkg.price.toLocaleString()}
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Link
                      to={`/packages/${pkg.slug || pkg._id}`}
                      className="block w-full px-4 py-2 border border-lime-500 text-lime-500 font-semibold rounded-lg hover:bg-lime-500/10 transition-colors text-center"
                    >
                      View Package Detail
                    </Link>
                    <button
                      onClick={() => handleOrderPackage(pkg)}
                      className="block w-full px-4 py-2 bg-lime-500 text-gray-900 font-semibold rounded-lg hover:bg-lime-400 transition-colors text-center"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                    src={resolveImageUrl(post.image, 'blog-images')}
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
    <>
      <Helmet>
        <title>
          CampQuest LK | Camping Equipment Rental & Outdoor Gear Store Sri Lanka
        </title>

        <meta
          name="description"
          content="Rent and buy premium camping equipment in Sri Lanka. CampQuest specializes in Hulangala Camping adventures, camping gear rental, tents, hiking equipment, outdoor accessories, and complete camping packages."
        />

        <meta
          name="keywords"
          content="camping sri lanka, camping equipment sri lanka, camping gear rental, tents sri lanka, outdoor equipment, hiking gear sri lanka, camping packages sri lanka, visiting places near hulangala, travelling places near hulangala, hulangala waterfall, බිසෝ ඇල්ල, Camping sites near hulangala, camping packages, camping packages hulangala, camping packages matale, budget camping packages, premium camping packages,
          buy camping gear, rent camping equipment, Camp Quest, CAMPQUEST, camp quest, campquest, campquest lk, campquest sri lanka, camping store sri lanka, outdoor gear sri lanka, camping accessories sri lanka, hulangala matale,hulangala mini world's end, hulangala punchi lokanthaya, හුළංගල පුංචි ලෝකාන්තය, Hulangala Camping, Hulangala Sri Lanka, Hulangala Camping Sri Lanka, Hulangala Camping Matale, Hulangala Camping Packages, 
          hulangala, hulangala camping, camping near me, best camping gear sri lanka, camping items for rent, camping equipment for sale, camping gear shop, camping essentials sri lanka, online camping store sri lanka, camping gear online sri lanka, camping equipment online sri lanka, camping gear delivery sri lanka, camping equipment delivery sri lanka,
          camping supplies sri lanka, camping gear online sri lanka, biso ella, bisso ella, camping gear bisso ella, camping equipment bisso ella, හුලංගල, හුලංගල කැම්පිං, හුලන්ගල, camping items near hulangala, camping equipment near hulangala, camping gear near hulangala, camping store near hulangala, camping rental near hulangala, Camping near Hulangala,
          one three hill camping, one three hill camping, one three hill, one three hill camping items,one three hill camping equipment, one three hill camping gear, one three hill camping rental, one three hill camping store, brandigala camping, brandigala, brandigala camping items, brandigala camping equipment, brandigala camping gear, brandigala camping rental, 
          brandigala camping store, dolukanda, dolukanda camping, dolukanda camping items, dolukanda camping equipment, dolukanda camping gear, dolukanda camping rental, dolukanda camping store, wewathenna, wewathenna camping, wewathenna camping items, wewathenna camping equipment, wewathenna camping gear, wewathenna camping rental, wewathenna camping store, 
          camping gear delivery sri lanka, camping equipment delivery sri lanka, camping gear delivery near me, camping equipment delivery near me, camp quest store, camp quest shop, camp quest rental, camp quest equipment, camp quest gear, camp quest tents, camp quest camping gear, camp quest outdoor gear, camp quest camping equipment, camp quest sri lanka, camp quest lk,
          campquest store, campquest shop, campquest rental, campquest equipment, campquest gear, campquest tents, campquest camping gear, campquest outdoor gear, campquest camping equipment, campquest sri lanka, camping store near colombo, camping items near colombo, camping equipment near colombo, camping gear near colombo, camping rental near colombo, camping store near colombo, 
          camping delivery near colombo, camping gear delivery near colombo, camping equipment delivery near colombo, camping items near kurunegala, camping equipment near kurunegala, camping gear near kurunegala, camping rental near kurunegala, camping store near kurunegala, camping delivery near kurunegala, camping gear delivery near kurunegala, camping equipment delivery near kurunegala,
          camping items near matale, camping equipment near matale, camping gear near matale, camping rental near matale, camping store near matale, camping delivery near matale, camping gear delivery near matale, camping equipment delivery near matale, hulangala sri lanka, hulangala matale, hulangala selagama, hulangala camping sri lanka, hulangala camping matale, hulangala camping selagama, 
          visiting area near kurunegala, visiting area near matale, camping sites near matale, camping sites near kurunegala, riverston, riverston camping, riverston camping areas, manigala, manigala camping, selagama, hulangala ticket price, hulangala entrance fee, hulangala camping price, windproof gas stove, camping gas stove, gas cartidge, camping gas cartridge, camping gas, 
          raincoat, waterproof phone cover, camping cooking set, leech socks, camping chairs, folderble camping chairs, portable chairs, folderble tables, camping cookware items, camping lights, camping lanterns, headtorch, BBQ grill, BBQ machine, gas torch, flame gun, charcoal, charcoal sri lanka, camping charcoal, charcoal 2kg, camping cooking set packages"
        />

        <meta property="og:title" content="CampQuest LK" />
        <meta
          property="og:description"
          content="Sri Lanka's camping equipment rental and outdoor gear platform."
        />
        <meta property="og:url" content="https://campquest.lk" />
        <meta property="og:type" content="website" />

        <link rel="canonical" href="https://campquest.lk/" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Hero />
        <SpecialPackages />
        <FeaturedCategories />
        <CallToAction />
        <BlogPreview />
      </div>
    </> 
  );
}