import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Heart, MessageCircle, User, LogOut, Menu, X, Camera, Zap } from 'lucide-react';
import { getProfile } from '../../services/authServices';
import { motion } from 'framer-motion';

const SocialNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await getProfile();
      setUser(res.data.user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/feed', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/create-post', icon: Camera, label: 'Create' },
    { path: '/social-notifications', icon: Heart, label: 'Likes' },
    { path: '/social-messages', icon: MessageCircle, label: 'Messages' },
    { path: '/social-profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:border-r md:border-gray-200 md:bg-white md:flex md:flex-col md:p-6 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200">
          <Camera className="h-8 w-8 text-black" />
          <span className="text-2xl font-light tracking-widest text-black">Homely</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-4 px-6 py-3 rounded-full transition-all ${
                  active
                    ? 'bg-black text-white font-semibold'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                <Icon size={24} />
                <span className="text-lg">{item.label}</span>
                {item.label === 'Likes' && notificationCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 pt-6">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Logged in as</p>
            <p className="font-semibold text-sm truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-600">
              {user?.role === 'landlord' ? 'Agent' : 'Customer'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 text-black hover:bg-gray-100 rounded-full transition-all"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-black" />
          <span className="text-xl font-light tracking-widest">Homely</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 bg-black/50 z-30 top-14"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-0 top-14 w-72 h-screen bg-white border-r border-gray-200 overflow-auto z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-black text-white font-semibold'
                        : 'text-black hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-gray-200 p-4 mt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-100 rounded-lg transition-all"
              >
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.9 }}
              className={`flex-1 flex flex-col items-center justify-center py-3 relative transition-colors ${
                active ? 'text-black' : 'text-gray-600'
              }`}
            >
              <Icon size={24} />
              {item.label === 'Likes' && notificationCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-1/3 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </nav>

    </>
  );
};

export default SocialNavBar;
