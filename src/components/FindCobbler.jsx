import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Navigation, 
  Filter, 
  Search, 
  ChevronDown,
  ExternalLink,
  Zap,
  Award,
  Users,
  CheckCircle,
  X,
  Locate,
  Calendar,
  Check,
  AlertCircle,
  User,
  Mail,
  Loader
} from 'lucide-react';
import axios, { API_BASE_URL } from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '16px'
};

const puneCenter = {
  lat: 18.5204,
  lng: 73.8567
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05,
      delayChildren: 0
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

const FindCobbler = () => {
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);
  const [selectedCobbler, setSelectedCobbler] = useState(null);
  const [hoveredCobbler, setHoveredCobbler] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [sortBy, setSortBy] = useState('distance');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  
  // Data states
  const [cobblers, setCobblers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  
  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingCobbler, setBookingCobbler] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [appointmentId, setAppointmentId] = useState('');

  const allServices = ["Repair", "Polish", "Custom", "Exchange", "Restoration"];

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default location (Pune)');
          setUserLocation(puneCenter);
        }
      );
    } else {
      setUserLocation(puneCenter);
    }
  }, []);

  // Fetch cobblers from API
  useEffect(() => {
    if (userLocation) {
      fetchCobblers();
    }
  }, [userLocation, selectedServices, showVerifiedOnly, sortBy]);

  const fetchCobblers = async () => {
    setIsLoading(true);
    setDataError('');
    
    try {
      const params = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        maxDistance: 50000, // 50km
        sortBy: sortBy,
        page: 1,
        limit: 50
      };

      if (selectedServices.length > 0) {
        params.services = selectedServices;
      }

      if (showVerifiedOnly) {
        params.verified = 'true';
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get('/api/cobblers', { params });

      if (response.data.success) {
        setCobblers(response.data.cobblers.map(cobbler => ({
          id: cobbler._id,
          cobblerId: cobbler.cobblerId,
          name: cobbler.name,
          position: {
            lat: cobbler.location.coordinates[1],
            lng: cobbler.location.coordinates[0]
          },
          rating: cobbler.rating,
          reviews: cobbler.reviews,
          phone: cobbler.phone,
          email: cobbler.email,
          hours: cobbler.hours,
          services: cobbler.services,
          distance: cobbler.distance || 'N/A',
          address: cobbler.address,
          verified: cobbler.verified,
          speciality: cobbler.speciality,
          availableSlots: cobbler.availableSlots || []
        })));
      }
    } catch (error) {
      console.error('Error fetching cobblers:', error);
      setDataError('Failed to load cobblers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    if (userLocation) {
      const timer = setTimeout(() => {
        fetchCobblers();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const toggleService = (service) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const clearFilters = () => {
    setSelectedServices([]);
    setSearchQuery('');
    setShowVerifiedOnly(false);
    setSortBy('distance');
  };

  // Generate next 7 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  const handleBookAppointment = (cobbler) => {
    setBookingCobbler(cobbler);
    setShowBookingModal(true);
    setBookingSuccess(false);
    setBookingError('');
    setAppointmentId('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedService('');
    setBookingDetails({ name: '', email: '', phone: '', notes: '' });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedDate || !selectedTime || !selectedService || !bookingDetails.name || !bookingDetails.email || !bookingDetails.phone) {
      setBookingError('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingDetails.email)) {
      setBookingError('Please enter a valid email address');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(bookingDetails.phone.replace(/[^0-9]/g, ''))) {
      setBookingError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsBooking(true);
    setBookingError('');

    try {
      const response = await axios.post(`/api/cobblers/${bookingCobbler.id}/book`, {
        customerName: bookingDetails.name,
        customerEmail: bookingDetails.email,
        customerPhone: bookingDetails.phone,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        serviceType: selectedService,
        notes: bookingDetails.notes
      });

      if (response.data.success) {
        setBookingSuccess(true);
        setAppointmentId(response.data.appointment.appointmentId);
        
        // Refresh cobblers list to update booking count
        await fetchCobblers();
        
        // Close modal after 3 seconds
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(
        error.response?.data?.message || 
        'Failed to book appointment. Please try again.'
      );
    } finally {
      setIsBooking(false);
    }
  };

  const filteredCobblers = cobblers;

  const stats = [
    { label: 'Locations', value: cobblers.length, icon: MapPin, color: 'blue' },
    { label: 'Avg Rating', value: cobblers.length > 0 ? (cobblers.reduce((acc, c) => acc + c.rating, 0) / cobblers.length).toFixed(1) : '0', icon: Star, color: 'amber' },
    { label: 'Total Reviews', value: `${cobblers.reduce((acc, c) => acc + c.reviews, 0)}+`, icon: Users, color: 'purple' },
    { label: 'Coverage', value: '50 km', icon: Navigation, color: 'green' }
  ];

  if (!isLoaded || !userLocation) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
      <Navbar />
      <div className="pt-24 md:pt-28">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full mb-4 border border-amber-500/20"
              >
                <MapPin className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 text-sm font-semibold">Find Nearby Services</span>
              </motion.div>
              
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                Find Cobblers Near You
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "390px" }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="h-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mt-2 mx-auto"
                />
              </h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-gray-400 text-lg max-w-2xl mx-auto mt-4"
              >
                Discover trusted shoe repair services in Pune with verified ratings and reviews
              </motion.p>
            </div>
          </motion.div>

          {/* Stats Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-700 rounded-2xl p-6 mb-8 shadow-xl border border-gray-700 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-purple-500/5" />
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                    whileHover={{ y: -3 }}
                    className="text-center"
                  >
                    <div className={`inline-flex p-3 bg-${stat.color}-500/10 rounded-xl mb-3 border border-${stat.color}-500/20`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mb-6 space-y-4"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 pr-10 text-white text-sm font-medium focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="distance">Sort by Distance</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="reviews">Sort by Reviews</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Verified Filter */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  showVerifiedOnly
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600"
                }`}
              >
                <CheckCircle size={16} />
                <span>Verified Only</span>
              </motion.button>

              {/* Filters Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filterOpen || selectedServices.length > 0
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600"
                }`}
              >
                <Filter size={16} />
                <span>Services {selectedServices.length > 0 && `(${selectedServices.length})`}</span>
                <motion.div
                  animate={{ rotate: filterOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </motion.button>

              {/* Clear Filters */}
              {(selectedServices.length > 0 || searchQuery || showVerifiedOnly) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-all"
                >
                  <X size={16} />
                  <span>Clear All</span>
                </motion.button>
              )}
            </div>

            {/* Service Filters Expandable */}
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                    <p className="text-sm font-medium text-gray-400 mb-3">Filter by Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {allServices.map(service => (
                        <motion.button
                          key={service}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleService(service)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedServices.includes(service)
                              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 shadow-lg shadow-amber-500/30"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                          }`}
                        >
                          {service}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Error Message */}
          {dataError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{dataError}</p>
            </motion.div>
          )}

          {/* Results Count */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mb-4 text-sm text-gray-400"
            >
              Showing <span className="text-white font-medium">{filteredCobblers.length}</span> cobblers
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-400">Loading cobblers...</p>
              </div>
            </div>
          ) : (
            /* Map and Cobbler List */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cobbler List */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
              >
                {filteredCobblers.length > 0 ? (
                  filteredCobblers.map((cobbler) => (
                    <motion.div
                      key={cobbler.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, y: -2 }}
                      onHoverStart={() => setHoveredCobbler(cobbler)}
                      onHoverEnd={() => setHoveredCobbler(null)}
                      onClick={() => {
                        setSelectedCobbler(cobbler);
                        map?.panTo(cobbler.position);
                        map?.setZoom(15);
                      }}
                      className={`bg-gray-800 rounded-xl p-5 border cursor-pointer transition-all relative overflow-hidden ${
                        selectedCobbler?.id === cobbler.id
                          ? "border-amber-500 shadow-lg shadow-amber-500/20"
                          : "border-gray-700 hover:border-amber-500/50"
                      }`}
                    >
                      {/* Hover glow effect */}
                      {(hoveredCobbler?.id === cobbler.id || selectedCobbler?.id === cobbler.id) && (
                        <motion.div
                          layoutId="cobbler-highlight"
                          className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-white text-lg">{cobbler.name}</h3>
                              {cobbler.verified && (
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                  className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded-full"
                                >
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                  <span className="text-green-400 text-xs font-medium">Verified</span>
                                </motion.div>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{cobbler.address}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-amber-400 text-sm font-bold mb-1">{cobbler.distance}</span>
                            <span className="text-xs text-gray-500">away</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center mb-3">
                          <div className="flex items-center mr-3">
                            <Star className="w-4 h-4 text-amber-400 fill-current mr-1" />
                            <span className="text-sm font-bold text-white mr-1">{cobbler.rating}</span>
                            <span className="text-xs text-gray-400">({cobbler.reviews})</span>
                          </div>
                          {cobbler.speciality && (
                            <div className="flex items-center text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">
                              <Zap className="w-3 h-3 mr-1" />
                              {cobbler.speciality}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-sm text-gray-300">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            {cobbler.hours}
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {cobbler.phone}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {cobbler.services.map(service => (
                            <span
                              key={service}
                              className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-lg border border-amber-500/20"
                            >
                              {service}
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-900 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookAppointment(cobbler);
                            }}
                          >
                            <Calendar className="w-4 h-4" />
                            Book
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="py-2.5 bg-gray-900 hover:bg-gray-700 border border-gray-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${cobbler.position.lat},${cobbler.position.lng}`, '_blank');
                            }}
                          >
                            <Navigation className="w-4 h-4" />
                            Directions
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center"
                  >
                    <div className="inline-flex p-4 bg-gray-700 rounded-full mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
                    <p className="text-gray-400 mb-4">Try adjusting your filters or search terms</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearFilters}
                      className="px-6 py-2.5 bg-amber-500 text-gray-900 rounded-lg font-medium hover:bg-amber-400 transition-colors"
                    >
                      Clear Filters
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>

              {/* Map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="lg:col-span-2 bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl relative"
              >
                {/* Map Controls Overlay */}
                <div className="absolute top-4 right-4 z-10 space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      map?.panTo(userLocation || puneCenter);
                      map?.setZoom(13);
                      setSelectedCobbler(null);
                    }}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg"
                  >
                    <Locate className="w-4 h-4 text-amber-400" />
                    <span>Reset View</span>
                  </motion.button>
                </div>

                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={userLocation || puneCenter}
                  zoom={13}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  options={{
                    styles: [
                      { elementType: "geometry", stylers: [{ color: "#1f2937" }] },
                      { elementType: "labels.text.stroke", stylers: [{ color: "#1f2937" }] },
                      { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
                      { 
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                      },
                      {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: "#374151" }]
                      },
                      {
                        featureType: "road",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#1f2937" }]
                      },
                      {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#111827" }]
                      },
                    ],
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                  }}
                >
                  {filteredCobblers.map((cobbler) => (
                    <Marker
                      key={cobbler.id}
                      position={cobbler.position}
                      onClick={() => setSelectedCobbler(cobbler)}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: hoveredCobbler?.id === cobbler.id ? 14 : selectedCobbler?.id === cobbler.id ? 12 : 10,
                        fillColor: selectedCobbler?.id === cobbler.id ? "#fbbf24" : cobbler.verified ? "#10b981" : "#f59e0b",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                      }}
                      animation={selectedCobbler?.id === cobbler.id ? window.google.maps.Animation.BOUNCE : null}
                    />
                  ))}

                  {selectedCobbler && (
                    <InfoWindow
                      position={selectedCobbler.position}
                      onCloseClick={() => setSelectedCobbler(null)}
                    >
                      <div className="p-3 bg-gray-900 text-white rounded-xl min-w-[240px]">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-base mb-1">{selectedCobbler.name}</h3>
                            <p className="text-xs text-gray-400 mb-2">{selectedCobbler.address}</p>
                          </div>
                          {selectedCobbler.verified && (
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 text-amber-400 fill-current mr-1" />
                          <span className="text-sm font-bold mr-1">{selectedCobbler.rating}</span>
                          <span className="text-xs text-gray-400">({selectedCobbler.reviews})</span>
                        </div>

                        <div className="flex items-center text-xs text-gray-300 mb-2">
                          <Clock className="w-3 h-3 mr-1.5" />
                          {selectedCobbler.hours}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {selectedCobbler.services.slice(0, 3).map(service => (
                            <span
                              key={service}
                              className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-md"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleBookAppointment(selectedCobbler)}
                            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                          >
                            <Calendar className="w-3 h-3" />
                            Book
                          </motion.button>
                          
                          <motion.a
                            href={`tel:${selectedCobbler.phone}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                          >
                            <Phone className="w-3 h-3" />
                            Call
                          </motion.a>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedCobbler.position.lat},${selectedCobbler.position.lng}`, '_blank')}
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                          >
                            <Navigation className="w-3 h-3" />
                            Go
                          </motion.button>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </motion.div>
            </div>
          )}

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
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

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-gray-900/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Award className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-semibold">Can't Find What You Need?</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                List Your Cobbler Business
              </h3>
              <p className="text-gray-800 mb-6 max-w-2xl mx-auto">
                Are you a cobbler or shoe repair professional? Join our platform and reach thousands of customers looking for quality shoe care services.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/contact')}
                className="bg-gray-900 text-amber-400 px-8 py-4 rounded-xl font-bold shadow-xl flex items-center gap-2 mx-auto"
              >
                <span>Register Your Business</span>
                <ExternalLink className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
      <Footer />

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isBooking && setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-2xl w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {bookingSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="inline-flex p-4 bg-green-500/20 rounded-full mb-4 border border-green-500/30"
                  >
                    <Check className="w-12 h-12 text-green-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-400 mb-4">
                    Your appointment with <span className="text-amber-400 font-semibold">{bookingCobbler?.name}</span> has been confirmed.
                  </p>
                  <div className="bg-gray-900 rounded-xl p-4 mb-4 text-left">
                    <p className="text-sm text-gray-400 mb-1">Appointment ID:</p>
                    <p className="text-white font-mono font-bold text-lg mb-3">{appointmentId}</p>
                    <p className="text-sm text-gray-400 mb-1">Date & Time:</p>
                    <p className="text-white font-semibold">{selectedDate} at {selectedTime}</p>
                    <p className="text-sm text-gray-400 mb-1 mt-3">Service:</p>
                    <p className="text-white font-semibold">{selectedService}</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    A confirmation has been sent to <span className="text-white">{bookingDetails.email}</span>
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <Calendar className="w-5 h-5 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Book Appointment</h2>
                      </div>
                      <p className="text-gray-400 text-sm">Schedule your visit with {bookingCobbler?.name}</p>
                    </div>
                    <button
                      onClick={() => !isBooking && setShowBookingModal(false)}
                      disabled={isBooking}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Cobbler Info */}
                  <div className="bg-gray-900 rounded-xl p-4 mb-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{bookingCobbler?.name}</h3>
                          {bookingCobbler?.verified && (
                            <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              <span className="text-green-400 text-xs font-medium">Verified</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{bookingCobbler?.address}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-amber-400 fill-current mr-1" />
                        <span className="text-sm font-bold text-white">{bookingCobbler?.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {bookingCobbler?.hours}
                    </div>
                  </div>

                  {/* Booking Form */}
                  <form onSubmit={handleBookingSubmit} className="space-y-5">
                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Select Date <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        disabled={isBooking}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">Choose a date</option>
                        {getAvailableDates().map((date) => (
                          <option key={date.value} value={date.value}>
                            {date.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Time Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Select Time <span className="text-red-400">*</span>
                      </label>
                      {bookingCobbler?.availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {bookingCobbler.availableSlots.map((time) => (
                            <motion.button
                              key={time}
                              type="button"
                              whileHover={{ scale: isBooking ? 1 : 1.05 }}
                              whileTap={{ scale: isBooking ? 1 : 0.95 }}
                              disabled={isBooking}
                              onClick={() => setSelectedTime(time)}
                              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                selectedTime === time
                                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 shadow-lg shadow-amber-500/30"
                                  : "bg-gray-900 text-gray-300 hover:bg-gray-700 border border-gray-700"
                              }`}
                            >
                              {time}
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No time slots available</p>
                      )}
                    </div>

                    {/* Service Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Select Service <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        disabled={isBooking}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      >
                        <option value="">Choose a service</option>
                        {bookingCobbler?.services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Customer Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Your Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            value={bookingDetails.name}
                            onChange={(e) => setBookingDetails({...bookingDetails, name: e.target.value})}
                            disabled={isBooking}
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="email"
                            value={bookingDetails.email}
                            onChange={(e) => setBookingDetails({...bookingDetails, email: e.target.value})}
                            disabled={isBooking}
                            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="tel"
                          value={bookingDetails.phone}
                          onChange={(e) => setBookingDetails({...bookingDetails, phone: e.target.value})}
                          disabled={isBooking}
                          className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={bookingDetails.notes}
                        onChange={(e) => setBookingDetails({...bookingDetails, notes: e.target.value})}
                        disabled={isBooking}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        rows="3"
                        placeholder="Any specific requirements or questions..."
                      />
                    </div>

                    {/* Error Message */}
                    {bookingError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{bookingError}</p>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: isBooking ? 1 : 1.02 }}
                        whileTap={{ scale: isBooking ? 1 : 0.98 }}
                        disabled={isBooking}
                        onClick={() => setShowBookingModal(false)}
                        className="flex-1 py-3 bg-gray-900 hover:bg-gray-700 border border-gray-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: isBooking ? 1 : 1.02 }}
                        whileTap={{ scale: isBooking ? 1 : 0.98 }}
                        disabled={isBooking}
                        className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-900 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isBooking ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Booking...</span>
                          </>
                        ) : (
                          'Confirm Booking'
                        )}
                      </motion.button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f59e0b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #fbbf24;
        }
      `}</style>
    </div>
  );
};

export default FindCobbler;