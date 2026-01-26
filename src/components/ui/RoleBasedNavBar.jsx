import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const RoleBasedNavBar = ({ userRole = 'tenant', isAuthenticated = true }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const landlordNavItems = [
    { label: 'Dashboard', path: '/landlord-dashboard', icon: 'Home' },
    { label: 'Properties', path: '/properties', icon: 'Building' },
    { label: 'Messages', path: '/messages', icon: 'MessageSquare' },
    { label: 'Analytics', path: '/analytics', icon: 'BarChart3' },
    { label: 'Community', path: '/feed', icon: 'Share2', badge: 'Social' }
  ];

  const tenantNavItems = [
    { label: 'Dashboard', path: '/tenant-dashboard', icon: 'Home' },
    { label: 'Search', path: '/property-search', icon: 'Search' },
    { label: 'Favorites', path: '/favorites', icon: 'Heart' },
    { label: 'Messages', path: '/messages', icon: 'MessageSquare' },
    { label: 'Community', path: '/feed', icon: 'Share2', badge: 'Social' }
  ];

  const moreMenuItems = [
    { label: 'Settings', path: '/settings', icon: 'Settings' },
    { label: 'Help', path: '/help', icon: 'HelpCircle' },
    { label: 'Support', path: '/support', icon: 'LifeBuoy' },
    { label: 'Community', path: '/feed', icon: 'Share2', badge: 'Social', divider: true }
  ];

  const currentNavItems = userRole === 'landlord' ? landlordNavItems : tenantNavItems;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  if (!isAuthenticated) {
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-smooth"
                  type="button"
                >
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Icon name="Building2" size={20} color="white" />
                  </div>
                  <span className="text-xl font-semibold">Findmyhome</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-foreground hover:text-primary"
                >
                  Sign In
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="h-16" aria-hidden="true" />
      </>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border elevation-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => handleNavigation(userRole === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard')}
                className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-smooth"
                type="button"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Building2" size={20} color="white" />
                </div>
                <span className="text-xl font-semibold">Findmyhome</span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {currentNavItems?.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-smooth relative ${
                    isActivePath(item?.path)
                      ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  type="button"
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.label}</span>
                  {item?.badge && (
                    <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full">
                      {item?.badge}
                    </span>
                  )}
                </button>
              ))}

              {/* More Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => toggleDropdown('more')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                  type="button"
                >
                  <Icon name="MoreHorizontal" size={18} />
                  <span>More</span>
                </button>

                {activeDropdown === 'more' && (
                  <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md elevation-2 animate-slide-down">
                    <div className="py-1">
                      {moreMenuItems?.map((item, idx) => (
                        <div key={item?.path}>
                          {item?.divider && idx > 0 && <div className="border-t border-border my-1" />}
                          <button
                            onClick={() => handleNavigation(item?.path)}
                            className="flex items-center justify-between space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                            type="button"
                          >
                            <div className="flex items-center space-x-2">
                              <Icon name={item?.icon} size={16} />
                              <span>{item?.label}</span>
                            </div>
                            {item?.badge && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full">
                                {item?.badge}
                              </span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                type="button"
              >
                <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-card animate-slide-down">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {currentNavItems?.map((item) => (
                  <button
                    key={item?.path}
                    onClick={() => handleNavigation(item?.path)}
                    className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium transition-smooth justify-between ${
                      isActivePath(item?.path)
                        ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name={item?.icon} size={20} />
                      <span>{item?.label}</span>
                    </div>
                    {item?.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full">
                        {item?.badge}
                      </span>
                    )}
                  </button>
                ))}

                <div className="border-t border-border pt-2 mt-2">
                  {moreMenuItems?.map((item) => (
                    <button
                      key={item?.path}
                      onClick={() => handleNavigation(item?.path)}
                      className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                      type="button"
                    >
                      <Icon name={item?.icon} size={20} />
                      <span>{item?.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* spacer to offset fixed nav height */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
};

export default RoleBasedNavBar;
