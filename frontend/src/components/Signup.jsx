// Signup.jsx - WOW-Factor Glassomorphism Design for Judges
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles, Shield, Zap } from 'lucide-react';
import logoImage from '../assets/logo.png';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
    setSuccess(''); // Clear success message when user starts typing
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // Get existing users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Check if user already exists
      const existingUser = storedUsers.find(user => user.email === formData.email);
      if (existingUser) {
        setError('An account with this email already exists');
        setIsLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        createdAt: new Date().toISOString()
      };

      // Add to users array
      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

      setSuccess('Account created successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Enhanced Animated Background matching Home page */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {/* Animated Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-[#20B2AA]/40 to-[#81D8D0]/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-80 h-80 bg-gradient-to-r from-[#20B2AA]/30 to-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-400/30 to-[#20B2AA]/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-400/20 to-[#20B2AA]/20 rounded-full blur-2xl animate-pulse delay-3000"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#20B2AA] rounded-full animate-ping opacity-70"></div>
          <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-1000 opacity-60"></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping delay-2000 opacity-50"></div>
          <div className="absolute top-1/3 left-2/3 w-2 h-2 bg-[#20B2AA] rounded-full animate-ping delay-3000 opacity-40"></div>
        </div>

        {/* Geometric Patterns */}
        <div className="absolute top-10 right-20 w-32 h-32 border border-[#20B2AA]/20 rounded-3xl rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-cyan-400/20 rounded-full animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg">
          
          {/* Premium Header with Glassomorphism */}
          <div className="text-center mb-12">
            {/* Enhanced Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-[#20B2AA]/80 to-[#81D8D0]/80 backdrop-blur-2xl rounded-3xl flex items-center justify-center shadow-2xl shadow-[#20B2AA]/50 border border-white/30 hover:scale-110 hover:shadow-3xl transition-all duration-500 group-hover:rotate-12">
                  <img src={logoImage} alt="KMRL-Vault Logo" className="w-14 h-14" />
                </div>
                {/* Floating sparkles */}
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[#20B2AA] animate-bounce" />
                <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-cyan-400 animate-bounce delay-500" />
              </div>
            </div>

            {/* Premium Title */}
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white via-[#20B2AA] to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl animate-in slide-in-from-top-4">
              Join KMRL-Vault
            </h1>
            <p className="text-xl text-white/80 drop-shadow-lg font-medium">
              Create your Smart Documents account
            </p>

            {/* Premium Feature Badges */}
            <div className="flex justify-center gap-4 mt-6">
              {[
                { icon: Shield, text: 'Secure' },
                { icon: Zap, text: 'Fast' },
                { icon: Sparkles, text: 'Smart' }
              ].map((badge, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                  <badge.icon className="w-4 h-4 text-[#20B2AA]" />
                  <span className="text-white/80 text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Glassomorphic Form Container */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-10 hover:bg-white/15 transition-all duration-500 relative overflow-hidden">
            {/* Animated Border Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#20B2AA]/20 via-cyan-400/20 to-purple-500/20 rounded-3xl blur-xl opacity-50"></div>
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              {/* Enhanced Name Field */}
              <div className="space-y-3">
                <label htmlFor="name" className="block text-sm font-bold text-white/90 drop-shadow-sm">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#20B2AA]/20 to-cyan-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#20B2AA] w-5 h-5 z-10" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="relative w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:ring-2 focus:ring-[#20B2AA] focus:border-[#20B2AA] transition-all duration-300 text-white placeholder-white/60 font-medium hover:bg-white/15 focus:bg-white/20"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Enhanced Email Field */}
              <div className="space-y-3">
                <label htmlFor="email" className="block text-sm font-bold text-white/90 drop-shadow-sm">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#20B2AA]/20 to-cyan-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#20B2AA] w-5 h-5 z-10" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="relative w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:ring-2 focus:ring-[#20B2AA] focus:border-[#20B2AA] transition-all duration-300 text-white placeholder-white/60 font-medium hover:bg-white/15 focus:bg-white/20"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Enhanced Password Field */}
              <div className="space-y-3">
                <label htmlFor="password" className="block text-sm font-bold text-white/90 drop-shadow-sm">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#20B2AA]/20 to-cyan-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#20B2AA] w-5 h-5 z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="relative w-full pl-14 pr-14 py-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:ring-2 focus:ring-[#20B2AA] focus:border-[#20B2AA] transition-all duration-300 text-white placeholder-white/60 font-medium hover:bg-white/15 focus:bg-white/20"
                    placeholder="Create a secure password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-[#20B2AA] transition-colors duration-300 z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Enhanced Confirm Password Field */}
              <div className="space-y-3">
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-white/90 drop-shadow-sm">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#20B2AA]/20 to-cyan-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#20B2AA] w-5 h-5 z-10" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="relative w-full pl-14 pr-14 py-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl focus:ring-2 focus:ring-[#20B2AA] focus:border-[#20B2AA] transition-all duration-300 text-white placeholder-white/60 font-medium hover:bg-white/15 focus:bg-white/20"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-[#20B2AA] transition-colors duration-300 z-10"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Enhanced Error Message */}
              {error && (
                <div className="flex items-center space-x-3 text-red-300 bg-red-500/20 backdrop-blur-xl p-4 rounded-2xl border border-red-500/30 animate-in slide-in-from-left-2">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Enhanced Success Message */}
              {success && (
                <div className="flex items-center space-x-3 text-green-300 bg-green-500/20 backdrop-blur-xl p-4 rounded-2xl border border-green-500/30 animate-in slide-in-from-left-2">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="font-medium">{success}</span>
                </div>
              )}

              {/* Premium Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] text-white py-5 rounded-2xl font-black text-lg hover:from-[#1a9d9a] hover:to-[#6bc7c0] focus:ring-4 focus:ring-[#20B2AA]/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:transform-none shadow-2xl shadow-[#20B2AA]/30 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative z-10">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Creating Your Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <UserPlus className="w-6 h-6" />
                      <span>Create Account</span>
                    </div>
                  )}
                </div>
              </button>
            </form>

            {/* Enhanced Login Link */}
            <div className="text-center mt-10 pt-8 border-t border-white/20">
              <p className="text-white/80 font-medium">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-[#20B2AA] hover:text-cyan-300 font-bold hover:underline transition-all duration-300 inline-flex items-center gap-1 group"
                >
                  <span>Sign In</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </p>
            </div>
          </div>

          {/* Premium Footer */}
          <div className="text-center mt-12">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <p className="text-white/70 font-medium">
                🔒 Enterprise-grade security for{' '}
                <span className="text-[#20B2AA] font-bold">Kochi Metro</span> documents
              </p>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>256-bit encryption</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <div className="w-2 h-2 bg-[#20B2AA] rounded-full animate-pulse delay-500"></div>
                  <span>GDPR compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
