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
  DollarSign,
  Activity,
  ShoppingCart,
  Warehouse,
} from 'lucide-react';
import {
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
  Area,
  AreaChart,
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

// Custom tooltip for better UX
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
  }, []);

  useEffect(() => {
    if (kpis) {
      fetchMasterData();
    }
  }, [selectedDays, kpis]);

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
      
      const trends = trendsRes.data || [];
      const products = topProductsRes.data || [];
      const categories = categoryValuesRes.data || [];
      
      setMovementTrends(Array.isArray(trends) ? trends : []);
      setTopProducts(Array.isArray(products) ? products : []);
      setCategoryValues(Array.isArray(categories) ? categories : []);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast.error('Failed to load chart data');
      setMovementTrends([]);
      setTopProducts([]);
      setCategoryValues([]);
    }
  };

  const kpiCards = kpis
    ? [
        {
          title: 'Total Products',
          value: kpis.total_products,
          icon: Package,
          color: 'bg-gradient-to-br from-blue-500 to-blue-600',
          textColor: 'text-blue-600',
          bgLight: 'bg-blue-50',
          change: '+12%',
          trend: 'up',
        },
        {
          title: 'Stock Value',
          value: `$${kpis.total_stock_value.toLocaleString()}`,
          icon: DollarSign,
          color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
          textColor: 'text-emerald-600',
          bgLight: 'bg-emerald-50',
          change: '+8%',
          trend: 'up',
        },
        {
          title: 'Low Stock Items',
          value: kpis.low_stock_count,
          icon: AlertTriangle,
          color: 'bg-gradient-to-br from-amber-500 to-amber-600',
          textColor: 'text-amber-600',
          bgLight: 'bg-amber-50',
          change: '-3%',
          trend: 'down',
        },
        {
          title: 'Out of Stock',
          value: kpis.out_of_stock_count,
          icon: AlertTriangle,
          color: 'bg-gradient-to-br from-red-500 to-red-600',
          textColor: 'text-red-600',
          bgLight: 'bg-red-50',
          change: '-5%',
          trend: 'down',
        },
        {
          title: 'Pending Receipts',
          value: kpis.pending_receipts,
          icon: ArrowDownToLine,
          color: 'bg-gradient-to-br from-green-500 to-green-600',
          textColor: 'text-green-600',
          bgLight: 'bg-green-50',
          change: '+15%',
          trend: 'up',
        },
        {
          title: 'Pending Deliveries',
          value: kpis.pending_deliveries,
          icon: ArrowUpFromLine,
          color: 'bg-gradient-to-br from-orange-500 to-orange-600',
          textColor: 'text-orange-600',
          bgLight: 'bg-orange-50',
          change: '+7%',
          trend: 'up',
        },
        {
          title: 'Pending Transfers',
          value: kpis.transfers_scheduled,
          icon: ArrowRightLeft,
          color: 'bg-gradient-to-br from-purple-500 to-purple-600',
          textColor: 'text-purple-600',
          bgLight: 'bg-purple-50',
          change: '+2%',
          trend: 'up',
        },
        {
          title: 'Total Movements',
          value: movementTrends.reduce((sum, t) => sum + t.total, 0),
          icon: Activity,
          color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
          textColor: 'text-cyan-600',
          bgLight: 'bg-cyan-50',
          change: '+20%',
          trend: 'up',
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
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 -mx-8 -mt-8 px-8 pt-8 pb-12 mb-8">
        <div className="flex items-center justify-between text-white">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-blue-100 text-sm">
              {isAdmin && '👑 Administrator Overview - Full System Analytics'}
              {userRole === 'INVENTORY_MANAGER' && '📊 Inventory Manager Overview - Operations & Stock Analytics'}
              {isStaff && '📦 Warehouse Staff Overview - Daily Operations'}
            </p>
          </div>
          
          {isManager && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Warehouse className="h-5 w-5" />
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(Number(e.target.value))}
                className="bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer"
              >
                <option value={7} className="text-gray-900">Last 7 days</option>
                <option value={14} className="text-gray-900">Last 14 days</option>
                <option value={30} className="text-gray-900">Last 30 days</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards - Enhanced Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgLight} rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.color} p-3 rounded-xl shadow-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                {card.change && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    card.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    <TrendingUp className={`h-3 w-3 ${card.trend === 'down' && 'rotate-180'}`} />
                    {card.change}
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor} group-hover:scale-105 transition-transform`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Enhanced Modern Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Movement Trends Chart - Admin & Manager */}
        {isManager && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Movement Trends</h2>
                  <p className="text-xs text-gray-500">Stock movement over time</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={movementTrends}>
                <defs>
                  <linearGradient id="colorReceipts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                <Area type="monotone" dataKey="receipts" stroke="#10b981" fillOpacity={1} fill="url(#colorReceipts)" name="Receipts" strokeWidth={2} />
                <Area type="monotone" dataKey="deliveries" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDeliveries)" name="Deliveries" strokeWidth={2} />
                <Area type="monotone" dataKey="transfers" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTransfers)" name="Transfers" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Products Chart - Admin & Manager */}
        {isManager && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Top Products</h2>
                  <p className="text-xs text-gray-500">Most active items</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topProducts} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="sku" 
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                <Bar dataKey="movements" fill="url(#barGradient)" name="Total Movements" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stock Value by Category - Admin Only */}
        {isAdmin && categoryValues.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Stock Value Distribution</h2>
                  <p className="text-xs text-gray-500">By category</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <RechartsPie>
                <Pie
                  data={categoryValues}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(props: any) => `${props.category}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="category"
                >
                  {categoryValues.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Stats Table - Admin Only */}
        {isAdmin && categoryValues.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Category Statistics</h2>
                <p className="text-xs text-gray-500">Detailed breakdown</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Products</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categoryValues.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                          <span className="text-sm font-medium text-gray-900">{cat.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{cat.products}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{cat.quantity.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">${cat.value.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-gray-900">Total</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{categoryValues.reduce((sum, c) => sum + c.products, 0)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{categoryValues.reduce((sum, c) => sum + c.quantity, 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">${categoryValues.reduce((sum, c) => sum + c.value, 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Movements - All Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Stock Movements</h2>
              <p className="text-xs text-gray-500">Latest inventory transactions</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                {isManager && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="h-12 w-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">No recent movements</p>
                      <p className="text-xs text-gray-400">Stock movements will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentMovements.map((movement, idx) => (
                  <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{movement.product_name}</div>
                          <div className="text-xs text-gray-500 font-mono">{movement.product_sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg ${getMovementBadgeColor(
                          movement.movement_type
                        )}`}
                      >
                        {movement.movement_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                        {movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {movement.source_location || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {movement.destination_location || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    {isManager && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {movement.created_by}
                        </span>
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
