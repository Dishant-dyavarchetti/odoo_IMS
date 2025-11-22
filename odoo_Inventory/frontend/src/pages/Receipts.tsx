import { useEffect, useState } from 'react';
import { receiptsAPI, productsAPI, warehousesAPI } from '@/services/api';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const [formData, setFormData] = useState({
    supplier: '',
    receipt_date: new Date().toISOString().split('T')[0],
    expected_date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [{ product: '', location: '', quantity: '', unit_price: '' }],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [receiptsRes, productsRes, locationsRes] = await Promise.all([
        receiptsAPI.getReceipts(),
        productsAPI.getProducts(),
        warehousesAPI.getLocations(),
      ]);
      setReceipts(receiptsRes.data);
      setProducts(productsRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (receipt?: Receipt) => {
    if (receipt) {
      setEditingReceipt(receipt);
      setFormData({
        supplier: receipt.supplier,
        receipt_date: receipt.receipt_date.split('T')[0],
        expected_date: receipt.expected_date.split('T')[0],
        notes: receipt.notes,
        items: receipt.items.map((item) => ({
          product: item.product.toString(),
          location: item.location.toString(),
          quantity: item.quantity.toString(),
          unit_price: item.unit_price.toString(),
        })),
      });
    } else {
      setEditingReceipt(null);
      setFormData({
        supplier: '',
        receipt_date: new Date().toISOString().split('T')[0],
        expected_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [{ product: '', location: '', quantity: '', unit_price: '' }],
      });
    }
    setShowDialog(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', location: '', quantity: '', unit_price: '' }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        supplier: formData.supplier,
        receipt_date: formData.receipt_date,
        expected_date: formData.expected_date,
        notes: formData.notes,
        items: formData.items.map((item) => ({
          product: parseInt(item.product),
          location: parseInt(item.location),
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
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
      toast.error(error.response?.data?.message || 'Failed to save receipt');
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

  const filteredReceipts = receipts.filter(
    (receipt) =>
      receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search receipts by number or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No receipts found
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => (
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
                <Label htmlFor="supplier">Supplier *</Label>
                <input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="receipt_date">Receipt Date *</Label>
                  <input
                    id="receipt_date"
                    type="date"
                    value={formData.receipt_date}
                    onChange={(e) =>
                      setFormData({ ...formData, receipt_date: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expected_date">Expected Date *</Label>
                  <input
                    id="expected_date"
                    type="date"
                    value={formData.expected_date}
                    onChange={(e) =>
                      setFormData({ ...formData, expected_date: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
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
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              {/* Items */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Items *</Label>
                  <Button type="button" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-md"
                    >
                      <div className="col-span-3">
                        <Label className="text-xs">Product</Label>
                        <Select
                          value={item.product}
                          onValueChange={(value) =>
                            updateItem(index, 'product', value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Location</Label>
                        <Select
                          value={item.location}
                          onValueChange={(value) =>
                            updateItem(index, 'location', value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select" />
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
                      <div className="col-span-2">
                        <Label className="text-xs">Quantity</Label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.quantity}
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
                          value={item.unit_price}
                          onChange={(e) =>
                            updateItem(index, 'unit_price', e.target.value)
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        {formData.items.length > 1 && (
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
