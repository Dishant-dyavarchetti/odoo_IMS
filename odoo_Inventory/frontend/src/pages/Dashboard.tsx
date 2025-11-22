import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import {
    Package,
    TrendingUp,
    TrendingDown,
    Menu,
    Search,
    Bell,
    User,
    LogOut,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// -----------------------------------------------------------------------
// 📌 MOCK DATA
// -----------------------------------------------------------------------
const stockMovementData = [
    { name: "Jan", receipts: 4000, deliveries: 2400 },
    { name: "Feb", receipts: 3000, deliveries: 1398 },
    { name: "Mar", receipts: 2000, deliveries: 9800 },
    { name: "Apr", receipts: 2780, deliveries: 3908 },
    { name: "May", receipts: 1890, deliveries: 4800 },
    { name: "Jun", receipts: 2390, deliveries: 3800 },
];

const topProductsData = [
    { name: "Product A", value: 400, color: "#1e3a8a" },
    { name: "Product B", value: 300, color: "#3b82f6" },
    { name: "Product C", value: 200, color: "#60a5fa" },
    { name: "Product D", value: 100, color: "#93c5fd" },
];

const stockAlerts = [
    {
        id: "ORD001",
        date: "2024-11-20",
        product: "Product A",
        quantity: 5,
        alert: "Low Stock",
        status: "Warning",
    },
    {
        id: "ORD002",
        date: "2024-11-19",
        product: "Product B",
        quantity: 0,
        alert: "Out of Stock",
        status: "Critical",
    },
    {
        id: "ORD003",
        date: "2024-11-18",
        product: "Product C",
        quantity: 8,
        alert: "Low Stock",
        status: "Warning",
    },
    {
        id: "ORD004",
        date: "2024-11-17",
        product: "Product D",
        quantity: 3,
        alert: "Low Stock",
        status: "Warning",
    },
];

const recentMovements = [
    {
        id: "MOV001",
        product: "Product A",
        quantity: 50,
        type: "Receipt",
        date: "2024-11-22",
    },
    {
        id: "MOV002",
        product: "Product B",
        quantity: 30,
        type: "Delivery",
        date: "2024-11-22",
    },
    {
        id: "MOV003",
        product: "Product C",
        quantity: 25,
        type: "Internal",
        date: "2024-11-21",
    },
    {
        id: "MOV004",
        product: "Product D",
        quantity: 40,
        type: "Receipt",
        date: "2024-11-21",
    },
];

// -----------------------------------------------------------------------
// 🚀 DASHBOARD COMPONENT
// -----------------------------------------------------------------------
const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filterType, setFilterType] = useState("all");
    const [filterWarehouse, setFilterWarehouse] = useState("all");

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    return (
        <div className="min-h-screen w-screen bg-gray-100 text-gray-900 flex">

            {/* ------------------------------------------------------------------ */}
            {/* SIDEBAR */}
            {/* ------------------------------------------------------------------ */}
            <aside
                className={`fixed left-0 top-0 h-full bg-slate-800 text-white shadow-lg transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"
                    }`}
            >
                <div className="p-4 flex items-center justify-center h-16 border-b border-slate-700">
                    {sidebarOpen ? (
                        <h2 className="text-xl font-bold tracking-wide">Inventory</h2>
                    ) : (
                        <Package className="w-8 h-8 text-white" />
                    )}
                </div>

                <nav className="mt-6 space-y-1 px-3">
                    {[
                        { icon: Package, label: "Dashboard", path: "/dashboard" },
                        { icon: Package, label: "In Stock", path: "/stock" },
                        { icon: Package, label: "Products", path: "/products" }, // ✅ FIXED PATH
                        { icon: TrendingUp, label: "Operations", path: "/sales" },
                        // { icon: TrendingDown, label: "Orders", path: "/orders" },
                        { icon: User, label: "Settings", path: "/users" },
                    ].map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}   // ⭐ ENABLE REDIRECT
                            className={`w-full flex items-center gap-4 px-3 py-3 rounded-md transition 
                ${location.pathname.startsWith(item.path)
                                    ? "bg-blue-600 shadow text-white"
                                    : "hover:bg-slate-700/70"}`}
                        >
                            <item.icon className="w-5 h-5 text-white" />

                            {sidebarOpen && (
                                <span className="text-sm font-medium tracking-wide">
                                    {item.label}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

            </aside>

            {/* ------------------------------------------------------------------ */}
            {/* MAIN WRAPPER */}
            {/* ------------------------------------------------------------------ */}
            <div
                className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"
                    }`}
            >

                {/* ------------------------------------------------------------------ */}
                {/* HEADER */}
                {/* ------------------------------------------------------------------ */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-30 border-b border-gray-200">

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 bg-black rounded-lg hover:bg-white hover:text-black"
                        >
                            <Menu className="w-5 h-5 text-white hover:text-black" />
                        </button>

                        <span className="font-medium text-gray-800">Dashboard</span>
                    </div>

                    <div className="flex items-center gap-4">

                        {/* Search */}
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 bg-white border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="p-2 bg-black rounded-lg hover:bg-gray-200 relative">
                            <Bell className="w-5 h-5 text-white hover:text-black" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                        </button>

                        {/* User */}
                        <div className="flex items-center gap-2">
                            <img
                                src="https://ui-avatars.com/api/?name=Ann+Lee&background=6366f1&color=fff"
                                className="w-8 h-8 rounded-full border"
                            />
                            <span className="text-sm font-medium">Ann Lee</span>
                        </div>

                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-500 hover:bg-red-100"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </header>

                {/* ------------------------------------------------------------------ */}
                {/* MAIN CONTENT */}
                {/* ------------------------------------------------------------------ */}
                <main className="p-6">

                    {/* FILTERS */}
                    <div className="mb-6 flex items-center gap-4">

                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-52 bg-white text-white border border-gray-300 shadow-sm hover:bg-gray-100">
                                <SelectValue placeholder="Document Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border shadow-md">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="receipts">Receipts</SelectItem>
                                <SelectItem value="delivery">Delivery</SelectItem>
                                <SelectItem value="internal">Internal</SelectItem>
                                <SelectItem value="adjustments">Adjustments</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterWarehouse} onValueChange={setFilterWarehouse}>
                            <SelectTrigger className="w-52 bg-white text-white border border-gray-300 shadow-sm hover:bg-gray-100">
                                <SelectValue placeholder="Warehouse" />
                            </SelectTrigger>
                            <SelectContent className="w-43 bg-white border shadow-md">
                                <SelectItem value="all">All Warehouses</SelectItem>
                                <SelectItem value="wh1">Warehouse 1</SelectItem>
                                <SelectItem value="wh2">Warehouse 2</SelectItem>
                                <SelectItem value="wh3">Warehouse 3</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {["Revenue", "Sales Return", "Purchase", "Income"].map(
                            (label, idx) => (
                                <Card
                                    key={idx}
                                    className="bg-white shadow hover:shadow-lg transition border border-gray-200"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-gray-700">
                                                {label}
                                            </span>
                                            <TrendingUp className="w-5 h-5 text-green-600" />
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-gray-900">
                                                30,000
                                            </span>
                                            <span className="text-green-600 text-sm font-semibold">
                                                +12%
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        )}
                    </div>

                    {/* ------------------------------------------------------------------ */}
                    {/* CHART ROW */}
                    {/* ------------------------------------------------------------------ */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                        {/* STOCK MOVEMENT BAR CHART */}
                        <Card className="lg:col-span-2 bg-white shadow border border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    Stock Movement Overview
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={stockMovementData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="name" stroke="#374151" />
                                        <YAxis stroke="#374151" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="receipts" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="deliveries" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* PIE CHART */}
                        <Card className="bg-white shadow border border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    Top Selling Products
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie
                                            data={topProductsData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {topProductsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ------------------------------------------------------------------ */}
                    {/* TABLES */}
                    {/* ------------------------------------------------------------------ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* STOCK ALERT TABLE */}
                        <Card className="bg-white shadow border border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    Stock Alerts
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <div className="overflow-auto max-h-[350px]">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-300 bg-gray-50">
                                                <th className="py-3 px-2 text-left font-semibold">
                                                    Order ID
                                                </th>
                                                <th className="py-3 px-2 text-left font-semibold">
                                                    Date
                                                </th>
                                                <th className="py-3 px-2 text-left font-semibold">
                                                    Qty
                                                </th>
                                                <th className="py-3 px-2 text-left font-semibold">
                                                    Alert
                                                </th>
                                                <th className="py-3 px-2 text-left font-semibold">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {stockAlerts.map((alert) => (
                                                <tr
                                                    key={alert.id}
                                                    className="border-b border-gray-200 hover:bg-gray-100 transition"
                                                >
                                                    <td className="py-3 px-2">{alert.id}</td>
                                                    <td className="py-3 px-2">{alert.date}</td>
                                                    <td className="py-3 px-2">{alert.quantity}</td>
                                                    <td className="py-3 px-2">{alert.alert}</td>

                                                    <td className="py-3 px-2">
                                                        {alert.status === "Critical" && (
                                                            <Badge className="bg-red-600 text-white px-3 py-1">
                                                                Critical
                                                            </Badge>
                                                        )}

                                                        {alert.status === "Warning" && (
                                                            <Badge className="bg-yellow-400 text-black px-3 py-1">
                                                                Warning
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* RECENT MOVEMENTS TABLE */}
                        <Card className="bg-white shadow border border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    Recent Stock Movements
                                </CardTitle>
                            </CardHeader>

                            <CardContent>
                                <div className="overflow-auto max-h-[350px]">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-300 bg-gray-50">
                                                <th className="py-3 px-2 text-left font-semibold">
                                                    Movement ID
                                                </th>
                                                <th className="py-3 px-2 text-left font-semibold">
                                                    Product
                                                </th>
                                                <th className="py-3 px-2 text-left font-semibold">
                                                    Quantity
                                                </th>
                                                <th className="py-3 px-2 text-left font-semibold">
                                                    Type
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {recentMovements.map((movement) => (
                                                <tr
                                                    key={movement.id}
                                                    className="border-b border-gray-200 hover:bg-gray-100 transition"
                                                >
                                                    <td className="py-3 px-2">{movement.id}</td>
                                                    <td className="py-3 px-2">{movement.product}</td>
                                                    <td className="py-3 px-2">{movement.quantity}</td>
                                                    <td className="py-3 px-2">
                                                        <Badge className="bg-blue-100 text-blue-700 border border-blue-300 px-3">
                                                            {movement.type}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default Dashboard;
