import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const NotificationIndicator = ({ 
  notifications = [],
  unreadCount = 0,
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onNotificationClick = () => {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const list = Array.isArray(notifications) ? notifications : [];
  const displayUnreadCount = unreadCount > 0 ? unreadCount : list?.filter(n => !n?.isRead)?.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event?.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    onNotificationClick(notification);
    if (!notification?.isRead) {
      onMarkAsRead(notification?.id);
    }
    if (notification?.actionUrl) {
      navigate(notification?.actionUrl);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return 'MessageSquare';
      case 'application':
        return 'FileText';
      case 'reminder':
        return 'Clock';
      case 'property':
        return 'Home';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return 'text-blue-500';
      case 'application':
        return 'text-success';
      case 'reminder':
        return 'text-warning';
      case 'property':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="relative z-40" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg hover:bg-muted transition-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Notifications ${displayUnreadCount > 0 ? `(${displayUnreadCount} unread)` : ''}`}
      >
        <Icon 
          name="Bell" 
          size={20} 
          className={`${displayUnreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'} transition-colors`}
        />
        
        {/* Unread Count Badge */}
        {displayUnreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs font-medium rounded-full flex items-center justify-center animate-pulse">
            {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
          </div>
        )}
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg elevation-2 animate-slide-down max-h-96 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-popover-foreground">Notifications</h3>
            {displayUnreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {list?.length > 0 ? (
              list?.map((notification) => (
                <button
                  key={notification?.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full px-4 py-3 text-left hover:bg-muted transition-smooth border-b border-border last:border-b-0 ${
                    !notification?.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 ${getNotificationColor(notification?.type)}`}>
                      <Icon name={getNotificationIcon(notification?.type)} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium truncate ${
                          !notification?.isRead ? 'text-popover-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification?.title}
                        </p>
                        {!notification?.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification?.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification?.timestamp}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {list?.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <button
                onClick={() => {
                  navigate('/account-notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIndicator;
