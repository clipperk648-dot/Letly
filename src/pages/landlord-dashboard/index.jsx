import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavBar from '../../components/ui/RoleBasedNavBar';
import UserProfileDropdown from '../../components/ui/UserProfileDropdown';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import MobileAppFooter from '../../components/ui/MobileAppFooter';
import Button from '../../components/ui/Button';
import PropertyCard from './components/PropertyCard';
import Image from '../../components/AppImage';
import { getProfile } from '../../services/authServices';
import SlideshowBanner from '../tenant-dashboard/components/SlideshowBanner';
import { formatCurrency } from '../../utils/currency';

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [currentUser, setCurrentUser] = useState({ name: '', email: '', role: 'landlord', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' });

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        const u = res?.data?.user || {};
        setCurrentUser({
          name: u.fullName || u.name || '',
          email: u.email || '',
          role: u.role || 'landlord',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        });
      } catch {}
    })();
  }, []);

  // Load properties from API (landlord's properties)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/properties');
        const json = await res.json();
        const items = Array.isArray(json?.items) ? json.items : [];
        const normalized = items.map((p) => ({
          ...p,
          id: p.id || p._id,
          image: p.image || (Array.isArray(p.images) ? p.images[0] : ''),
          unitsOccupied: p.unitsOccupied || 0,
          unitsTotal: p.unitsTotal || 1,
        }));
        if (mounted) setProperties(normalized);
      } catch (e) {
        if (mounted) setProperties([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const dashboardMetrics = {
    totalProperties: properties.length,
    occupancyPercent: properties.length === 0 ? 0 : Math.round(
      (properties.reduce((acc, p) => acc + (p.unitsOccupied || 0), 0) /
        Math.max(1, properties.reduce((acc, p) => acc + (p.unitsTotal || 0), 0))) *
        100
    ),
    monthlyRevenue: properties.reduce((acc, p) => acc + (p.price || 0), 0),
    requestsPending: 0,
  };

  const formatCurrencyLocal = (value) => formatCurrency(value);

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavBar userRole={currentUser.role} isAuthenticated />

      <div className="pt-16 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 gap-2 h-16">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-foreground truncate">
                Welcome back, {currentUser?.name?.split(' ')?.[0] || '—'}!
              </h1>
              <p className="hidden sm:block text-muted-foreground mt-1">Here's what's happening with your properties today.</p>
            </div>

            <div className="flex items-center shrink-0 gap-3">
              <NotificationIndicator />
              <UserProfileDropdown user={currentUser} onLogout={() => navigate('/login')} />
            </div>
          </div>

          {/* Slideshow Banner */}
          <div className="mb-6">
            <SlideshowBanner slides={[
              { id: 1, title: 'List properties in minutes', subtitle: 'Add new listings and start receiving inquiries', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1600&h=600&fit=crop' },
              { id: 2, title: 'Track performance easily', subtitle: 'Views, inquiries, and favorites at a glance', image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1600&h=600&fit=crop' },
              { id: 3, title: 'Reach verified tenants', subtitle: 'Your listings appear instantly in tenant search', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1600&h=600&fit=crop' },
            ]} interval={3000} />
          </div>

          {/* Community Promotion Banner */}
          <div className="mb-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Join Our Community Platform</h3>
                <p className="text-rose-100 mb-4">Share your listings, connect with tenants, and build your brand in our social community.</p>
                <Button
                  variant="default"
                  className="bg-white text-rose-600 hover:bg-gray-100"
                  onClick={() => navigate('/feed')}
                >
                  Explore Community
                </Button>
              </div>
              <div className="hidden sm:block text-5xl opacity-20">📸</div>
            </div>
          </div>

          {/* Metrics Grid (mobile-first) */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Properties</div>
              <div className="text-xl font-semibold text-foreground">{dashboardMetrics.totalProperties}</div>
              <div className="text-xs text-muted-foreground">{properties.reduce((acc, p) => acc + (p.unitsTotal || 0), 0)} units</div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Occupancy</div>
              <div className="text-xl font-semibold text-success">{dashboardMetrics.occupancyPercent}%</div>
              <div className="text-xs text-muted-foreground">{dashboardMetrics.occupancyPercent}% occupied</div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Revenue</div>
              <div className="text-xl font-semibold text-foreground">{formatCurrencyLocal(dashboardMetrics.monthlyRevenue)}</div>
              <div className="text-xs text-muted-foreground">+12% this month</div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Requests</div>
              <div className="text-xl font-semibold text-foreground">{dashboardMetrics.requestsPending}</div>
              <div className="text-xs text-muted-foreground">{dashboardMetrics.requestsPending} pending</div>
            </div>
          </div>

          {/* Your Properties */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Properties</h2>
            <Button variant="default" size="sm" onClick={() => navigate('/property-management')}>+ Add</Button>
          </div>

          <div className="space-y-3">
            {properties.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-lg p-3 flex items-center">
                <div className="w-24 h-16 flex-shrink-0 rounded overflow-hidden mr-3">
                  <Image src={p.image} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{p.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center">{p.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">{formatCurrency(p.price)}{p.type === 'rent' ? '/mo' : ''}</div>
                      <div className="text-xs text-muted-foreground">{p.unitsOccupied}/{p.unitsTotal}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="w-1/2 bg-muted h-2 rounded-full overflow-hidden">
                      <div style={{ width: `${Math.min(100, Math.round((p.unitsOccupied / p.unitsTotal) * 100))}%` }} className="h-2 bg-primary" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => navigate('/property-details', { state: { propertyId: p.id } })}>
                        View
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigate('/property-management')}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MobileAppFooter userRole="landlord" showOnDesktop />
    </div>
  );
};

export default LandlordDashboard;
