import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const MobileAppFooter = ({ userRole = 'tenant', showOnDesktop = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'home',
        label: 'Home',
        icon: 'Home',
        path: userRole === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard',
        activeColor: 'text-blue-600',
        inactiveColor: 'text-gray-500'
      },
      {
        id: 'search',
        label: 'Search',
        icon: 'Search',
        path: '/property-search',
        activeColor: 'text-green-600',
        inactiveColor: 'text-gray-500'
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: 'MessageCircle',
        path: '/messages',
        activeColor: 'text-purple-600',
        inactiveColor: 'text-gray-500'
      }
    ];

    if (userRole === 'landlord') {
      baseItems?.push(
        {
          id: 'properties',
          label: 'Properties',
          icon: 'Building2',
          path: '/properties',
          activeColor: 'text-orange-600',
          inactiveColor: 'text-gray-500'
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: 'User',
          path: '/account-profile',
          activeColor: 'text-indigo-600',
          inactiveColor: 'text-gray-500'
        }
      );
    } else {
      baseItems?.push(
        {
          id: 'favorites',
          label: 'Favorites',
          icon: 'Heart',
          path: '/favorites',
          activeColor: 'text-red-600',
          inactiveColor: 'text-gray-500'
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: 'User',
          path: '/account-profile',
          activeColor: 'text-indigo-600',
          inactiveColor: 'text-gray-500'
        }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    if (path === '/landlord-dashboard' || path === '/tenant-dashboard') {
      return location?.pathname === '/' || location?.pathname === path;
    }
    return location?.pathname === path;
  };

  const handleNavigation = (item) => {
    navigate(item?.path);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 pb-[max(env(safe-area-inset-bottom),0px)]${showOnDesktop ? '' : ' md:hidden'}`}>
      <div className="grid grid-cols-5 h-14 md:h-16 select-none">
        {navigationItems?.map((item) => {
          const active = isActive(item?.path);
          return (
            <button
              key={item?.id}
              onClick={() => handleNavigation(item)}
              className={`flex flex-col items-center justify-center px-2 py-1 transition-colors duration-200 ${
                active
                  ? 'bg-blue-50 border-t-2 border-blue-600' :'hover:bg-gray-50 border-t-2 border-transparent'
              }`}
            >
              <Icon
                name={item?.icon}
                size={18}
                className={`mb-1 ${
                  active ? item?.activeColor : item?.inactiveColor
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  active ? item?.activeColor : item?.inactiveColor
                }`}
              >
                {item?.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileAppFooter;
