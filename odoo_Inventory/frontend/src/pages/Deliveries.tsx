import { useEffect, useState } from 'react';
import { deliveriesAPI, productsAPI, warehousesAPI } from '@/services/api';
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

interface Delivery {
  id: number;
  delivery_number: string;
  customer: string;
  delivery_date: string;
  status: string;
  notes: string;
  created_by_name: string;
  validated_by_name: string | null;
  items: DeliveryItem[];
}

interface DeliveryItem {
  id?: number;
  product: number;
  product_name?: string;
  location: number;
  location_name?: string;
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

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);

  const [formData, setFormData] = useState({
    customer: '',
    delivery_date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [{ product: '', location: '', quantity: '' }],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deliveriesRes, productsRes, locationsRes] = await Promise.all([
        deliveriesAPI.getDeliveries(),
        productsAPI.getProducts(),
        warehousesAPI.getLocations(),
      ]);
      setDeliveries(deliveriesRes.data);
      setProducts(productsRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (delivery?: Delivery) => {
    if (delivery) {
      setEditingDelivery(delivery);
      setFormData({
        customer: delivery.customer,
        delivery_date: delivery.delivery_date.split('T')[0],
        notes: delivery.notes,
        items: delivery.items.map((item) => ({
          product: item.product.toString(),
          location: item.location.toString(),
          quantity: item.quantity.toString(),
        })),
      });
    } else {
      setEditingDelivery(null);
      setFormData({
        customer: '',
        delivery_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [{ product: '', location: '', quantity: '' }],
      });
    }
    setShowDialog(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', location: '', quantity: '' }],
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
        customer: formData.customer,
        delivery_date: formData.delivery_date,
        notes: formData.notes,
        items: formData.items.map((item) => ({
          product: parseInt(item.product),
          location: parseInt(item.location),
          quantity: parseFloat(item.quantity),
        })),
      };

      if (editingDelivery) {
        await deliveriesAPI.updateDelivery(editingDelivery.id, payload);
        toast.success('Delivery updated successfully');
      } else {
        await deliveriesAPI.createDelivery(payload);
        toast.success('Delivery created successfully');
      }

      setShowDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving delivery:', error);
      toast.error(error.response?.data?.message || 'Failed to save delivery');
    }
  };

  const handleValidate = async (id: number) => {
    if (!confirm('Are you sure you want to validate this delivery? This will reduce stock levels.')) return;

    try {
      await deliveriesAPI.validateDelivery(id);
      toast.success('Delivery validated successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error validating delivery:', error);
      toast.error(error.response?.data?.message || 'Failed to validate delivery');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this delivery?')) return;

    try {
      await deliveriesAPI.deleteDelivery(id);
      toast.success('Delivery deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting delivery:', error);
      toast.error('Failed to delete delivery');
    }
  };

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.delivery_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customer.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="mt-4 text-gray-600">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-600">Manage outgoing stock deliveries</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Delivery
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search deliveries by number or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date
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
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No deliveries found
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {delivery.delivery_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(delivery.delivery_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          delivery.status
                        )}`}
                      >
                        {delivery.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.created_by_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {delivery.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleValidate(delivery.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="Validate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(delivery)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(delivery.id)}
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
              {editingDelivery ? 'Edit Delivery' : 'New Delivery'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer *</Label>
                <input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) =>
                    setFormData({ ...formData, customer: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="delivery_date">Delivery Date *</Label>
                <input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) =>
                    setFormData({ ...formData, delivery_date: e.target.value })
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
                      <div className="col-span-4">
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
                      <div className="col-span-4">
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
                {editingDelivery ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
