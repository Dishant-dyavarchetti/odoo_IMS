import { useEffect, useState } from 'react';
import { productsAPI } from '@/services/api';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, Filter, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UOM {
  id: number;
  name: string;
  abbreviation: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export default function UOMs() {
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingUOM, setEditingUOM] = useState<UOM | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  const [filters, setFilters] = useState({
    is_active: '',
    ordering: 'name',
  });

  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchUOMs();
  }, [currentPage, pageSize, filters]);

  const fetchUOMs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        page_size: pageSize,
        search: searchTerm,
        ordering: filters.ordering,
      };
      
      if (filters.is_active) params.is_active = filters.is_active;
      
      const response = await productsAPI.getUOMs(params);
      const uomsData = response.data.results || response.data;
      setUOMs(Array.isArray(uomsData) ? uomsData : []);
      setTotalItems(response.data.count || uomsData.length);
    } catch (error) {
      console.error('Error fetching UOMs:', error);
      toast.error('Failed to load UOMs');
      setUOMs([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUOMs();
  };
  
  const handleResetFilters = () => {
    setFilters({ is_active: '', ordering: 'name' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleOpenDialog = (uom?: UOM) => {
    if (uom) {
      setEditingUOM(uom);
      setFormData({
        name: uom.name,
        abbreviation: uom.abbreviation,
        description: uom.description || '',
        is_active: uom.is_active,
      });
    } else {
      setEditingUOM(null);
      setFormData({
        name: '',
        abbreviation: '',
        description: '',
        is_active: true,
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        abbreviation: formData.abbreviation,
        description: formData.description,
        is_active: formData.is_active,
      };

      if (editingUOM) {
        await productsAPI.updateUOM(editingUOM.id, payload);
        toast.success('UOM updated successfully');
      } else {
        await productsAPI.createUOM(payload);
        toast.success('UOM created successfully');
      }

      setShowDialog(false);
      fetchUOMs();
    } catch (error: any) {
      console.error('Error saving UOM:', error);
      toast.error(error.response?.data?.message || 'Failed to save UOM');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this UOM?')) return;

    try {
      await productsAPI.deleteUOM(id);
      toast.success('UOM deleted successfully');
      fetchUOMs();
    } catch (error: any) {
      console.error('Error deleting UOM:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete UOM. It may have associated products.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading UOMs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Units of Measure</h1>
          <p className="text-gray-600">Manage measurement units</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add UOM
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search UOMs by name, abbreviation or description..."
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
                value={filters.is_active}
                onValueChange={(value) =>
                  setFilters({ ...filters, is_active: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort By</Label>
              <Select
                value={filters.ordering}
                onValueChange={(value) =>
                  setFilters({ ...filters, ordering: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="-name">Name (Z-A)</SelectItem>
                  <SelectItem value="abbreviation">Abbreviation (A-Z)</SelectItem>
                  <SelectItem value="-abbreviation">Abbreviation (Z-A)</SelectItem>
                  <SelectItem value="created_at">Oldest First</SelectItem>
                  <SelectItem value="-created_at">Newest First</SelectItem>
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

      {/* UOMs Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Abbreviation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uoms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No UOMs found
                  </td>
                </tr>
              ) : (
                uoms.map((uom) => (
                  <tr key={uom.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {uom.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {uom.abbreviation}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {uom.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {uom.is_active ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(uom.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenDialog(uom)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(uom.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingUOM ? 'Edit Unit of Measure' : 'Add New Unit of Measure'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g., Kilogram, Liter, Piece"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="abbreviation">Abbreviation *</Label>
                <input
                  id="abbreviation"
                  value={formData.abbreviation}
                  onChange={(e) =>
                    setFormData({ ...formData, abbreviation: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g., kg, L, pc"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Active
                </Label>
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
                {editingUOM ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
