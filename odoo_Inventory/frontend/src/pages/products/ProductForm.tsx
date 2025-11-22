import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const ProductForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        sku: isEditMode ? 'INV-001' : '',
        name: isEditMode ? 'Inverter' : '',
        category: isEditMode ? 'electronics' : '',
        uom: isEditMode ? 'unit' : '',
        reorderLevel: isEditMode ? '20' : '',
        minStock: isEditMode ? '10' : '',
        maxStock: isEditMode ? '200' : '',
        unitPrice: isEditMode ? '5000' : '',
        description: isEditMode ? 'High quality inverter' : '',
        manufacturer: isEditMode ? 'XYZ Corp' : '',
        barcode: isEditMode ? '123456789' : '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add your API call here
        navigate('/products');
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/products')}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Products
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Product' : 'Create New Product'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditMode
                            ? 'Update product details and inventory settings'
                            : 'Add a new product to your inventory'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sku">SKU *</Label>
                                            <Input
                                                id="sku"
                                                placeholder="e.g., INV-001"
                                                value={formData.sku}
                                                onChange={(e) => handleInputChange('sku', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="barcode">Barcode</Label>
                                            <Input
                                                id="barcode"
                                                placeholder="e.g., 123456789"
                                                value={formData.barcode}
                                                onChange={(e) => handleInputChange('barcode', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">Product Name *</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g., Inverter"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            placeholder="Product description..."
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(value) => handleInputChange('category', value)}
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
                                            <Label htmlFor="manufacturer">Manufacturer</Label>
                                            <Input
                                                id="manufacturer"
                                                placeholder="e.g., XYZ Corp"
                                                value={formData.manufacturer}
                                                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Inventory Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="uom">Unit of Measure *</Label>
                                            <Select
                                                value={formData.uom}
                                                onValueChange={(value) => handleInputChange('uom', value)}
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
                                            <Label htmlFor="unitPrice">Unit Price *</Label>
                                            <Input
                                                id="unitPrice"
                                                type="number"
                                                placeholder="0.00"
                                                value={formData.unitPrice}
                                                onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="minStock">Min Stock Level</Label>
                                            <Input
                                                id="minStock"
                                                type="number"
                                                placeholder="0"
                                                value={formData.minStock}
                                                onChange={(e) => handleInputChange('minStock', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reorderLevel">Reorder Level *</Label>
                                            <Input
                                                id="reorderLevel"
                                                type="number"
                                                placeholder="0"
                                                value={formData.reorderLevel}
                                                onChange={(e) => handleInputChange('reorderLevel', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="maxStock">Max Stock Level</Label>
                                            <Input
                                                id="maxStock"
                                                type="number"
                                                placeholder="0"
                                                value={formData.maxStock}
                                                onChange={(e) => handleInputChange('maxStock', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>Reordering Rules:</strong> The system will alert you when stock
                                            falls below the reorder level. Min and max stock levels help maintain
                                            optimal inventory.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                        <Save className="w-4 h-4 mr-2" />
                                        {isEditMode ? 'Update Product' : 'Create Product'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate('/products')}
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
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
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
                                    </div>
                                </CardContent>
                            </Card>

                            {isEditMode && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Created:</span>
                                            <span className="font-medium">Nov 15, 2024</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Updated:</span>
                                            <span className="font-medium">Nov 20, 2024</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Sales:</span>
                                            <span className="font-medium">245 units</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default ProductForm;