import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SearchSummaryPanel = () => {
  const navigate = useNavigate();
  // TODO: Replace with API call to fetch saved searches
  const [savedSearches, setSavedSearches] = useState([]);

  // TODO: Replace with API call to fetch recent search
  const [recentSearch, setRecentSearch] = useState(null);

  const handleReapplySearch = () => {
    const searchParams = new URLSearchParams({
      location: recentSearch.location,
      minPrice: recentSearch.priceRange.split('-')[0].replace('$', ''),
      maxPrice: recentSearch.priceRange.split('-')[1].replace('$', ''),
      bedrooms: recentSearch.bedrooms,
      propertyType: recentSearch.propertyType
    });
    navigate(`/property-search?${searchParams?.toString()}`);
  };

  const handleRunSavedSearch = (search) => {
    const searchParams = new URLSearchParams({
      location: search.criteria.location,
      minPrice: search.criteria.priceRange.split('-')[0].replace('$', ''),
      maxPrice: search.criteria.priceRange.split('-')[1].replace('$', ''),
      bedrooms: search.criteria.bedrooms,
      propertyType: search.criteria.propertyType
    });
    navigate(`/property-search?${searchParams?.toString()}`);
  };

  const handleToggleSearchStatus = (searchId) => {
    setSavedSearches(prev => 
      prev?.map(search => 
        search?.id === searchId 
          ? { ...search, isActive: !search?.isActive }
          : search
      )
    );
  };

  const handleDeleteSavedSearch = (searchId) => {
    setSavedSearches(prev => prev?.filter(search => search?.id !== searchId));
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Search Management</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/property-search')}
          iconName="Plus"
          iconPosition="left"
        >
          New Search
        </Button>
      </div>
      {/* Recent Search */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-foreground mb-3">Recent Search</h3>
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium text-foreground">{recentSearch?.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  <p className="font-medium text-foreground">{recentSearch?.priceRange}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bedrooms:</span>
                  <p className="font-medium text-foreground">{recentSearch?.bedrooms}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium text-foreground">{recentSearch?.propertyType}</p>
                </div>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleReapplySearch}
              iconName="Search"
              iconPosition="left"
            >
              Search Again
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Searched on {new Date(recentSearch.searchDate)?.toLocaleDateString()}
          </p>
        </div>
      </div>
      {/* Saved Searches */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-3">Saved Searches</h3>
        {savedSearches?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Search" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No saved searches yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedSearches?.map((search) => (
              <div key={search?.id} className="bg-background rounded-lg p-4 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-foreground">{search?.name}</h4>
                      <div className="flex items-center space-x-2">
                        {search?.isActive ? (
                          <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            Paused
                          </span>
                        )}
                        {search?.newMatches > 0 && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {search?.newMatches} new
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mb-2">
                      <span>{search?.criteria?.location}</span>
                      <span>{search?.criteria?.priceRange}</span>
                      <span>{search?.criteria?.bedrooms} bed</span>
                      <span>{search?.criteria?.propertyType}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {search?.resultsCount} results • Updated {new Date(search.lastUpdated)?.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRunSavedSearch(search)}
                      iconName="Play"
                      iconPosition="left"
                    >
                      Run
                    </Button>
                    <button
                      onClick={() => handleToggleSearchStatus(search?.id)}
                      className="p-2 hover:bg-muted rounded-md transition-colors"
                      title={search?.isActive ? "Pause search" : "Activate search"}
                    >
                      <Icon 
                        name={search?.isActive ? "Pause" : "Play"} 
                        size={16} 
                        className="text-muted-foreground" 
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteSavedSearch(search?.id)}
                      className="p-2 hover:bg-muted rounded-md transition-colors"
                      title="Delete search"
                    >
                      <Icon name="Trash2" size={16} className="text-error" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSummaryPanel;
