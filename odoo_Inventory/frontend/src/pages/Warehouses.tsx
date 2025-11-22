import { useEffect, useState } from 'react';
import { warehousesAPI } from '@/services/api';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewDialog } from '@/components/ViewDialog';
import { PermissionGuard } from '@/components/PermissionGuard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Warehouse {
  id: number;
  code: string;
  name: string;
  address: string;
  is_active: boolean;
}

interface Location {
  id: number;
  warehouse_name: string;
  name: string;
  location_type: string;
  parent_name: string | null;
  full_path: string;
  is_active: boolean;
}

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [viewWarehouse, setViewWarehouse] = useState<Warehouse | null>(null);
  const [viewLocation, setViewLocation] = useState<Location | null>(null);
  const [showViewWarehouseDialog, setShowViewWarehouseDialog] = useState(false);
  const [showViewLocationDialog, setShowViewLocationDialog] = useState(false);

  const [warehouseForm, setWarehouseForm] = useState({
    code: '',
    name: '',
    address: '',
    is_active: true,
  });

  const [locationForm, setLocationForm] = useState({
    warehouse: '',
    name: '',
    location_type: 'STORAGE',
    parent: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [warehousesRes, locationsRes] = await Promise.all([
        warehousesAPI.getWarehouses(),
        warehousesAPI.getLocations(),
      ]);
      const warehousesData = warehousesRes.data.results || warehousesRes.data;
      const locationsData = locationsRes.data.results || locationsRes.data;
      
      setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load warehouses');
      setWarehouses([]);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWarehouseDialog = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setWarehouseForm({
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address,
        is_active: warehouse.is_active,
      });
    } else {
      setEditingWarehouse(null);
      setWarehouseForm({ code: '', name: '', address: '', is_active: true });
    }
    setShowWarehouseDialog(true);
  };

  const handleOpenLocationDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setLocationForm({
        warehouse: '', // Will need warehouse ID
        name: location.name,
        location_type: location.location_type,
        parent: '', // Will need parent ID
      });
    } else {
      setEditingLocation(null);
      setLocationForm({ warehouse: '', name: '', location_type: 'STORAGE', parent: '' });
    }
    setShowLocationDialog(true);
  };

  const handleSubmitWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await warehousesAPI.updateWarehouse(editingWarehouse.id, warehouseForm);
        toast.success('Warehouse updated successfully');
      } else {
        await warehousesAPI.createWarehouse(warehouseForm);
        toast.success('Warehouse created successfully');
      }
      setShowWarehouseDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving warehouse:', error);
      toast.error(error.response?.data?.message || 'Failed to save warehouse');
    }
  };

  const handleSubmitLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        warehouse: parseInt(locationForm.warehouse),
        name: locationForm.name,
        location_type: locationForm.location_type,
        parent: locationForm.parent ? parseInt(locationForm.parent) : null,
      };

      if (editingLocation) {
        await warehousesAPI.updateLocation(editingLocation.id, payload);
        toast.success('Location updated successfully');
      } else {
        await warehousesAPI.createLocation(payload);
        toast.success('Location created successfully');
      }
      setShowLocationDialog(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast.error(error.response?.data?.message || 'Failed to save location');
    }
  };

  const handleDeleteWarehouse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;

    try {
      await warehousesAPI.deleteWarehouse(id);
      toast.success('Warehouse deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast.error('Failed to delete warehouse');
    }
  };

  const handleDeleteLocation = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      await warehousesAPI.deleteLocation(id);
      toast.success('Location deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLocations = locations.filter((location) =>
    location.full_path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading warehouses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouses & Locations</h1>
          <p className="text-gray-600">Manage warehouses and storage locations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleOpenLocationDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
          <Button onClick={() => handleOpenWarehouseDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search warehouses and locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Warehouses Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Warehouses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWarehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No warehouses found
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {warehouse.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {warehouse.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {warehouse.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          warehouse.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {warehouse.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setViewWarehouse(warehouse);
                          setShowViewWarehouseDialog(true);
                        }}
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenWarehouseDialog(warehouse)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWarehouse(warehouse.id)}
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
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Locations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warehouse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No locations found
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {location.full_path}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.warehouse_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.location_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          location.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {location.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setViewLocation(location);
                          setShowViewLocationDialog(true);
                        }}
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenLocationDialog(location)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
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
      </div>

      {/* Warehouse Dialog */}
      <Dialog open={showWarehouseDialog} onOpenChange={setShowWarehouseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? 'Edit Warehouse' : 'New Warehouse'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitWarehouse}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Code *</Label>
                <input
                  id="code"
                  value={warehouseForm.code}
                  onChange={(e) =>
                    setWarehouseForm({ ...warehouseForm, code: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <input
                  id="name"
                  value={warehouseForm.name}
                  onChange={(e) =>
                    setWarehouseForm({ ...warehouseForm, name: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <textarea
                  id="address"
                  value={warehouseForm.address}
                  onChange={(e) =>
                    setWarehouseForm({ ...warehouseForm, address: e.target.value })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={warehouseForm.is_active}
                  onChange={(e) =>
                    setWarehouseForm({ ...warehouseForm, is_active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowWarehouseDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingWarehouse ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'New Location'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitLocation}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="warehouse">Warehouse *</Label>
                <select
                  id="warehouse"
                  value={locationForm.warehouse}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, warehouse: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="loc_name">Name *</Label>
                <input
                  id="loc_name"
                  value={locationForm.name}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, name: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location_type">Type *</Label>
                <select
                  id="location_type"
                  value={locationForm.location_type}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, location_type: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="STORAGE">Storage</option>
                  <option value="RECEIVING">Receiving</option>
                  <option value="SHIPPING">Shipping</option>
                  <option value="PRODUCTION">Production</option>
                  <option value="QUARANTINE">Quarantine</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parent">Parent Location</Label>
                <select
                  id="parent"
                  value={locationForm.parent}
                  onChange={(e) =>
                    setLocationForm({ ...locationForm, parent: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">None (root level)</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_path}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLocationDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingLocation ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Warehouse Dialog */}
      {viewWarehouse && (
        <ViewDialog
          open={showViewWarehouseDialog}
          onOpenChange={setShowViewWarehouseDialog}
          title={`Warehouse: ${viewWarehouse.name}`}
          data={viewWarehouse}
          fields={[
            { label: 'Code', key: 'code' },
            { label: 'Name', key: 'name' },
            { label: 'Address', key: 'address' },
            { label: 'Active', key: 'is_active', format: (val) => val ? 'Yes' : 'No' },
          ]}
        />
      )}

      {/* View Location Dialog */}
      {viewLocation && (
        <ViewDialog
          open={showViewLocationDialog}
          onOpenChange={setShowViewLocationDialog}
          title={`Location: ${viewLocation.name}`}
          data={viewLocation}
          fields={[
            { label: 'Name', key: 'name' },
            { label: 'Warehouse', key: 'warehouse_name' },
            { label: 'Location Type', key: 'location_type' },
            { label: 'Active', key: 'is_active', format: (val) => val ? 'Yes' : 'No' },
          ]}
        />
      )}
    </div>
  );
}
