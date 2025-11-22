import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/services/api';
import { toast } from 'react-toastify';
import { getCurrentUser } from '@/utils/permissions';
import type { UserRole } from '@/utils/permissions';
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  TrendingUp,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface KPIData {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  pending_receipts: number;
  pending_deliveries: number;
  transfers_scheduled: number;
  total_stock_value: number;
}

interface RecentMovement {
  id: number;
  product_name: string;
  product_sku: string;
  movement_type: string;
  quantity: string;
  source_location: string | null;
  destination_location: string | null;
  created_at: string;
  created_by: string;
}

interface MovementTrend {
  date: string;
  receipts: number;
  deliveries: number;
  transfers: number;
  adjustments: number;
  total: number;
}

interface TopProduct {
  name: string;
  sku: string;
  movements: number;
  quantity: string;
}

interface CategoryValue {
  category: string;
  value: number;
  quantity: number;
  products: number;
  [key: string]: string | number;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [movementTrends, setMovementTrends] = useState<MovementTrend[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryValues, setCategoryValues] = useState<CategoryValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);
  
  const user = getCurrentUser();
  const userRole: UserRole = user?.role || 'WAREHOUSE_STAFF';

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDays]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [kpiResponse, movementsResponse] = await Promise.all([
        dashboardAPI.getKPIs(),
        dashboardAPI.getRecentMovements(),
      ]);
      setKpis(kpiResponse.data);
      const movementsData = movementsResponse.data.results || movementsResponse.data;
      const movements = Array.isArray(movementsData) ? movementsData : [];
      setRecentMovements(movements.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setRecentMovements([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMasterData = async () => {
    try {
      const [trendsRes, topProductsRes, categoryValuesRes] = await Promise.all([
        dashboardAPI.getMovementTrends({ days: selectedDays }),
        dashboardAPI.getTopProducts({ limit: 10, days: 30 }),
        dashboardAPI.getStockValueByCategory(),
      ]);
      
      setMovementTrends(trendsRes.data || []);
      setTopProducts(topProductsRes.data || []);
      setCategoryValues(categoryValuesRes.data || []);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const kpiCards = kpis
    ? [
        {
          title: 'Total Products',
          value: kpis.total_products,
          icon: Package,
          color: 'bg-blue-500',
        },
        {
          title: 'Low Stock Items',
          value: kpis.low_stock_count,
          icon: AlertTriangle,
          color: 'bg-red-500',
        },
        {
          title: 'Out of Stock',
          value: kpis.out_of_stock_count,
          icon: AlertTriangle,
          color: 'bg-yellow-500',
        },
        {
          title: 'Pending Receipts',
          value: kpis.pending_receipts,
          icon: ArrowDownToLine,
          color: 'bg-green-500',
        },
        {
          title: 'Pending Deliveries',
          value: kpis.pending_deliveries,
          icon: ArrowUpFromLine,
          color: 'bg-orange-500',
        },
        {
          title: 'Pending Transfers',
          value: kpis.transfers_scheduled,
          icon: ArrowRightLeft,
          color: 'bg-purple-500',
        },
      ]
    : [];

  const getMovementBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      RECEIPT: 'bg-green-100 text-green-800',
      DELIVERY: 'bg-orange-100 text-orange-800',
      TRANSFER: 'bg-purple-100 text-purple-800',
      ADJUSTMENT: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Role-based dashboard content
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'INVENTORY_MANAGER' || isAdmin;
  const isStaff = userRole === 'WAREHOUSE_STAFF';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {isAdmin && 'Administrator Overview - Full System Analytics'}
            {userRole === 'INVENTORY_MANAGER' && 'Inventory Manager Overview - Operations & Stock Analytics'}
            {isStaff && 'Warehouse Staff Overview - Daily Operations'}
          </p>
        </div>
        
        {isManager && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Trend Period:</label>
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Role Based */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Movement Trends Chart - Admin & Manager */}
        {isManager && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Movement Trends</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={movementTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="receipts" stroke="#10b981" name="Receipts" strokeWidth={2} />
                <Line type="monotone" dataKey="deliveries" stroke="#f59e0b" name="Deliveries" strokeWidth={2} />
                <Line type="monotone" dataKey="transfers" stroke="#8b5cf6" name="Transfers" strokeWidth={2} />
                <Line type="monotone" dataKey="adjustments" stroke="#ef4444" name="Adjustments" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Products Chart - Admin & Manager */}
        {isManager && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Top 10 Products by Activity</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="sku" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ fontSize: 12 }}
                  labelFormatter={(value) => `SKU: ${value}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="movements" fill="#3b82f6" name="Total Movements" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stock Value by Category - Admin Only */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Stock Value by Category</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={categoryValues}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.category}: $${props.value.toLocaleString()}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="category"
                >
                  {categoryValues.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Stats Table - Admin Only */}
        {isAdmin && categoryValues.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Statistics</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Products</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryValues.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{cat.category}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 text-right">{cat.products}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 text-right">{cat.quantity.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right font-semibold">${cat.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Movements - All Users */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Stock Movements
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {isManager && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="px-6 py-4 text-center text-gray-500">
                    No recent movements
                  </td>
                </tr>
              ) : (
                recentMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{movement.product_name}</div>
                      <div className="text-xs text-gray-500">{movement.product_sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getMovementBadgeColor(
                          movement.movement_type
                        )}`}
                      >
                        {movement.movement_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.source_location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.destination_location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    {isManager && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {movement.created_by}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
