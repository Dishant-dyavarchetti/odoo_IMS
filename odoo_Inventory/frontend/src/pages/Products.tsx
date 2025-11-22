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

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: number;
  category_name: string;
  uom: number;
  uom_name: string;
  uom_abbreviation: string;
  cost_price: string;
  selling_price: string;
  min_stock_level: number;
  reorder_quantity: number;
  total_stock: number;
  is_low_stock: boolean;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface UOM {
  id: number;
  name: string;
  abbreviation: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uoms, setUOMs] = useState<UOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState({
    category: '',
    is_active: '',
    stock_status: '', // all, in_stock, low_stock, out_of_stock
    ordering: '-created_at',
  });

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    uom: '',
    cost_price: '',
    selling_price: '',
    min_stock_level: '',
    reorder_quantity: '',
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        page_size: pageSize,
        search: searchTerm,
        ordering: filters.ordering,
      };
      
      if (filters.category) params.category = filters.category;
      if (filters.is_active) params.is_active = filters.is_active;
      
      const [productsRes, categoriesRes, uomsRes] = await Promise.all([
        productsAPI.getProducts(params),
        productsAPI.getCategories(),
        productsAPI.getUOMs(),
      ]);
      
      // Handle paginated response
      const productsData = productsRes.data.results || productsRes.data;
      const categoriesData = categoriesRes.data.results || categoriesRes.data;
      const uomsData = uomsRes.data.results || uomsRes.data;
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setUOMs(Array.isArray(uomsData) ? uomsData : []);
      setTotalItems(productsRes.data.count || productsData.length);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.detail || error.message || 'Failed to load products');
      setProducts([]);
      setCategories([]);
      setUOMs([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };
  
  const handleResetFilters = () => {
    setFilters({
      category: '',
      is_active: '',
      stock_status: '',
      ordering: '-created_at',
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description,
        category: product.category.toString(),
        uom: product.uom.toString(),
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        min_stock_level: product.min_stock_level.toString(),
        reorder_quantity: product.reorder_quantity.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        sku: '',
        name: '',
        description: '',
        category: '',
        uom: '',
        cost_price: '',
        selling_price: '',
        min_stock_level: '0',
        reorder_quantity: '0',
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        category: parseInt(formData.category),
        uom: parseInt(formData.uom),
        cost_price: formData.cost_price,
        selling_price: formData.selling_price,
        min_stock_level: parseInt(formData.min_stock_level),
        reorder_quantity: parseInt(formData.reorder_quantity),
      };

      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.id, payload);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.createProduct(payload);
        toast.success('Product created successfully');
      }

      setShowDialog(false);
      setCurrentPage(1);
      fetchData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsAPI.deleteProduct(id);
      toast.success('Product deleted successfully');
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Apply stock status filter locally
  const filteredProducts = products.filter((product) => {
    if (filters.stock_status === 'low_stock') return product.is_low_stock;
    if (filters.stock_status === 'out_of_stock') return product.total_stock === 0;
    if (filters.stock_status === 'in_stock') return product.total_stock > 0 && !product.is_low_stock;
    return true;
  });

  const totalPages = Math.ceil(totalItems / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <PermissionGuard permission="CREATE_PRODUCT">
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters {showFilters && <X className="ml-2 h-4 w-4" />}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm font-medium mb-2">Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Stock Status</Label>
              <Select
                value={filters.stock_status}
                onValueChange={(value) => setFilters({ ...filters, stock_status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Status</Label>
              <Select
                value={filters.is_active}
                onValueChange={(value) => setFilters({ ...filters, is_active: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Sort By</Label>
              <Select
                value={filters.ordering}
                onValueChange={(value) => setFilters({ ...filters, ordering: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_at">Newest First</SelectItem>
                  <SelectItem value="created_at">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="-name">Name (Z-A)</SelectItem>
                  <SelectItem value="sku">SKU (A-Z)</SelectItem>
                  <SelectItem value="-sku">SKU (Z-A)</SelectItem>
                  <SelectItem value="cost_price">Price (Low-High)</SelectItem>
                  <SelectItem value="-cost_price">Price (High-Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Per Page</Label>
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

            <div className="md:col-span-5 flex gap-2">
              <Button variant="outline" onClick={handleResetFilters} className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UOM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.uom_abbreviation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{parseFloat(product.cost_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{parseFloat(product.selling_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.total_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.min_stock_level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.is_low_stock ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <PermissionGuard permission="EDIT_PRODUCT">
                        <button
                          onClick={() => handleOpenDialog(product)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="DELETE_PRODUCT">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </PermissionGuard>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU *</Label>
                <input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="uom">Unit of Measure *</Label>
                <Select
                  value={formData.uom}
                  onValueChange={(value) =>
                    setFormData({ ...formData, uom: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select UOM" />
                  </SelectTrigger>
                  <SelectContent>
                    {uoms.map((uom) => (
                      <SelectItem key={uom.id} value={uom.id.toString()}>
                        {uom.name} ({uom.abbreviation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cost_price">Cost Price *</Label>
                  <input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) =>
                      setFormData({ ...formData, cost_price: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="selling_price">Selling Price *</Label>
                  <input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) =>
                      setFormData({ ...formData, selling_price: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="min_stock_level">Min Stock Level *</Label>
                  <input
                    id="min_stock_level"
                    type="number"
                    value={formData.min_stock_level}
                    onChange={(e) =>
                      setFormData({ ...formData, min_stock_level: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reorder_quantity">Reorder Quantity *</Label>
                  <input
                    id="reorder_quantity"
                    type="number"
                    value={formData.reorder_quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, reorder_quantity: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
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
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
