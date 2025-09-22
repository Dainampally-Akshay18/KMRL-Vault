// Navbar.jsx - Enhanced with Increased Height and Better Proportions
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
    { name: 'Sign Up', path: '/signup', icon: UserPlus }
  ];

  // Enhanced navbar background with glassomorphism
  const getNavbarBgClass = () => {
    if (needsSolidBackground) {
      return 'bg-white/95 backdrop-blur-2xl shadow-2xl border-b border-white/20';
    }
    if (isScrolled) {
      return 'bg-white/10 backdrop-blur-2xl shadow-2xl border-b border-white/20';
    }
    return 'bg-white/5 backdrop-blur-2xl border-b border-white/10';
  };

  // Enhanced text colors with glassomorphism theme
  const getTextColorClass = (isActive = false) => {
    if (needsSolidBackground) {
      return isActive 
        ? 'text-white bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] shadow-lg shadow-[#20B2AA]/30' 
        : 'text-gray-700 hover:text-[#20B2AA] hover:bg-[#20B2AA]/10 hover:shadow-lg hover:shadow-[#20B2AA]/20';
    }
    return isActive 
      ? 'text-white bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] shadow-lg shadow-[#20B2AA]/30' 
      : 'text-white/90 hover:text-white hover:bg-white/20 hover:shadow-lg hover:shadow-white/20';
  };

  return (
    <>
      {/* Enhanced Mobile Menu Overlay with Glassomorphism */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Enhanced Main Navbar with INCREASED HEIGHT */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ${getNavbarBgClass()} ${
          isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* INCREASED HEIGHT FROM h-16 TO h-24 */}
          <div className="flex justify-between items-center h-24">
            {/* Enhanced Logo Section with Larger Elements */}
            <Link
              to={currentUser ? "/document-upload" : "/"}
              className="flex items-center space-x-4 group"
            >
              <div className="relative">
                {/* INCREASED LOGO SIZE FROM 12x12 TO 16x16 */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#20B2AA]/80 to-[#81D8D0]/80 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl shadow-[#20B2AA]/30 border border-white/20 hover:scale-110 hover:shadow-3xl transition-all duration-300 group-hover:rotate-3">
                  {/* INCREASED IMAGE SIZE FROM 8x8 TO 10x10 */}
                  <img src={logoImage} alt="KMRL-Vault Logo" className="w-10 h-10" />
                </div>
              </div>
              <div className="hidden sm:block">
                {/* INCREASED TEXT SIZE FROM xl TO 2xl */}
                <h1 className={text-2xl font-black transition-colors duration-300 bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] bg-clip-text text-transparent drop-shadow-lg}>
                  KMRL-Vault
                </h1>
                {/* INCREASED SUBTITLE SIZE FROM sm TO base */}
                <p className={`text-base font-medium transition-colors duration-300 ${
                  needsSolidBackground || isScrolled ? 'text-gray-600' : 'text-white/80'
                } drop-shadow-sm`}>
                  Smart Documents
                </p>
              </div>
            </Link>

            {/* Enhanced Desktop Navigation with Larger Elements */}
            <div className="hidden lg:flex items-center space-x-3">
              {currentUser ? (
                // Enhanced Authenticated User Navigation
                <>
                  {authenticatedNavLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = isActiveLink(link.path);
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={flex items-center space-x-3 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 backdrop-blur-sm border border-white/20 hover:-translate-y-1 ${getTextColorClass(isActive)}}
                      >
                        {/* INCREASED ICON SIZE FROM 4x4 TO 5x5 */}
                        <Icon className="w-5 h-5" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}

                  {/* Enhanced User Profile Dropdown with Larger Elements */}
                  <div className="relative ml-4">
                    <button
                      onClick={toggleProfileDropdown}
                      className={profile-button flex items-center space-x-4 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 backdrop-blur-sm border border-white/20 hover:-translate-y-1 ${getTextColorClass()}}
                    >
                      {/* INCREASED AVATAR SIZE FROM 8x8 TO 10x10 */}
                      <div className="w-10 h-10 bg-gradient-to-br from-[#20B2AA] to-[#81D8D0] rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-[#20B2AA]/30">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-36 truncate">{currentUser.name}</span>
                      {/* INCREASED CHEVRON SIZE FROM 4x4 TO 5x5 */}
                      <svg className={w-5 h-5 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Enhanced Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="profile-dropdown absolute right-0 mt-3 w-72 bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 py-4 z-50 animate-in slide-in-from-top-2">
                        <div className="px-8 py-5 border-b border-white/20">
                          {/* INCREASED TEXT SIZES */}
                          <p className="text-base font-bold text-white truncate drop-shadow-sm">{currentUser.name}</p>
                          <p className="text-sm text-white/70 truncate drop-shadow-sm">{currentUser.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-4 w-full px-8 py-4 text-base font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 rounded-2xl mx-2 mt-2 hover:shadow-lg hover:shadow-red-500/20"
                        >
                          {/* INCREASED LOGOUT ICON SIZE */}
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Enhanced Unauthenticated User Navigation
                <>
                  {unauthenticatedNavLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = isActiveLink(link.path);
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={flex items-center space-x-3 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300 backdrop-blur-sm border border-white/20 hover:-translate-y-1 ${getTextColorClass(isActive)}}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>

            {/* Enhanced Mobile Menu Button with Larger Size */}
            <button
              onClick={toggleMobileMenu}
              className={`lg:hidden p-4 rounded-2xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110 hover:shadow-lg ${
                needsSolidBackground || isScrolled 
                  ? 'text-gray-700 hover:bg-[#20B2AA]/10 hover:text-[#20B2AA] hover:shadow-[#20B2AA]/20' 
                  : 'text-white/90 hover:bg-white/20 hover:text-white hover:shadow-white/20'
              }`}
            >
              {/* INCREASED HAMBURGER ICON SIZE FROM 6x6 TO 7x7 */}
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu with Better Proportions */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-white/10 backdrop-blur-2xl shadow-2xl border-t border-white/20 transition-all duration-500 z-40 ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
        >
          <div className="px-6 py-8 space-y-5 max-h-screen overflow-y-auto">
            {currentUser ? (
              // Enhanced Authenticated Mobile Menu
              <>
                {/* Enhanced User Info Card with Better Proportions */}
                <div className="flex items-center space-x-5 p-8 bg-gradient-to-r from-[#20B2AA]/20 to-[#81D8D0]/20 backdrop-blur-sm rounded-2xl mb-8 border border-white/20 shadow-lg">
                  {/* INCREASED MOBILE AVATAR SIZE FROM 14x14 TO 16x16 */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[#20B2AA] to-[#81D8D0] text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-[#20B2AA]/30">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* INCREASED MOBILE TEXT SIZES */}
                    <p className="text-lg font-bold text-white truncate drop-shadow-sm">{currentUser.name}</p>
                    <p className="text-base text-white/70 truncate drop-shadow-sm">{currentUser.email}</p>
                  </div>
                </div>

                {/* Enhanced Navigation Links with Better Sizing */}
                {authenticatedNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActiveLink(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center space-x-5 px-8 py-5 rounded-2xl text-base font-bold transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-105 hover:shadow-lg ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] text-white shadow-lg shadow-[#20B2AA]/30' 
                          : 'text-white/90 hover:bg-white/20 hover:text-white hover:shadow-white/20'
                      }`}
                    >
                      {/* INCREASED MOBILE ICONS FROM 5x5 TO 6x6 */}
                      <Icon className="w-6 h-6" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}

                {/* Enhanced Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-5 w-full px-8 py-5 text-base font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-2xl transition-all duration-300 mt-8 border-t border-white/20 pt-10 backdrop-blur-sm border border-red-500/30 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
                >
                  <LogOut className="w-6 h-6" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              // Enhanced Unauthenticated Mobile Menu
              <>
                {unauthenticatedNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActiveLink(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`flex items-center space-x-5 px-8 py-5 rounded-2xl text-base font-bold transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-105 hover:shadow-lg ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#20B2AA] to-[#81D8D0] text-white shadow-lg shadow-[#20B2AA]/30' 
                          : 'text-white/90 hover:bg-white/20 hover:text-white hover:shadow-white/20'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* UPDATED Navbar Spacer - INCREASED FROM 16 TO 24 */}
      <div className="h-24"></div>
    </>
  );
};

export default Navbar;
