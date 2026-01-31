import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavBar from '../../components/ui/RoleBasedNavBar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import MobileAppFooter from '../../components/ui/MobileAppFooter';
import InquiryFilters from './components/InquiryFilters';
import InquiryCard from './components/InquiryCard';
import InquiryStats from './components/InquiryStats';
import BulkInquiryActions from './components/BulkInquiryActions';
import InquiryDetailModal from './components/InquiryDetailModal';

const InquiryManagement = () => {
  const navigate = useNavigate();
  const [selectedInquiries, setSelectedInquiries] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({});
  const [currentSort, setCurrentSort] = useState('recent');
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [viewMode, setViewMode] = useState('cards');

  // Mock user data
  const currentUser = {
    name: "David Wilson",
    email: "david.wilson@findmyhome.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role: "landlord"
  };

  // TODO: Replace with API call to fetch inquiries
  const mockInquiries = [];

  // Inquiry statistics
  const inquiryStats = {
    total: mockInquiries?.length,
    new: mockInquiries?.filter(i => i?.status === 'new')?.length,
    responded: mockInquiries?.filter(i => i?.status === 'responded')?.length,
    followUp: mockInquiries?.filter(i => i?.status === 'follow-up')?.length,
    resolved: mockInquiries?.filter(i => i?.status === 'resolved')?.length,
    avgResponseTime: "2.5 hours",
    todayCount: mockInquiries?.filter(i => {
      const today = new Date();
      const inquiryDate = new Date(i?.timestamp);
      return inquiryDate?.toDateString() === today?.toDateString();
    })?.length
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [currentFilters, currentSort]);

  const applyFiltersAndSort = () => {
    let filtered = [...mockInquiries];

    // Apply filters
    if (currentFilters?.status) {
      filtered = filtered?.filter(inquiry => inquiry?.status === currentFilters?.status);
    }
    if (currentFilters?.priority) {
      filtered = filtered?.filter(inquiry => inquiry?.priority === currentFilters?.priority);
    }
    if (currentFilters?.inquiryType) {
      filtered = filtered?.filter(inquiry => inquiry?.inquiryType === currentFilters?.inquiryType);
    }
    if (currentFilters?.property) {
      filtered = filtered?.filter(inquiry => 
        inquiry?.property?.title?.toLowerCase()?.includes(currentFilters?.property?.toLowerCase())
      );
    }
    if (currentFilters?.tenant) {
      filtered = filtered?.filter(inquiry => 
        inquiry?.tenant?.name?.toLowerCase()?.includes(currentFilters?.tenant?.toLowerCase())
      );
    }

    // Apply sorting
    switch (currentSort) {
      case 'oldest':
        filtered?.sort((a, b) => new Date(a?.timestamp) - new Date(b?.timestamp));
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filtered?.sort((a, b) => priorityOrder?.[b?.priority] - priorityOrder?.[a?.priority]);
        break;
      case 'property':
        filtered?.sort((a, b) => a?.property?.title?.localeCompare(b?.property?.title));
        break;
      case 'tenant':
        filtered?.sort((a, b) => a?.tenant?.name?.localeCompare(b?.tenant?.name));
        break;
      default: // 'recent'
        filtered?.sort((a, b) => new Date(b?.timestamp) - new Date(a?.timestamp));
    }

    setFilteredInquiries(filtered);
  };

  const handleInquirySelect = (inquiryId, isSelected) => {
    if (isSelected) {
      setSelectedInquiries([...selectedInquiries, inquiryId]);
    } else {
      setSelectedInquiries(selectedInquiries?.filter(id => id !== inquiryId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedInquiries(filteredInquiries?.map(i => i?.id));
    } else {
      setSelectedInquiries([]);
    }
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, 'for inquiries:', selectedInquiries);
    setSelectedInquiries([]);
  };

  const handleInquiryAction = (inquiry, action) => {
    console.log('Inquiry action:', action, 'for inquiry:', inquiry?.id);
    if (action === 'view') {
      setSelectedInquiry(inquiry);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <RoleBasedNavBar userRole="landlord" isAuthenticated={true} />
      {/* Main Content */}
      <div className="pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inquiry Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage tenant inquiries and communication
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="default"
                onClick={() => navigate('/messages')}
                iconName="MessageSquare"
                iconPosition="left"
              >
                View All Messages
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          <BreadcrumbTrail 
            userRole="landlord" 
            currentPage="Inquiry Management"
            customBreadcrumbs={[
              { label: 'Dashboard', href: '/landlord-dashboard' },
              { label: 'Inquiry Management', href: '/inquiry-management', current: true }
            ]}
          />

          {/* Inquiry Statistics */}
          <InquiryStats stats={inquiryStats} />

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  iconName="Grid3X3"
                  iconSize={16}
                />
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  iconName="List"
                  iconSize={16}
                />
              </div>
              
              {selectedInquiries?.length > 0 && (
                <BulkInquiryActions
                  selectedCount={selectedInquiries?.length}
                  onBulkAction={handleBulkAction}
                />
              )}
            </div>

            <InquiryFilters
              onFilterChange={setCurrentFilters}
              onSortChange={setCurrentSort}
              totalInquiries={filteredInquiries?.length}
            />
          </div>

          {/* Inquiries Content */}
          {filteredInquiries?.length > 0 ? (
            <>
              {/* Select All Checkbox */}
              <div className="flex items-center justify-between mb-4 p-4 bg-card border border-border rounded-lg">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedInquiries?.length === filteredInquiries?.length}
                    onChange={(e) => handleSelectAll(e?.target?.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-foreground">
                    Select all {filteredInquiries?.length} inquiries
                  </span>
                </label>
                <span className="text-sm text-muted-foreground">
                  {selectedInquiries?.length} selected
                </span>
              </div>

              {/* Inquiries Grid */}
              <div className={`${
                viewMode === 'cards' ?'grid grid-cols-1 lg:grid-cols-2 gap-6' :'space-y-4'
              }`}>
                {filteredInquiries?.map((inquiry) => (
                  <InquiryCard
                    key={inquiry?.id}
                    inquiry={inquiry}
                    isSelected={selectedInquiries?.includes(inquiry?.id)}
                    onSelect={(isSelected) => handleInquirySelect(inquiry?.id, isSelected)}
                    onAction={handleInquiryAction}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">📬</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Inquiries Found</h3>
              <p className="text-muted-foreground mb-6">
                No inquiries match your current filters. Try adjusting your search criteria.
              </p>
              <Button
                variant="ghost"
                onClick={() => setCurrentFilters({})}
                iconName="RotateCcw"
                iconPosition="left"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onAction={handleInquiryAction}
        />
      )}
      {/* Mobile App Footer */}
      <MobileAppFooter userRole="landlord" showOnDesktop />
    </div>
  );
};

export default InquiryManagement;
