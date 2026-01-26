import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';

const SocialNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, likes, comments, follows

  useEffect(() => {
    // Load notifications from localStorage or API
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    // Demo notifications - in production, these would come from an API
    const demoNotifications = [
      {
        id: 1,
        type: 'like',
        user: { name: 'Sarah Johnson', initials: 'SJ', role: 'Agent' },
        post: 'Beautiful sunset at the beach house',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: 2,
        type: 'comment',
        user: { name: 'Mike Chen', initials: 'MC', role: 'Customer' },
        action: 'commented on your post',
        comment: 'Love this place! Is it still available?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
      },
      {
        id: 3,
        type: 'follow',
        user: { name: 'Emma Davis', initials: 'ED', role: 'Agent' },
        action: 'started following you',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: 4,
        type: 'like',
        user: { name: 'John Smith', initials: 'JS', role: 'Customer' },
        post: 'Modern apartment in the city center',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        id: 5,
        type: 'comment',
        user: { name: 'Lisa Wang', initials: 'LW', role: 'Agent' },
        action: 'commented on your post',
        comment: 'Great location! Let me know if interested.',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
      },
      {
        id: 6,
        type: 'follow',
        user: { name: 'Alex Rodriguez', initials: 'AR', role: 'Customer' },
        action: 'started following you',
        timestamp: new Date(Date.now() - 1000 * 60 * 240),
      },
    ];
    setNotifications(demoNotifications);
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => n.type === filter);
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={18} className="text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle size={18} className="text-blue-500" />;
      case 'follow':
        return <UserPlus size={18} className="text-green-500" />;
      default:
        return null;
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'like':
        return `liked your post "${notification.post}"`;
      case 'comment':
        return notification.action;
      case 'follow':
        return notification.action;
      default:
        return '';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 sticky top-0 bg-white/80 backdrop-blur-sm z-40">
          <h1 className="text-2xl font-light">Notifications</h1>
        </div>

        {/* Filter Buttons */}
        <div className="border-b border-gray-200 p-4 flex gap-2 overflow-x-auto">
          {[
            { value: 'all', label: 'All', count: notifications.length },
            { value: 'like', label: 'Likes', count: notifications.filter(n => n.type === 'like').length },
            { value: 'comment', label: 'Comments', count: notifications.filter(n => n.type === 'comment').length },
            { value: 'follow', label: 'Follows', count: notifications.filter(n => n.type === 'follow').length },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                filter === btn.value
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {btn.label}
              {btn.count > 0 && (
                <span className="ml-2 text-sm font-semibold">({btn.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-gray-400 mb-3">
                  {filter === 'all' ? (
                    <>
                      <p className="text-lg font-semibold text-gray-700">No notifications yet</p>
                      <p className="text-sm text-gray-600 mt-1">Interact with posts to get notifications</p>
                    </>
                  ) : (
                    <p className="text-gray-600">No {filter}s yet</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition flex items-start justify-between group"
              >
                <div className="flex gap-4 flex-1">
                  {/* User Avatar & Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {notification.user.initials}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-white rounded-full p-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{notification.user.name}</p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {notification.user.role === 'landlord' ? 'Agent' : 'Customer'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {getNotificationMessage(notification)}
                    </p>
                    {notification.comment && (
                      <p className="text-sm text-gray-700 mt-2 italic border-l-2 border-gray-300 pl-3">
                        "{notification.comment}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500"
                  title="Delete notification"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialNotificationsPage;
