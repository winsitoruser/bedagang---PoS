import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  FaChartBar, FaCalendar, FaDownload, FaPrint,
  FaArrowUp, FaArrowDown, FaShoppingCart, FaMoneyBillWave
} from 'react-icons/fa';

const ReportsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dateRange, setDateRange] = useState('today');

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat Laporan...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const salesData = [
    { period: "00:00 - 06:00", sales: 1200000, transactions: 8 },
    { period: "06:00 - 12:00", sales: 4500000, transactions: 32 },
    { period: "12:00 - 18:00", sales: 6800000, transactions: 58 },
    { period: "18:00 - 24:00", sales: 3200000, transactions: 28 },
  ];

  const topProducts = [
    { name: "Produk A", sold: 145, revenue: 2900000 },
    { name: "Produk B", sold: 128, revenue: 2560000 },
    { name: "Produk C", sold: 98, revenue: 1960000 },
    { name: "Produk D", sold: 87, revenue: 1740000 },
    { name: "Produk E", sold: 76, revenue: 1520000 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Laporan Penjualan | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Laporan Penjualan</h1>
              <p className="text-orange-100">
                Analisis dan laporan penjualan lengkap
              </p>
            </div>
            <FaChartBar className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button 
                onClick={() => setDateRange('today')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateRange === 'today' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hari Ini
              </button>
              <button 
                onClick={() => setDateRange('week')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateRange === 'week' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Minggu Ini
              </button>
              <button 
                onClick={() => setDateRange('month')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateRange === 'month' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bulan Ini
              </button>
              <button 
                onClick={() => setDateRange('custom')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateRange === 'custom' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaCalendar className="inline mr-2" />
                Custom
              </button>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FaPrint className="text-gray-600" />
                <span className="text-gray-700">Cetak</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <FaDownload />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="w-6 h-6 text-green-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <FaArrowUp className="mr-1" /> 12%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Penjualan</p>
            <p className="text-2xl font-bold text-gray-900">Rp 15.7 Jt</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <FaArrowUp className="mr-1" /> 8%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Transaksi</p>
            <p className="text-2xl font-bold text-gray-900">126</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaChartBar className="w-6 h-6 text-purple-600" />
              </div>
              <span className="flex items-center text-red-600 text-sm font-medium">
                <FaArrowDown className="mr-1" /> 2%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Rata-rata Transaksi</p>
            <p className="text-2xl font-bold text-gray-900">Rp 125K</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <FaArrowUp className="mr-1" /> 15%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Produk Terjual</p>
            <p className="text-2xl font-bold text-gray-900">534</p>
          </div>
        </div>

        {/* Sales by Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Penjualan per Periode Waktu</h2>
          <div className="space-y-4">
            {salesData.map((data, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600">{data.period}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-full flex items-center justify-end pr-3"
                        style={{ width: `${(data.sales / 7000000) * 100}%` }}
                      >
                        <span className="text-white text-xs font-medium">
                          {formatCurrency(data.sales)}
                        </span>
                      </div>
                    </div>
                    <div className="w-24 text-sm text-gray-600 text-right">
                      {data.transactions} trx
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Produk Terlaris</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peringkat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terjual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{product.sold} unit</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(product.revenue)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
