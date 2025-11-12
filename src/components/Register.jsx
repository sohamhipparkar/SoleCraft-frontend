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
  CheckCircle, 
  Phone,
  Sparkles,
  Shield,
  Zap,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios, { API_BASE_URL } from '../utils/axiosConfig';

export default function Register() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  
  const navigate = useNavigate();

  // Password strength calculation
  const calculatePasswordStrength = (pass) => {
    let score = 0;
    const checks = {
      length: pass.length >= 8,
      lowercase: /[a-z]/.test(pass),
      uppercase: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    };

    // Calculate score
    if (checks.length) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.number) score += 20;
    if (checks.special) score += 20;

    // Determine strength level
    let text = '';
    let color = '';
    if (score === 0) {
      text = '';
      color = '';
    } else if (score <= 40) {
      text = 'Weak';
      color = 'from-red-500 to-red-600';
    } else if (score <= 60) {
      text = 'Fair';
      color = 'from-orange-500 to-orange-600';
    } else if (score <= 80) {
      text = 'Good';
      color = 'from-yellow-500 to-yellow-600';
    } else {
      text = 'Strong';
      color = 'from-green-500 to-green-600';
    }

    return { score, text, color, checks };
  };

  // Update password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, text: '', color: '' });
    }
  }, [password]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  // Mouse move effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (phone.length < 10) {
      setError('Please enter a valid phone number (minimum 10 digits)');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        phone,
        password
      });

      if (res.data && res.data.success) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }

        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.request) {
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
    { icon: <Shield className="w-5 h-5" />, text: "Secure Platform", color: "from-blue-500 to-cyan-500" },
    { icon: <Zap className="w-5 h-5" />, text: "Instant Access", color: "from-amber-500 to-orange-500" }
  ];

  const welcomeText = "Join SoleCraft Today";
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
                Start Your
                <span className="block bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                  Journey Today
                </span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                Join thousands of satisfied customers and experience premium shoe care services with expert craftsmanship.
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
                { value: "10K+", label: "Happy Members" },
                { value: "100%", label: "Secure" },
                { value: "24/7", label: "Support" }
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

          {/* Right side - Registration Form */}
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
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-gray-400 text-sm mt-2">
                Join us and start your journey
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
                  {registrationSuccess ? (
                    <motion.div 
                      key="success"
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div 
                        className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg mb-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      >
                        <CheckCircle className="text-white w-12 h-12" />
                      </motion.div>
                      <motion.h2 
                        className="text-2xl font-bold text-white mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Welcome Aboard!
                      </motion.h2>
                      <motion.p 
                        className="text-gray-400"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        Registration successful. Redirecting...
                      </motion.p>
                      <motion.div
                        className="mt-6 flex justify-center space-x-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
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
                  ) : (
                    <motion.form 
                      key="register-form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      {/* Name input */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <motion.div 
                          className="relative group"
                          animate={{
                            scale: nameFocused ? 1.02 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 ${nameFocused ? 'opacity-30' : ''}`} />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className={`h-5 w-5 transition-colors duration-300 ${nameFocused ? 'text-amber-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            type="text"
                            className="relative block w-full pl-12 pr-4 py-3.5 bg-gray-900/50 text-white placeholder-gray-500 rounded-xl border border-gray-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={() => setNameFocused(true)}
                            onBlur={() => setNameFocused(false)}
                          />
                        </motion.div>
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

                      {/* Phone input */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Phone Number
                        </label>
                        <motion.div 
                          className="relative group"
                          animate={{
                            scale: phoneFocused ? 1.02 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 ${phoneFocused ? 'opacity-30' : ''}`} />
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className={`h-5 w-5 transition-colors duration-300 ${phoneFocused ? 'text-amber-400' : 'text-gray-400'}`} />
                          </div>
                          <input
                            type="tel"
                            className="relative block w-full pl-12 pr-4 py-3.5 bg-gray-900/50 text-white placeholder-gray-500 rounded-xl border border-gray-700 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                            placeholder="+91-9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onFocus={() => setPhoneFocused(true)}
                            onBlur={() => setPhoneFocused(false)}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Password input with strength indicator */}
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

                        {/* Password Strength Indicator */}
                        <AnimatePresence>
                          {password && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 space-y-2"
                            >
                              {/* Strength Bar */}
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full bg-gradient-to-r ${passwordStrength.color}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${passwordStrength.score}%` }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                                {passwordStrength.text && (
                                  <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`text-xs font-semibold bg-gradient-to-r ${passwordStrength.color} bg-clip-text text-transparent`}
                                  >
                                    {passwordStrength.text}
                                  </motion.span>
                                )}
                              </div>

                              {/* Password Requirements Checklist */}
                              <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-gray-900/30 rounded-lg border border-gray-700/30"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                {[
                                  {
                                    key: 'length',
                                    text: '8+ characters'
                                  },
                                  {
                                    key: 'lowercase',
                                    text: 'Lowercase letter'
                                  },
                                  {
                                    key: 'uppercase',
                                    text: 'Uppercase letter'
                                  },
                                  {
                                    key: 'number',
                                    text: 'Number'
                                  },
                                  {
                                    key: 'special',
                                    text: 'Special character'
                                  },
                                ].map((requirement, index) => {
                                  const checks = passwordStrength.checks || {};
                                  const isValid = checks[requirement.key];
                                  return (
                                    <motion.div
                                      key={requirement.key}
                                      className="flex items-center space-x-2"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <motion.div
                                        animate={{
                                          scale: isValid ? [1, 1.2, 1] : 1,
                                        }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        {isValid ? (
                                          <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <X className="w-4 h-4 text-gray-500" />
                                        )}
                                      </motion.div>
                                      <span
                                        className={`text-xs ${
                                          isValid ? 'text-green-400' : 'text-gray-500'
                                        }`}
                                      >
                                        {requirement.text}
                                      </span>
                                    </motion.div>
                                  );
                                })}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Terms checkbox */}
                      <motion.div 
                        className="flex items-start"
                        variants={itemVariants}
                      >
                        <input
                          id="terms"
                          type="checkbox"
                          className="mt-1 h-4 w-4 bg-gray-900 border-gray-700 rounded focus:ring-amber-500 text-amber-500 transition-all"
                          required
                        />
                        <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                          I agree to the{' '}
                          <span className="text-amber-400 hover:text-amber-300 cursor-pointer">Terms of Service</span>
                          {' '}and{' '}
                          <span className="text-amber-400 hover:text-amber-300 cursor-pointer">Privacy Policy</span>
                        </label>
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
                            <span className="relative">Create Account</span>
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
                          <span className="px-4 bg-gray-800/40 text-gray-400">Or sign up with</span>
                        </div>
                      </motion.div>

                      {/* Social logins */}
                      <motion.div 
                        className="grid grid-cols-3 gap-3"
                        variants={itemVariants}
                      >
                        {[
                          { name: 'Google', icon: (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path
                                fill="currentColor"
                                d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"
                              />
                            </svg>
                          )},
                          { name: 'Apple', icon: (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

                      {/* Sign in link */}
                      <motion.div 
                        className="text-center pt-4"
                        variants={itemVariants}
                      >
                        <p className="text-gray-400 text-sm">
                          Already have an account?{' '}
                          <Link to="/login">
                            <motion.span
                              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Sign in
                            </motion.span>
                          </Link>
                        </p>
                      </motion.div>
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