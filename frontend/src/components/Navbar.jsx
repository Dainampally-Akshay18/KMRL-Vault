// Navbar.jsx - Fixed Professional Version with Proper Visibility
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Home, Info, UserPlus, LogIn } from 'lucide-react';
import logoImage from '../assets/logo.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if we're on a page that needs solid background
  const needsSolidBackground = ['/document-upload', '/analysis', '/about'].includes(location.pathname);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle component mount animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Check user authentication status
  useEffect(() => {
    const checkUser = () => {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      setCurrentUser(user);
    };
    
    checkUser();
    
    // Listen for storage changes to update user state
    const handleStorageChange = () => {
      checkUser();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on interval for immediate updates
    const interval = setInterval(checkUser, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [location]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location]);

  // Close dropdowns on escape key and outside clicks
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown') && !e.target.closest('.profile-button')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isProfileDropdownOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('session_id');
    setCurrentUser(null);
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  // Authenticated navigation links
  const authenticatedNavLinks = [
    { name: 'Home', path: '/document-upload', icon: Home },
    { name: 'About', path: '/about', icon: Info }
  ];

  // Unauthenticated navigation links
  const unauthenticatedNavLinks = [
    { name: 'Login', path: '/login', icon: LogIn },
    { name: 'Sign Up', path: '/register', icon: UserPlus }
  ];

  // Determine navbar background class based on context
  const getNavbarBgClass = () => {
    if (needsSolidBackground || isScrolled) {
      return 'bg-white shadow-lg border-b border-gray-200';
    }
    return 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-md';
  };

  // Determine text color class based on background
  const getTextColorClass = (isActive = false) => {
    if (needsSolidBackground || isScrolled) {
      return isActive ? 'text-white bg-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50';
    }
    return isActive ? 'text-blue-100 bg-white/20' : 'text-white hover:text-blue-100 hover:bg-white/10';
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Navbar - FIXED Z-INDEX AND BACKGROUND */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${getNavbarBgClass()} ${
          isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <Link
              to={currentUser ? "/document-upload" : "/"}
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold transition-colors duration-300 ${
                  needsSolidBackground || isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  KMRL-Vault
                </h1>
                <p className={`text-sm transition-colors duration-300 ${
                  needsSolidBackground || isScrolled ? 'text-gray-600' : 'text-blue-100'
                }`}>
                  Smart Documents
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {currentUser ? (
                // Authenticated User Navigation
                <>
                  {authenticatedNavLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = isActiveLink(link.path);
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${getTextColorClass(isActive)}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}

                  {/* User Profile Dropdown */}
                  <div className="relative ml-4">
                    <button
                      onClick={toggleProfileDropdown}
                      className={`profile-button flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${getTextColorClass()}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        needsSolidBackground || isScrolled ? 'bg-blue-600 text-white' : 'bg-white/20 text-white'
                      }`}>
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-32 truncate">{currentUser.name}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="profile-dropdown absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Unauthenticated User Navigation
                <>
                  {unauthenticatedNavLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = isActiveLink(link.path);
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${getTextColorClass(isActive)}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                needsSolidBackground || isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 transition-all duration-300 z-40 ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
        >
          <div className="px-4 py-6 space-y-4 max-h-screen overflow-y-auto">
            {currentUser ? (
              // Authenticated Mobile Menu
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                </div>

                {/* Navigation Links */}
                {authenticatedNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActiveLink(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-4 border-t border-gray-200 pt-6"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              // Unauthenticated Mobile Menu
              <>
                {unauthenticatedNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActiveLink(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Navbar Spacer - ENSURE PROPER SPACING */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;
