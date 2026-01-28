import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ children, variant = 'default', className, ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    agent: 'bg-purple-100 text-purple-800',
    customer: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={cn(
        'inline-block px-2.5 py-1 rounded-full font-medium text-xs',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

const RoleBadge = ({ role, className, ...props }) => {
  const roleConfig = {
    landlord: { label: 'Agent', variant: 'agent' },
    tenant: { label: 'Customer', variant: 'customer' },
  };

  const config = roleConfig[role] || { label: 'User', variant: 'default' };

  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  );
};

const StatusBadge = ({ status, className, ...props }) => {
  const statusConfig = {
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'danger' },
    pending: { label: 'Pending', variant: 'warning' },
    completed: { label: 'Completed', variant: 'success' },
  };

  const config = statusConfig[status] || { label: status, variant: 'default' };

  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  );
};

export default Badge;
export { RoleBadge, StatusBadge };
