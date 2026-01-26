import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


const QuickActionButtons = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 1,
      title: 'Search Properties',
      description: 'Find your perfect home',
      icon: 'Search',
      color: 'bg-primary text-primary-foreground',
      action: () => navigate('/property-search'),
      primary: true
    },
    {
      id: 2,
      title: 'Community',
      description: 'Join the social platform',
      icon: 'Share2',
      color: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
      action: () => navigate('/feed'),
      primary: true,
      badge: 'NEW'
    },
    {
      id: 3,
      title: 'View Applications',
      description: 'Track your applications',
      icon: 'FileText',
      color: 'bg-secondary text-secondary-foreground',
      action: () => navigate('/applications')
    },
    {
      id: 4,
      title: 'Messages',
      description: 'Chat with landlords',
      icon: 'MessageSquare',
      color: 'bg-blue-600 text-white',
      action: () => navigate('/messages'),
      badge: 3
    },
    {
      id: 5,
      title: 'Favorites',
      description: 'Saved properties',
      icon: 'Heart',
      color: 'bg-error text-error-foreground',
      action: () => navigate('/favorites'),
      badge: 4
    },
    {
      id: 6,
      title: 'Profile',
      description: 'Manage your profile',
      icon: 'User',
      color: 'bg-muted text-muted-foreground',
      action: () => navigate('/profile')
    },
    {
      id: 7,
      title: 'Settings',
      description: 'Account settings',
      icon: 'Settings',
      color: 'bg-muted text-muted-foreground',
      action: () => navigate('/settings')
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
      {/* Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {quickActions?.filter(action => action?.primary)?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.action}
            className={`${action?.color} rounded-lg p-6 text-left hover:opacity-90 transition-all hover:elevation-2 group`}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon name={action?.icon} size={24} />
              {action?.badge && (
                <span className="bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {action?.badge}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-1 group-hover:scale-105 transition-transform">
              {action?.title}
            </h3>
            <p className="text-sm opacity-90">{action?.description}</p>
          </button>
        ))}
      </div>
      {/* Secondary Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions?.filter(action => !action?.primary)?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.action}
            className={`${action?.color} rounded-lg p-4 text-center hover:opacity-90 transition-all hover:elevation-1 group relative`}
          >
            {action?.badge && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                {action?.badge}
              </div>
            )}
            <Icon name={action?.icon} size={20} className="mx-auto mb-2" />
            <h4 className="font-medium text-sm mb-1 group-hover:scale-105 transition-transform">
              {action?.title}
            </h4>
            <p className="text-xs opacity-80">{action?.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionButtons;
