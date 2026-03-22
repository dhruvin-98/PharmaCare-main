// frontend/src/pages/AuthPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
Ã‚  Pill, ShoppingCart, Clock, Shield, Star, Users, 
Ã‚  ArrowRight, CheckCircle, MapPin, TrendingUp, 
Ã‚  Heart, Award, Phone, Mail, Facebook, Twitter, 
Ã‚  Instagram, Linkedin, Menu, X, Eye, EyeOff, Smartphone,
Ã‚  PackageSearch, FileText, Truck, Store, Zap, HeartPulse,
Ã‚  BadgeCheck, Lock, UserCheck, Building2, Activity, Globe,
Ã‚  AlertCircle, User,
  Import
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000') + '/api/auth';

const AuthPage = ({ onLogin, onLogout }) => { 
Ã‚  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP+Name
  const [authMethod, setAuthMethod] = useState('email'); // email | phone
  const [userType, setUserType] = useState('customer');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', otp: '', pharmacyName: ''
  });

  useEffect(() => {
    const authData = localStorage.getItem('user_auth');
    if (authData) {
        const parsed = JSON.parse(authData);
        const initialView = getInitialAuthView(parsed.userType);
        navigate(`/app/${initialView}`);
    }
  }, []);

Ã‚  const handleInputChange = (e) => {
Ã‚  Ã‚  setFormData({ ...formData, [e.target.name]: e.target.value });
Ã‚  };

Ã‚  const setAuthDataInStorage = (data) => {
Ã‚  Ã‚  Ã‚  localStorage.setItem('user_auth', JSON.stringify(data));
Ã‚  Ã‚  Ã‚  setIsLoggedIn(true);
Ã‚  Ã‚  Ã‚  setShowAuthModal(false);
Ã‚  Ã‚  Ã‚  onLogin(data.userType);
Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  const initialView = getInitialAuthView(data.userType);
Ã‚  Ã‚  Ã‚  navigate(`/app/${initialView}`); 
Ã‚  }

Ã‚  const handleLogout = () => {
Ã‚  Ã‚  localStorage.removeItem('user_auth');
Ã‚  Ã‚  onLogout();
Ã‚  Ã‚  setIsLoggedIn(false);
    resetForm();
  };

  const getInitialAuthView = (role) => {
    if (role === 'admin' || role === 'pharmacist') {
      return 'dashboard';
    } else if (role === 'customer') {
      return 'find-medicine';
    }
    return 'dashboard';
  };

Ã‚  // Send OTP (Phone or Email)
  // Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (authMethod === 'email' && !formData.email) throw new Error("Email is required");
      if (authMethod === 'phone' && !formData.phone) throw new Error("Phone number is required");

      const sendPayload = authMethod === 'phone'
        ? { phone: formData.phone }
        : { email: formData.email };

      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setOtpSent(true);
      setStep(2);
      setSuccess(authMethod === 'phone'
        ? 'OTP sent to your mobile number.'
        : 'OTP sent to your email! Check your inbox.');
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      setOtpSent(false);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.otp) throw new Error("OTP is required");
      if (!formData.name) throw new Error("Name is required");
      if (userType === 'pharmacist' && !formData.pharmacyName) throw new Error("Pharmacy name is required for pharmacists");

      const payload = {
        otp: formData.otp,
        name: formData.name,
        userType: userType
      };

      if (authMethod === 'phone') {
        payload.phone = formData.phone;
      } else {
        payload.email = formData.email;
      }

      if (userType === 'pharmacist') {
        payload.pharmacyName = formData.pharmacyName;
      }

      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      const authData = {
        token: data.token,
        userType: data.user.userType,
        userId: data.user._id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone
      };

      localStorage.setItem('user_auth', JSON.stringify(authData));
      setIsLoggedIn(true);
      setShowAuthModal(false);
      onLogin(data.user.userType);
      
      const initialView = getInitialAuthView(data.user.userType);
      navigate(`/app/${initialView}`);
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ email: '', phone: '', otp: '', name: '', pharmacyName: '' });
    setStep(1);
    setOtpSent(false);
    setError(null);
    setSuccess(null);
Ã‚  };


  const handleSocialLogin = async (provider) => {
    alert(`${provider} login is not yet implemented. Please use email or OTP login.`);
Ã‚  };

Ã‚  return (
Ã‚  Ã‚  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
Ã‚  Ã‚  Ã‚  {/* Enhanced Navigation */}
Ã‚  Ã‚  Ã‚  <nav className="fixed top-0 w-full bg-white/98 backdrop-blur-lg shadow-md z-50 border-b border-blue-100">
Ã‚  Ã‚  Ã‚  Ã‚  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex justify-between items-center h-20">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-3 group cursor-pointer">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="relative">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="relative bg-blue-600 rounded-2xl p-3 shadow-xl transform group-hover:scale-110 transition-transform duration-300">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Pill className="h-8 w-8 text-white" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span className="font-bold text-3xl text-blue-600 tracking-tight">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  PharmaCare
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-1 mt-0.5">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span className="text-xs text-gray-600 font-medium">Trusted Healthcare Platform</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="hidden md:flex items-center space-x-8">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <a href="#services" className="text-gray-700 hover:text-blue-600 transition font-semibold text-sm flex items-center space-x-1 group">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Store className="h-4 w-4 group-hover:scale-110 transition-transform" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Services</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </a>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition font-semibold text-sm flex items-center space-x-1 group">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Activity className="h-4 w-4 group-hover:scale-110 transition-transform" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>How It Works</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </a>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition font-semibold text-sm flex items-center space-x-1 group">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Star className="h-4 w-4 group-hover:scale-110 transition-transform" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Testimonials</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </a>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <a href="#contact" className="text-gray-700 hover:text-blue-600 transition font-semibold text-sm flex items-center space-x-1 group">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Contact</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </a>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {!isLoggedIn ? (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <button 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  onClick={() => setShowAuthModal(true)}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 hover:shadow-xl transition transform hover:scale-105 font-semibold flex items-center space-x-2"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  >
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <UserCheck className="h-5 w-5" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Get Started</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </button>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ) : (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <button 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  onClick={handleLogout}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 hover:shadow-xl transition transform hover:scale-105 font-semibold flex items-center space-x-2"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  >
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <X className="h-5 w-5" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Logout</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </button>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  )}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>

Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <button 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="md:hidden text-gray-700 hover:text-blue-600 transition"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  >
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </button>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  </div>

Ã‚  Ã‚  Ã‚  Ã‚  {/* Mobile Menu */}
Ã‚  Ã‚  Ã‚  Ã‚  {mobileMenuOpen && (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="md:hidden bg-white border-t border-blue-100 shadow-lg">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="px-4 py-6 space-y-4">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <a href="#services" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Store className="h-5 w-5" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span className="font-semibold">Services</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </a>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <a href="#how-it-works" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Activity className="h-5 w-5" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span className="font-semibold">How It Works</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </a>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <a href="#testimonials" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Star className="h-5 w-5" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span className="font-semibold">Testimonials</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </a>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <a href="#contact" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Phone className="h-5 w-5" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span className="font-semibold">Contact</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </a>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {!isLoggedIn ? (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <button 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  >
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <UserCheck className="h-5 w-5" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Get Started</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </button>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ) : (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <button 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  onClick={handleLogout}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  >
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <X className="h-5 w-5" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Logout</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </button>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  )}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  )}
Ã‚  Ã‚  Ã‚  </nav>

Ã‚  Ã‚  Ã‚  {/* Hero Section with Enhanced Images */}
Ã‚  Ã‚  Ã‚  <section className="pt-32 pb-24 px-4 relative overflow-hidden">
Ã‚  Ã‚  Ã‚  Ã‚  {/* Decorative Elements */}
Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute top-20 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  <div className="max-w-7xl mx-auto relative z-10">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="grid md:grid-cols-2 gap-16 items-center">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="space-y-8">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg border border-blue-200">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <BadgeCheck className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>India's Most Trusted Pharmacy Platform</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Your Health, Our
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span className="text-blue-600 block mt-2">Priority</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </h1>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <p className="text-xl text-gray-600 leading-relaxed">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Find medicines in 15 minutes, manage prescriptions digitally, and get doorstep delivery with PharmaCare - India's fastest growing healthcare platform
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </p>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex flex-wrap gap-4">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {!isLoggedIn && (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <button 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  onClick={() => setShowAuthModal(true)}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 hover:bg-blue-700 hover:shadow-2xl transition transform hover:scale-105"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  >
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Get Started Free</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ArrowRight className="h-6 w-6" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </button>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  )}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <button className="border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 hover:shadow-xl transition transform hover:scale-105 flex items-center space-x-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Globe className="h-5 w-5" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Watch Demo</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </button>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-8 pt-6">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-3 shadow-lg border border-blue-100">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="bg-green-100 rounded-full p-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <CheckCircle className="h-5 w-5 text-green-600" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span className="text-gray-900 font-bold">100% Genuine</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-3 bg-white rounded-xl px-4 py-3 shadow-lg border border-blue-100">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="bg-blue-100 rounded-full p-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Clock className="h-5 w-5 text-blue-600" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span className="text-gray-900 font-bold">24/7 Support</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {/* Enhanced Image Section */}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="relative">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="relative bg-white rounded-3xl p-6 shadow-2xl border-4 border-blue-100">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <img 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop" 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  alt="Modern Pharmacy" 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-2xl p-5 border-2 border-blue-200">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-4">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="bg-green-100 rounded-xl p-3">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <CheckCircle className="h-8 w-8 text-green-600" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="font-bold text-gray-900 text-2xl">5000+</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-sm text-gray-600 font-semibold">Happy Customers</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute -top-4 -left-4 bg-blue-600 rounded-2xl shadow-2xl p-5">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-3">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Zap className="h-8 w-8 text-yellow-300" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-white">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="font-bold text-xl">15 Min</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-xs font-semibold">Delivery</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  </section>

Ã‚  Ã‚  Ã‚  {/* Enhanced Services Section */}
Ã‚  Ã‚  Ã‚  <section id="services" className="py-24 px-4 bg-white">
Ã‚  Ã‚  Ã‚  Ã‚  <div className="max-w-7xl mx-auto">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-center mb-20">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Store className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Our Services</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Everything You Need</h2>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <p className="text-xl text-gray-600 max-w-2xl mx-auto">Complete healthcare solutions at your fingertips</p>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="grid md:grid-cols-3 gap-8">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {[
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  icon: PackageSearch,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  title: 'Find Medicine Instantly',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  description: 'Locate medicines at nearby pharmacies with real-time availability tracking',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  color: 'blue'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  icon: ShoppingCart,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  title: 'Online Ordering',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  description: 'Order medicines online and get doorstep delivery within hours',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  color: 'blue'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  icon: FileText,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  title: 'Digital Prescriptions',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  description: 'Upload and manage prescriptions digitally with secure cloud storage',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  color: 'blue'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  icon: TrendingUp,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  title: 'Inventory Management',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  description: 'For pharmacists: Track stock, expiry dates, and automate reorders',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  color: 'blue'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  icon: HeartPulse,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  title: 'Health Reminders',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  description: 'Never miss medication with smart reminders and dose tracking',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  color: 'blue'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  icon: Award,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  title: 'Loyalty Rewards',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  description: 'Earn points on purchases and unlock exclusive member discounts',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  color: 'blue'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  }
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ].map((service, idx) => (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  key={idx}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-2 border-blue-100 overflow-hidden"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  >
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="relative h-48 overflow-hidden">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <img 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  src={service.image} 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  alt={service.title}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute bottom-4 left-4 bg-white rounded-xl p-3 shadow-xl">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <service.icon className="h-8 w-8 text-blue-600" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="p-8">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <p className="text-gray-600 leading-relaxed">{service.description}</p>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ))}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  </section>

Ã‚  Ã‚  Ã‚  {/* Enhanced How It Works */}
Ã‚  Ã‚  Ã‚  <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-blue-50 to-white">
Ã‚  Ã‚  Ã‚  Ã‚  <div className="max-w-7xl mx-auto">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-center mb-20">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Activity className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Simple Process</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">How It Works</h2>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get your medicines in 3 simple steps</p>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="grid md:grid-cols-3 gap-12">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {[
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  step: '01',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  title: 'Search Medicine',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  description: 'Search by name or upload your prescription for instant results',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  icon: PackageSearch,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=300&fit=crop'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  step: '02',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  title: 'Choose Pharmacy',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  description: 'Select from nearby pharmacies with live stock availability',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  icon: Building2,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=300&fit=crop'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  step: '03',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  title: 'Get Delivered',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  description: 'Receive at doorstep or pickup from store - your choice',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  icon: Truck,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437f5?w=400&h=300&fit=crop'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  }
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ].map((step, idx) => (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div key={idx} className="relative">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-100 overflow-hidden">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="relative h-56">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <img 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  src={step.image} 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  alt={step.title}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="w-full h-full object-cover"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent"></div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute top-4 right-4 bg-blue-600 text-white font-bold text-3xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {step.step}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute bottom-4 left-4 bg-white rounded-xl p-3 shadow-xl">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <step.icon className="h-10 w-10 text-blue-600" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="p-8">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <p className="text-gray-600 leading-relaxed">{step.description}</p>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {idx < 2 && (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ArrowRight className="h-12 w-12 text-blue-400" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  )}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ))}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  </section>

Ã‚  Ã‚  Ã‚  {/* Enhanced Testimonials */}
Ã‚  Ã‚  Ã‚  <section id="testimonials" className="py-24 px-4 bg-white">
Ã‚  Ã‚  Ã‚  Ã‚  <div className="max-w-7xl mx-auto">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-center mb-20">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Star className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Customer Reviews</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">What People Say</h2>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <p className="text-xl text-gray-600 max-w-2xl mx-auto">Trusted by thousands across India</p>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="grid md:grid-cols-3 gap-8">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {[
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  name: 'Priya Sharma',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  role: 'Customer from Delhi',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://i.pravatar.cc/150?img=1',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  rating: 5,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  text: 'PharmaCare made it incredibly easy to find medicines during an emergency. Found exactly what I needed in just 10 minutes! The service is outstanding.'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  name: 'Dr. Rajesh Kumar',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  role: 'Pharmacist, Mumbai',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://i.pravatar.cc/150?img=33',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  rating: 5,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  text: 'The inventory management system is absolutely fantastic. It saves me hours every week and helps prevent stockouts. Best pharmacy software I have used!'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  name: 'Anjali Patel',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  role: 'Customer from Bangalore',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  image: 'https://i.pravatar.cc/150?img=5',
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  rating: 5,
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  text: 'Love the prescription upload feature! No more carrying physical prescriptions everywhere. Digital storage is secure and accessible anytime.'
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  }
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ].map((testimonial, idx) => (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div key={idx} className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-100 p-8">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-1 mb-6">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {[...Array(testimonial.rating)].map((_, i) => (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ))}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <p className="text-gray-700 mb-8 text-lg leading-relaxed italic">"{testimonial.text}"</p>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-4 pt-6 border-t-2 border-blue-100">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <img 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  src={testimonial.image} 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  alt={testimonial.name}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="w-16 h-16 rounded-full ring-4 ring-blue-100 shadow-lg"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-sm text-gray-600 font-medium">{testimonial.role}</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ))}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  </section>

Ã‚  Ã‚  Ã‚  {/* Enhanced Stats Section */}
Ã‚  Ã‚  Ã‚  <section className="py-24 px-4 bg-blue-600 text-white relative overflow-hidden">
Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute inset-0 bg-blue-700 opacity-50"></div>
Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
Ã‚  Ã‚  Ã‚  Ã‚  <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-800 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  <div className="max-w-7xl mx-auto relative z-10">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="grid md:grid-cols-4 gap-12 text-center">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {[
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  { number: '5000+', label: 'Happy Customers', icon: Users },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  { number: '200+', label: 'Partner Pharmacies', icon: Building2 },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  { number: '10000+', label: 'Medicines Available', icon: Pill },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  { number: '24/7', label: 'Customer Support', icon: HeartPulse }
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ].map((stat, idx) => (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div key={idx} className="transform hover:scale-110 transition-transform duration-300">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <stat.icon className="h-16 w-16 mx-auto mb-6 text-white" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-6xl font-bold mb-4">{stat.number}</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-xl font-semibold">{stat.label}</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ))}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  </section>

Ã‚  Ã‚  Ã‚  {/* Enhanced Contact Section */}
Ã‚  Ã‚  Ã‚  <section id="contact" className="py-24 px-4 bg-gradient-to-b from-white to-blue-50">
Ã‚  Ã‚  Ã‚  Ã‚  <div className="max-w-7xl mx-auto">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="grid md:grid-cols-2 gap-16 items-center">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Phone className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Contact Us</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Get In Touch</h2>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <p className="text-xl text-gray-600 mb-10 leading-relaxed">Have questions? Our team is here to help you 24/7!</p>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="space-y-6">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-5 group bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition border-2 border-blue-100">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="bg-blue-100 p-4 rounded-xl shadow-md group-hover:bg-blue-600 transition">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Phone className="h-7 w-7 text-blue-600 group-hover:text-white transition" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="font-bold text-gray-900 text-lg">Phone</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-gray-600 text-lg">+91 98765 43210</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-5 group bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition border-2 border-blue-100">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="bg-blue-100 p-4 rounded-xl shadow-md group-hover:bg-blue-600 transition">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Mail className="h-7 w-7 text-blue-600 group-hover:text-white transition" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="font-bold text-gray-900 text-lg">Email</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-gray-600 text-lg">support@pharmacare.com</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-5 group bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition border-2 border-blue-100">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="bg-blue-100 p-4 rounded-xl shadow-md group-hover:bg-blue-600 transition">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <MapPin className="h-7 w-7 text-blue-600 group-hover:text-white transition" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="font-bold text-gray-900 text-lg">Location</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-gray-600 text-lg">Delhi, India</div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex space-x-4 mt-10">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {[
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  { icon: Facebook, label: 'Facebook' },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  { icon: Twitter, label: 'Twitter' },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  { icon: Instagram, label: 'Instagram' },
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  { icon: Linkedin, label: 'LinkedIn' }
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ].map((social, idx) => (
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <a 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  key={idx}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  href="#" 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="bg-blue-100 p-4 rounded-xl hover:bg-blue-600 hover:shadow-xl transition transform hover:scale-110 group"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  aria-label={social.label}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  >
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <social.icon className="h-7 w-7 text-blue-600 group-hover:text-white transition" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </a>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  ))}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 overflow-hidden">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="bg-blue-600 p-8 text-white">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <h3 className="text-3xl font-bold mb-2">Send us a message</h3>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <p className="text-blue-100">We'll get back to you within 24 hours</p>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <form className="p-8 space-y-6">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <input 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  type="text" 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  placeholder="John Doe"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition text-lg"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <label className="block text-sm font-bold text-gray-700 mb-2">Your Email</label>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <input 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  type="email" 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  placeholder="john@example.com"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition text-lg"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <label className="block text-sm font-bold text-gray-700 mb-2">Your Message</label>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <textarea 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  placeholder="Tell us how we can help you..."
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  rows="5"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition text-lg resize-none"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center space-x-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Send Message</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ArrowRight className="h-5 w-5" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </button>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </form>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  </section>

Ã‚  Ã‚  Ã‚  {/* Enhanced Footer */}
Ã‚  Ã‚  Ã‚  <footer className="bg-gray-900 text-white py-16 px-4">
Ã‚  Ã‚  Ã‚  Ã‚  <div className="max-w-7xl mx-auto">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="grid md:grid-cols-4 gap-12 mb-12">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-3 mb-6">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="bg-blue-600 rounded-2xl p-3 shadow-xl">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <Pill className="h-7 w-7 text-white" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span className="font-bold text-2xl">PharmaCare</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <p className="text-gray-400 leading-relaxed">Your trusted pharmacy management solution for modern healthcare needs</p>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <h4 className="font-bold text-xl mb-6 text-white">Quick Links</h4>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ul className="space-y-3 text-gray-400">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ArrowRight className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>About Us</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </li>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ArrowRight className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Careers</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </li>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ArrowRight className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Blog</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </li>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ArrowRight className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Press</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </li>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </ul>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <h4 className="font-bold text-xl mb-6 text-white">Support</h4>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ul className="space-y-3 text-gray-400">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ArrowRight className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Help Center</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </li>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ArrowRight className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Terms of Service</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </li>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ArrowRight className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>Privacy Policy</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </li>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <li className="hover:text-white cursor-pointer transition flex items-center space-x-2">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <ArrowRight className="h-4 w-4" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span>FAQ</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </li>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </ul>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <h4 className="font-bold text-xl mb-6 text-white">Newsletter</h4>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <p className="text-gray-400 mb-6">Subscribe for health tips and updates</p>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <input 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  type="email" 
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  placeholder="Your email"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="flex-1 px-5 py-3 rounded-l-xl bg-gray-800 border-2 border-gray-700 focus:outline-none focus:border-blue-600 text-white"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <button className="bg-blue-600 px-6 py-3 rounded-r-xl hover:bg-blue-700 transition font-bold">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã¢€ €™
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </button>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="border-t-2 border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="text-gray-400 mb-4 md:mb-0">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚© 2025 PharmaCare. All rights reserved.
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <div className="flex items-center space-x-6 text-gray-400">
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <BadgeCheck className="h-5 w-5 text-blue-500" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <span className="font-semibold">Certified & Trusted Platform</span>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  </footer>

{/* Simplified 2-Step Email+OTP Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border-2 border-blue-100">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-blue-600 mb-2">
                    Join PharmaCare
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {step === 1
                      ? `Enter your ${authMethod === 'phone' ? 'mobile number' : 'email'} to get started`
                      : `Verify your ${authMethod === 'phone' ? 'mobile number' : 'email'} with OTP`}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    resetForm();
                    setShowAuthModal(false);
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  }}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  className="text-gray-400 hover:text-gray-600 transition transform hover:scale-110 bg-gray-100 rounded-xl p-2"
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  >
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  <X className="h-6 w-6" />
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </button>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-center space-x-3 animate-fadeIn">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="block text-sm font-semibold">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-100 border-2 border-green-400 text-green-700 px-5 py-4 rounded-xl mb-6 flex items-center space-x-3 animate-fadeIn">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="block text-sm font-semibold">{success}</span>
                </div>
              )}

              {/* STEP 1: Select User Type & Enter Email */}
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">I'm a:</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType('customer')}
                        className={`flex-1 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                          userType === 'customer'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                            : 'bg-white text-gray-700 border-blue-200 hover:border-blue-400'
                        }`}
                      >
                        <Users className="inline h-5 w-5 mr-2" />Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('pharmacist')}
                        className={`flex-1 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                          userType === 'pharmacist'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                            : 'bg-white text-gray-700 border-blue-200 hover:border-blue-400'
                        }`}
                      >
                        <Shield className="inline h-5 w-5 mr-2" />Pharmacist
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Login With:</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod('email');
                          setFormData((prev) => ({ ...prev, otp: '' }));
                        }}
                        className={`flex-1 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                          authMethod === 'email'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                            : 'bg-white text-gray-700 border-blue-200 hover:border-blue-400'
                        }`}
                      >
                        <Mail className="inline h-5 w-5 mr-2" />Email OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod('phone');
                          setFormData((prev) => ({ ...prev, otp: '' }));
                        }}
                        className={`flex-1 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                          authMethod === 'phone'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                            : 'bg-white text-gray-700 border-blue-200 hover:border-blue-400'
                        }`}
                      >
                        <Smartphone className="inline h-5 w-5 mr-2" />Mobile OTP
                      </button>
                    </div>
                  </div>
                  <div>
                    {authMethod === 'email' ? (
                      <>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                          <Mail className="h-4 w-4" /><span>Email Address</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" /><span>Mobile Number</span>
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                            placeholder="9876543210"
                            maxLength="10"
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <><Activity className="h-5 w-5 animate-spin" /><span>Sending OTP...</span></>
                    ) : (
                      <><span>Send OTP</span><ArrowRight className="h-5 w-5" /></>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Verify OTP & Enter Details */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {authMethod === 'phone' ? 'Mobile Number' : 'Email'}
                    </label>
                    <div className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-700 flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{authMethod === 'phone' ? formData.phone : formData.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                      <Lock className="h-4 w-4" /><span>Enter OTP</span>
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      maxLength="6"
                      className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-center text-3xl tracking-widest font-bold"
                      placeholder="- - - - - -"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      6-digit code sent to your {authMethod === 'phone' ? 'mobile number' : 'email'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                      <User className="h-4 w-4" /><span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  {userType === 'pharmacist' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                        <Building2 className="h-4 w-4" /><span>Pharmacy Name</span>
                      </label>
                      <input
                        type="text"
                        name="pharmacyName"
                        value={formData.pharmacyName}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition text-lg"
                        placeholder="Your pharmacy name"
                        required
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <><Activity className="h-5 w-5 animate-spin" /><span>Verifying...</span></>
                    ) : (
                      <><span>Verify & Login</span><ArrowRight className="h-5 w-5" /></>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full text-blue-600 hover:text-blue-700 font-semibold text-sm py-2 disabled:opacity-50"
                  >
                    Didn't receive OTP? Resend
                  </button>
                  <button
                    type="button"
                    onClick={() => resetForm()}
                    className="w-full text-gray-600 hover:text-gray-700 font-semibold text-sm py-2"
                  >
                    Ã¢€  Change Email
                  </button>
                </form>
              )}
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  Ã‚  </div>
Ã‚  Ã‚  Ã‚  )}
Ã‚  Ã‚  </div>
Ã‚  );
};

export default AuthPage;