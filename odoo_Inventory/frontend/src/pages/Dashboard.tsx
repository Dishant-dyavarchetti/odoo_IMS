import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/services/api';
import { toast } from 'react-toastify';
import {
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface KPIData {
  total_products: number;
  low_stock_items: number;
  pending_receipts: number;
  pending_deliveries: number;
  pending_transfers: number;
  total_warehouses: number;
  total_locations: number;
}

interface RecentMovement {
  id: number;
  product_name: string;
  movement_type: string;
  quantity: number;
  location_from: string | null;
  location_to: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [kpiResponse, movementsResponse] = await Promise.all([
        dashboardAPI.getKPIs(),
        dashboardAPI.getRecentMovements(),
      ]);
      setKpis(kpiResponse.data);
      setRecentMovements(movementsResponse.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
          value: kpis.low_stock_items,
          icon: AlertTriangle,
          color: 'bg-red-500',
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
          value: kpis.pending_transfers,
          icon: ArrowRightLeft,
          color: 'bg-purple-500',
        },
        {
          title: 'Warehouses',
          value: kpis.total_warehouses,
          icon: TrendingUp,
          color: 'bg-indigo-500',
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your inventory system</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
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

      {/* Recent Movements */}
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No recent movements
                  </td>
                </tr>
              ) : (
                recentMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {movement.product_name}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.location_from || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.location_to || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
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
