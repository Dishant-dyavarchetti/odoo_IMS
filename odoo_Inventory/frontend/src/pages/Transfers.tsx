import { useEffect, useState } from 'react';
import { transfersAPI, productsAPI, warehousesAPI } from '@/services/api';
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

interface Transfer {
  id: number;
  transfer_number: string;
  transfer_date: string;
  status: string;
  notes: string;
  created_by_name: string;
  validated_by_name: string | null;
  items: TransferItem[];
}

interface TransferItem {
  id?: number;
  product: number;
  product_name?: string;
  from_location: number;
  from_location_name?: string;
  to_location: number;
  to_location_name?: string;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
}

interface Location {
  id: number;
  full_path: string;
}

export default function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);

  const [formData, setFormData] = useState({
    transfer_date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [{ product: '', from_location: '', to_location: '', quantity: '' }],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transfersRes, productsRes, locationsRes] = await Promise.all([
        transfersAPI.getTransfers(),
        productsAPI.getProducts(),
        warehousesAPI.getLocations(),
      ]);
      setTransfers(transfersRes.data);
      setProducts(productsRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (transfer?: Transfer) => {
    if (transfer) {
      setEditingTransfer(transfer);
      setFormData({
        transfer_date: transfer.transfer_date.split('T')[0],
        notes: transfer.notes,
        items: transfer.items.map((item) => ({
          product: item.product.toString(),
          from_location: item.from_location.toString(),
          to_location: item.to_location.toString(),
          quantity: item.quantity.toString(),
        })),
      });
    } else {
      setEditingTransfer(null);
      setFormData({
        transfer_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [{ product: '', from_location: '', to_location: '', quantity: '' }],
      });
    }
    setShowDialog(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', from_location: '', to_location: '', quantity: '' }],
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
        transfer_date: formData.transfer_date,
        notes: formData.notes,
        items: formData.items.map((item) => ({
          product: parseInt(item.product),
          from_location: parseInt(item.from_location),
          to_location: parseInt(item.to_location),
          quantity: parseFloat(item.quantity),
        })),
      };

      if (editingTransfer) {
        await transfersAPI.updateTransfer(editingTransfer.id, payload);
        toast.success('Transfer updated successfully');
      } else {
        await transfersAPI.createTransfer(payload);
        toast.success('Transfer created successfully');
      }

      setShowDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving transfer:', error);
      toast.error(error.response?.data?.message || 'Failed to save transfer');
    }
  };

  const handleValidate = async (id: number) => {
    if (!confirm('Are you sure you want to validate this transfer?')) return;

    try {
      await transfersAPI.validateTransfer(id);
      toast.success('Transfer validated successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error validating transfer:', error);
      toast.error(error.response?.data?.message || 'Failed to validate transfer');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transfer?')) return;

    try {
      await transfersAPI.deleteTransfer(id);
      toast.success('Transfer deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting transfer:', error);
      toast.error('Failed to delete transfer');
    }
  };

  const filteredTransfers = transfers.filter((transfer) =>
    transfer.transfer_number.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="mt-4 text-gray-600">Loading transfers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transfers</h1>
          <p className="text-gray-600">Manage stock transfers between locations</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Transfer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search transfers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transfer #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transfer Date
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
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No transfers found
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transfer.transfer_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transfer.transfer_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          transfer.status
                        )}`}
                      >
                        {transfer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transfer.created_by_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {transfer.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleValidate(transfer.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="Validate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(transfer)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transfer.id)}
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTransfer ? 'Edit Transfer' : 'New Transfer'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="transfer_date">Transfer Date *</Label>
                <input
                  id="transfer_date"
                  type="date"
                  value={formData.transfer_date}
                  onChange={(e) =>
                    setFormData({ ...formData, transfer_date: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
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
                        <Label className="text-xs">From Location</Label>
                        <Select
                          value={item.from_location}
                          onValueChange={(value) =>
                            updateItem(index, 'from_location', value)
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
                      <div className="col-span-3">
                        <Label className="text-xs">To Location</Label>
                        <Select
                          value={item.to_location}
                          onValueChange={(value) =>
                            updateItem(index, 'to_location', value)
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
                      <div className="col-span-1 flex justify-end">
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
                {editingTransfer ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
