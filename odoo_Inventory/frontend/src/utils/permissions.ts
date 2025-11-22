// Role-based permission utility

export type UserRole = 'ADMIN' | 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
}

// Permission rules for each role
export const PERMISSIONS = {
  // Dashboard - All can view
  VIEW_DASHBOARD: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],

  // Products
  VIEW_PRODUCTS: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  CREATE_PRODUCT: ['ADMIN', 'INVENTORY_MANAGER'],
  EDIT_PRODUCT: ['ADMIN', 'INVENTORY_MANAGER'],
  DELETE_PRODUCT: ['ADMIN'],

  // Categories
  VIEW_CATEGORIES: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  CREATE_CATEGORY: ['ADMIN', 'INVENTORY_MANAGER'],
  EDIT_CATEGORY: ['ADMIN', 'INVENTORY_MANAGER'],
  DELETE_CATEGORY: ['ADMIN'],

  // UOMs
  VIEW_UOMS: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  CREATE_UOM: ['ADMIN', 'INVENTORY_MANAGER'],
  EDIT_UOM: ['ADMIN', 'INVENTORY_MANAGER'],
  DELETE_UOM: ['ADMIN'],

  // Warehouses & Locations
  VIEW_WAREHOUSES: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  CREATE_WAREHOUSE: ['ADMIN', 'INVENTORY_MANAGER'],
  EDIT_WAREHOUSE: ['ADMIN', 'INVENTORY_MANAGER'],
  DELETE_WAREHOUSE: ['ADMIN'],
  CREATE_LOCATION: ['ADMIN', 'INVENTORY_MANAGER'],
  EDIT_LOCATION: ['ADMIN', 'INVENTORY_MANAGER'],
  DELETE_LOCATION: ['ADMIN'],

  // Receipts
  VIEW_RECEIPTS: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  CREATE_RECEIPT: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  EDIT_RECEIPT: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  DELETE_RECEIPT: ['ADMIN', 'INVENTORY_MANAGER'],
  VALIDATE_RECEIPT: ['ADMIN', 'INVENTORY_MANAGER'],

  // Deliveries
  VIEW_DELIVERIES: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  CREATE_DELIVERY: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  EDIT_DELIVERY: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  DELETE_DELIVERY: ['ADMIN', 'INVENTORY_MANAGER'],
  VALIDATE_DELIVERY: ['ADMIN', 'INVENTORY_MANAGER'],

  // Transfers
  VIEW_TRANSFERS: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  CREATE_TRANSFER: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  EDIT_TRANSFER: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  DELETE_TRANSFER: ['ADMIN', 'INVENTORY_MANAGER'],
  VALIDATE_TRANSFER: ['ADMIN', 'INVENTORY_MANAGER'],

  // Adjustments
  VIEW_ADJUSTMENTS: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  CREATE_ADJUSTMENT: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  EDIT_ADJUSTMENT: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  DELETE_ADJUSTMENT: ['ADMIN', 'INVENTORY_MANAGER'],
  VALIDATE_ADJUSTMENT: ['ADMIN', 'INVENTORY_MANAGER'],

  // Move History
  VIEW_MOVE_HISTORY: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],

  // Users (Admin only)
  VIEW_USERS: ['ADMIN'],
  CREATE_USER: ['ADMIN'],
  EDIT_USER: ['ADMIN'],
  DELETE_USER: ['ADMIN'],
  RESET_PASSWORD: ['ADMIN'],

  // Settings
  VIEW_SETTINGS: ['ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'],
  EDIT_SETTINGS: ['ADMIN'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (userRole: UserRole | undefined, permission: Permission): boolean => {
  if (!userRole) return false;
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(userRole);
};

/**
 * Check if user has any of the given permissions
 */
export const hasAnyPermission = (userRole: UserRole | undefined, permissions: Permission[]): boolean => {
  if (!userRole) return false;
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Check if user has all of the given permissions
 */
export const hasAllPermissions = (userRole: UserRole | undefined, permissions: Permission[]): boolean => {
  if (!userRole) return false;
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

/**
 * Get current user role
 */
export const getCurrentUserRole = (): UserRole | undefined => {
  const user = getCurrentUser();
  return user?.role;
};

/**
 * Check if current user has permission
 */
export const canAccess = (permission: Permission): boolean => {
  const role = getCurrentUserRole();
  return hasPermission(role, permission);
};

/**
 * Role display helpers
 */
export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Admin',
    INVENTORY_MANAGER: 'Inventory Manager',
    WAREHOUSE_STAFF: 'Warehouse Staff',
  };
  return labels[role] || role;
};

export const getRoleBadgeColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    INVENTORY_MANAGER: 'bg-blue-100 text-blue-800',
    WAREHOUSE_STAFF: 'bg-green-100 text-green-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};
