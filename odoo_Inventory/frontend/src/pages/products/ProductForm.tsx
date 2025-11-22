import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

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
    Save,
} from "lucide-react";


// ----------------------------
// MAIN COMPONENT
// ----------------------------
const ProductForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const isEditMode = !!id;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
        { label: "In Stock", path: "/stock", icon: Archive },
        { label: "Products", path: "/products", icon: Package },
        { label: "Sales", path: "/sales", icon: TrendingUp },
        { label: "Orders", path: "/orders", icon: TrendingDown },
        { label: "Users", path: "/users", icon: User },
    ];

    const [formData, setFormData] = useState({
        sku: isEditMode ? "INV-001" : "",
        name: isEditMode ? "Inverter" : "",
        category: isEditMode ? "electronics" : "",
        uom: isEditMode ? "unit" : "",
        reorderLevel: isEditMode ? "20" : "",
        minStock: isEditMode ? "10" : "",
        maxStock: isEditMode ? "200" : "",
        unitPrice: isEditMode ? "5000" : "",
        description: isEditMode ? "High quality inverter" : "",
        manufacturer: isEditMode ? "XYZ Corp" : "",
        barcode: isEditMode ? "123456789" : "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("FORM SUBMITTED", formData);
        navigate("/products");
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
                    {menuItems.map((item, i) => {
                        const active = location.pathname.startsWith(item.path);
                        const Icon = item.icon;

                        return (
                            <button
                                key={i}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition 
                                ${active ? "bg-gray-700" : "hover:bg-gray-700"}`}
                            >
                                <Icon className="w-5 h-5" />
                                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
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

                        <span className="text-gray-500 text-sm capitalize">
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
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="flex items-center gap-2">
                            <img
                                className="w-8 h-8 rounded-full"
                                src="https://ui-avatars.com/api/?name=Ann+Lee&background=6366f1&color=fff"
                            />
                            <span className="text-sm font-medium">Ann Lee</span>
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

                    {/* Header Section */}
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/products")}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Products
                    </Button>

                    <h1 className="text-3xl font-bold">
                        {isEditMode ? "Edit Product" : "Create New Product"}
                    </h1>
                    <p className="text-gray-500 mt-1 mb-6">
                        {isEditMode
                            ? "Update product details and inventory settings"
                            : "Add a new product to your inventory"}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* LEFT SIDE FORM */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* BASIC INFORMATION */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>SKU *</Label>
                                                <Input
                                                    value={formData.sku}
                                                    onChange={(e) => handleInputChange("sku", e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Barcode</Label>
                                                <Input
                                                    value={formData.barcode}
                                                    onChange={(e) => handleInputChange("barcode", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Product Name *</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <textarea
                                                className="w-full min-h-24 p-3 border rounded-md"
                                                value={formData.description}
                                                onChange={(e) => handleInputChange("description", e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Category *</Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(value) => handleInputChange("category", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="electronics">Electronics</SelectItem>
                                                        <SelectItem value="machinery">Machinery</SelectItem>
                                                        <SelectItem value="tools">Tools</SelectItem>
                                                        <SelectItem value="accessories">Accessories</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Manufacturer</Label>
                                                <Input
                                                    value={formData.manufacturer}
                                                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>


                                {/* INVENTORY SETTINGS */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Inventory Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">

                                        <div className="grid grid-cols-2 gap-4">

                                            <div className="space-y-2">
                                                <Label>Unit of Measure *</Label>
                                                <Select
                                                    value={formData.uom}
                                                    onValueChange={(value) => handleInputChange("uom", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select UOM" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unit">Unit</SelectItem>
                                                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                                                        <SelectItem value="ltr">Liter (ltr)</SelectItem>
                                                        <SelectItem value="box">Box</SelectItem>
                                                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Unit Price *</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.unitPrice}
                                                    onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                                                    required
                                                />
                                            </div>

                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Min Stock</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.minStock}
                                                    onChange={(e) => handleInputChange("minStock", e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Reorder Level *</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.reorderLevel}
                                                    onChange={(e) => handleInputChange("reorderLevel", e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Max Stock</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.maxStock}
                                                    onChange={(e) => handleInputChange("maxStock", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
                                            <b>Reordering Rules:</b> System alerts when stock falls minimum levels.
                                        </div>

                                    </CardContent>
                                </Card>

                            </div>


                            {/* RIGHT PANEL / ACTIONS */}
                            <div className="space-y-6">

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                            <Save className="w-4 h-4 mr-2" />
                                            {isEditMode ? "Update Product" : "Create Product"}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => navigate("/products")}
                                        >
                                            Cancel
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Product Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Label>Status</Label>
                                        <Select defaultValue="active">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="discontinued">Discontinued</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </CardContent>
                                </Card>

                                {isEditMode && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Quick Info</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Created:</span>
                                                <span>Nov 15, 2024</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Last Updated:</span>
                                                <span>Nov 20, 2024</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Total Sales:</span>
                                                <span>245 units</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                            </div>

                        </div>
                    </form>

                </main>

            </div>

        </div>
    );
};


export default ProductForm;
