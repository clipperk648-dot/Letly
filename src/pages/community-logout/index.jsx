import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const CommunityLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get user role before clearing localStorage
    const userRole = localStorage.getItem('userRole');

    // Clear all authentication data from localStorage
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing session:', e);
    }

    // Redirect to appropriate dashboard based on user role
    const timer = setTimeout(() => {
      if (userRole === 'landlord') {
        navigate('/landlord-dashboard');
      } else if (userRole === 'tenant') {
        navigate('/tenant-dashboard');
      } else {
        navigate('/login');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Logging out...</h1>
        <p className="text-gray-600">Redirecting you to your dashboard</p>
      </div>
    </div>
  );
};

export default CommunityLogout;
