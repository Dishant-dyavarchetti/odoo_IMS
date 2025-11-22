import { useEffect, useState } from 'react';
import { deliveriesAPI, productsAPI, warehousesAPI, authAPI } from '@/services/api';
import { toast } from 'react-toastify';
import { Plus, Search, Trash2, CheckCircle, Edit, X, Eye, Filter } from 'lucide-react';
import { ViewDialog } from '@/components/ViewDialog';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/Pagination';
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
  customer_name: string;
  customer_reference: string;
  source_location: number;
  source_location_code?: string;
  shipping_address: string;
  delivery_date: string;
  scheduled_date: string;
  status: string;
  notes: string;
  responsible?: number;
  responsible_username?: string;
  created_by_username: string;
  validated_by_username: string | null;
  lines: DeliveryLine[];
}

interface DeliveryLine {
  id?: number;
  product: number;
  product_name?: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  notes?: string;
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
  full_path: string;
}

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewDelivery, setViewDelivery] = useState<Delivery | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [ordering, setOrdering] = useState('-created_at');

  const [formData, setFormData] = useState({
    delivery_number: '',
    customer_name: '',
    customer_reference: '',
    source_location: '',
    shipping_address: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    notes: '',
    responsible: '',
    lines: [{ product: 0, quantity: '', unit_price: '', notes: '' }],
  });
  
  const [stockValidationErrors, setStockValidationErrors] = useState<{[key: number]: string}>({});
  
  const validateStock = (productId: string, quantity: string, lineIndex: number) => {
    const product = products.find(p => p.id.toString() === productId);
    if (!product || !quantity) {
      setStockValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[lineIndex];
        return newErrors;
      });
      return true;
    }
    
    const qty = parseFloat(quantity);
    if (qty > product.total_stock) {
      setStockValidationErrors(prev => ({
        ...prev,
        [lineIndex]: `Insufficient stock! Available: ${product.total_stock} ${product.uom_abbreviation}`
      }));
      return false;
    }
    
    setStockValidationErrors(prev => {
      const newErrors = {...prev};
      delete newErrors[lineIndex];
      return newErrors;
    });
    return true;
  };

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
      
      const deliveriesRes = await deliveriesAPI.getDeliveries(params);
      const deliveriesData = deliveriesRes.data.results || deliveriesRes.data;
      setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
      setTotalItems(deliveriesRes.data.count || deliveriesData.length);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Failed to load deliveries');
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMasterData = async () => {
    try {
      const [productsRes, locationsRes, usersRes] = await Promise.all([
        productsAPI.getProducts({ page_size: 1000 }),
        warehousesAPI.getLocations({ page_size: 1000 }),
        authAPI.getUsers({ page_size: 1000 }),
      ]);
      const productsData = productsRes.data.results || productsRes.data;
      const locationsData = locationsRes.data.results || locationsRes.data;
      const usersData = usersRes.data.results || usersRes.data;
      setProducts(Array.isArray(productsData) ? productsData : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching master data:', error);
      toast.error('Failed to load products/locations/users');
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

  const handleOpenDialog = (delivery?: Delivery) => {
    if (delivery) {
      setEditingDelivery(delivery);
      setFormData({
        delivery_number: delivery.delivery_number,
        customer_name: delivery.customer_name,
        customer_reference: delivery.customer_reference || '',
        source_location: delivery.source_location?.toString() || '',
        shipping_address: delivery.shipping_address || '',
        scheduled_date: delivery.scheduled_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        notes: delivery.notes || '',
        responsible: delivery.responsible?.toString() || '',
        lines: delivery.lines?.map((line) => ({
          product: line.product,
          quantity: line.quantity.toString(),
          unit_price: line.unit_price?.toString() || '0',
          notes: line.notes || '',
        })) || [{ product: 0, quantity: '', unit_price: '', notes: '' }],
      });
    } else {
      setEditingDelivery(null);
      setFormData({
        delivery_number: `DEL-${Date.now()}`,
        customer_name: '',
        customer_reference: '',
        source_location: '',
        shipping_address: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        notes: '',
        responsible: '',
        lines: [{ product: 0, quantity: '', unit_price: '', notes: '' }],
      });
    }
    setShowDialog(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { product: 0, quantity: '', unit_price: '', notes: '' }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    setFormData(prevData => {
      const newLines = [...prevData.lines];
      newLines[index] = { ...newLines[index], [field]: value };
      console.log('Updated line', index, 'field', field, 'to value', value);
      console.log('New lines state:', newLines);
      return { ...prevData, lines: newLines };
    });
  };

  useEffect(() => {
    console.log("form:", formData);
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for stock validation errors
    if (Object.keys(stockValidationErrors).length > 0) {
      toast.error('Please fix stock validation errors before submitting');
      return;
    }
    
    // Validate required fields
    if (!formData.customer_name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!formData.source_location) {
      toast.error('Source location is required');
      return;
    }
    if (!formData.lines.length) {
      toast.error('At least one line item is required');
      return;
    }
    
    // Validate line items
    for (let i = 0; i < formData.lines.length; i++) {
      const line = formData.lines[i];
      console.log(`Validating line ${i + 1}:`, line);
      if (!line.product || line.product === 0) {
        toast.error(`Product is required for line ${i + 1}`);
        return;
      }
      if (!line.quantity || line.quantity.trim() === '' || parseFloat(line.quantity) <= 0) {
        toast.error(`Valid quantity is required for line ${i + 1}`);
        return;
      }
      if (!line.unit_price || line.unit_price.trim() === '' || parseFloat(line.unit_price) < 0) {
        toast.error(`Valid unit price is required for line ${i + 1}`);
        return;
      }
    }
    
    try {
      const payload = {
        delivery_number: formData.delivery_number,
        customer_name: formData.customer_name,
        customer_reference: formData.customer_reference || undefined,
        source_location: parseInt(formData.source_location),
        shipping_address: formData.shipping_address || undefined,
        scheduled_date: formData.scheduled_date || undefined,
        notes: formData.notes || undefined,
        responsible: formData.responsible ? parseInt(formData.responsible) : null,
        lines: formData.lines.map((line) => ({
          product: typeof line.product === 'string' ? parseInt(line.product) : line.product,
          quantity: parseFloat(line.quantity),
          unit_price: parseFloat(line.unit_price),
          notes: line.notes || undefined,
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
      
      // Extract detailed error messages from backend
      let errorMessage = 'Failed to save delivery';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.lines) {
          // Handle line-level errors
          errorMessage = 'Validation errors in line items: ' + JSON.stringify(errorData.lines);
        } else {
          // Show first validation error
          const firstError = Object.entries(errorData)[0];
          if (firstError) {
            errorMessage = `${firstError[0]}: ${Array.isArray(firstError[1]) ? firstError[1][0] : firstError[1]}`;
          }
        }
      }
      toast.error(errorMessage);
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

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search deliveries by number or customer..."
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
                  <SelectItem value="-scheduled_date">Scheduled Date (Newest)</SelectItem>
                  <SelectItem value="scheduled_date">Scheduled Date (Oldest)</SelectItem>
                  <SelectItem value="delivery_number">Number (A-Z)</SelectItem>
                  <SelectItem value="-delivery_number">Number (Z-A)</SelectItem>
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
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No deliveries found
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {delivery.delivery_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.customer_name}
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
                      {delivery.created_by_username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {delivery.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => {
                              setViewDelivery(delivery);
                              setShowViewDialog(true);
                            }}
                            className="text-gray-600 hover:text-gray-900 mr-3"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
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
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="delivery_number">Delivery Number *</Label>
                  <input
                    id="delivery_number"
                    value={formData.delivery_number}
                    onChange={(e) =>
                      setFormData({ ...formData, delivery_number: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="e.g., DEL-001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_name: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer_reference">Customer Reference</Label>
                  <input
                    id="customer_reference"
                    value={formData.customer_reference}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_reference: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="source_location">Source Location *</Label>
                  <Select
                    value={formData.source_location || undefined}
                    onValueChange={(value) =>
                      setFormData({ ...formData, source_location: value })
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="scheduled_date">Scheduled Date *</Label>
                  <input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduled_date: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="responsible">Responsible</Label>
                  <Select
                    value={formData.responsible || undefined}
                    onValueChange={(value) =>
                      setFormData({ ...formData, responsible: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="shipping_address">Shipping Address</Label>
                  <input
                    id="shipping_address"
                    value={formData.shipping_address}
                    onChange={(e) =>
                      setFormData({ ...formData, shipping_address: e.target.value })
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

              {/* Lines */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Items *</Label>
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
                      <div className="col-span-4">
                        <Label className="text-xs">Product</Label>
                        <Select
                          value={line.product ? line.product.toString() : undefined}
                          onValueChange={(value) => {
                            const productId = parseInt(value);
                            const selectedProduct = products.find(p => p.id === productId);
                            
                            setFormData(prevData => {
                              const newLines = [...prevData.lines];
                              newLines[index] = { 
                                ...newLines[index], 
                                product: productId,
                                unit_price: selectedProduct ? selectedProduct.selling_price.toString() : newLines[index].unit_price
                              };
                              
                              // Validate stock
                              setTimeout(() => {
                                validateStock(value, newLines[index].quantity, index);
                              }, 0);
                              
                              return { ...prevData, lines: newLines };
                            });
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
                        {line.product && line.product !== 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            Selected: {products.find(p => p.id === line.product)?.name || 'Unknown'}
                          </p>
                        )}
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Quantity</Label>
                        <input
                          type="number"
                          step="0.01"
                          value={line.quantity}
                          onChange={(e) => {
                            updateItem(index, 'quantity', e.target.value);
                            validateStock(line.product, e.target.value, index);
                          }}
                          className={`flex h-9 w-full rounded-md border px-2 py-1 text-sm ${
                            stockValidationErrors[index] ? 'border-red-500 bg-red-50' : 'border-input bg-background'
                          }`}
                          required
                        />
                        {stockValidationErrors[index] && (
                          <p className="text-xs text-red-600 mt-1">{stockValidationErrors[index]}</p>
                        )}
                      </div>
                      <div className="col-span-3">
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
                      <div className="col-span-2 flex justify-end">
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
                {editingDelivery ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {viewDelivery && (
        <ViewDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          title={`Delivery: ${viewDelivery.delivery_number}`}
          data={viewDelivery}
          fields={[
            { label: 'Delivery Number', key: 'delivery_number' },
            { label: 'Customer Name', key: 'customer_name' },
            { label: 'Customer Reference', key: 'customer_reference' },
            { label: 'Source Location', key: 'source_location_name' },
            { label: 'Shipping Address', key: 'shipping_address' },
            { label: 'Scheduled Date', key: 'scheduled_date', format: (val) => new Date(val).toLocaleDateString() },
            { label: 'Status', key: 'status' },
            { label: 'Responsible', key: 'responsible_name' },
            { label: 'Notes', key: 'notes' },
            { label: 'Created By', key: 'created_by_username' },
            { label: 'Created At', key: 'created_at', format: (val) => new Date(val).toLocaleString() },
          ]}
        />
      )}
    </div>
  );
}
