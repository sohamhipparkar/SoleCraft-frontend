import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Scissors, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  Check, 
  Wrench, 
  RefreshCw, 
  Settings, 
  Star, 
  Clock, 
  Calendar, 
  Heart, 
  ChevronRight,
  TrendingUp,
  X,
  Zap,
  Award,
  Users,
  Package,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';


// Add token to requests if available
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to get correct image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return `${API_BASE_URL}/images/placeholder.jpg`;
  
  // If image path already includes http/https, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Replace localhost URLs with production URL
    return imagePath.replace('http://localhost:5000', API_BASE_URL);
  }
  
  // Otherwise, prepend API_BASE_URL
  return `${API_BASE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

const recentActivity = [
  {
    id: 1,
    action: 'Cleaning & Polishing',
    time: '2 hours ago',
    details: 'Air Jordan 1',
    status: 'Completed',
    icon: Sparkles,
    color: 'green'
  },
  {
    id: 2,
    action: 'Repair & Restoration',
    time: '5 hours ago',
    details: 'Nike Dunk Low',
    status: 'In Progress',
    icon: Wrench,
    color: 'blue'
  },
  {
    id: 3,
    action: 'Custom Design',
    time: '1 day ago',
    details: 'Yeezy Boost 350',
    status: 'Pending',
    icon: Settings,
    color: 'amber'
  },
  {
    id: 4,
    action: 'Shoe Exchange',
    time: '2 days ago',
    details: 'New Balance 550',
    status: 'Completed',
    icon: RefreshCw,
    color: 'purple'
  }
];

const trendingStyles = [
  { name: 'Vintage Restoration', popularity: 92 },
  { name: 'Custom Paint', popularity: 85 },
  { name: 'Deep Clean', popularity: 78 },
  { name: 'Sole Swap', popularity: 65 },
  { name: 'Leather Repair', popularity: 58 }
];

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

const ShoeServiceApp = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [shoeDetails, setShoeDetails] = useState({
    brand: '',
    model: '',
    size: '',
    color: '',
    condition: '',
  });
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch services from backend
  useEffect(() => {
    fetchServices();
  }, []);

  // Auto-fill user data if logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    }
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/services');
      if (response.data.success) {
        setServices(response.data.services);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        const user = response.data.user;
        setCustomerName(user.name || '');
        setCustomerEmail(user.email || '');
        setCustomerPhone(user.phone || '');
        setAddress(user.address || '');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to book a service');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone || !address) {
      alert('Please fill in all required fields');
      return;
    }

    setIsBooking(true);

    try {
      const response = await axios.post(
        `/api/services/${selectedService._id}/book`,
        {
          customerName,
          customerEmail,
          customerPhone,
          address,
          shoeDetails,
          specialInstructions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setIsBooked(true);
        setTimeout(() => {
          setIsBooking(false);
        }, 500);
      }
    } catch (err) {
      console.error('Error booking service:', err);
      alert(err.response?.data?.message || 'Failed to book service');
      setIsBooking(false);
    }
  };

  const resetBooking = () => {
    setSelectedService(null);
    setIsBooked(false);
    setShoeDetails({
      brand: '',
      model: '',
      size: '',
      color: '',
      condition: '',
    });
    setSpecialInstructions('');
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
      <Navbar />
      
      {/* Enhanced Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-24 right-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-2xl max-w-sm z-50 border border-gray-700"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Special Offer</p>
                  <p className="text-sm text-gray-400 mt-1">20% off your first repair service!</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="pt-24 md:pt-28">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
              <div className="mb-4 md:mb-0">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                  Premium Shoe Service
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "375px" }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="h-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mt-2"
                  />
                </h2>
                <p className="text-gray-400 text-lg mt-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-amber-400" />
                  Give your favorite shoes the care they deserve
                </p>
              </div>
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
                { label: 'Shoes Repaired', value: '1,254', icon: Wrench, colorClass: 'amber' },
                { label: 'Premium Polishes', value: '867', icon: Sparkles, colorClass: 'purple' },
                { label: 'Happy Customers', value: '5,000', icon: Users, colorClass: 'green' },
                { label: 'Custom Jobs', value: '432', icon: Settings, colorClass: 'blue' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                
                // Define color styles based on colorClass
                const colorStyles = {
                  amber: {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    text: 'text-amber-400'
                  },
                  purple: {
                    bg: 'bg-purple-500/10',
                    border: 'border-purple-500/20',
                    text: 'text-purple-400'
                  },
                  green: {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/20',
                    text: 'text-green-400'
                  },
                  blue: {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    text: 'text-blue-400'
                  }
                };

                const colors = colorStyles[stat.colorClass] || colorStyles.amber;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                    whileHover={{ y: -3 }}
                    className="text-center"
                  >
                    <div className={`inline-flex p-3 ${colors.bg} rounded-xl mb-3 border ${colors.border}`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold mb-1">{stat.value}+</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Service Cards - FIXED IMAGE RENDERING */}
          <AnimatePresence mode="wait">
            {!selectedService ? (
              <>
                <motion.div 
                  className="mb-10"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Our Services</h2>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-20">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full"
                      />
                    </div>
                  ) : error ? (
                    <div className="text-center py-16 text-red-400">{error}</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {services.map((service) => {
                        const iconMap = {
                          Sparkles: Sparkles,
                          Wrench: Wrench,
                          Settings: Settings,
                          RefreshCw: RefreshCw,
                        };
                        const Icon = iconMap[service.icon] || Sparkles;

                        return (
                          <motion.div
                            key={service._id}
                            variants={itemVariants}
                            whileHover={{ y: -8 }}
                            className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-amber-500/50 transition-all duration-300 shadow-lg cursor-pointer group"
                            onClick={() => setSelectedService(service)}
                          >
                            <div className="h-40 bg-gray-700 relative overflow-hidden">
                              <motion.img
                                src={getImageUrl(service.bgImage)}
                                alt={service.title}
                                className="w-full h-full object-cover"
                                initial={{ scale: 1, opacity: 0.7 }}
                                whileHover={{ scale: 1.1, opacity: 0.9 }}
                                transition={{
                                  duration: 0.6,
                                  ease: [0.43, 0.13, 0.23, 0.96]
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `${API_BASE_URL}/images/placeholder.jpg`;
                                }}
                                loading="lazy"
                              />
                              <motion.div 
                                className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"
                                initial={{ opacity: 1 }}
                                whileHover={{ opacity: 0.7 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                              />
                              
                              <div className="absolute top-3 right-3 bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1 border border-gray-700">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-xs font-semibold">{service.rating}</span>
                              </div>

                              <div className="absolute bottom-3 left-3 flex items-center text-xs text-gray-200 bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700">
                                <Heart className="w-3 h-3 mr-1 text-red-400" />
                                {service.popularCount}
                              </div>
                            </div>
                            
                            <div className="p-5">
                              <div className="flex justify-between items-start mb-4">
                                <motion.div 
                                  className="p-3 bg-gray-900 rounded-lg"
                                  whileHover={{ scale: 1.05, rotate: 5 }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                  <Icon className="w-6 h-6 text-amber-400" />
                                </motion.div>
                                <span className="text-amber-400 font-bold text-lg">{service.price}</span>
                              </div>
                              
                              <h3 className="font-bold text-lg mb-2 group-hover:text-amber-400 transition-colors duration-300">{service.title}</h3>
                              <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                              
                              <div className="flex items-center text-gray-500 text-xs mb-4">
                                <Clock className="w-3 h-3 mr-1" />
                                {service.turnaround}
                              </div>

                              <div className="mt-4 text-amber-400 text-sm font-medium flex items-center group">
                                Learn more 
                                <motion.div
                                  animate={{ x: 0 }}
                                  whileHover={{ x: 4 }}
                                  transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                  <ChevronRight className="ml-1 w-4 h-4" />
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>

                {/* Activity and Trending Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                  {/* Recent Activity */}
                  <motion.div 
                    className="lg:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
                      <h3 className="font-bold text-lg mb-4 flex items-center">
                        <Clock className="mr-2 text-amber-400" />
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        {recentActivity.map((activity) => {
                          const Icon = activity.icon;
                          
                          // Define color styles
                          const colorStyles = {
                            green: {
                              bg: 'bg-green-500/20',
                              border: 'border-green-500/30',
                              statusBg: 'bg-green-900/30',
                              statusText: 'text-green-400',
                              statusBorder: 'border-green-500/30'
                            },
                            blue: {
                              bg: 'bg-blue-500/20',
                              border: 'border-blue-500/30',
                              statusBg: 'bg-blue-900/30',
                              statusText: 'text-blue-400',
                              statusBorder: 'border-blue-500/30'
                            },
                            amber: {
                              bg: 'bg-amber-500/20',
                              border: 'border-amber-500/30',
                              statusBg: 'bg-amber-900/30',
                              statusText: 'text-amber-400',
                              statusBorder: 'border-amber-500/30'
                            },
                            purple: {
                              bg: 'bg-purple-500/20',
                              border: 'border-purple-500/30',
                              statusBg: 'bg-purple-900/30',
                              statusText: 'text-purple-400',
                              statusBorder: 'border-purple-500/30'
                            }
                          };

                          const colors = colorStyles[activity.color] || colorStyles.amber;

                          return (
                            <motion.div 
                              key={activity.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5, duration: 0.3 }}
                              whileHover={{ x: 3 }}
                              className="p-4 bg-gray-900/50 rounded-xl flex justify-between items-center hover:bg-gray-700/50 transition-all cursor-pointer border border-gray-800 hover:border-gray-700"
                            >
                              <div className="flex items-center flex-1">
                                <div className={`p-2.5 ${colors.bg} rounded-lg mr-3 border ${colors.border}`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{activity.action}</p>
                                  <div className="flex items-center mt-1">
                                    <p className="text-gray-400 text-xs">{activity.time}</p>
                                    <span className="mx-2 text-gray-600">•</span>
                                    <p className="text-gray-500 text-xs">{activity.details}</p>
                                  </div>
                                </div>
                              </div>
                              <span className={`text-xs px-3 py-1.5 rounded-full ${colors.statusBg} ${colors.statusText} border ${colors.statusBorder}`}>
                                {activity.status}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>

                  {/* Trending Styles */}
                  <motion.div 
                    className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                      <TrendingUp className="mr-2 text-amber-400" />
                      Trending Styles
                    </h3>
                    
                    <div className="space-y-4">
                      {trendingStyles.map((style, index) => (
                        <motion.div 
                          key={index}
                          className="flex justify-between items-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + 0.1 * index, duration: 0.3 }}
                        >
                          <p className="text-gray-300 text-sm">{style.name}</p>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-700 rounded-full h-1.5 mr-2">
                              <motion.div 
                                className="bg-gradient-to-r from-amber-400 to-amber-600 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${style.popularity}%` }}
                                transition={{ delay: 0.8 + 0.1 * index, duration: 0.8 }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{style.popularity}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Special Promo Banner */}
                <motion.div 
                  className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
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
                        <span className="text-white text-sm font-semibold">Limited Time</span>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">Get a Free Consultation!</h3>
                      <p className="text-gray-800 leading-relaxed max-w-2xl">
                        Ask our experts about shoe care, restoration, or customization. No purchase required.
                      </p>
                      <ul className="mt-4 space-y-2 text-gray-800">
                        <li className="flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          <span>Professional assessment</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          <span>Care recommendations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-5 h-5" />
                          <span>Free estimates</span>
                        </li>
                      </ul>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-gray-900 text-amber-400 px-8 py-4 rounded-xl font-bold shadow-xl flex items-center gap-2 whitespace-nowrap"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              </>
            ) : (
              // Enhanced Service Booking Modal with Form - FIXED IMAGE
              <motion.div className="fixed inset-0 z-40 flex items-center justify-center px-4 overflow-y-auto">
                <motion.div
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={resetBooking}
                />
                
                <motion.div
                  className="relative z-50 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-8 max-w-2xl w-full mx-4 my-8"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                >
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    onClick={resetBooking}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  {!isBooked ? (
                    <form onSubmit={handleBookService}>
                      <div className="flex flex-col items-center mb-6">
                        <img
                          src={getImageUrl(selectedService.bgImage)}
                          alt={selectedService.title}
                          className="w-32 h-32 object-cover rounded-2xl mb-4 border-4 border-amber-400 shadow-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${API_BASE_URL}/images/placeholder.jpg`;
                          }}
                          loading="lazy"
                        />
                        <h2 className="text-2xl font-bold mb-2 text-center">{selectedService.title}</h2>
                        <p className="text-gray-400 text-center mb-4">{selectedService.description}</p>
                      </div>

                      {/* Booking Form */}
                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                            <input
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Shoe Size</label>
                            <input
                              type="text"
                              value={shoeDetails.size}
                              onChange={(e) => setShoeDetails({...shoeDetails, size: e.target.value})}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                              placeholder="e.g., US 10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                          <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                            rows="2"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Special Instructions</label>
                          <textarea
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                            rows="3"
                            placeholder="Any special requests or details..."
                          />
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-900 font-bold px-8 py-4 rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center"
                        disabled={isBooking}
                      >
                        {isBooking ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Confirm Booking
                          </>
                        )}
                      </motion.button>
                    </form>
                  ) : (
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.div
                        className="bg-green-500 rounded-full p-4 mb-4"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12 }}
                      >
                        <Check className="text-white w-8 h-8" />
                      </motion.div>
                      <p className="text-green-300 font-bold text-xl mb-2">Booking Confirmed!</p>
                      <p className="text-gray-400 text-center mb-4">
                        We'll contact you shortly to schedule your appointment
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gray-900 text-amber-400 px-6 py-3 rounded-xl border border-gray-700 hover:border-amber-500/50 transition-all"
                        onClick={resetBooking}
                      >
                        Book Another Service
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ShoeServiceApp;
