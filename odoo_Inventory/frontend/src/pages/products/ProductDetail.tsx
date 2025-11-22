import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Package,
    TrendingUp,
    MapPin,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

// Mock data
const productData = {
    id: '1',
    sku: 'INV-001',
    name: 'Inverter',
    description: 'High quality inverter for residential and commercial use',
    category: 'Electronics',
    manufacturer: 'XYZ Corp',
    barcode: '123456789',
    uom: 'Unit',
    unitPrice: 5000,
    reorderLevel: 20,
    minStock: 10,
    maxStock: 200,
    totalStock: 80,
    status: 'Active',
    createdAt: 'Nov 15, 2024',
    updatedAt: 'Nov 20, 2024',
};

const stockByLocation = [
    { location: 'Warehouse A - Zone 1', quantity: 45, status: 'Available' },
    { location: 'Warehouse A - Zone 2', quantity: 20, status: 'Available' },
    { location: 'Warehouse B - Zone 1', quantity: 15, status: 'Reserved' },
    { location: 'Store Location', quantity: 0, status: 'Out of Stock' },
];

const stockMovements = [
    {
        id: 'MOV001',
        date: '2024-11-22',
        type: 'Receipt',
        quantity: 50,
        location: 'Warehouse A',
        reference: 'PO-12345',
    },
    {
        id: 'MOV002',
        date: '2024-11-21',
        type: 'Delivery',
        quantity: -30,
        location: 'Warehouse A',
        reference: 'SO-67890',
    },
    {
        id: 'MOV003',
        date: '2024-11-20',
        type: 'Internal Transfer',
        quantity: 15,
        location: 'Warehouse B',
        reference: 'IT-45678',
    },
    {
        id: 'MOV004',
        date: '2024-11-19',
        type: 'Adjustment',
        quantity: -5,
        location: 'Warehouse A',
        reference: 'ADJ-11111',
    },
    {
        id: 'MOV005',
        date: '2024-11-18',
        type: 'Receipt',
        quantity: 100,
        location: 'Warehouse A',
        reference: 'PO-12340',
    },
];

const ProductDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const getMovementColor = (type: string) => {
        switch (type) {
            case 'Receipt':
                return 'text-green-600';
            case 'Delivery':
                return 'text-red-600';
            case 'Internal Transfer':
                return 'text-blue-600';
            case 'Adjustment':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    const getLocationStatusColor = (status: string) => {
        switch (status) {
            case 'Available':
                return 'bg-green-500';
            case 'Reserved':
                return 'bg-yellow-500';
            case 'Out of Stock':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/products')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Products
                    </Button>

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{productData.name}</h1>
                                <Badge className="bg-green-500">Active</Badge>
                            </div>
                            <p className="text-gray-500">SKU: {productData.sku}</p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => navigate(`/products/${id}/edit`)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Product
                            </Button>
                            <Button variant="outline" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Product Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Product Name</p>
                                        <p className="font-medium">{productData.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">SKU</p>
                                        <p className="font-medium">{productData.sku}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Category</p>
                                        <p className="font-medium">{productData.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Manufacturer</p>
                                        <p className="font-medium">{productData.manufacturer}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Barcode</p>
                                        <p className="font-medium">{productData.barcode}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Unit of Measure</p>
                                        <p className="font-medium">{productData.uom}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500 mb-1">Description</p>
                                        <p className="font-medium">{productData.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock by Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Stock by Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                    Location
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                    Quantity
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {stockByLocation.map((location, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {location.location}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                                        {location.quantity}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge className={getLocationStatusColor(location.status)}>
                                                            {location.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock Movement History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Stock Movement History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                    Type
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                    Quantity
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                    Location
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                    Reference
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {stockMovements.map((movement) => (
                                                <tr key={movement.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {movement.date}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={getMovementColor(movement.type)}>
                                                            {movement.type}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`px-4 py-3 text-sm font-semibold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                                            }`}
                                                    >
                                                        {movement.quantity > 0 ? '+' : ''}
                                                        {movement.quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {movement.location}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {movement.reference}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stock Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Stock Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Package className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Total Stock</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {productData.totalStock}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Unit Price</span>
                                        <span className="font-semibold">₹{productData.unitPrice}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Reorder Level</span>
                                        <span className="font-semibold">{productData.reorderLevel}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Min Stock</span>
                                        <span className="font-semibold">{productData.minStock}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Max Stock</span>
                                        <span className="font-semibold">{productData.maxStock}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Stock Value</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            ₹{(productData.totalStock * productData.unitPrice).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reordering Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Reordering Rules</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-green-900">Stock Level Good</p>
                                        <p className="text-xs text-green-700 mt-1">
                                            Current stock is above reorder level
                                        </p>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600">
                                    <p className="mb-1">
                                        <strong>Rule:</strong> Alert when stock falls below {productData.reorderLevel}{' '}
                                        units
                                    </p>
                                    <p>
                                        <strong>Suggested Reorder Quantity:</strong>{' '}
                                        {productData.maxStock - productData.totalStock} units
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-medium">{productData.createdAt}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="font-medium">{productData.updatedAt}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProductDetail;