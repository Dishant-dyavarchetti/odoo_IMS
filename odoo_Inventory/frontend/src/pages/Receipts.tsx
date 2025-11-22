import { useEffect, useState } from 'react';
import { receiptsAPI, productsAPI, warehousesAPI } from '@/services/api';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, CheckCircle, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/Pagination';
import { PermissionGuard } from '@/components/PermissionGuard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Receipt {
  id: number;
  receipt_number: string;
  supplier: string;
  receipt_date: string;
  expected_date: string;
  status: string;
  notes: string;
  created_by_name: string;
  validated_by_name: string | null;
  items: ReceiptItem[];
}

interface ReceiptItem {
  id?: number;
  product: number;
  product_name?: string;
  location: number;
  location_name?: string;
  quantity: number;
  unit_price: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  cost_price: number;
  selling_price: number;
  total_stock: number;
  uom_abbreviation: string;
}

interface Location {
  id: number;
  name: string;
  full_path: string;
}

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [ordering, setOrdering] = useState('-created_at');

  const [formData, setFormData] = useState({
    receipt_number: '',
    supplier_name: '',
    supplier_reference: '',
    destination_location: '',
    expected_date: new Date().toISOString().split('T')[0],
    notes: '',
    lines: [{ product: '', quantity: '', unit_price: '', notes: '' }],
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, statusFilter, ordering]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        page_size: pageSize,
        search: searchTerm,
        ordering: ordering,
      };
      if (statusFilter) params.status = statusFilter;
      
      const receiptsRes = await receiptsAPI.getReceipts(params);
      const receiptsData = receiptsRes.data.results || receiptsRes.data;
      setReceipts(Array.isArray(receiptsData) ? receiptsData : []);
      setTotalItems(receiptsRes.data.count || receiptsData.length);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast.error('Failed to load receipts');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMasterData = async () => {
    try {
      const [productsRes, locationsRes] = await Promise.all([
        productsAPI.getProducts({ page_size: 1000 }),
        warehousesAPI.getLocations({ page_size: 1000 }),
      ]);
      const productsData = productsRes.data.results || productsRes.data;
      const locationsData = locationsRes.data.results || locationsRes.data;
      setProducts(Array.isArray(productsData) ? productsData : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (error) {
      console.error('Error fetching master data:', error);
      toast.error('Failed to load products/locations');
    }
  };
  
  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };
  
  const handleResetFilters = () => {
    setStatusFilter('');
    setOrdering('-created_at');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleOpenDialog = (receipt?: Receipt) => {
    if (receipt) {
      setEditingReceipt(receipt);
      setFormData({
        receipt_number: receipt.receipt_number,
        supplier_name: receipt.supplier,
        supplier_reference: '',
        destination_location: '', // Will need location ID from backend
        expected_date: receipt.expected_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        notes: receipt.notes,
        lines: receipt.items.map((item) => ({
          product: item.product.toString(),
          quantity: item.quantity.toString(),
          unit_price: item.unit_price.toString(),
          notes: '',
        })),
      });
    } else {
      setEditingReceipt(null);
      setFormData({
        receipt_number: `REC-${Date.now()}`,
        supplier_name: '',
        supplier_reference: '',
        destination_location: '',
        expected_date: new Date().toISOString().split('T')[0],
        notes: '',
        lines: [{ product: '', quantity: '', unit_price: '', notes: '' }],
      });
    }
    setShowDialog(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { product: '', quantity: '', unit_price: '', notes: '' }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        receipt_number: formData.receipt_number,
        supplier_name: formData.supplier_name,
        supplier_reference: formData.supplier_reference || undefined,
        destination_location: parseInt(formData.destination_location),
        expected_date: formData.expected_date,
        notes: formData.notes,
        lines: formData.lines.map((line) => ({
          product: parseInt(line.product),
          quantity: parseFloat(line.quantity),
          unit_price: parseFloat(line.unit_price),
          notes: line.notes || undefined,
        })),
      };

      if (editingReceipt) {
        await receiptsAPI.updateReceipt(editingReceipt.id, payload);
        toast.success('Receipt updated successfully');
      } else {
        await receiptsAPI.createReceipt(payload);
        toast.success('Receipt created successfully');
      }

      setShowDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving receipt:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || JSON.stringify(error.response?.data) || 'Failed to save receipt';
      toast.error(errorMsg);
    }
  };

  const handleValidate = async (id: number) => {
    if (!confirm('Are you sure you want to validate this receipt? This will update stock levels.')) return;

    try {
      await receiptsAPI.validateReceipt(id);
      toast.success('Receipt validated successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error validating receipt:', error);
      toast.error(error.response?.data?.message || 'Failed to validate receipt');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;

    try {
      await receiptsAPI.deleteReceipt(id);
      toast.success('Receipt deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast.error('Failed to delete receipt');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      DRAFT: 'bg-gray-100 text-gray-800',
      VALIDATED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
          <p className="text-gray-600">Manage incoming stock receipts</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Receipt
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search receipts by number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <Label>Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="VALIDATED">Validated</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort By</Label>
              <Select
                value={ordering}
                onValueChange={(value) => setOrdering(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">Date Created (Newest)</SelectItem>
                  <SelectItem value="created_at">Date Created (Oldest)</SelectItem>
                  <SelectItem value="-expected_date">Expected Date (Newest)</SelectItem>
                  <SelectItem value="expected_date">Expected Date (Oldest)</SelectItem>
                  <SelectItem value="receipt_number">Receipt # (A-Z)</SelectItem>
                  <SelectItem value="-receipt_number">Receipt # (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Items Per Page</Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleResetFilters} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No receipts found
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {receipt.receipt_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {receipt.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(receipt.receipt_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          receipt.status
                        )}`}
                      >
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {receipt.created_by_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {receipt.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleValidate(receipt.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="Validate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(receipt)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(receipt.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReceipt ? 'Edit Receipt' : 'New Receipt'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="receipt_number">Receipt Number *</Label>
                <input
                  id="receipt_number"
                  value={formData.receipt_number}
                  onChange={(e) =>
                    setFormData({ ...formData, receipt_number: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g., REC-001"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="supplier_name">Supplier Name *</Label>
                  <input
                    id="supplier_name"
                    value={formData.supplier_name}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier_name: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Supplier company name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supplier_reference">Supplier Reference</Label>
                  <input
                    id="supplier_reference"
                    value={formData.supplier_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier_reference: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="PO number, invoice, etc."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="destination_location">Destination Location *</Label>
                  <Select
                    value={formData.destination_location}
                    onValueChange={(value) =>
                      setFormData({ ...formData, destination_location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id.toString()}>
                          {l.full_path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expected_date">Expected Date</Label>
                  <input
                    id="expected_date"
                    type="date"
                    value={formData.expected_date}
                    onChange={(e) =>
                      setFormData({ ...formData, expected_date: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              {/* Items */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Line Items *</Label>
                  <Button type="button" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.lines.map((line, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-md"
                    >
                      <div className="col-span-5">
                        <Label className="text-xs">Product</Label>
                        <Select
                          value={line.product}
                          onValueChange={(value) => {
                            const selectedProduct = products.find(p => p.id.toString() === value);
                            updateItem(index, 'product', value);
                            if (selectedProduct) {
                              updateItem(index, 'unit_price', selectedProduct.cost_price.toString());
                            }
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.name} ({p.sku}) - Stock: {p.total_stock} {p.uom_abbreviation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Quantity</Label>
                        <input
                          type="number"
                          step="0.001"
                          value={line.quantity}
                          onChange={(e) =>
                            updateItem(index, 'quantity', e.target.value)
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Unit Price</Label>
                        <input
                          type="number"
                          step="0.01"
                          value={line.unit_price}
                          onChange={(e) =>
                            updateItem(index, 'unit_price', e.target.value)
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Total</Label>
                        <div className="h-9 flex items-center justify-center text-sm font-semibold bg-gray-100 rounded-md border">
                          {line.quantity && line.unit_price
                            ? (parseFloat(line.quantity) * parseFloat(line.unit_price)).toFixed(2)
                            : '0.00'}
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {formData.lines.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="h-9"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingReceipt ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
