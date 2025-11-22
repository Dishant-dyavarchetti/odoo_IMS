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
  ChevronDown,
  ChevronRight,
  Circle,
  Boxes,
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
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar - Enhanced Modern Design */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl`}
      >
        <div className="flex h-full flex-col">
          {/* Logo - Enhanced */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg">
                <Boxes className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  StockMaster
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">Inventory System</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-700/50 p-1.5 rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation - Enhanced */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {navigation.map((item) => {
              if (item.children) {
                const isExpanded = expandedMenu === item.name;
                const hasActiveChild = item.children.some((child: any) => location.pathname === child.href);
                
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => setExpandedMenu(isExpanded ? null : item.name)}
                      className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        hasActiveChild || isExpanded
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-lg transition-all ${
                          hasActiveChild || isExpanded
                            ? 'bg-white/20'
                            : 'bg-slate-700/50 group-hover:bg-slate-700'
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span>{item.name}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="ml-4 pl-3 border-l-2 border-slate-700/50 space-y-1 animate-in slide-in-from-top-2">
                        {item.children.filter((child: any) => canAccess(child.permission)).map((child: any) => {
                          const isActive = location.pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`group flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                isActive
                                  ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 font-medium border-l-2 border-blue-400'
                                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                              }`}
                            >
                              <Circle className={`h-2 w-2 ${isActive ? 'fill-blue-400' : 'fill-slate-600 group-hover:fill-slate-400'}`} />
                              <child.icon className="h-4 w-4" />
                              <span>{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-slate-700/50 group-hover:bg-slate-700'
                  }`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info - Enhanced */}
          <div className="border-t border-slate-700/50 p-3 bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                <p className="text-xs text-slate-400 font-medium">{user.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 shadow-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - Enhanced */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 lg:ml-0">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Inventory Management System
              </h2>
            </div>
            {/* Optional: Add search or user profile here */}
          </div>
        </header>

        {/* Page content - Enhanced */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile - Enhanced */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
