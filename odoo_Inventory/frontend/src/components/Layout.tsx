import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  ClipboardList,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  FolderTree,
  Ruler,
  Database,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { authAPI } from '@/services/api';
import { canAccess } from '@/utils/permissions';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'ADMIN';

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'VIEW_DASHBOARD' as const },
    { name: 'Products', href: '/products', icon: Package, permission: 'VIEW_PRODUCTS' as const },
    { name: 'Warehouses', href: '/warehouses', icon: Warehouse, permission: 'VIEW_WAREHOUSES' as const },
    {
      name: 'Master Data',
      icon: Database,
      permission: 'VIEW_CATEGORIES' as const,
      children: [
        { name: 'Categories', href: '/categories', icon: FolderTree, permission: 'VIEW_CATEGORIES' as const },
        { name: 'UOMs', href: '/uoms', icon: Ruler, permission: 'VIEW_UOMS' as const },
      ],
    },
    {
      name: 'Operations',
      icon: ClipboardList,
      permission: 'VIEW_RECEIPTS' as const,
      children: [
        { name: 'Receipts', href: '/receipts', icon: ArrowDownToLine, permission: 'VIEW_RECEIPTS' as const },
        { name: 'Deliveries', href: '/deliveries', icon: ArrowUpFromLine, permission: 'VIEW_DELIVERIES' as const },
        { name: 'Transfers', href: '/transfers', icon: ArrowRightLeft, permission: 'VIEW_TRANSFERS' as const },
        { name: 'Adjustments', href: '/adjustments', icon: ClipboardList, permission: 'VIEW_ADJUSTMENTS' as const },
      ],
    },
    { name: 'Move History', href: '/move-history', icon: History, permission: 'VIEW_MOVE_HISTORY' as const },
    ...(isAdmin ? [{ name: 'Users', href: '/users', icon: Users, permission: 'VIEW_USERS' as const }] : []),
    { name: 'Settings', href: '/settings', icon: Settings, permission: 'VIEW_SETTINGS' as const },
  ].filter(item => canAccess(item.permission));

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
            <h1 className="text-xl font-bold">StockMaster</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            {navigation.map((item) => {
              if (item.children) {
                const isExpanded = expandedMenu === item.name;
                return (
                  <div key={item.name}>
                    <button
                      onClick={() =>
                        setExpandedMenu(isExpanded ? null : item.name)
                      }
                      className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-white mb-1"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 space-y-1">
                        {item.children.filter((child: any) => canAccess(child.permission)).map((child: any) => (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={`flex items-center px-3 py-2 text-sm rounded-md ${
                              location.pathname === child.href
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <child.icon className="mr-3 h-4 w-4" />
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                    location.pathname === item.href
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-gray-400">{user.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full text-gray-300 border-gray-700 hover:bg-gray-800"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 lg:ml-0">
              <h2 className="text-xl font-semibold text-gray-800">
                Inventory Management System
              </h2>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
