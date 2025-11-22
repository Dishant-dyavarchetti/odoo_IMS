import type { ReactNode } from 'react';
import type { Permission } from '@/utils/permissions';
import { canAccess } from '@/utils/permissions';

interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that renders children only if user has the required permission
 */
export const PermissionGuard = ({ permission, children, fallback = null }: PermissionGuardProps) => {
  if (!canAccess(permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

interface MultiPermissionGuardProps {
  permissions: Permission[];
  requireAll?: boolean; // If true, requires all permissions. If false, requires at least one
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that renders children based on multiple permissions
 */
export const MultiPermissionGuard = ({ 
  permissions, 
  requireAll = false, 
  children, 
  fallback = null 
}: MultiPermissionGuardProps) => {
  const hasAccess = requireAll
    ? permissions.every(p => canAccess(p))
    : permissions.some(p => canAccess(p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};
