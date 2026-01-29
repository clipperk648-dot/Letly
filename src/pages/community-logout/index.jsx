import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CommunityLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get user role to redirect to appropriate dashboard
    const userRole = localStorage.getItem('userRole');

    // Redirect immediately to dashboard (no auth clearing - just exiting community)
    if (userRole === 'landlord') {
      navigate('/landlord-dashboard');
    } else if (userRole === 'tenant') {
      navigate('/tenant-dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <ArrowLeft className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Exiting Community</h1>
        <p className="text-gray-600">Taking you back to your dashboard</p>
      </div>
    </div>
  );
};

export default CommunityLogout;
