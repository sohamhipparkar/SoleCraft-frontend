import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Star, Filter, ChevronDown, Search, ShoppingCart, Tag, ChevronRight, Package, TrendingUp, Users, Clock, Check, X, ArrowRight, Zap, Shield, RefreshCw, Loader } from 'lucide-react';
import axios, { API_BASE_URL } from '../utils/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'tween',
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export default function ShoeShopComponent() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    categories: [],
    priceRange: [0, 200],
    showFilter: false
  });
  const [wishlist, setWishlist] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStockProducts: 0,
    totalOrders: 0,
    averageRating: 0
  });
  const [brands, setBrands] = useState(['all']);
  const [categories, setCategories] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });

  const isAuthenticated = !!localStorage.getItem('token');

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page,
        limit: 12,
        sortBy,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedBrand !== 'all') params.brand = selectedBrand;
      if (filterOptions.brands.length > 0) params.brand = filterOptions.brands;
      if (filterOptions.categories.length > 0) params.category = filterOptions.categories;
      if (filterOptions.priceRange[0] > 0) params.minPrice = filterOptions.priceRange[0];
      if (filterOptions.priceRange[1] < 200) params.maxPrice = filterOptions.priceRange[1];

      const response = await axios.get('/api/products', { params });

      if (response.data.success) {
        setProducts(response.data.products || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 12
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      
      let errorMessage = 'Failed to load products';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/shop/stats');
      if (response.data.success) {
        setStats(response.data.stats || {
          totalProducts: 0,
          inStockProducts: 0,
          totalOrders: 0,
          averageRating: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't show notification for stats - keep default values
      setStats({
        totalProducts: products.length || 0,
        inStockProducts: products.filter(p => p.inStock).length || 0,
        totalOrders: 0,
        averageRating: 0
      });
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/products/filters/brands');
      if (response.data.success) {
        setBrands(['all', ...(response.data.brands || [])]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Keep default 'all' option if fetch fails
      setBrands(['all']);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/filters/categories');
      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Keep empty array if fetch fails
      setCategories([]);
    }
  };

  // Fetch cart
  const fetchCart = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.get('/api/cart');
      if (response.data.success) {
        setCart(response.data.cart || { items: [], subtotal: 0, itemCount: 0 });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      
      // Handle specific errors
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        setCart({ items: [], subtotal: 0, itemCount: 0 });
      } else if (error.response?.status === 404) {
        // Cart not found - initialize empty cart
        setCart({ items: [], subtotal: 0, itemCount: 0 });
      } else if (error.code !== 'ERR_NETWORK') {
        // Only show error if it's not a network error
        // Network errors are already handled globally
      }
    }
  };

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.get('/api/product-wishlist');
      if (response.data.success) {
        setWishlist(response.data.wishlist?.map(item => item._id) || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Don't show error for 404 - wishlist endpoint might not be implemented yet
      if (error.response?.status !== 404) {
        // Only log other errors, don't show notification to user
      }
      // Set empty wishlist on error
      setWishlist([]);
    }
  };

  // Add to cart
  const addToCart = async (product) => {
    if (!isAuthenticated) {
      showNotification('Please login to add items to cart', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      setIsCartLoading(true);
      const response = await axios.post('/api/cart/add', {
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0] || '',
        color: product.colors?.[0] || ''
      });

      if (response.data.success) {
        await fetchCart();
        showNotification(`${product.name} added to cart!`, 'success');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      let errorMessage = 'Failed to add to cart';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please login again to add items to cart';
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 1500);
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid product details';
      } else if (error.response?.status === 404) {
        errorMessage = 'Product not found';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setIsCartLoading(false);
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete(`/api/cart/remove/${itemId}`);
      if (response.data.success) {
        await fetchCart();
        showNotification('Item removed from cart', 'success');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      showNotification('Failed to remove item', 'error');
    }
  };

  // Update cart quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    try {
      const response = await axios.put(`/api/cart/update/${itemId}`, {
        quantity: newQuantity
      });

      if (response.data.success) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showNotification('Failed to update quantity', 'error');
    }
  };

  // Toggle wishlist
  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      showNotification('Please login to add to wishlist', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const isInWishlist = wishlist.includes(productId);

      if (isInWishlist) {
        const response = await axios.delete(`/api/product-wishlist/${productId}`);
        if (response.data.success) {
          setWishlist(wishlist.filter(id => id !== productId));
          showNotification('Removed from wishlist', 'success');
        }
      } else {
        const response = await axios.post(`/api/product-wishlist/${productId}`);
        if (response.data.success) {
          setWishlist([...wishlist, productId]);
          showNotification('Added to wishlist', 'success');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        showNotification('Wishlist feature is currently unavailable', 'error');
      } else if (error.response?.status === 401) {
        showNotification('Please login again to use wishlist', 'error');
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 1500);
      } else {
        showNotification(
          error.response?.data?.message || 'Failed to update wishlist',
          'error'
        );
      }
    }
  };

  // Handle brand filter
  const handleBrandFilter = (brand) => {
    if (filterOptions.brands.includes(brand)) {
      setFilterOptions({
        ...filterOptions,
        brands: filterOptions.brands.filter(b => b !== brand)
      });
    } else {
      setFilterOptions({
        ...filterOptions,
        brands: [...filterOptions.brands, brand]
      });
    }
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    if (filterOptions.categories.includes(category)) {
      setFilterOptions({
        ...filterOptions,
        categories: filterOptions.categories.filter(c => c !== category)
      });
    } else {
      setFilterOptions({
        ...filterOptions,
        categories: [...filterOptions.categories, category]
      });
    }
  };

  // Handle price change
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const numValue = Number(value);

    if (name === 'min') {
      setFilterOptions({
        ...filterOptions,
        priceRange: [numValue, filterOptions.priceRange[1]]
      });
    } else {
      setFilterOptions({
        ...filterOptions,
        priceRange: [filterOptions.priceRange[0], numValue]
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      // Fetch products first (most important)
      await fetchProducts();
      
      // Then fetch supplementary data in parallel (non-critical)
      await Promise.allSettled([
        fetchStats(),
        fetchBrands(),
        fetchCategories()
      ]);
      
      // Finally fetch user-specific data if authenticated
      if (isAuthenticated) {
        await Promise.allSettled([
          fetchCart(),
          fetchWishlist()
        ]);
      }
    };

    initializeData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Add a new useEffect to fetch cart when auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      Promise.allSettled([
        fetchCart(),
        fetchWishlist()
      ]);
    } else {
      // Clear cart and wishlist if not authenticated
      setCart({ items: [], subtotal: 0, itemCount: 0 });
      setWishlist([]);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch products when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filterOptions, selectedBrand, sortBy, page]);

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
      <Navbar />

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50"
          >
            <div
              className={`px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
                notification.type === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {notification.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
              <span>{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 md:pt-28">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Enhanced Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
              <div className="mb-4 md:mb-0">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                  Shoe Shop
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '180px' }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="h-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mt-2"
                  />
                </h2>
                <p className="text-gray-400 text-lg mt-3 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-amber-400" />
                  Find your perfect pair from our premium collection
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search shoes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-gray-700 text-white placeholder-gray-500 transition-all"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-gray-700 text-white cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                </select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCart(!showCart)}
                  className="relative bg-gray-800 p-2.5 rounded-xl hover:bg-amber-500 hover:text-gray-900 transition-all border border-gray-700"
                  aria-label="Toggle cart"
                >
                  <ShoppingCart size={20} />
                  {cart.itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-amber-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                    >
                      {cart.itemCount}
                    </motion.span>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Brand Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {brands.map((brand) => (
                <motion.button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedBrand === brand
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {brand === 'all' ? 'All Brands' : brand}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-700 rounded-2xl p-6 mb-8 shadow-xl border border-gray-700 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-purple-500/5" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {[
              {
                label: 'Total Products',
                value: stats.totalProducts,
                icon: Package,
                colorClass: 'amber',
              },
              {
                label: 'Happy Customers',
                value: '2,547',
                icon: Users,
                colorClass: 'purple',
              },
              {
                label: 'Avg Rating',
                value: (stats.averageRating || 0).toFixed(1),
                icon: Star,
                colorClass: 'yellow',
              },
              {
                label: 'Fast Delivery',
                value: '24h',
                icon: Clock,
                colorClass: 'green',
              },
            ].map((stat, index) => {
                const Icon = stat.icon;

                const colorStyles = {
                  amber: {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    text: 'text-amber-400',
                  },
                  purple: {
                    bg: 'bg-purple-500/10',
                    border: 'border-purple-500/20',
                    text: 'text-purple-400',
                  },
                  yellow: {
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/20',
                    text: 'text-yellow-400',
                  },
                  green: {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/20',
                    text: 'text-green-400',
                  },
                };

                const colors = colorStyles[stat.colorClass] || colorStyles.amber;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="text-center"
                  >
                    <div
                      className={`inline-flex p-3 ${colors.bg} rounded-xl mb-3 border ${colors.border}`}
                    >
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold mb-1 text-white">{stat.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Enhanced Filters Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow-lg cursor-pointer border border-gray-700"
              onClick={() =>
                setFilterOptions({ ...filterOptions, showFilter: !filterOptions.showFilter })
              }
            >
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-amber-400" />
                <span className="font-medium text-white">Advanced Filters</span>
              </div>
              <motion.div
                animate={{ rotate: filterOptions.showFilter ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-amber-400" />
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {filterOptions.showFilter && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden bg-gray-800 rounded-b-xl border-x border-b border-gray-700 mt-2"
                >
                  <div className="p-6 space-y-6">
                    {/* Brand Filters */}
                    <div>
                      <h3 className="font-semibold mb-3 text-white flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-amber-400" />
                        Brands
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {brands
                          .filter((b) => b !== 'all')
                          .map((brand) => (
                            <motion.label
                              key={brand}
                              whileHover={{ scale: 1.02 }}
                              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                                filterOptions.brands.includes(brand)
                                  ? 'bg-amber-500/10 border-amber-500'
                                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                              } border`}
                            >
                              <input
                                type="checkbox"
                                checked={filterOptions.brands.includes(brand)}
                                onChange={() => handleBrandFilter(brand)}
                                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                              />
                              <span className="ml-2 text-sm text-gray-300">{brand}</span>
                            </motion.label>
                          ))}
                      </div>
                    </div>

                    {/* Category Filters */}
                    <div>
                      <h3 className="font-semibold mb-3 text-white flex items-center">
                        <Package className="w-4 h-4 mr-2 text-amber-400" />
                        Categories
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <motion.label
                            key={category}
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                              filterOptions.categories.includes(category)
                                ? 'bg-amber-500/10 border-amber-500'
                                : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                            } border`}
                          >
                            <input
                              type="checkbox"
                              checked={filterOptions.categories.includes(category)}
                              onChange={() => handleCategoryFilter(category)}
                              className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="ml-2 text-sm text-gray-300">{category}</span>
                          </motion.label>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="font-semibold mb-3 text-white flex items-center">
                        <ShoppingBag className="w-4 h-4 mr-2 text-amber-400" />
                        Price Range
                      </h3>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-sm text-gray-400 mb-1 block">Min Price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400">
                              $
                            </span>
                            <input
                              type="number"
                              name="min"
                              placeholder="0"
                              value={filterOptions.priceRange[0]}
                              onChange={handlePriceChange}
                              className="w-full pl-8 pr-4 py-2.5 border border-gray-700 bg-gray-900 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-sm text-gray-400 mb-1 block">Max Price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400">
                              $
                            </span>
                            <input
                              type="number"
                              name="max"
                              placeholder="200"
                              value={filterOptions.priceRange[1]}
                              onChange={handlePriceChange}
                              className="w-full pl-8 pr-4 py-2.5 border border-gray-700 bg-gray-900 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setFilterOptions({
                          brands: [],
                          categories: [],
                          priceRange: [0, 200],
                          showFilter: filterOptions.showFilter,
                        })
                      }
                      className="w-full py-2.5 bg-gray-900 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reset Filters
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader className="w-12 h-12 text-amber-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-400 mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchProducts}
                className="px-6 py-3 bg-amber-500 text-gray-900 rounded-xl font-medium"
              >
                Retry
              </motion.button>
            </div>
          ) : (
            <>
              {/* Enhanced Product Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-12"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center">
                      Available Shoes
                      <span className="ml-3 text-sm font-normal text-gray-400">
                        ({pagination.totalItems} items)
                      </span>
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Premium quality sneakers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {products.map((product) => (
                      <motion.div
                        key={product._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        variants={itemVariants}
                        whileHover={{ y: -8 }}
                        className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-amber-500/50 transition-all shadow-lg group"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={`${API_BASE_URL}${product.image}`}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${API_BASE_URL}/images/placeholder.jpg`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                          {/* Wishlist Button */}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product._id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm rounded-full p-2 z-10 border border-gray-700"
                            aria-label={
                              wishlist.includes(product._id)
                                ? 'Remove from wishlist'
                                : 'Add to wishlist'
                            }
                          >
                            <Heart
                              className={`w-5 h-5 transition-colors ${
                                wishlist.includes(product._id)
                                  ? 'text-red-500 fill-red-500'
                                  : 'text-gray-400'
                              }`}
                            />
                          </motion.button>

                          {/* Rating Badge */}
                          <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-700 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-semibold">{product.rating}</span>
                          </div>

                          {/* Stock Status */}
                          <div className="absolute bottom-3 left-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                product.inStock
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-400 mb-3">
                            {product.brand} • {product.category}
                          </p>

                          <div className="flex items-center gap-2 mb-4">
                            {product.colors.slice(0, 3).map((color, i) => (
                              <motion.div
                                key={i}
                                whileHover={{ scale: 1.3 }}
                                className={`w-5 h-5 rounded-full ${color} border-2 border-gray-700 cursor-pointer`}
                                title={`Color option ${i + 1}`}
                              />
                            ))}
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-amber-400 font-bold text-xl">
                              ${product.price.toFixed(2)}
                            </span>
                            <motion.button
                              onClick={() => addToCart(product)}
                              disabled={!product.inStock || isCartLoading}
                              whileHover={product.inStock ? { scale: 1.05 } : {}}
                              whileTap={product.inStock ? { scale: 0.95 } : {}}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                product.inStock
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-900 shadow-lg shadow-amber-500/30'
                                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              }`}
                              aria-label={`Add ${product.name} to cart`}
                            >
                              {isCartLoading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <ShoppingBag className="w-4 h-4" />
                                  Add
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </motion.button>

                    <span className="text-gray-400">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                      disabled={page === pagination.totalPages}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </motion.button>
                  </div>
                )}

                {products.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-16 text-center"
                  >
                    <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg mb-4">No products match your filters.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 rounded-xl font-medium hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/30"
                      onClick={() => {
                        setFilterOptions({
                          brands: [],
                          categories: [],
                          priceRange: [0, 200],
                          showFilter: false,
                        });
                        setSearchTerm('');
                        setSelectedBrand('all');
                      }}
                    >
                      Reset All Filters
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}

          {/* Enhanced Cart Sidebar */}
          <AnimatePresence>
            {showCart && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowCart(false)}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                />

                <motion.aside
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
                  className="fixed top-0 right-0 w-full sm:w-96 h-full bg-gray-900 shadow-2xl border-l border-gray-700 z-50 flex flex-col"
                >
                  <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2 text-amber-400" />
                      Your Cart
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowCart(false)}
                      aria-label="Close cart"
                      className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {!isAuthenticated ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
                        <p className="text-gray-400 text-center mb-4">
                          Please login to view your cart
                        </p>
                        <Link to="/login">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 rounded-xl font-medium"
                          >
                            Login
                          </motion.button>
                        </Link>
                      </div>
                    ) : cart.items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
                        </motion.div>
                        <p className="text-gray-400 text-center">Your cart is empty.</p>
                        <p className="text-gray-500 text-sm mt-2">Add some shoes to get started!</p>
                      </div>
                    ) : (
                      cart.items.map((item) => (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-4 bg-gray-800 rounded-xl p-4 border border-gray-700"
                        >
                          <img
                            src={`${API_BASE_URL}${item.productId?.image}`}
                            alt={item.productId?.name}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-amber-400"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${API_BASE_URL}/images/placeholder.jpg`;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold truncate">
                              {item.productId?.name}
                            </h4>
                            <p className="text-gray-400 text-sm">{item.productId?.brand}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                                >
                                  -
                                </motion.button>
                                <span className="text-white font-medium w-8 text-center">
                                  {item.quantity}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
                                >
                                  +
                                </motion.button>
                              </div>
                              <p className="text-amber-400 font-bold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item._id)}
                            aria-label={`Remove ${item.productId?.name} from cart`}
                            className="text-red-500 hover:text-red-400 transition-colors p-2 hover:bg-gray-700 rounded-lg"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {isAuthenticated && cart.items.length > 0 && (
                    <div className="p-6 border-t border-gray-700 bg-gray-800">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 font-semibold">Total:</span>
                        <span className="text-amber-400 font-bold text-2xl">
                          ${cart.subtotal}
                        </span>
                      </div>
                      <Link to="/checkout" onClick={() => setShowCart(false)}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-900 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                        >
                          <span>Proceed to Checkout</span>
                          <ArrowRight className="w-5 h-5" />
                        </motion.button>
                      </Link>
                    </div>
                  )}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Enhanced Featured Section - UPDATED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl overflow-hidden shadow-xl border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 flex flex-col justify-center">
                  <span className="text-amber-400 text-sm font-medium mb-2">Featured Collection</span>
                  <h3 className="text-3xl font-bold mb-3 text-white">Dynamic Wave</h3>
                  <p className="text-gray-300 mb-6">Experience the perfect blend of style and comfort with our latest Nike collection.</p>
                  <div className="flex gap-2 mb-6">
                    {["bg-indigo-600", "bg-teal-400", "bg-gray-700"].map((color, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.3 }}
                        className={`${color} w-8 h-8 rounded-full border-2 border-gray-600 cursor-pointer`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-900 font-medium rounded-xl shadow-lg shadow-amber-500/30 transition-all"
                    >
                      Shop Now
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 border border-gray-600 text-white rounded-xl hover:border-amber-500 hover:text-amber-500 transition-all"
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-r from-gray-700 to-gray-900 min-h-[300px]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-64 h-64 rounded-full bg-amber-500 opacity-20 blur-3xl"></div>
                  </div>
                  <img
                    src={`${API_BASE_URL}/images/DynamicWave.png`}
                    alt="Dynamic Wave"
                    className="relative w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      // Fallback to placeholder or hide if image doesn't exist
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">Coming Soon</div>';
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-12 bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700"
          >
            <h3 className="text-2xl font-bold mb-8 text-center">Why Shop With Us</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Clock,
                  title: "Fast Shipping",
                  description: "Free shipping for orders over $100. Express delivery available.",
                  color: "amber"
                },
                {
                  icon: Shield,
                  title: "Secure Payment",
                  description: "Multiple secure payment options. 100% secure checkout.",
                  color: "green"
                },
                {
                  icon: RefreshCw,
                  title: "Easy Returns",
                  description: "30-day return policy. No questions asked.",
                  color: "purple"
                }
              ].map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center text-center p-6 bg-gray-900 rounded-xl border border-gray-700"
                  >
                    <div className={`p-4 bg-${benefit.color}-500/10 rounded-xl mb-4 border border-${benefit.color}-500/20`}>
                      <Icon className={`w-8 h-8 text-${benefit.color}-400`} />
                    </div>
                    <h4 className="font-bold mb-2 text-white">{benefit.title}</h4>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Enhanced CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0">
              <motion.div
                animate={{
                  x: [-100, 100, -100],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-gray-900/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-semibold">Stay Updated</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Join Our Newsletter</h3>
                <p className="text-gray-800 leading-relaxed max-w-2xl">
                  Stay updated with the latest releases and exclusive offers.
                </p>
                <ul className="mt-4 space-y-2 text-gray-800">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>Exclusive member discounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>Early access to new releases</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>Special birthday rewards</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-xl border-2 border-gray-900/20 bg-white/90 backdrop-blur-sm text-gray-900 focus:outline-none focus:border-gray-900 placeholder-gray-600 md:w-80"
                />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gray-900 text-amber-400 px-6 py-3 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  <span>Subscribe Now</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
      <Footer />
    </div>
  );
}