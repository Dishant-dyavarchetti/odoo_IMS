import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    Package,
    TrendingUp,
    TrendingDown,
    User,
    Menu,
    Search,
    Bell,
    LogOut,
    LayoutGrid,
    Archive,
} from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
        { icon: Archive, label: "In Stock", path: "/stock" },
        { icon: Package, label: "Products", path: "/products" },
        { icon: TrendingUp, label: "Sales", path: "/sales" },
        { icon: TrendingDown, label: "Orders", path: "/orders" },
        { icon: User, label: "Users", path: "/users" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* SIDEBAR */}
            <aside
                className={`h-screen bg-[#1e293b] text-white transition-all duration-300 
                ${sidebarOpen ? 'w-64' : 'w-20'}`}
            >
                <div className="p-4 flex items-center justify-center h-16 border-b border-gray-700">
                    {sidebarOpen ? (
                        <h2 className="text-xl font-bold">Inventory</h2>
                    ) : (
                        <Package className="w-8 h-8" />
                    )}
                </div>

                <nav className="mt-8 space-y-2 px-3">
                    {menuItems.map((item, i) => {
                        const active = location.pathname === item.path;
                        return (
                            <button
                                key={i}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition 
                                    ${active ? "bg-gray-700" : "hover:bg-gray-700"}`}
                            >
                                <item.icon className="w-5 h-5" />
                                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 w-full transition-all duration-300">

                {/* HEADER */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <span className="text-gray-500 text-sm capitalize">
                            {location.pathname.split("/")[1] || "Dashboard"}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search..."
                                className="pl-10 bg-white border-gray-300 focus:ring-blue-500"
                            />
                        </div>

                        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="flex items-center gap-2">
                            <img
                                className="w-8 h-8 rounded-full"
                                src="https://ui-avatars.com/api/?name=Ann+Lee&background=6366f1&color=fff"
                                alt="User"
                            />
                            <span className="text-sm font-medium">Ann Lee</span>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
