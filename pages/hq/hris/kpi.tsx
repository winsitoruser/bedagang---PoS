import { useState, useEffect } from 'react';
import HQLayout from '@/components/hq/HQLayout';
import { 
  Target, TrendingUp, TrendingDown, Award, Users, 
  Building2, Calendar, Filter, Download, ChevronDown,
  AlertCircle, CheckCircle, Clock, BarChart3, PieChart, Eye
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface KPIMetric {
  id: string;
  name: string;
  category: 'sales' | 'operations' | 'customer' | 'financial';
  target: number;
  actual: number;
  unit: string;
  weight: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

interface EmployeeKPI {
  employeeId: string;
  employeeName: string;
  position: string;
  branchName: string;
  department: string;
  overallScore: number;
  overallAchievement: number;
  metrics: KPIMetric[];
  status: 'exceeded' | 'achieved' | 'partial' | 'not_achieved';
  lastUpdated: string;
}

interface BranchKPI {
  branchId: string;
  branchName: string;
  branchCode: string;
  manager: string;
  overallAchievement: number;
  salesKPI: number;
  operationsKPI: number;
  customerKPI: number;
  employeeCount: number;
  topPerformers: number;
  lowPerformers: number;
}

const mockEmployeeKPIs: EmployeeKPI[] = [
  {
    employeeId: '1', employeeName: 'Ahmad Wijaya', position: 'Branch Manager', branchName: 'Cabang Pusat Jakarta', department: 'Operations',
    overallScore: 92, overallAchievement: 104,
    metrics: [
      { id: '1', name: 'Target Penjualan', category: 'sales', target: 1200000000, actual: 1250000000, unit: 'Rp', weight: 40, trend: 'up', period: 'Feb 2026' },
      { id: '2', name: 'Kepuasan Pelanggan', category: 'customer', target: 90, actual: 92, unit: '%', weight: 20, trend: 'up', period: 'Feb 2026' },
      { id: '3', name: 'Efisiensi Operasional', category: 'operations', target: 85, actual: 88, unit: '%', weight: 20, trend: 'stable', period: 'Feb 2026' },
      { id: '4', name: 'Kehadiran Tim', category: 'operations', target: 95, actual: 98, unit: '%', weight: 20, trend: 'up', period: 'Feb 2026' },
    ],
    status: 'exceeded', lastUpdated: '2026-02-22'
  },
  {
    employeeId: '2', employeeName: 'Siti Rahayu', position: 'Branch Manager', branchName: 'Cabang Bandung', department: 'Operations',
    overallScore: 88, overallAchievement: 102,
    metrics: [
      { id: '1', name: 'Target Penjualan', category: 'sales', target: 900000000, actual: 920000000, unit: 'Rp', weight: 40, trend: 'up', period: 'Feb 2026' },
      { id: '2', name: 'Kepuasan Pelanggan', category: 'customer', target: 90, actual: 88, unit: '%', weight: 20, trend: 'down', period: 'Feb 2026' },
      { id: '3', name: 'Efisiensi Operasional', category: 'operations', target: 85, actual: 86, unit: '%', weight: 20, trend: 'stable', period: 'Feb 2026' },
      { id: '4', name: 'Kehadiran Tim', category: 'operations', target: 95, actual: 96, unit: '%', weight: 20, trend: 'up', period: 'Feb 2026' },
    ],
    status: 'exceeded', lastUpdated: '2026-02-22'
  },
  {
    employeeId: '3', employeeName: 'Budi Santoso', position: 'Branch Manager', branchName: 'Cabang Surabaya', department: 'Operations',
    overallScore: 78, overallAchievement: 92,
    metrics: [
      { id: '1', name: 'Target Penjualan', category: 'sales', target: 850000000, actual: 780000000, unit: 'Rp', weight: 40, trend: 'down', period: 'Feb 2026' },
      { id: '2', name: 'Kepuasan Pelanggan', category: 'customer', target: 90, actual: 85, unit: '%', weight: 20, trend: 'down', period: 'Feb 2026' },
      { id: '3', name: 'Efisiensi Operasional', category: 'operations', target: 85, actual: 82, unit: '%', weight: 20, trend: 'down', period: 'Feb 2026' },
      { id: '4', name: 'Kehadiran Tim', category: 'operations', target: 95, actual: 94, unit: '%', weight: 20, trend: 'stable', period: 'Feb 2026' },
    ],
    status: 'partial', lastUpdated: '2026-02-22'
  },
  {
    employeeId: '5', employeeName: 'Eko Prasetyo', position: 'Kasir Senior', branchName: 'Cabang Pusat Jakarta', department: 'Sales',
    overallScore: 90, overallAchievement: 110,
    metrics: [
      { id: '1', name: 'Transaksi Harian', category: 'sales', target: 50, actual: 58, unit: 'transaksi', weight: 30, trend: 'up', period: 'Feb 2026' },
      { id: '2', name: 'Nilai Transaksi', category: 'sales', target: 15000000, actual: 16500000, unit: 'Rp', weight: 30, trend: 'up', period: 'Feb 2026' },
      { id: '3', name: 'Upselling', category: 'sales', target: 10, actual: 12, unit: '%', weight: 20, trend: 'up', period: 'Feb 2026' },
      { id: '4', name: 'Akurasi Kasir', category: 'operations', target: 99, actual: 99.5, unit: '%', weight: 20, trend: 'stable', period: 'Feb 2026' },
    ],
    status: 'exceeded', lastUpdated: '2026-02-22'
  },
];

const mockBranchKPIs: BranchKPI[] = [
  { branchId: '1', branchName: 'Cabang Pusat Jakarta', branchCode: 'HQ-001', manager: 'Ahmad Wijaya', overallAchievement: 104, salesKPI: 104, operationsKPI: 103, customerKPI: 102, employeeCount: 25, topPerformers: 8, lowPerformers: 2 },
  { branchId: '2', branchName: 'Cabang Bandung', branchCode: 'BR-002', manager: 'Siti Rahayu', overallAchievement: 102, salesKPI: 102, operationsKPI: 101, customerKPI: 98, employeeCount: 18, topPerformers: 5, lowPerformers: 3 },
  { branchId: '3', branchName: 'Cabang Surabaya', branchCode: 'BR-003', manager: 'Budi Santoso', overallAchievement: 92, salesKPI: 92, operationsKPI: 96, customerKPI: 94, employeeCount: 15, topPerformers: 3, lowPerformers: 4 },
  { branchId: '4', branchName: 'Cabang Medan', branchCode: 'BR-004', manager: 'Dedi Kurniawan', overallAchievement: 95, salesKPI: 94, operationsKPI: 97, customerKPI: 96, employeeCount: 12, topPerformers: 3, lowPerformers: 2 },
  { branchId: '5', branchName: 'Cabang Yogyakarta', branchCode: 'BR-005', manager: 'Rina Susanti', overallAchievement: 98, salesKPI: 97, operationsKPI: 99, customerKPI: 100, employeeCount: 10, topPerformers: 4, lowPerformers: 1 },
];

export default function KPIDashboard() {
  const [mounted, setMounted] = useState(false);
  const [employeeKPIs, setEmployeeKPIs] = useState<EmployeeKPI[]>([]);
  const [branchKPIs, setBranchKPIs] = useState<BranchKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'employee' | 'branch'>('branch');
  const [periodFilter, setPeriodFilter] = useState('current');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedKPI, setSelectedKPI] = useState<EmployeeKPI | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hq/hris/kpi');
      if (response.ok) {
        const data = await response.json();
        setEmployeeKPIs(data.employeeKPIs || mockEmployeeKPIs);
        setBranchKPIs(data.branchKPIs || mockBranchKPIs);
      } else {
        setEmployeeKPIs(mockEmployeeKPIs);
        setBranchKPIs(mockBranchKPIs);
      }
    } catch (error) {
      setEmployeeKPIs(mockEmployeeKPIs);
      setBranchKPIs(mockBranchKPIs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  if (!mounted) return null;

  const totalEmployees = employeeKPIs.length;
  const exceededCount = employeeKPIs.filter(e => e.status === 'exceeded').length;
  const achievedCount = employeeKPIs.filter(e => e.status === 'achieved').length;
  const partialCount = employeeKPIs.filter(e => e.status === 'partial').length;
  const notAchievedCount = employeeKPIs.filter(e => e.status === 'not_achieved').length;
  const avgAchievement = employeeKPIs.reduce((sum, e) => sum + e.overallAchievement, 0) / totalEmployees || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'exceeded': return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Melampaui</span>;
      case 'achieved': return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Tercapai</span>;
      case 'partial': return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Sebagian</span>;
      case 'not_achieved': return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Tidak Tercapai</span>;
      default: return null;
    }
  };

  const getAchievementColor = (value: number) => {
    if (value >= 100) return 'text-green-600';
    if (value >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (value: number) => {
    if (value >= 100) return 'bg-green-500';
    if (value >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'Rp') {
      return `Rp ${(value / 1000000).toFixed(0)} Jt`;
    }
    return `${value}${unit === '%' ? '%' : ` ${unit}`}`;
  };

  return (
    <HQLayout title="KPI Dashboard" subtitle="Monitoring Key Performance Indicators Karyawan">
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Achievement</p>
                <p className="text-xl font-bold">{avgAchievement.toFixed(0)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Melampaui Target</p>
                <p className="text-xl font-bold">{exceededCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tercapai</p>
                <p className="text-xl font-bold">{achievedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sebagian</p>
                <p className="text-xl font-bold">{partialCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tidak Tercapai</p>
                <p className="text-xl font-bold">{notAchievedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Karyawan</p>
                <p className="text-xl font-bold">{totalEmployees}</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle & Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('branch')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'branch' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                Per Cabang
              </button>
              <button
                onClick={() => setViewMode('employee')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'employee' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Per Karyawan
              </button>
            </div>
            <div className="flex gap-2">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="current">Bulan Ini</option>
                <option value="last">Bulan Lalu</option>
                <option value="quarter">Kuartal Ini</option>
                <option value="year">Tahun Ini</option>
              </select>
              <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Branch KPI View with Charts */}
        {viewMode === 'branch' && (
          <div className="space-y-6">
            {/* KPI Comparison Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Branch Comparison Bar Chart */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-lg mb-4">Perbandingan KPI Cabang</h3>
                {typeof window !== 'undefined' && (
                  <Chart
                    type="bar"
                    height={300}
                    options={{
                      chart: { toolbar: { show: false }, fontFamily: 'inherit' },
                      plotOptions: { bar: { horizontal: false, columnWidth: '60%', borderRadius: 6 } },
                      dataLabels: { enabled: false },
                      xaxis: { categories: branchKPIs.map(b => b.branchName.replace('Cabang ', '')) },
                      yaxis: { max: 120, labels: { formatter: (val: number) => `${val}%` } },
                      colors: ['#3B82F6', '#10B981', '#F59E0B'],
                      legend: { position: 'top' },
                      grid: { borderColor: '#f1f1f1' },
                      tooltip: { y: { formatter: (val: number) => `${val}%` } }
                    }}
                    series={[
                      { name: 'Sales', data: branchKPIs.map(b => b.salesKPI) },
                      { name: 'Operations', data: branchKPIs.map(b => b.operationsKPI) },
                      { name: 'Customer', data: branchKPIs.map(b => b.customerKPI) }
                    ]}
                  />
                )}
              </div>

              {/* Overall Achievement Radar Chart */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-lg mb-4">Radar KPI per Cabang</h3>
                {typeof window !== 'undefined' && (
                  <Chart
                    type="radar"
                    height={300}
                    options={{
                      chart: { toolbar: { show: false }, fontFamily: 'inherit' },
                      xaxis: { categories: ['Sales', 'Operations', 'Customer', 'Overall'] },
                      yaxis: { max: 110 },
                      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
                      markers: { size: 4 },
                      legend: { position: 'bottom' },
                      fill: { opacity: 0.2 }
                    }}
                    series={branchKPIs.map(b => ({
                      name: b.branchName.replace('Cabang ', ''),
                      data: [b.salesKPI, b.operationsKPI, b.customerKPI, b.overallAchievement]
                    }))}
                  />
                )}
              </div>
            </div>

            {/* Branch Cards with Radial Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branchKPIs.map((branch) => (
                <div key={branch.branchId} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{branch.branchName}</h3>
                      <p className="text-sm text-gray-500">{branch.branchCode} • {branch.manager}</p>
                    </div>
                  </div>

                  {/* Radial Bar for Overall Achievement */}
                  <div className="flex items-center justify-center my-4">
                    {typeof window !== 'undefined' && (
                      <Chart
                        type="radialBar"
                        height={180}
                        width={180}
                        options={{
                          chart: { sparkline: { enabled: true } },
                          plotOptions: {
                            radialBar: {
                              startAngle: -135,
                              endAngle: 135,
                              hollow: { size: '60%' },
                              track: { background: '#f1f5f9', strokeWidth: '100%' },
                              dataLabels: {
                                name: { show: true, fontSize: '12px', color: '#6b7280', offsetY: 20 },
                                value: { 
                                  show: true, 
                                  fontSize: '24px', 
                                  fontWeight: 700,
                                  color: branch.overallAchievement >= 100 ? '#10B981' : branch.overallAchievement >= 80 ? '#F59E0B' : '#EF4444',
                                  offsetY: -10,
                                  formatter: (val: number) => `${val}%`
                                }
                              }
                            }
                          },
                          colors: [branch.overallAchievement >= 100 ? '#10B981' : branch.overallAchievement >= 80 ? '#F59E0B' : '#EF4444'],
                          labels: ['Achievement']
                        }}
                        series={[Math.min(branch.overallAchievement, 100)]}
                      />
                    )}
                  </div>

                  {/* Mini Bar Chart for KPI breakdown */}
                  <div className="space-y-2 mt-4">
                    {[
                      { label: 'Sales', value: branch.salesKPI, color: '#3B82F6' },
                      { label: 'Operations', value: branch.operationsKPI, color: '#10B981' },
                      { label: 'Customer', value: branch.customerKPI, color: '#F59E0B' }
                    ].map((kpi) => (
                      <div key={kpi.label} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-20">{kpi.label}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(kpi.value, 100)}%`, backgroundColor: kpi.color }}
                          />
                        </div>
                        <span className={`text-xs font-semibold w-12 text-right ${kpi.value >= 100 ? 'text-green-600' : kpi.value >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {kpi.value}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{branch.employeeCount} staff</span>
                      <span className="text-green-600">{branch.topPerformers} ↑</span>
                      <span className="text-red-600">{branch.lowPerformers} ↓</span>
                    </div>
                    <button className="flex items-center gap-1 text-blue-600 hover:underline">
                      <Eye className="w-4 h-4" /> Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employee KPI View */}
        {viewMode === 'employee' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabang</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Achievement</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metrics</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employeeKPIs.map((emp) => (
                    <tr key={emp.employeeId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{emp.employeeName}</p>
                          <p className="text-sm text-gray-500">{emp.position}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{emp.branchName}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-lg font-bold ${getAchievementColor(emp.overallScore)}`}>
                          {emp.overallScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-lg font-bold ${getAchievementColor(emp.overallAchievement)}`}>
                          {emp.overallAchievement}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(emp.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {emp.metrics.slice(0, 3).map((m, i) => (
                            <span key={i} className={`px-2 py-1 text-xs rounded ${m.actual >= m.target ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {m.name.split(' ')[0]}
                            </span>
                          ))}
                          {emp.metrics.length > 3 && <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">+{emp.metrics.length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => setSelectedKPI(emp)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KPI Detail Modal with Charts */}
        {selectedKPI && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
                <div className="flex justify-between items-start">
                  <div className="text-white">
                    <h3 className="text-xl font-bold">{selectedKPI?.employeeName}</h3>
                    <p className="text-blue-100">{selectedKPI?.position} • {selectedKPI?.branchName}</p>
                  </div>
                  <button onClick={() => setSelectedKPI(null)} className="text-white/70 hover:text-white text-2xl">×</button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Summary Cards with Radial Charts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                    {typeof window !== 'undefined' && (
                      <Chart
                        type="radialBar"
                        height={150}
                        options={{
                          chart: { sparkline: { enabled: true } },
                          plotOptions: {
                            radialBar: {
                              hollow: { size: '65%' },
                              track: { background: '#dbeafe' },
                              dataLabels: {
                                name: { show: false },
                                value: { fontSize: '24px', fontWeight: 700, color: '#2563eb', offsetY: 5 }
                              }
                            }
                          },
                          colors: ['#2563eb']
                        }}
                        series={[selectedKPI?.overallScore || 0]}
                      />
                    )}
                    <p className="text-sm text-gray-600 font-medium">Overall Score</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                    {typeof window !== 'undefined' && (
                      <Chart
                        type="radialBar"
                        height={150}
                        options={{
                          chart: { sparkline: { enabled: true } },
                          plotOptions: {
                            radialBar: {
                              hollow: { size: '65%' },
                              track: { background: '#dcfce7' },
                              dataLabels: {
                                name: { show: false },
                                value: { fontSize: '24px', fontWeight: 700, color: '#16a34a', offsetY: 5, formatter: (val: number) => `${val}%` }
                              }
                            }
                          },
                          colors: ['#16a34a']
                        }}
                        series={[Math.min(selectedKPI?.overallAchievement || 0, 100)]}
                      />
                    )}
                    <p className="text-sm text-gray-600 font-medium">Achievement</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 flex flex-col items-center justify-center">
                    <div className="mb-2">{getStatusBadge(selectedKPI?.status)}</div>
                    <p className="text-sm text-gray-600 font-medium mt-2">Status KPI</p>
                    <p className="text-xs text-gray-400 mt-1">Last updated: {selectedKPI?.lastUpdated}</p>
                  </div>
                </div>

                {/* Metrics Bar Chart */}
                <div className="bg-white border rounded-xl p-4">
                  <h4 className="font-semibold mb-4">KPI Metrics Overview</h4>
                  {typeof window !== 'undefined' && (
                    <Chart
                      type="bar"
                      height={250}
                      options={{
                        chart: { toolbar: { show: false }, fontFamily: 'inherit' },
                        plotOptions: { 
                          bar: { 
                            horizontal: true, 
                            barHeight: '70%', 
                            borderRadius: 6,
                            distributed: true
                          } 
                        },
                        dataLabels: { 
                          enabled: true, 
                          formatter: (val: number) => `${val}%`,
                          style: { fontSize: '12px', fontWeight: 600 }
                        },
                        xaxis: { 
                          categories: selectedKPI?.metrics?.map(m => m.name) || [],
                          max: 120,
                          labels: { formatter: (val: string) => `${val}%` }
                        },
                        colors: selectedKPI?.metrics?.map(m => 
                          (m.actual / m.target) * 100 >= 100 ? '#10B981' : 
                          (m.actual / m.target) * 100 >= 80 ? '#F59E0B' : '#EF4444'
                        ) || [],
                        legend: { show: false },
                        grid: { borderColor: '#f1f1f1', xaxis: { lines: { show: true } } },
                        annotations: {
                          xaxis: [{ x: 100, borderColor: '#10B981', strokeDashArray: 4, label: { text: 'Target', style: { color: '#10B981' } } }]
                        }
                      }}
                      series={[{ data: selectedKPI?.metrics?.map(m => Math.round((m.actual / m.target) * 100)) || [] }]}
                    />
                  )}
                </div>

                {/* Detailed Metrics Cards */}
                <div>
                  <h4 className="font-semibold mb-4">Detail per Metric</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedKPI?.metrics?.map((metric) => {
                      const achievement = (metric.actual / metric.target) * 100;
                      return (
                        <div key={metric.id} className="border rounded-xl p-4 hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-gray-900">{metric.name}</p>
                              <p className="text-xs text-gray-500">Bobot: {metric.weight}% • {metric.category}</p>
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-semibold ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                              {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : metric.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                              {metric.trend}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {typeof window !== 'undefined' && (
                              <Chart
                                type="radialBar"
                                height={80}
                                width={80}
                                options={{
                                  chart: { sparkline: { enabled: true } },
                                  plotOptions: {
                                    radialBar: {
                                      hollow: { size: '50%' },
                                      track: { background: '#f1f5f9' },
                                      dataLabels: {
                                        name: { show: false },
                                        value: { fontSize: '14px', fontWeight: 700, color: achievement >= 100 ? '#10B981' : achievement >= 80 ? '#F59E0B' : '#EF4444', offsetY: 5 }
                                      }
                                    }
                                  },
                                  colors: [achievement >= 100 ? '#10B981' : achievement >= 80 ? '#F59E0B' : '#EF4444']
                                }}
                                series={[Math.min(Math.round(achievement), 100)]}
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Actual</span>
                                <span className="font-medium">{formatValue(metric.actual, metric.unit)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Target</span>
                                <span className="font-medium">{formatValue(metric.target, metric.unit)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export PDF
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit KPI</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </HQLayout>
  );
}
