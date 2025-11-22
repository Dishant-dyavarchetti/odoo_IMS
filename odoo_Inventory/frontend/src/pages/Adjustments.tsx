import { useEffect, useState } from 'react';
import { adjustmentsAPI, productsAPI, warehousesAPI } from '@/services/api';
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

interface Adjustment {
  id: number;
  adjustment_number: string;
  location: number;
  location_code?: string;
  product: number;
  product_sku?: string;
  product_name?: string;
  system_quantity: number;
  counted_quantity: number;
  adjustment_quantity: number;
  reason: string;
  status: string;
  notes: string;
  created_by_username: string;
  validated_by_username: string | null;
  created_at: string;
  updated_at: string;
  validated_at: string | null;
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

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState<Adjustment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewAdjustment, setViewAdjustment] = useState<Adjustment | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [ordering, setOrdering] = useState('-created_at');

  const [formData, setFormData] = useState({
    adjustment_number: '',
    product: 0,
    location: '',
    counted_quantity: '',
    system_quantity: '',
    reason: 'PHYSICAL_COUNT',
    notes: '',
  });
  
  const [stockValidationError, setStockValidationError] = useState<string>('');
  
  const validateAdjustmentStock = () => {
    const product = products.find(p => p.id.toString() === formData.product);
    if (!product || !formData.system_quantity || !formData.counted_quantity) {
      setStockValidationError('');
      return true;
    }
    
    const systemQty = parseFloat(formData.system_quantity);
    const countedQty = parseFloat(formData.counted_quantity);
    const difference = countedQty - systemQty;
    
    // If decreasing stock (negative adjustment)
    if (difference < 0 && Math.abs(difference) > product.total_stock) {
      setStockValidationError(
        `Cannot decrease stock by ${Math.abs(difference).toFixed(2)}! Available: ${product.total_stock} ${product.uom_abbreviation}`
      );
      return false;
    }
    
    setStockValidationError('');
    return true;
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, statusFilter, reasonFilter, ordering]);

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
      if (reasonFilter) params.reason = reasonFilter;
      
      const adjustmentsRes = await adjustmentsAPI.getAdjustments(params);
      const adjustmentsData = adjustmentsRes.data.results || adjustmentsRes.data;
      setAdjustments(Array.isArray(adjustmentsData) ? adjustmentsData : []);
      setTotalItems(adjustmentsRes.data.count || adjustmentsData.length);
    } catch (error) {
      console.error('Error fetching adjustments:', error);
      toast.error('Failed to load adjustments');
      setAdjustments([]);
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
    setReasonFilter('');
    setOrdering('-created_at');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleOpenDialog = (adjustment?: Adjustment) => {
    if (adjustment) {
      setEditingAdjustment(adjustment);
      setFormData({
        adjustment_number: adjustment.adjustment_number,
        product: adjustment.product,
        location: adjustment.location.toString(),
        counted_quantity: adjustment.counted_quantity.toString(),
        system_quantity: adjustment.system_quantity.toString(),
        reason: adjustment.reason,
        notes: adjustment.notes || '',
      });
    } else {
      setEditingAdjustment(null);
      setFormData({
        adjustment_number: `ADJ-${Date.now()}`,
        product: 0,
        location: '',
        counted_quantity: '',
        system_quantity: '',
        reason: 'PHYSICAL_COUNT',
        notes: '',
      });
    }
    setShowDialog(true);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for stock validation error
    if (stockValidationError) {
      toast.error('Please fix stock validation error before submitting');
      return;
    }
    
    // Validate required fields
    if (!formData.product || formData.product === 0) {
      toast.error('Product is required');
      return;
    }
    if (!formData.location || formData.location.trim() === '') {
      toast.error('Location is required');
      return;
    }
    if (!formData.counted_quantity || formData.counted_quantity.trim() === '' || parseFloat(formData.counted_quantity) < 0) {
      toast.error('Valid counted quantity is required');
      return;
    }
    if (!formData.reason || formData.reason.trim() === '') {
      toast.error('Reason is required');
      return;
    }
    
    try {
      const payload = {
        adjustment_number: formData.adjustment_number,
        product: typeof formData.product === 'string' ? parseInt(formData.product) : formData.product,
        location: parseInt(formData.location),
        counted_quantity: parseFloat(formData.counted_quantity),
        system_quantity: parseFloat(formData.system_quantity),
        reason: formData.reason,
        notes: formData.notes || undefined,
      };

      if (editingAdjustment) {
        await adjustmentsAPI.updateAdjustment(editingAdjustment.id, payload);
        toast.success('Adjustment updated successfully');
      } else {
        await adjustmentsAPI.createAdjustment(payload);
        toast.success('Adjustment created successfully');
      }

      setShowDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving adjustment:', error);
      
      // Extract detailed error messages from backend
      let errorMessage = 'Failed to save adjustment';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
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
    if (!confirm('Are you sure you want to validate this adjustment? This will update stock levels.')) return;

    try {
      await adjustmentsAPI.validateAdjustment(id);
      toast.success('Adjustment validated successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error validating adjustment:', error);
      toast.error(error.response?.data?.message || 'Failed to validate adjustment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this adjustment?')) return;

    try {
      await adjustmentsAPI.deleteAdjustment(id);
      toast.success('Adjustment deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting adjustment:', error);
      toast.error('Failed to delete adjustment');
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
          <p className="mt-4 text-gray-600">Loading adjustments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Adjustments</h1>
          <p className="text-gray-600">Manage inventory adjustments and physical counts</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Adjustment
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search adjustments by number or product..."
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
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason</Label>
              <Select
                value={reasonFilter}
                onValueChange={(value) => setReasonFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Reasons</SelectItem>
                  <SelectItem value="DAMAGED">Damaged</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                  <SelectItem value="FOUND">Found</SelectItem>
                  <SelectItem value="PHYSICAL_COUNT">Physical Count</SelectItem>
                  <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
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
                  <SelectItem value="-created_at">Date (Newest)</SelectItem>
                  <SelectItem value="created_at">Date (Oldest)</SelectItem>
                  <SelectItem value="adjustment_number">Number (A-Z)</SelectItem>
                  <SelectItem value="-adjustment_number">Number (Z-A)</SelectItem>
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
          </div>
        )}
        {showFilters && (
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={handleResetFilters}>
              <X className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adjustment #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
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
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No adjustments found
                  </td>
                </tr>
              ) : (
                adjustments.map((adjustment) => (
                  <tr key={adjustment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {adjustment.adjustment_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(adjustment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {adjustment.product_name || `Product #${adjustment.product}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {adjustment.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          adjustment.status
                        )}`}
                      >
                        {adjustment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {adjustment.created_by_username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {adjustment.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => {
                              setViewAdjustment(adjustment);
                              setShowViewDialog(true);
                            }}
                            className="text-purple-600 hover:text-purple-900 mr-3"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleValidate(adjustment.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="Validate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(adjustment)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(adjustment.id)}
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAdjustment ? 'Edit Adjustment' : 'New Adjustment'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="adjustment_number">Adjustment Number *</Label>
                <input
                  id="adjustment_number"
                  value={formData.adjustment_number}
                  onChange={(e) =>
                    setFormData({ ...formData, adjustment_number: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g., ADJ-001"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="product">Product *</Label>
                  <Select
                    value={formData.product ? formData.product.toString() : undefined}
                    onValueChange={(value) =>
                      setFormData({ ...formData, product: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
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
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={formData.location || undefined}
                    onValueChange={(value) =>
                      setFormData({ ...formData, location: value })
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
              
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="system_quantity">System Quantity *</Label>
                  <input
                    id="system_quantity"
                    type="number"
                    step="0.001"
                    value={formData.system_quantity}
                    onChange={(e) => {
                      setFormData({ ...formData, system_quantity: e.target.value });
                      setTimeout(validateAdjustmentStock, 100);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="0.000"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="counted_quantity">Counted Quantity *</Label>
                  <input
                    id="counted_quantity"
                    type="number"
                    step="0.001"
                    value={formData.counted_quantity}
                    onChange={(e) => {
                      setFormData({ ...formData, counted_quantity: e.target.value });
                      setTimeout(validateAdjustmentStock, 100);
                    }}
                    className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${
                      stockValidationError ? 'border-red-500 bg-red-50' : 'border-input bg-background'
                    }`}
                    placeholder="0.000"
                    required
                  />
                  {stockValidationError && (
                    <p className="text-xs text-red-600 mt-1">{stockValidationError}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label>Adjustment Difference</Label>
                  <div className="flex h-10 items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-semibold">
                    {formData.counted_quantity && formData.system_quantity
                      ? (parseFloat(formData.counted_quantity) - parseFloat(formData.system_quantity)).toFixed(3)
                      : '0.000'}
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason *</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) =>
                    setFormData({ ...formData, reason: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAMAGED">Damaged</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                    <SelectItem value="FOUND">Found</SelectItem>
                    <SelectItem value="PHYSICAL_COUNT">Physical Count</SelectItem>
                    <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
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
                  placeholder="Additional notes..."
                />
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
                {editingAdjustment ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <ViewDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        title="Adjustment Details"
        data={viewAdjustment || {}}
        fields={[
          { label: 'Adjustment Number', key: 'adjustment_number' },
          { label: 'Product', key: 'product_name' },
          { label: 'Location', key: 'location_name' },
          { label: 'Counted Quantity', key: 'counted_quantity' },
          { label: 'System Quantity', key: 'system_quantity' },
          { label: 'Difference', key: 'difference' },
          { label: 'Reason', key: 'reason' },
          { label: 'Status', key: 'status' },
          { label: 'Notes', key: 'notes' },
          { label: 'Created By', key: 'created_by_username' },
          { label: 'Created At', key: 'created_at', format: (value) => value ? new Date(value).toLocaleString() : 'N/A' },
        ]}
      />
    </div>
  );
}
