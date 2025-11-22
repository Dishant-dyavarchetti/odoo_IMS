import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Search,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Filter,
} from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";

// ----------------------------------------------------------------------
// MOCK DATA
// ----------------------------------------------------------------------
const productsData = [
    {
        id: "1",
        sku: "INV-001",
        name: "Inverter",
        category: "Electronics",
        uom: "Unit",
        availableStock: 80,
        reorderLevel: 20,
        status: "In Stock",
    },
    {
        id: "2",
        sku: "BAT-002",
        name: "Battery",
        category: "Electronics",
        uom: "Unit",
        availableStock: 15,
        reorderLevel: 20,
        status: "Low Stock",
    },
    {
        id: "3",
        sku: "GEN-003",
        name: "Generator",
        category: "Machinery",
        uom: "Unit",
        availableStock: 45,
        reorderLevel: 10,
        status: "In Stock",
    },
    {
        id: "4",
        sku: "CHG-004",
        name: "Charger",
        category: "Electronics",
        uom: "Unit",
        availableStock: 0,
        reorderLevel: 15,
        status: "Out of Stock",
    },
];

// ----------------------------------------------------------------------

const ProductsList: React.FC = () => {
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selected, setSelected] = useState<string[]>([]);

    const filteredProducts = productsData.filter((product) => {
        const searchMatch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());

        const statusMatch =
            statusFilter === "all" || product.status === statusFilter;

        const categoryMatch =
            categoryFilter === "all" || product.category === categoryFilter;

        return searchMatch && statusMatch && categoryMatch;
    });

    const handleSelectAll = (checked: boolean) => {
        checked
            ? setSelected(filteredProducts.map((p) => p.id))
            : setSelected([]);
    };

    const handleSelectSingle = (id: string, checked: boolean) => {
        checked
            ? setSelected((prev) => [...prev, id])
            : setSelected((prev) => prev.filter((x) => x !== id));
    };

    const statusColor = (status: string) => {
        if (status === "In Stock") return "bg-green-100 text-green-700";
        if (status === "Low Stock") return "bg-yellow-100 text-yellow-700";
        if (status === "Out of Stock") return "bg-red-100 text-red-700";
        return "bg-gray-200 text-gray-900";
    };

    return (
        <DashboardLayout>
            <div className="p-6  w-full mx-auto">

                {/* PAGE HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-500 mt-1">
                            Manage and monitor all your inventory items
                        </p>
                    </div>

                    <Button
                        onClick={() => navigate("/products/create")}
                        className="bg-blue-600 hover:bg-blue-700 shadow"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Product
                    </Button>
                </div>

                {/* FILTER CARD */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b p-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">

                            {/* SEARCH */}
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* FILTERS */}
                            <div className="flex items-center gap-3">

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="In Stock">In Stock</SelectItem>
                                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={categoryFilter}
                                    onValueChange={setCategoryFilter}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Electronics">Electronics</SelectItem>
                                        <SelectItem value="Machinery">Machinery</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button variant="outline" size="icon">
                                    <Filter className="w-4 h-4" />
                                </Button>
                            </div>

                        </div>
                    </CardHeader>

                    {/* TABLE */}
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3">
                                            <Checkbox
                                                checked={
                                                    selected.length > 0 &&
                                                    selected.length === filteredProducts.length
                                                }
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </th>

                                        {[
                                            "SKU",
                                            "Name",
                                            "Category",
                                            "UOM",
                                            "Available",
                                            "Reorder",
                                            "Status",
                                            "Actions",
                                        ].map((head) => (
                                            <th
                                                key={head}
                                                className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                                            >
                                                {head}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {filteredProducts.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => navigate(`/products/${p.id}`)}
                                        >
                                            <td
                                                className="px-6 py-3"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Checkbox
                                                    checked={selected.includes(p.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectSingle(p.id, checked as boolean)
                                                    }
                                                />
                                            </td>

                                            <td className="px-6 py-3 font-medium">{p.sku}</td>
                                            <td className="px-6 py-3">{p.name}</td>
                                            <td className="px-6 py-3">{p.category}</td>
                                            <td className="px-6 py-3">{p.uom}</td>
                                            <td className="px-6 py-3 font-semibold">
                                                {p.availableStock}
                                            </td>
                                            <td className="px-6 py-3">{p.reorderLevel}</td>

                                            <td className="px-6 py-3">
                                                <Badge className={`${statusColor(p.status)} px-3 py-1`}>
                                                    {p.status}
                                                </Badge>
                                            </td>

                                            <td
                                                className="px-6 py-3"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => navigate(`/products/${p.id}`)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => navigate(`/products/${p.id}/edit`)}
                                                        >
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem className="text-red-600">
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center text-gray-500 py-10">
                                No matching products found.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* BULK BAR */}
                {selected.length > 0 && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
                        <span>{selected.length} selected</span>
                        <Button size="sm" className="bg-white text-gray-900">
                            Bulk Update
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-white"
                            onClick={() => setSelected([])}
                        >
                            Clear
                        </Button>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default ProductsList;
