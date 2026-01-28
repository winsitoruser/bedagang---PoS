import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  FaCashRegister, FaShoppingCart, FaReceipt, FaChartBar, 
  FaHistory, FaClock, FaUsers, FaBoxes, FaArrowUp, FaArrowDown,
  FaDollarSign, FaBox, FaChartLine
} from 'react-icons/fa';

const PosPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '3m' | '6m' | '1y'>('7d');

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pos/dashboard-stats?period=${selectedPeriod}`);
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

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
            <p className="mt-4 text-gray-700">Memuat POS...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const features = [
    {
      title: "Kasir",
      description: "Proses transaksi penjualan dengan cepat",
      icon: FaCashRegister,
      color: "bg-green-500",
      href: "/pos/cashier",
    },
    {
      title: "Transaksi",
      description: "Lihat semua transaksi penjualan",
      icon: FaShoppingCart,
      color: "bg-blue-500",
      href: "/pos/transactions",
    },
    {
      title: "Struk & Invoice",
      description: "Kelola struk dan invoice penjualan",
      icon: FaReceipt,
      color: "bg-purple-500",
      href: "/pos/receipts",
    },
    {
      title: "Laporan Penjualan",
      description: "Analisis dan laporan penjualan",
      icon: FaChartBar,
      color: "bg-orange-500",
      href: "/pos/reports",
    },
    {
      title: "Riwayat Shift",
      description: "Kelola shift kasir dan handover",
      icon: FaClock,
      color: "bg-red-500",
      href: "/pos/shifts",
    },
    {
      title: "Pelanggan",
      description: "Data pelanggan dan loyalty",
      icon: FaUsers,
      color: "bg-indigo-500",
      href: "/customers",
    },
    {
      title: "Stok Produk",
      description: "Kelola stok dan inventory",
      icon: FaBoxes,
      color: "bg-teal-500",
      href: "/inventory",
    },
    {
      title: "Riwayat Transaksi",
      description: "Lihat riwayat transaksi lengkap",
      icon: FaHistory,
      color: "bg-pink-500",
      href: "/pos/history",
    },
  ];


  return (
    <DashboardLayout>
      <Head>
        <title>Point of Sale (POS) | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Point of Sale (POS)</h1>
              <p className="text-green-100">
                Kelola transaksi penjualan dan kasir dengan mudah
              </p>
            </div>
            <FaCashRegister className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Transaksi Hari Ini */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <FaShoppingCart className="w-6 h-6 text-white" />
              </div>
              {dashboardData && dashboardData.changes.transactions !== 0 && (
                <span className={`flex items-center text-sm font-semibold ${
                  dashboardData.changes.transactions > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {dashboardData.changes.transactions > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                  {Math.abs(dashboardData.changes.transactions)}%
                </span>
              )}
            </div>
            <p className="text-sm text-blue-700 font-medium mb-1">Transaksi Hari Ini</p>
            <p className="text-3xl font-bold text-blue-900">
              {loading ? '...' : dashboardData?.today.transactions || 0}
            </p>
          </div>

          {/* Total Penjualan */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <FaDollarSign className="w-6 h-6 text-white" />
              </div>
              {dashboardData && dashboardData.changes.sales !== 0 && (
                <span className={`flex items-center text-sm font-semibold ${
                  dashboardData.changes.sales > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {dashboardData.changes.sales > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                  {Math.abs(dashboardData.changes.sales)}%
                </span>
              )}
            </div>
            <p className="text-sm text-green-700 font-medium mb-1">Total Penjualan</p>
            <p className="text-2xl font-bold text-green-900">
              {loading ? '...' : formatCurrency(dashboardData?.today.sales || 0)}
            </p>
          </div>

          {/* Produk Terjual */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <FaBox className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-purple-700 font-medium mb-1">Produk Terjual</p>
            <p className="text-3xl font-bold text-purple-900">
              {loading ? '...' : dashboardData?.today.items || 0}
            </p>
          </div>

          {/* Rata-rata Transaksi */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg border border-orange-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <FaChartLine className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-orange-700 font-medium mb-1">Rata-rata Transaksi</p>
            <p className="text-2xl font-bold text-orange-900">
              {loading ? '...' : formatCurrency(dashboardData?.today.avgTransaction || 0)}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Trend Penjualan</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedPeriod === '7d' && '7 hari terakhir'}
                  {selectedPeriod === '30d' && '30 hari terakhir'}
                  {selectedPeriod === '3m' && '3 bulan terakhir'}
                  {selectedPeriod === '6m' && '6 bulan terakhir'}
                  {selectedPeriod === '1y' && '1 tahun terakhir'}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FaChartBar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            
            {/* Period Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {[
                { value: '7d' as const, label: '7 Hari' },
                { value: '30d' as const, label: '30 Hari' },
                { value: '3m' as const, label: '3 Bulan' },
                { value: '6m' as const, label: '6 Bulan' },
                { value: '1y' as const, label: '1 Tahun' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedPeriod === period.value
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            <div className="h-72">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full"></div>
                </div>
              ) : dashboardData && dashboardData.salesTrend && dashboardData.salesTrend.length > 0 ? (
                <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {(() => {
                    const data = dashboardData.salesTrend;
                    const maxSales = Math.max(...data.map((d: any) => d.sales));
                    const minSales = Math.min(...data.map((d: any) => d.sales));
                    const range = maxSales - minSales || 1;
                    const width = 800;
                    const height = 300;
                    const padding = 40;
                    const chartWidth = width - padding * 2;
                    const chartHeight = height - padding * 2;
                    
                    const points = data.map((item: any, index: number) => {
                      const x = padding + (index / (data.length - 1)) * chartWidth;
                      const y = padding + chartHeight - ((item.sales - minSales) / range) * chartHeight;
                      return { x, y, sales: item.sales, date: item.date };
                    });
                    
                    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
                    
                    return (
                      <>
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                          <line
                            key={i}
                            x1={padding}
                            y1={padding + chartHeight * ratio}
                            x2={width - padding}
                            y2={padding + chartHeight * ratio}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                        ))}
                        
                        {/* Area */}
                        <path
                          d={areaPath}
                          fill="url(#areaGradient)"
                        />
                        
                        {/* Line */}
                        <path
                          d={linePath}
                          fill="none"
                          stroke="rgb(34, 197, 94)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* Points */}
                        {points.map((point, index) => (
                          <g key={index}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="5"
                              fill="white"
                              stroke="rgb(34, 197, 94)"
                              strokeWidth="2"
                              className="cursor-pointer hover:r-7 transition-all"
                            />
                            <title>
                              {new Date(point.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}: Rp {(point.sales / 1000000).toFixed(1)}Jt
                            </title>
                          </g>
                        ))}
                        
                        {/* Y-axis labels */}
                        {[0, 0.5, 1].map((ratio, i) => {
                          const value = minSales + range * (1 - ratio);
                          return (
                            <text
                              key={i}
                              x={padding - 10}
                              y={padding + chartHeight * ratio}
                              textAnchor="end"
                              fontSize="12"
                              fill="#6b7280"
                              dominantBaseline="middle"
                            >
                              {(value / 1000000).toFixed(1)}Jt
                            </text>
                          );
                        })}
                        
                        {/* X-axis labels */}
                        {points.map((point, index) => {
                          if (index % Math.ceil(points.length / 7) === 0 || index === points.length - 1) {
                            const date = new Date(point.date);
                            const label = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                            return (
                              <text
                                key={index}
                                x={point.x}
                                y={height - padding + 20}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#6b7280"
                              >
                                {label}
                              </text>
                            );
                          }
                          return null;
                        })}
                      </>
                    );
                  })()}
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Tidak ada data
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Metode Pembayaran</h2>
                <p className="text-sm text-gray-500 mt-1">30 hari terakhir</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCashRegister className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="h-80 flex flex-col justify-center">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : dashboardData && dashboardData.paymentMethods ? (
                <div className="space-y-4 px-4">
                  {dashboardData.paymentMethods.map((item: any, index: number) => {
                    const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                    const totalAmount = dashboardData.paymentMethods.reduce((sum: number, p: any) => sum + p.total, 0);
                    const percentage = ((item.total / totalAmount) * 100).toFixed(1);
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">{item.method}</span>
                          <span className="text-gray-600">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`${colors[index % colors.length]} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{item.count} transaksi</span>
                          <span>Rp {(item.total / 1000000).toFixed(1)}Jt</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Tidak ada data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Fitur POS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  href={feature.href}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-sky-300 group"
                >
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        {dashboardData && dashboardData.topProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Produk Terlaris</h2>
                <p className="text-sm text-gray-500 mt-1">7 hari terakhir</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaBoxes className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="space-y-3">
              {dashboardData.topProducts.map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.quantity} unit terjual</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(product.sales)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default PosPage;
