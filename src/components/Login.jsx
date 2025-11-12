import { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  User,
  ShoppingBag,
  Settings,
  Key,
  CheckCircle,
  Sparkles,
  Shield,
  Zap,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// Configure axios base URL (use Vite env var when available)
const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'https://sole-craft-backend.vercel.app';
axios.defaults.baseURL = API_BASE_URL;

export default function EnhancedLoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePanel, setActivePanel] = useState('login');
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchParams] = useSearchParams();
  
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    }
  }, []);

  // Mouse move effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'session_expired') {
      setError('Your session has expired. Please login again.');
    }
  }, [searchParams]);

  const verifyToken = async (token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        navigate('/');
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        setError(error.response.data.message || 'Login failed. Please try again.');
      } else if (error.request) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email
      });

      if (response.data.success) {
        setSuccess('Password reset link has been sent to your email!');
        
        if (response.data.resetToken) {
          console.log('Reset Token:', response.data.resetToken);
        }
        
        setTimeout(() => {
          setActivePanel('login');
          setSuccess('');
        }, 3000);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response) {
        setError(error.response.data.message || 'Failed to send reset link.');
      } else if (error.request) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 120, damping: 12 }
    }
  };

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const rotateVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 25,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const welcomeTextVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.5
      }
    }
  };
  
  const letterVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  };

  const features = [
    { icon: <Sparkles className="w-5 h-5" />, text: "Premium Quality", color: "from-purple-500 to-pink-500" },
    { icon: <Shield className="w-5 h-5" />, text: "Secure Checkout", color: "from-blue-500 to-cyan-500" },
    { icon: <Zap className="w-5 h-5" />, text: "Fast Delivery", color: "from-amber-500 to-orange-500" }
  ];

  const welcomeText = "Welcome to SoleCraft";
  const welcomeLetters = welcomeText.split("");

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div 
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-600/20 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(251, 191, 36, 0.15), transparent 40%)`,
          }}
        />
      </div>

      {/* Welcome animation overlay */}
      <AnimatePresence>
        {showWelcomeAnimation && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, delay: 2 }}
          >
            <motion.div
              className="flex flex-col items-center justify-center"
              variants={welcomeTextVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div 
                className="mb-6 relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                <div className="relative p-4 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl">
                  <ShoppingBag className="text-white w-12 h-12" />
                </div>
              </motion.div>

              <div className="flex flex-wrap justify-center max-w-2xl">
                {welcomeLetters.map((letter, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent inline-block"
                    style={{ 
                      display: letter === " " ? "inline-block" : "inline-block", 
                      width: letter === " " ? "0.5em" : "auto",
                      textShadow: "0 0 30px rgba(251, 191, 36, 0.5)"
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="mt-4 flex items-center space-x-2"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-amber-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main container */}
      <motion.div 
        className="w-full max-w-6xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <motion.div 
            className="hidden lg:block space-y-8"
            variants={itemVariants}
          >
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div 
                className="inline-block"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur-lg opacity-50" />
                    <div className="relative p-3 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl">
                      <ShoppingBag className="text-white w-8 h-8" />
                    </div>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                    SoleCraft
                  </span>
                </div>
              </motion.div>

              <h1 className="text-5xl font-bold text-white leading-tight">
                Step Into
                <span className="block bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                  Excellence
                </span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                Premium shoe care and customization services. Transform your footwear with expert craftsmanship.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 10, scale: 1.02 }}
                  className="flex items-center space-x-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300"
                >
                  <div className={`p-3 bg-gradient-to-br ${feature.color} rounded-lg`}>
                    {feature.icon}
                  </div>
                  <span className="text-white font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4"
              variants={containerVariants}
            >
              {[
                  { value: "10K+", label: "Happy Customers" },
                  { value: "50+", label: "Expert Craftsmen" },
                  { value: "4.9", label: "Rating" }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="text-center p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30"
                  >
                    <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                  </motion.div>
                ))}
            </motion.div>
          </motion.div>

          {/* Right side - Login Form */}
          <motion.div
            variants={itemVariants}
            className="w-full"
          >
            {/* Logo for mobile */}
            <motion.div 
              className="lg:hidden text-center mb-8"
              variants={itemVariants}
            >
              <motion.div 
                className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg mb-4"
                whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
              >
                <ShoppingBag className="text-white w-8 h-8" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white">
                {activePanel === 'login' ? 'Welcome Back' : 'Reset Password'}
              </h1>
              <p className="text-gray-400 text-sm mt-2">
                {activePanel === 'login' 
                  ? 'Sign in to continue your journey'
                  : 'Enter your email to receive reset link'}
              </p>
            </motion.div>

            {/* Form container with glass morphism */}
            <motion.div 
              className="relative bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl opacity-20 blur-xl" />
              
              <div className="relative">
                <AnimatePresence mode="wait">
                  {activePanel === 'login' ? (
                    <motion.form 
                      key="login-form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Email input */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <motion.div 
                          className="relative group"
                          animate={{
                            scale: emailFocused ? 1.02 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 ${emailFocused ? 'opacity-30' : ''}`} />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className={`h-5 w-5 transition-colors duration-300 ${emailFocused ? 'text-amber-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            type="email"
                            className="relative block w-full pl-12 pr-4 py-3.5 bg-gray-900/50 text-white placeholder-gray-500 rounded-xl border border-gray-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Password input */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Password
                        </label>
                        <motion.div 
                          className="relative group"
                          animate={{
                            scale: passwordFocused ? 1.02 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 ${passwordFocused ? 'opacity-30' : ''}`} />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className={`h-5 w-5 transition-colors duration-300 ${passwordFocused ? 'text-amber-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            type={isPasswordVisible ? "text" : "password"}
                            className="relative block w-full pl-12 pr-12 py-3.5 bg-gray-900/50 text-white placeholder-gray-500 rounded-xl border border-gray-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                          />
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <motion.button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="text-gray-400 hover:text-amber-400 focus:outline-none transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Remember me and forgot password */}
                      <motion.div 
                        className="flex items-center justify-between"
                        variants={itemVariants}
                      >
                        <label className="flex items-center group cursor-pointer">
                          <input
                            id="remember-me"
                            type="checkbox"
                            className="h-4 w-4 bg-gray-900 border-gray-700 rounded focus:ring-amber-500 text-amber-500 transition-all"
                          />
                          <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">
                            Remember me
                          </span>
                        </label>
                        {/*<motion.button
                          type="button"
                          className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                          onClick={() => {
                            setActivePanel('forgotPassword');
                            setError('');
                            setSuccess('');
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Forgot password?
                        </motion.button>*/}
                      </motion.div>

                      {/* Error message */}
                      <AnimatePresence>
                        {error && (
                          <motion.div 
                            className="p-4 bg-red-500/10 backdrop-blur-sm text-red-300 rounded-xl flex items-start border border-red-500/20"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Success message */}
                      <AnimatePresence>
                        {success && (
                          <motion.div 
                            className="p-4 bg-green-500/10 backdrop-blur-sm text-green-300 rounded-xl flex items-start border border-green-500/20"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{success}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit button */}
                      <motion.button
                        type="submit"
                        className="relative w-full bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center overflow-hidden group"
                        disabled={isSubmitting}
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        variants={itemVariants}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {isSubmitting ? (
                          <motion.div 
                            className="relative h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          <>
                            <span className="relative">Sign In</span>
                            <motion.div
                              className="relative ml-2"
                              initial={{ x: 0 }}
                              whileHover={{ x: 5 }}
                            >
                              <ArrowRight className="h-5 w-5" />
                            </motion.div>
                          </>
                        )}
                      </motion.button>

                      {/* Divider */}
                      <motion.div 
                        className="relative my-6"
                        variants={itemVariants}
                      >
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-gray-800/40 text-gray-400">Or continue with</span>
                        </div>
                      </motion.div>

                      {/* Social logins */}
                      <motion.div 
                        className="grid grid-cols-3 gap-3"
                        variants={itemVariants}
                      >
                        {[
                          { name: 'Google', icon: (
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"
                              />
                            </svg>
                          )}, 
                          { name: 'Apple', icon: (
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.16 3.51 7.84 9.39 7.64c1.48.06 2.44.83 3.29.83.83 0 2.43-.93 3.69-.78 1.04.05 3.84.42 5.65 3.15-4.11 2.54-3.35 7.39-.97 9.44ZM12.1 7.5c-.06-2.56 2.07-4.99 4.58-5C17.07 5 14.93 7.5 12.1 7.5Z"
                              />
                            </svg>
                          )}, 
                          { name: 'GitHub', icon: <User className="h-5 w-5" /> }
                        ].map((provider, index) => (
                          <motion.button
                            key={provider.name}
                            type="button"
                            className="relative bg-gray-900/50 hover:bg-gray-700/50 p-3 rounded-xl border border-gray-700 hover:border-amber-500/50 flex items-center justify-center transition-all duration-300 group overflow-hidden"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-amber-600/0 group-hover:from-amber-500/10 group-hover:to-amber-600/10 transition-all duration-300" />
                            <span className="relative text-gray-300 group-hover:text-amber-400 transition-colors">
                              {provider.icon}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>

                      {/* Sign up link */}
                      <motion.div 
                        className="text-center pt-4"
                        variants={itemVariants}
                      >
                        <p className="text-gray-400 text-sm">
                          New to SoleCraft?{' '}
                          <Link to="/register">
                            <motion.span
                              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Create an account
                            </motion.span>
                          </Link>
                        </p>
                      </motion.div>
                    </motion.form>
                  ) : (
                    <motion.form 
                      key="forgot-password-form"
                      onSubmit={handleForgotPassword}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <motion.div
                        variants={itemVariants}
                        className="text-center mb-6"
                      >
                        <motion.div 
                          className="inline-flex p-4 bg-amber-500/10 rounded-2xl mb-4"
                          animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          <Key className="h-10 w-10 text-amber-400" />
                        </motion.div>
                        <h3 className="text-xl font-semibold text-white mb-2">Forgot Password?</h3>
                        <p className="text-gray-400 text-sm">
                          No worries! Enter your email and we'll send you a reset link
                        </p>
                      </motion.div>

                      {/* Email input */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <motion.div 
                          className="relative group"
                          animate={{
                            scale: emailFocused ? 1.02 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 ${emailFocused ? 'opacity-30' : ''}`} />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className={`h-5 w-5 transition-colors duration-300 ${emailFocused ? 'text-amber-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            type="email"
                            className="relative block w-full pl-12 pr-4 py-3.5 bg-gray-900/50 text-white placeholder-gray-500 rounded-xl border border-gray-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Error message */}
                      <AnimatePresence>
                        {error && (
                          <motion.div 
                            className="p-4 bg-red-500/10 backdrop-blur-sm text-red-300 rounded-xl flex items-start border border-red-500/20"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Success message */}
                      <AnimatePresence>
                        {success && (
                          <motion.div 
                            className="p-4 bg-green-500/10 backdrop-blur-sm text-green-300 rounded-xl flex items-start border border-green-500/20"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{success}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit button */}
                      <motion.button
                        type="submit"
                        className="relative w-full bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center overflow-hidden group"
                        disabled={isSubmitting}
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                        variants={itemVariants}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {isSubmitting ? (
                          <motion.div 
                            className="relative h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          <span className="relative">Send Reset Link</span>
                        )}
                      </motion.button>

                      {/* Back to login */}
                      <motion.button
                        type="button"
                        onClick={() => {
                          setActivePanel('login');
                          setError('');
                          setSuccess('');
                        }}
                        className="w-full text-center py-3 text-amber-400 border border-gray-700 rounded-xl hover:bg-gray-700/30 hover:border-amber-500/50 transition-all duration-300 font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                      >
                        Back to Login
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}