import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RoleBasedNavBar from '../../components/ui/RoleBasedNavBar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import MobileAppFooter from '../../components/ui/MobileAppFooter';
import ApplicationStatusOverview from './components/ApplicationStatusOverview';
import ApplicationFilters from './components/ApplicationFilters';
import ApplicationList from './components/ApplicationList';
import DocumentUploadModal from './components/DocumentUploadModal';
import ApplicationDetailsModal from './components/ApplicationDetailsModal';

const ApplicationTracking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  // TODO: Replace with API call to fetch applications
  const [applications] = useState([]);

  const currentUser = {
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'tenant'
  };

  const handleLogout = () => {
    console.log('User logged out');
  };

  // Check if there's an upload query parameter
  React.useEffect(() => {
    const uploadId = searchParams?.get('upload');
    if (uploadId) {
      const application = applications?.find(app => app?.id === parseInt(uploadId));
      if (application) {
        setSelectedApplication(application);
        setShowDocumentUpload(true);
      }
    }
  }, [searchParams, applications]);

  const filteredApplications = selectedStatus === 'all' 
    ? applications 
    : applications?.filter(app => app?.status === selectedStatus);

  const handleUploadDocuments = (application) => {
    setSelectedApplication(application);
    setShowDocumentUpload(true);
  };

  const handleViewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <RoleBasedNavBar userRole="tenant" isAuthenticated={true} />
      
      {/* Header */}
      <div className="bg-card border-b border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Application Tracking</h1>
              <p className="text-sm text-muted-foreground">
                Monitor your rental applications and manage required documents
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Breadcrumb */}
        <BreadcrumbTrail userRole="tenant" currentPage="Application Tracking" />

        {/* Application Status Overview */}
        <ApplicationStatusOverview applications={applications} />

        {/* Filters */}
        <ApplicationFilters 
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          applications={applications}
        />

        {/* Applications List */}
        <ApplicationList 
          applications={filteredApplications}
          onUploadDocuments={handleUploadDocuments}
          onViewDetails={handleViewApplicationDetails}
        />
      </div>

      {/* Document Upload Modal */}
      {showDocumentUpload && (
        <DocumentUploadModal
          application={selectedApplication}
          onClose={() => {
            setShowDocumentUpload(false);
            setSelectedApplication(null);
          }}
        />
      )}

      {/* Application Details Modal */}
      {showApplicationDetails && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => {
            setShowApplicationDetails(false);
            setSelectedApplication(null);
          }}
          onUploadDocuments={() => {
            setShowApplicationDetails(false);
            setShowDocumentUpload(true);
          }}
        />
      )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FMH</span>
              </div>
              <span className="text-lg font-semibold text-foreground">Findmyhome</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date()?.getFullYear()} Findmyhome. All rights reserved.
            </div>
          </div>
        </div>
      {/* Mobile App Footer */}
      <MobileAppFooter userRole="tenant" showOnDesktop />
    </div>
  );
};

export default ApplicationTracking;
