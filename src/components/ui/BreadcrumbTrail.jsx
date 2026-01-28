import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbTrail = ({ customBreadcrumbs = null, userRole = 'tenant' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route mapping for breadcrumb generation
  const routeMap = {
    '/': { label: 'Home', icon: 'Home' },
    '/login': { label: 'Sign In', icon: 'LogIn' },
    '/register': { label: 'Register', icon: 'UserPlus' },
    '/landlord-dashboard': { label: 'Dashboard', icon: 'Home' },
    '/tenant-dashboard': { label: 'Dashboard', icon: 'Home' },
    '/property-search': { label: 'Search Properties', icon: 'Search' },
    '/property-details': { label: 'Property Details', icon: 'Building' },
    '/properties': { label: 'My Properties', icon: 'Building' },
    '/messages': { label: 'Messages', icon: 'MessageSquare' },
    '/favorites': { label: 'Favorites', icon: 'Heart' },
    '/account-profile': { label: 'Profile', icon: 'User' },
    '/social-profile': { label: 'Social Profile', icon: 'User' },
    '/settings': { label: 'Settings', icon: 'Settings' },
    '/account-notifications': { label: 'Notifications', icon: 'Bell' },
    '/social-notifications': { label: 'Notifications', icon: 'Bell' },
    '/help': { label: 'Help', icon: 'HelpCircle' },
    '/support': { label: 'Support', icon: 'LifeBuoy' },
    '/analytics': { label: 'Analytics', icon: 'BarChart3' },
    '/billing': { label: 'Billing', icon: 'CreditCard' },
    '/applications': { label: 'Applications', icon: 'FileText' },
    '/payments': { label: 'Payments', icon: 'CreditCard' },
    '/feed': { label: 'Community Feed', icon: 'Share2' },
    '/explore': { label: 'Explore', icon: 'Compass' },
    '/create-post': { label: 'Create Post', icon: 'Plus' }
  };

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const pathSegments = location?.pathname?.split('/')?.filter(segment => segment !== '');
    const breadcrumbs = [];

    // Add home/dashboard as root
    const dashboardPath = userRole === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard';
    const dashboardLabel = userRole === 'landlord' ? 'Landlord Dashboard' : 'Tenant Dashboard';
    
    if (location?.pathname !== dashboardPath && location?.pathname !== '/login' && location?.pathname !== '/register') {
      breadcrumbs?.push({
        label: dashboardLabel,
        path: dashboardPath,
        icon: 'Home'
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments?.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const routeInfo = routeMap?.[currentPath];
      
      if (routeInfo) {
        breadcrumbs?.push({
          label: routeInfo?.label,
          path: currentPath,
          icon: routeInfo?.icon,
          isLast: index === pathSegments?.length - 1
        });
      } else {
        // Handle dynamic routes or unknown paths
        const formattedLabel = segment?.split('-')?.map(word => word?.charAt(0)?.toUpperCase() + word?.slice(1))?.join(' ');
        
        breadcrumbs?.push({
          label: formattedLabel,
          path: currentPath,
          icon: 'ChevronRight',
          isLast: index === pathSegments?.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on auth pages or if only one item
  if (location?.pathname === '/login' || 
      location?.pathname === '/register' || 
      breadcrumbs?.length <= 1) {
    return null;
  }

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs?.map((breadcrumb, index) => (
          <li key={`${breadcrumb?.path || breadcrumb?.label}-${index}`} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={16} 
                className="mx-2 text-muted-foreground/60" 
              />
            )}
            
            {breadcrumb?.isLast ? (
              <span className="flex items-center space-x-1 text-foreground font-medium">
                <Icon name={breadcrumb?.icon} size={16} />
                <span className="hidden sm:inline">{breadcrumb?.label}</span>
                <span className="sm:hidden truncate max-w-32">{breadcrumb?.label}</span>
              </span>
            ) : (
              <button
                onClick={() => handleBreadcrumbClick(breadcrumb?.path)}
                className="flex items-center space-x-1 hover:text-foreground transition-colors rounded px-1 py-0.5 hover:bg-muted"
              >
                <Icon name={breadcrumb?.icon} size={16} />
                <span className="hidden sm:inline">{breadcrumb?.label}</span>
                <span className="sm:hidden truncate max-w-24">{breadcrumb?.label}</span>
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbTrail;
