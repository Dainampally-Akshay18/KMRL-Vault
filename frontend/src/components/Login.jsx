// Login.jsx - WOW-Factor Glassomorphism Design for Judges
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, Shield, Zap, Crown, Sparkles } from 'lucide-react';
import logoImage from '../assets/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get stored users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Find user with matching credentials
      const user = storedUsers.find(
        u => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        // Store logged-in user info
        localStorage.setItem('currentUser', JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          loginTime: new Date().toISOString()
        }));

        // Success - redirect to document upload
        navigate('/document-upload');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Enhanced Animated Background matching Home/Signup */}
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
        
        {/* Extra Visual Elements for Login */}
        <div className="absolute top-1/3 right-1/3 w-16 h-16 border-2 border-purple-400/30 rounded-2xl rotate-12 animate-bounce"></div>
        <div className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-gradient-to-br from-cyan-400/10 to-[#20B2AA]/10 rounded-full animate-pulse delay-1500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg">
          
          {/* Premium Header with Enhanced Animations */}
          <div className="text-center mb-12">
            {/* Enhanced Logo with Login Theme */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-[#20B2AA]/80 to-[#81D8D0]/80 backdrop-blur-2xl rounded-3xl flex items-center justify-center shadow-2xl shadow-[#20B2AA]/50 border border-white/30 hover:scale-110 hover:shadow-3xl transition-all duration-500 group-hover:rotate-12 animate-in zoom-in-50">
                  <img src={logoImage} alt="KMRL-Vault Logo" className="w-14 h-14" />
                </div>
                {/* Crown for VIP login */}
                <Crown className="absolute -top-3 -right-1 w-8 h-8 text-yellow-400 animate-bounce drop-shadow-lg" />
                {/* Floating sparkles */}
                <Sparkles className="absolute -top-2 -left-2 w-5 h-5 text-[#20B2AA] animate-pulse delay-300" />
                <Sparkles className="absolute -bottom-1 -right-3 w-4 h-4 text-cyan-400 animate-pulse delay-700" />
              </div>
            </div>

            {/* Premium Welcome Title */}
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white via-[#20B2AA] to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl animate-in slide-in-from-top-4">
              Welcome Back
            </h1>
            <p className="text-xl text-white/80 drop-shadow-lg font-medium mb-6">
              Sign in to your Smart Documents portal
            </p>

            {/* Premium Welcome Back Badges */}
            <div className="flex justify-center gap-4">
              {[
                { icon: Shield, text: 'Secure Access', color: 'text-green-400' },
                { icon: Zap, text: 'Instant Login', color: 'text-yellow-400' },
                { icon: Crown, text: 'VIP Portal', color: 'text-purple-400' }
              ].map((badge, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 animate-in fade-in delay-300">
                  <badge.icon className={`w-4 h-4 ${badge.color}`} />
                  <span className="text-white/80 text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Glassomorphic Form Container */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-10 hover:bg-white/15 transition-all duration-500 relative overflow-hidden animate-in slide-in-from-bottom-4">
            {/* Animated Border Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#20B2AA]/20 via-cyan-400/20 to-purple-500/20 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
            
            {/* Welcome Message */}
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#20B2AA]/20 to-cyan-400/20 backdrop-blur-xl rounded-full border border-[#20B2AA]/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 font-bold text-sm">🚀 Ready for Smart Document Management</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
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
                    placeholder="Enter your email address"
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
                    placeholder="Enter your password"
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

              {/* Enhanced Error Message */}
              {error && (
                <div className="flex items-center space-x-3 text-red-300 bg-red-500/20 backdrop-blur-xl p-4 rounded-2xl border border-red-500/30 animate-in slide-in-from-left-2 shadow-lg shadow-red-500/10">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 animate-pulse" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Premium Submit Button with Enhanced Animation */}
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
                      <span>Signing You In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <LogIn className="w-6 h-6" />
                      <span>Sign In to Portal</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Quick Login Tips */}
              <div className="bg-gradient-to-r from-[#20B2AA]/10 to-cyan-400/10 backdrop-blur-xl rounded-2xl p-4 border border-[#20B2AA]/20">
                <div className="flex items-center gap-3 text-white/80">
                  <Shield className="w-5 h-5 text-[#20B2AA]" />
                  <div className="text-sm">
                    <p className="font-bold">💡 Quick Tip:</p>
                    <p>Use the same credentials you created during registration</p>
                  </div>
                </div>
              </div>
            </form>

            {/* Enhanced Sign Up Link */}
            <div className="text-center mt-10 pt-8 border-t border-white/20">
              <p className="text-white/80 font-medium mb-4">
                New to KMRL-Vault?
              </p>
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-xl text-white font-bold rounded-2xl hover:from-purple-700/80 hover:to-blue-700/80 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg shadow-purple-500/20 border border-white/20 group"
              >
                <span>Create New Account</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Premium Footer with Status Indicators */}
          <div className="text-center mt-12">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <p className="text-white/70 font-medium mb-4">
                🏢 Enterprise Portal for{' '}
                <span className="text-[#20B2AA] font-bold">Kochi Metro Rail Limited</span>
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white/60 font-medium">System Online</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-3 h-3 bg-[#20B2AA] rounded-full animate-pulse delay-300"></div>
                  <span className="text-xs text-white/60 font-medium">SSL Secure</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-600"></div>
                  <span className="text-xs text-white/60 font-medium">AI Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
