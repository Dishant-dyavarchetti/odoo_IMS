import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    ArrowLeft,
    Edit,
    Trash2,
    MapPin,
} from "lucide-react";


// MOCK PRODUCT DATA
const productData = {
    id: "1",
    sku: "INV-001",
    name: "Inverter",
    description: "High quality inverter for residential and commercial use",
    category: "Electronics",
    manufacturer: "XYZ Corp",
    barcode: "123456789",
    uom: "Unit",
    unitPrice: 5000,
    reorderLevel: 20,
    minStock: 10,
    maxStock: 200,
    totalStock: 80,
    status: "Active",
    createdAt: "Nov 15, 2024",
    updatedAt: "Nov 20, 2024",
};

const stockByLocation = [
    { location: "Warehouse A - Zone 1", quantity: 45, status: "Available" },
    { location: "Warehouse A - Zone 2", quantity: 20, status: "Available" },
    { location: "Warehouse B - Zone 1", quantity: 15, status: "Reserved" },
    { location: "Store Location", quantity: 0, status: "Out of Stock" },
];

const stockMovements = [
    {
        id: "MOV001",
        date: "2024-11-22",
        type: "Receipt",
        quantity: 50,
        location: "Warehouse A",
        reference: "PO-12345",
    },
    {
        id: "MOV002",
        date: "2024-11-21",
        type: "Delivery",
        quantity: -30,
        location: "Warehouse A",
        reference: "SO-67890",
    },
    {
        id: "MOV003",
        date: "2024-11-20",
        type: "Internal Transfer",
        quantity: 15,
        location: "Warehouse B",
        reference: "IT-45678",
    },
    {
        id: "MOV004",
        date: "2024-11-19",
        type: "Adjustment",
        quantity: -5,
        location: "Warehouse A",
        reference: "ADJ-11111",
    },
    {
        id: "MOV005",
        date: "2024-11-18",
        type: "Receipt",
        quantity: 100,
        location: "Warehouse A",
        reference: "PO-12340",
    },
];


// ----------------------------
// MAIN COMPONENT
// ----------------------------
const ProductDetail: React.FC = () => {

    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
        { label: "In Stock", path: "/stock", icon: Archive },
        { label: "Products", path: "/products", icon: Package },
        { label: "Sales", path: "/sales", icon: TrendingUp },
        { label: "Orders", path: "/orders", icon: TrendingDown },
        { label: "Users", path: "/users", icon: User },
    ];

    const getMovementColor = (type: string) => {
        switch (type) {
            case "Receipt": return "text-green-600";
            case "Delivery": return "text-red-600";
            case "Internal Transfer": return "text-blue-600";
            case "Adjustment": return "text-yellow-600";
            default: return "text-gray-600";
        }
    };

    const getLocationStatusColor = (status: string) => {
        switch (status) {
            case "Available": return "bg-green-500";
            case "Reserved": return "bg-yellow-500";
            case "Out of Stock": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* SIDEBAR */}
            <aside
                className={`h-screen bg-[#1e293b] text-white transition-all duration-300 
                ${sidebarOpen ? "w-64" : "w-20"}`}
            >
                <div className="p-4 flex items-center justify-center h-16 border-b border-gray-700">
                    {sidebarOpen ? (
                        <h2 className="text-xl font-bold">Inventory</h2>
                    ) : (
                        <Package className="w-8 h-8" />
                    )}
                </div>

                <nav className="mt-8 space-y-2 px-3">
                    {menuItems.map((item, index) => {
                        const active = location.pathname.startsWith(item.path);
                        const Icon = item.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition
                                ${active ? "bg-gray-700" : "hover:bg-gray-700"}`}
                            >
                                <Icon className="w-5 h-5" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>
            </aside>


            {/* MAIN CONTENT */}
            <div className="flex-1 w-full">

                {/* HEADER */}
                <header className="bg-white border-b h-16 px-6 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <span className="text-gray-500 capitalize">
                            {location.pathname.split("/")[1] || "Dashboard"}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input className="pl-10 bg-white border-gray-300" placeholder="Search..." />
                        </div>

                        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                            <Bell className="w-5 h-5" />
                            <span className="w-2 h-2 bg-red-500 absolute top-1 right-1 rounded-full"></span>
                        </button>

                        <div className="flex items-center gap-2">
                            <img
                                className="w-8 h-8 rounded-full"
                                src="https://ui-avatars.com/api/?name=Ann+Lee&background=6366f1&color=fff"
                            />
                            <span>Ann Lee</span>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </header>


                {/* PAGE CONTENT */}
                <main className="p-6">

                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/products")}
                        className="mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Products
                    </Button>

                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">{productData.name}</h1>
                            <p className="text-gray-500">SKU: {productData.sku}</p>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={() => navigate(`/products/${id}/edit`)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                            </Button>
                            <Button variant="outline" className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </Button>
                        </div>
                    </div>

                    {/* GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT SIDE CONTENT */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* PRODUCT INFO */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-sm text-gray-500">Product Name</p>
                                            <p>{productData.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">SKU</p>
                                            <p>{productData.sku}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Category</p>
                                            <p>{productData.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Manufacturer</p>
                                            <p>{productData.manufacturer}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Barcode</p>
                                            <p>{productData.barcode}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Unit of Measure</p>
                                            <p>{productData.uom}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-500">Description</p>
                                            <p>{productData.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>


                            {/* STOCK BY LOCATION */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        Stock by Location
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <table className="w-full text-left">
                                        <thead className="border-b bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2">Location</th>
                                                <th className="px-4 py-2">Quantity</th>
                                                <th className="px-4 py-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockByLocation.map((item, idx) => (
                                                <tr key={idx} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-3">{item.location}</td>
                                                    <td className="px-4 py-3 font-semibold">{item.quantity}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge className={getLocationStatusColor(item.status)}>
                                                            {item.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>


                            {/* STOCK MOVEMENT HISTORY */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Stock Movement History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <table className="w-full text-left">
                                        <thead className="border-b bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2">Date</th>
                                                <th className="px-4 py-2">Type</th>
                                                <th className="px-4 py-2">Quantity</th>
                                                <th className="px-4 py-2">Location</th>
                                                <th className="px-4 py-2">Reference</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockMovements.map((move) => (
                                                <tr key={move.id} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-3">{move.date}</td>
                                                    <td className={`px-4 py-3 ${getMovementColor(move.type)}`}>
                                                        {move.type}
                                                    </td>
                                                    <td
                                                        className={`px-4 py-3 font-semibold ${move.quantity > 0 ? "text-green-600" : "text-red-600"}`}
                                                    >
                                                        {move.quantity > 0 ? "+" : ""}{move.quantity}
                                                    </td>
                                                    <td className="px-4 py-3">{move.location}</td>
                                                    <td className="px-4 py-3">{move.reference}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>

                        </div>


                        {/* RIGHT SIDE SUMMARY */}
                        <div className="space-y-6">

                            {/* STOCK SUMMARY */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Stock Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">

                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                        <Package className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Total Stock</p>
                                            <p className="text-2xl font-bold">{productData.totalStock}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Unit Price</span>
                                            <span>₹{productData.unitPrice}</span>
                                        </div>

                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Reorder Level</span>
                                            <span>{productData.reorderLevel}</span>
                                        </div>

                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Min Stock</span>
                                            <span>{productData.minStock}</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Max Stock</span>
                                            <span>{productData.maxStock}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <div className="flex justify-between font-semibold text-blue-600">
                                            <span>Stock Value</span>
                                            <span>₹{(productData.totalStock * productData.unitPrice).toLocaleString()}</span>
                                        </div>
                                    </div>

                                </CardContent>
                            </Card>


                            {/* REORDERING RULES */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reordering Rules</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">

                                    <div className="p-3 bg-green-50 rounded-lg flex items-start gap-3">
                                        <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-green-900">Stock Level Good</p>
                                            <p className="text-xs text-green-700">
                                                Current stock is above reorder level
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <p>Rule: Alert when below {productData.reorderLevel} units</p>
                                        <p>Suggested Reorder: {productData.maxStock - productData.totalStock} units</p>
                                    </div>

                                </CardContent>
                            </Card>


                            {/* METADATA */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span>{productData.createdAt}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Updated:</span>
                                        <span>{productData.updatedAt}</span>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
};


export default ProductDetail;
