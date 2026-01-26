import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavBar from '../../components/ui/RoleBasedNavBar';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import DashboardStats from './components/DashboardStats';
import QuickActionButtons from './components/QuickActionButtons';
import SavedPropertiesGrid from './components/SavedPropertiesGrid';
import RecentActivityFeed from './components/RecentActivityFeed';
import ApplicationTracker from './components/ApplicationTracker';
import SlideshowBanner from './components/SlideshowBanner';
import MessageNotifications from './components/MessageNotifications';
import MobileAppFooter from '../../components/ui/MobileAppFooter';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { getProfile } from '../../services/authServices';

const TenantDashboard = () => {
  const [user, setUser] = useState({ name: '', email: '', role: 'tenant', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' });

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        const u = res?.data?.user || {};
        setUser({
          name: u.fullName || u.name || '',
          email: u.email || '',
          role: u.role || 'tenant',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        });
      } catch {}
    })();
  }, []);

  const handleLogout = () => {
    try { localStorage.clear(); sessionStorage.clear(); } catch {}
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <RoleBasedNavBar userRole={user.role} isAuthenticated={true} />
      {/* Header */}
      <div className="bg-card border-b border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">Welcome back, {user?.name?.split(' ')?.[0] || '—'}!</h1>
              <p className="hidden sm:block text-sm text-muted-foreground">
                {new Date()?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center shrink-0 gap-3 sm:gap-4">
              <NotificationIndicator />
              <UserProfileDropdown user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Breadcrumb */}
        <BreadcrumbTrail userRole="tenant" />

        {/* Slideshow Banner */}
        <div className="mb-8">
          <SlideshowBanner />
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActionButtons />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Saved Properties */}
            <SavedPropertiesGrid />
          </div>

          {/* Right Column - Secondary Content */}
          <div className="space-y-8">
            {/* Application Tracker */}
            <ApplicationTracker />

            {/* Messages (live) */}
            <MessageNotifications />

            {/* Recent Activity Feed */}
            <RecentActivityFeed />
          </div>
        </div>
      </div>
      {/* Mobile App Footer */}
      <MobileAppFooter userRole="tenant" showOnDesktop />
    </div>
  );
};

export default TenantDashboard;
