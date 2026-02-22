import React, { useState, useEffect } from 'react';
import HQLayout from '../../components/hq/HQLayout';
import { StatsCard, StatusBadge } from '../../components/hq/ui';
import Modal from '../../components/hq/ui/Modal';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  MapPin,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Bell,
  ChevronRight,
  Store,
  Wallet,
  Box,
  UserCheck,
  Zap,
  Target,
  Award,
  Calendar,
  Eye,
  Edit,
  Check,
  X,
  ExternalLink,
  Settings,
  MoreVertical
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';

interface BranchData {
  id: string;
  code: string;
  name: string;
  type: 'main' | 'branch' | 'warehouse' | 'kiosk';
  city: string;
  province: string;
  isActive: boolean;
  manager: string;
  todaySales: number;
  yesterdaySales: number;
  monthSales: number;
  transactionCount: number;
  avgTicketSize: number;
  stockValue: number;
  lowStockItems: number;
  employeeCount: number;
  activeEmployees: number;
  lastSync: string;
  status: 'online' | 'offline' | 'warning';
  performanceScore: number;
}

interface Alert {
  id: string;
  branchId: string;
  branchName: string;
  type: 'low_stock' | 'high_sales' | 'low_sales' | 'employee' | 'system';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Mock data defined outside component to avoid TDZ issues
const mockBranchesData: BranchData[] = [
    {
      id: '1',
      code: 'HQ-001',
      name: 'Cabang Pusat Jakarta',
      type: 'main',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      isActive: true,
      manager: 'Ahmad Wijaya',
      todaySales: 45000000,
      yesterdaySales: 42000000,
      monthSales: 1250000000,
      transactionCount: 156,
      avgTicketSize: 288462,
      stockValue: 850000000,
      lowStockItems: 5,
      employeeCount: 25,
      activeEmployees: 22,
      lastSync: new Date().toISOString(),
      status: 'online',
      performanceScore: 92
    },
    {
      id: '2',
      code: 'BR-002',
      name: 'Cabang Bandung',
      type: 'branch',
      city: 'Bandung',
      province: 'Jawa Barat',
      isActive: true,
      manager: 'Siti Rahayu',
      todaySales: 32000000,
      yesterdaySales: 35000000,
      monthSales: 920000000,
      transactionCount: 98,
      avgTicketSize: 326531,
      stockValue: 450000000,
      lowStockItems: 12,
      employeeCount: 18,
      activeEmployees: 16,
      lastSync: new Date(Date.now() - 300000).toISOString(),
      status: 'online',
      performanceScore: 85
    },
    {
      id: '3',
      code: 'BR-003',
      name: 'Cabang Surabaya',
      type: 'branch',
      city: 'Surabaya',
      province: 'Jawa Timur',
      isActive: true,
      manager: 'Budi Santoso',
      todaySales: 28500000,
      yesterdaySales: 31000000,
      monthSales: 780000000,
      transactionCount: 87,
      avgTicketSize: 327586,
      stockValue: 380000000,
      lowStockItems: 8,
      employeeCount: 15,
      activeEmployees: 14,
      lastSync: new Date(Date.now() - 600000).toISOString(),
      status: 'online',
      performanceScore: 78
    },
    {
      id: '4',
      code: 'BR-004',
      name: 'Cabang Medan',
      type: 'branch',
      city: 'Medan',
      province: 'Sumatera Utara',
      isActive: true,
      manager: 'Dewi Lestari',
      todaySales: 22000000,
      yesterdaySales: 24500000,
      monthSales: 650000000,
      transactionCount: 72,
      avgTicketSize: 305556,
      stockValue: 320000000,
      lowStockItems: 15,
      employeeCount: 12,
      activeEmployees: 10,
      lastSync: new Date(Date.now() - 1800000).toISOString(),
      status: 'warning',
      performanceScore: 72
    },
    {
      id: '5',
      code: 'BR-005',
      name: 'Cabang Yogyakarta',
      type: 'branch',
      city: 'Yogyakarta',
      province: 'DI Yogyakarta',
      isActive: true,
      manager: 'Eko Prasetyo',
      todaySales: 18500000,
      yesterdaySales: 19000000,
      monthSales: 520000000,
      transactionCount: 65,
      avgTicketSize: 284615,
      stockValue: 280000000,
      lowStockItems: 3,
      employeeCount: 10,
      activeEmployees: 10,
      lastSync: new Date(Date.now() - 120000).toISOString(),
      status: 'online',
      performanceScore: 88
    },
    {
      id: '6',
      code: 'WH-001',
      name: 'Gudang Pusat Cikarang',
      type: 'warehouse',
      city: 'Cikarang',
      province: 'Jawa Barat',
      isActive: true,
      manager: 'Hendra Kusuma',
      todaySales: 0,
      yesterdaySales: 0,
      monthSales: 0,
      transactionCount: 45,
      avgTicketSize: 0,
      stockValue: 2500000000,
      lowStockItems: 22,
      employeeCount: 35,
      activeEmployees: 30,
      lastSync: new Date(Date.now() - 60000).toISOString(),
      status: 'online',
      performanceScore: 95
    },
    {
      id: '7',
      code: 'KS-001',
      name: 'Kiosk Mall Taman Anggrek',
      type: 'kiosk',
      city: 'Jakarta Barat',
      province: 'DKI Jakarta',
      isActive: true,
      manager: 'Linda Susanti',
      todaySales: 8500000,
      yesterdaySales: 9200000,
      monthSales: 245000000,
      transactionCount: 45,
      avgTicketSize: 188889,
      stockValue: 85000000,
      lowStockItems: 2,
      employeeCount: 4,
      activeEmployees: 3,
      lastSync: new Date(Date.now() - 180000).toISOString(),
      status: 'online',
      performanceScore: 82
    },
    {
      id: '8',
      code: 'BR-006',
      name: 'Cabang Semarang',
      type: 'branch',
      city: 'Semarang',
      province: 'Jawa Tengah',
      isActive: false,
      manager: 'Agus Hermawan',
      todaySales: 0,
      yesterdaySales: 15000000,
      monthSales: 380000000,
      transactionCount: 0,
      avgTicketSize: 0,
      stockValue: 220000000,
      lowStockItems: 0,
      employeeCount: 8,
      activeEmployees: 0,
      lastSync: new Date(Date.now() - 7200000).toISOString(),
      status: 'offline',
      performanceScore: 0
    }
];

const mockAlertsData: Alert[] = [
    {
      id: '1',
      branchId: '4',
      branchName: 'Cabang Medan',
      type: 'low_stock',
      message: '15 produk mencapai batas minimum stok',
      severity: 'warning',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: '2',
      branchId: '8',
      branchName: 'Cabang Semarang',
      type: 'system',
      message: 'Tidak ada koneksi selama 2 jam terakhir',
      severity: 'critical',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '3',
      branchId: '1',
      branchName: 'Cabang Pusat Jakarta',
      type: 'high_sales',
      message: 'Penjualan hari ini meningkat 25% dari rata-rata',
      severity: 'info',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '4',
      branchId: '6',
      branchName: 'Gudang Pusat Cikarang',
      type: 'low_stock',
      message: '22 produk perlu restocking segera',
      severity: 'warning',
      timestamp: new Date(Date.now() - 5400000).toISOString()
    }
];

interface SalesTrendData {
  date: string;
  day: string;
  sales: number;
  transactions: number;
}

interface RegionData {
  region: string;
  sales: number;
  branches: number;
}

export default function HQDashboard() {
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [salesTrendData, setSalesTrendData] = useState<SalesTrendData[]>([]);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Interactive state
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [selectedBranchData, setSelectedBranchData] = useState<BranchData | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hq/dashboard?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches || mockBranchesData);
        setAlerts(data.alerts || mockAlertsData);
        if (data.salesTrend) {
          setSalesTrendData(data.salesTrend.map((t: SalesTrendData) => ({
            ...t,
            sales: t.sales / 1000000 // Convert to millions for chart
          })));
        }
        if (data.regionPerformance) {
          setRegionData(data.regionPerformance.map((r: RegionData) => ({
            ...r,
            sales: r.sales / 1000000 // Convert to millions
          })));
        }
      } else {
        setBranches(mockBranchesData);
        setAlerts(mockAlertsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setBranches(mockBranchesData);
      setAlerts(mockAlertsData);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const handleViewBranch = (branch: BranchData) => {
    setSelectedBranchData(branch);
    setShowBranchModal(true);
  };

  const handleEditBranch = (branch: BranchData) => {
    window.location.href = `/hq/branches/${branch.id}/edit`;
  };

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowAlertModal(true);
  };

  const handleDismissAlert = async (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setShowAlertModal(false);
  };

  const handleResolveAlert = async (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setShowAlertModal(false);
  };

  if (!mounted) {
    return null;
  }

  // Calculate totals
  const activeBranches = branches.filter(b => b.isActive && b.type !== 'warehouse');
  const totalSalesToday = activeBranches.reduce((sum, b) => sum + b.todaySales, 0);
  const totalSalesYesterday = activeBranches.reduce((sum, b) => sum + b.yesterdaySales, 0);
  const totalSalesMonth = activeBranches.reduce((sum, b) => sum + b.monthSales, 0);
  const totalTransactions = activeBranches.reduce((sum, b) => sum + b.transactionCount, 0);
  const totalStockValue = branches.reduce((sum, b) => sum + b.stockValue, 0);
  const totalLowStockItems = branches.reduce((sum, b) => sum + b.lowStockItems, 0);
  const totalEmployees = branches.reduce((sum, b) => sum + b.employeeCount, 0);
  const totalActiveEmployees = branches.reduce((sum, b) => sum + b.activeEmployees, 0);
  const avgPerformance = activeBranches.length > 0 
    ? Math.round(activeBranches.reduce((sum, b) => sum + b.performanceScore, 0) / activeBranches.length)
    : 0;

  const salesGrowth = totalSalesYesterday > 0 
    ? ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday * 100).toFixed(1)
    : '0';

  // Chart data
  const branchSalesData = activeBranches
    .filter(b => b.type !== 'warehouse')
    .map(b => ({
      name: b.name.replace('Cabang ', '').replace('Kiosk ', ''),
      sales: b.todaySales / 1000000,
      transactions: b.transactionCount
    }))
    .sort((a, b) => b.sales - a.sales);

  const branchTypeData = [
    { name: 'Cabang Utama', value: branches.filter(b => b.type === 'main').length },
    { name: 'Cabang', value: branches.filter(b => b.type === 'branch').length },
    { name: 'Gudang', value: branches.filter(b => b.type === 'warehouse').length },
    { name: 'Kiosk', value: branches.filter(b => b.type === 'kiosk').length }
  ].filter(d => d.value > 0);

  // Use API data if available, otherwise use defaults
  const fallbackSalesTrend = [
    { day: 'Sen', sales: 125 },
    { day: 'Sel', sales: 142 },
    { day: 'Rab', sales: 138 },
    { day: 'Kam', sales: 155 },
    { day: 'Jum', sales: 162 },
    { day: 'Sab', sales: 185 },
    { day: 'Min', sales: 154 }
  ];

  const fallbackRegionData = [
    { region: 'DKI Jakarta', sales: 53.5, branches: 2 },
    { region: 'Jawa Barat', sales: 32, branches: 2 },
    { region: 'Jawa Timur', sales: 28.5, branches: 1 },
    { region: 'Sumatera Utara', sales: 22, branches: 1 },
    { region: 'DI Yogyakarta', sales: 18.5, branches: 1 }
  ];

  const chartSalesTrend = salesTrendData.length > 0 ? salesTrendData : fallbackSalesTrend;
  const chartRegionData = regionData.length > 0 ? regionData : fallbackRegionData;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)}M`;
    } else if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}Jt`;
    } else if (value >= 1000) {
      return `Rp ${(value / 1000).toFixed(0)}rb`;
    }
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <Package className="w-4 h-4" />;
      case 'high_sales': return <TrendingUp className="w-4 h-4" />;
      case 'low_sales': return <TrendingDown className="w-4 h-4" />;
      case 'employee': return <Users className="w-4 h-4" />;
      case 'system': return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'main': return 'Pusat';
      case 'branch': return 'Cabang';
      case 'warehouse': return 'Gudang';
      case 'kiosk': return 'Kiosk';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-purple-100 text-purple-800';
      case 'branch': return 'bg-blue-100 text-blue-800';
      case 'warehouse': return 'bg-orange-100 text-orange-800';
      case 'kiosk': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <HQLayout title="HQ Dashboard" subtitle="Monitor aktivitas bisnis seluruh cabang">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Update terakhir: {lastUpdated ? lastUpdated.toLocaleTimeString('id-ID') : '-'}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Sales Today */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${parseFloat(salesGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(salesGrowth) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(parseFloat(salesGrowth))}%
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Penjualan Hari Ini</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSalesToday)}</p>
            <p className="text-xs text-gray-500 mt-2">Kemarin: {formatCurrency(totalSalesYesterday)}</p>
          </div>

          {/* Total Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <Activity className="w-4 h-4" />
                Live
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Transaksi</h3>
            <p className="text-2xl font-bold text-gray-900">{totalTransactions.toLocaleString('id-ID')}</p>
            <p className="text-xs text-gray-500 mt-2">Rata-rata: {formatCurrency(totalSalesToday / (totalTransactions || 1))}/trx</p>
          </div>

          {/* Total Stock Value */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              {totalLowStockItems > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  {totalLowStockItems} low stock
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Nilai Total Stok</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStockValue)}</p>
            <p className="text-xs text-gray-500 mt-2">Di {branches.length} lokasi</p>
          </div>

          {/* Branch Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Store className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {branches.filter(b => b.status === 'online').length}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  {branches.filter(b => b.status === 'warning').length}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {branches.filter(b => b.status === 'offline').length}
                </span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status Cabang</h3>
            <p className="text-2xl font-bold text-gray-900">{branches.filter(b => b.isActive).length}/{branches.length}</p>
            <p className="text-xs text-gray-500 mt-2">Cabang aktif dari total</p>
          </div>
        </div>

        {/* Second Row - Performance & Employees */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Average Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Performa Rata-rata</h3>
            <p className="text-2xl font-bold text-gray-900">{avgPerformance}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${avgPerformance}%` }}
              ></div>
            </div>
          </div>

          {/* Top Performing Branch */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Cabang Terbaik</h3>
            <p className="text-lg font-bold text-gray-900">
              {activeBranches.sort((a, b) => b.performanceScore - a.performanceScore)[0]?.name || '-'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Skor: {activeBranches.sort((a, b) => b.performanceScore - a.performanceScore)[0]?.performanceScore || 0}%
            </p>
          </div>

          {/* Total Employees */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-100 rounded-xl">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Karyawan</h3>
            <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
            <p className="text-xs text-gray-500 mt-2">{totalActiveEmployees} aktif hari ini</p>
          </div>

          {/* Month Sales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <Wallet className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Penjualan Bulan Ini</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSalesMonth)}</p>
            <p className="text-xs text-gray-500 mt-2">Target: Rp 5M</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Sales by Branch Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Penjualan per Cabang</h3>
                <p className="text-sm text-gray-500">Perbandingan penjualan hari ini (dalam juta)</p>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchSalesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tickFormatter={(v) => `${v}Jt`} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`Rp ${value.toFixed(1)} Juta`, 'Penjualan']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  />
                  <Bar dataKey="sales" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Branch Type Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Distribusi Tipe</h3>
                <p className="text-sm text-gray-500">Komposisi tipe lokasi</p>
              </div>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={branchTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {branchTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sales Trend & Region Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Sales Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tren Penjualan Mingguan</h3>
                <p className="text-sm text-gray-500">Total penjualan 7 hari terakhir (dalam juta)</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSalesTrend}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(v) => `${v}Jt`} />
                  <Tooltip formatter={(value: number) => [`Rp ${value} Juta`, 'Penjualan']} />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Region Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Performa per Wilayah</h3>
                <p className="text-sm text-gray-500">Penjualan hari ini berdasarkan wilayah</p>
              </div>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {chartRegionData.map((region, index) => (
                <div key={region.region} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-700 truncate">{region.region}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(region.sales / (chartRegionData[0]?.sales || 1)) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold text-gray-900">
                    Rp {region.sales}Jt
                  </div>
                  <div className="w-16 text-right text-xs text-gray-500">
                    {region.branches} cabang
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Branch List & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branch List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Daftar Cabang</h3>
                  <p className="text-sm text-gray-500">Status dan performa real-time</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="main">Pusat</option>
                    <option value="branch">Cabang</option>
                    <option value="warehouse">Gudang</option>
                    <option value="kiosk">Kiosk</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cabang</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Penjualan</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transaksi</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Performa</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {branches
                    .filter(b => selectedBranch === 'all' || b.type === selectedBranch)
                    .map((branch) => (
                    <tr key={branch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(branch.status)}`}></div>
                          <div>
                            <div className="font-medium text-gray-900">{branch.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadgeColor(branch.type)}`}>
                                {getTypeLabel(branch.type)}
                              </span>
                              <span className="text-xs text-gray-500">{branch.city}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            branch.status === 'online' ? 'bg-green-100 text-green-800' :
                            branch.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {branch.status === 'online' ? 'Online' : branch.status === 'warning' ? 'Warning' : 'Offline'}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            Sync: {new Date(branch.lastSync).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(branch.todaySales)}</div>
                        <div className={`flex items-center justify-end gap-1 text-xs mt-1 ${
                          branch.todaySales >= branch.yesterdaySales ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {branch.todaySales >= branch.yesterdaySales ? 
                            <ArrowUpRight className="w-3 h-3" /> : 
                            <ArrowDownRight className="w-3 h-3" />
                          }
                          {branch.yesterdaySales > 0 ? 
                            Math.abs(((branch.todaySales - branch.yesterdaySales) / branch.yesterdaySales * 100)).toFixed(1) : 0
                          }%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-gray-900">{branch.transactionCount}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {branch.lowStockItems > 0 && (
                            <span className="text-red-600">{branch.lowStockItems} low stock</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90">
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                fill="none"
                                stroke="#E5E7EB"
                                strokeWidth="4"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                fill="none"
                                stroke={branch.performanceScore >= 80 ? '#10B981' : branch.performanceScore >= 60 ? '#F59E0B' : '#EF4444'}
                                strokeWidth="4"
                                strokeDasharray={`${branch.performanceScore * 1.256} 126`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                              {branch.performanceScore}%
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
                  <p className="text-sm text-gray-500">{alerts.length} notifikasi aktif</p>
                </div>
                <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5 text-gray-500" />
                  {alerts.filter(a => a.severity === 'critical').length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {alerts.filter(a => a.severity === 'critical').length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Tidak ada alert</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.branchName}</p>
                        <p className="text-sm mt-1">{alert.message}</p>
                        <p className="text-xs mt-2 opacity-75">
                          {new Date(alert.timestamp).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                Lihat Semua Alert
              </button>
            </div>
          </div>
        </div>

      {/* Branch Detail Modal */}
      <Modal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        title={selectedBranchData?.name || 'Detail Cabang'}
        subtitle={selectedBranchData?.code}
        size="xl"
        footer={
          <div className="flex justify-between">
            <button
              onClick={() => setShowBranchModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tutup
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(`/hq/branches/${selectedBranchData?.id}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ExternalLink className="w-4 h-4" />
                Buka di Tab Baru
              </button>
              <button
                onClick={() => handleEditBranch(selectedBranchData!)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit Cabang
              </button>
            </div>
          </div>
        }
      >
        {selectedBranchData && (
          <div className="space-y-6">
            {/* Branch Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Informasi Cabang</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <StatusBadge status={selectedBranchData.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipe</span>
                    <span className="font-medium">{getTypeLabel(selectedBranchData.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lokasi</span>
                    <span className="font-medium">{selectedBranchData.city}, {selectedBranchData.province}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Manager</span>
                    <span className="font-medium">{selectedBranchData.manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sinkronisasi Terakhir</span>
                    <span className="font-medium">{new Date(selectedBranchData.lastSync).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Performa Score</h4>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                      <circle 
                        cx="48" cy="48" r="40" 
                        stroke={selectedBranchData.performanceScore >= 80 ? '#10B981' : selectedBranchData.performanceScore >= 60 ? '#F59E0B' : '#EF4444'} 
                        strokeWidth="8" 
                        fill="none"
                        strokeDasharray={`${selectedBranchData.performanceScore * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{selectedBranchData.performanceScore}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`text-lg font-semibold ${
                      selectedBranchData.performanceScore >= 80 ? 'text-green-600' : 
                      selectedBranchData.performanceScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedBranchData.performanceScore >= 80 ? 'Sangat Baik' : 
                       selectedBranchData.performanceScore >= 60 ? 'Cukup Baik' : 'Perlu Perbaikan'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Berdasarkan penjualan, stok, dan aktivitas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600">Penjualan Hari Ini</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(selectedBranchData.todaySales)}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {selectedBranchData.todaySales > selectedBranchData.yesterdaySales ? '↑' : '↓'} 
                  {Math.abs(((selectedBranchData.todaySales - selectedBranchData.yesterdaySales) / selectedBranchData.yesterdaySales * 100)).toFixed(1)}% dari kemarin
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600">Transaksi</p>
                <p className="text-xl font-bold text-green-900">{selectedBranchData.transactionCount}</p>
                <p className="text-xs text-green-600 mt-1">Hari ini</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600">Rata-rata Ticket</p>
                <p className="text-xl font-bold text-purple-900">{formatCurrency(selectedBranchData.avgTicketSize)}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-600">Stok Rendah</p>
                <p className="text-xl font-bold text-orange-900">{selectedBranchData.lowStockItems}</p>
                <p className="text-xs text-orange-600 mt-1">Item perlu restock</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Aksi Cepat</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => window.location.href = `/hq/reports/sales?branch=${selectedBranchData.id}`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <BarChart3 className="w-4 h-4" />
                  Lihat Laporan Penjualan
                </button>
                <button 
                  onClick={() => window.location.href = `/hq/requisitions?branch=${selectedBranchData.id}`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <Package className="w-4 h-4" />
                  Lihat Internal Requisition
                </button>
                <button 
                  onClick={() => window.location.href = `/hq/users?branch=${selectedBranchData.id}`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <Users className="w-4 h-4" />
                  Kelola Karyawan
                </button>
                <button 
                  onClick={() => window.location.href = `/hq/branches/${selectedBranchData.id}/settings`}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan Cabang
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Alert Detail Modal */}
      <Modal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Detail Alert"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleDismissAlert(selectedAlert?.id || '')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Abaikan
            </button>
            <button
              onClick={() => handleResolveAlert(selectedAlert?.id || '')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              Tandai Selesai
            </button>
          </div>
        }
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${getSeverityColor(selectedAlert.severity)}`}>
              <div className="flex items-center gap-3">
                {getAlertIcon(selectedAlert.type)}
                <div>
                  <p className="font-medium">{selectedAlert.message}</p>
                  <p className="text-sm opacity-75">{selectedAlert.branchName}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Tipe</span>
                <span className="font-medium capitalize">{selectedAlert.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Severity</span>
                <StatusBadge status={selectedAlert.severity} />
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Waktu</span>
                <span className="font-medium">{new Date(selectedAlert.timestamp).toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Aksi yang Disarankan</h4>
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                {selectedAlert.type === 'low_stock' && 'Buat Internal Requisition untuk restock item yang stoknya rendah.'}
                {selectedAlert.type === 'low_sales' && 'Tinjau strategi penjualan cabang dan jadwalkan evaluasi dengan manager.'}
                {selectedAlert.type === 'high_sales' && 'Pastikan stok mencukupi untuk memenuhi permintaan tinggi.'}
                {selectedAlert.type === 'employee' && 'Hubungi manager cabang untuk mengatasi masalah kepegawaian.'}
                {selectedAlert.type === 'system' && 'Hubungi tim IT untuk menyelesaikan masalah teknis.'}
              </div>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </HQLayout>
  );
}
