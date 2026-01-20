import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { 
  FaChartLine, FaBoxOpen, FaShoppingCart, FaUsers, FaMoneyBillWave, 
  FaArrowUp, FaArrowDown, FaSpinner, FaWarehouse,
  FaReceipt, FaClock, FaCalendarAlt, FaChartBar, FaChartPie,
  FaExclamationTriangle, FaBell, FaStar, FaTicketAlt
} from "react-icons/fa";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const Dashboard: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <FaSpinner className="animate-spin h-12 w-12 mx-auto text-sky-600" />
            <p className="mt-4 text-gray-700">Memuat dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Total Penjualan Hari Ini",
      value: "Rp 45.2 Juta",
      change: "+12.5%",
      changeText: "vs kemarin",
      isPositive: true,
      icon: FaMoneyBillWave,
      gradient: "from-green-500 to-emerald-600",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Transaksi Hari Ini",
      value: "156",
      change: "+8.2%",
      changeText: "vs kemarin",
      isPositive: true,
      icon: FaShoppingCart,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Produk Terjual",
      value: "342",
      change: "+15.3%",
      changeText: "vs kemarin",
      isPositive: true,
      icon: FaBoxOpen,
      gradient: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Pelanggan Aktif",
      value: "1,234",
      change: "+5.8%",
      changeText: "bulan ini",
      isPositive: true,
      icon: FaUsers,
      gradient: "from-orange-500 to-orange-600",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  const quickStats = [
    { label: "Rata-rata Transaksi", value: "Rp 289.743", icon: FaReceipt },
    { label: "Stok Menipis", value: "12 Produk", icon: FaWarehouse, alert: true },
    { label: "Pending Orders", value: "8", icon: FaClock },
  ];

  const topProducts = [
    { name: "Kopi Arabica 250g", sold: 45, revenue: "Rp 2.250.000", trend: "+12%" },
    { name: "Teh Hijau Premium", sold: 38, revenue: "Rp 1.520.000", trend: "+8%" },
    { name: "Susu UHT 1L", sold: 32, revenue: "Rp 960.000", trend: "+15%" },
    { name: "Roti Tawar Gandum", sold: 28, revenue: "Rp 840.000", trend: "+5%" },
  ];

  const recentTransactions = [
    { id: "#TRX-001234", time: "10:30", customer: "Ahmad Rizki", amount: "Rp 250.000", status: "success" },
    { id: "#TRX-001233", time: "10:15", customer: "Siti Nurhaliza", amount: "Rp 180.000", status: "success" },
    { id: "#TRX-001232", time: "09:45", customer: "Budi Santoso", amount: "Rp 320.000", status: "success" },
    { id: "#TRX-001231", time: "09:30", customer: "Dewi Lestari", amount: "Rp 150.000", status: "success" },
  ];

  const alerts = [
    { type: "warning", message: "12 produk stok menipis", action: "Lihat Detail", link: "/inventory" },
    { type: "info", message: "8 pesanan menunggu konfirmasi", action: "Proses", link: "/pos/transactions" },
  ];

  const salesData = [
    { day: 'Sen', sales: 4200000 },
    { day: 'Sel', sales: 3800000 },
    { day: 'Rab', sales: 5100000 },
    { day: 'Kam', sales: 4500000 },
    { day: 'Jum', sales: 6200000 },
    { day: 'Sab', sales: 7800000 },
    { day: 'Min', sales: 5900000 },
  ];

  const maxSales = Math.max(...salesData.map(d => d.sales));

  const categoryData = [
    { name: 'Makanan', value: 35, color: 'bg-blue-500' },
    { name: 'Minuman', value: 25, color: 'bg-green-500' },
    { name: 'Snack', value: 20, color: 'bg-purple-500' },
    { name: 'Lainnya', value: 20, color: 'bg-orange-500' },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Welcome Section with Time */}
        <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Selamat Datang, {session?.user?.name || 'User'}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Berikut adalah ringkasan bisnis Anda hari ini
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-blue-100 text-sm">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
            
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {quickStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className="text-xs text-blue-100">{stat.label}</p>
                        <p className="text-lg font-bold flex items-center space-x-2">
                          <span>{stat.value}</span>
                          {stat.alert && <FaExclamationTriangle className="w-4 h-4 text-yellow-300" />}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Grid - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`bg-gradient-to-br ${stat.gradient} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                      stat.isPositive ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {stat.isPositive ? (
                        <FaArrowUp className={`w-3 h-3 ${
                          stat.isPositive ? 'text-green-600' : 'text-red-600'
                        }`} />
                      ) : (
                        <FaArrowDown className={`w-3 h-3 ${
                          stat.isPositive ? 'text-green-600' : 'text-red-600'
                        }`} />
                      )}
                      <span className={`text-xs font-bold ${
                        stat.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>{stat.change}</span>
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-2">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.changeText}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert, idx) => (
              <Card key={idx} className={`border-l-4 ${
                alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FaBell className={`w-5 h-5 ${
                        alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                      <p className="font-medium text-gray-900">{alert.message}</p>
                    </div>
                    <Link href={alert.link}>
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        alert.type === 'warning' 
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } transition-colors`}>
                        {alert.action}
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <FaChartBar className="w-5 h-5 text-blue-600" />
                    <span>Penjualan 7 Hari Terakhir</span>
                  </CardTitle>
                  <CardDescription>Grafik penjualan harian minggu ini</CardDescription>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>7 Hari</option>
                  <option>30 Hari</option>
                  <option>90 Hari</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesData.map((data, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium text-gray-600">{data.day}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                            style={{ width: `${(data.sales / maxSales) * 100}%` }}
                          >
                            <span className="text-white text-xs font-bold">
                              {(data.sales / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>
                        <div className="w-28 text-right">
                          <p className="text-sm font-bold text-gray-900">
                            Rp {(data.sales / 1000000).toFixed(1)} Jt
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Minggu Ini</p>
                    <p className="text-2xl font-bold text-gray-900">Rp 37.5 Jt</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Rata-rata/Hari</p>
                    <p className="text-2xl font-bold text-green-600">Rp 5.4 Jt</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FaChartPie className="w-5 h-5 text-purple-600" />
                <span>Kategori Produk</span>
              </CardTitle>
              <CardDescription>Distribusi penjualan per kategori</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{cat.value}%</span>
                    </div>
                    <Progress value={cat.value} className="h-2" />
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600">Top Kategori</p>
                    <p className="text-lg font-bold text-blue-600">Makanan</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600">Pertumbuhan</p>
                    <p className="text-lg font-bold text-green-600">+12%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <FaChartLine className="w-5 h-5 text-green-600" />
                    <span>Produk Terlaris Hari Ini</span>
                  </CardTitle>
                  <CardDescription>Top 4 produk dengan penjualan tertinggi</CardDescription>
                </div>
                <Link href="/reports">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Lihat Semua →
                  </button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sold} terjual</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{product.revenue}</p>
                      <p className="text-sm text-green-600 font-medium">{product.trend}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Enhanced */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
              <CardDescription>Shortcut untuk fitur utama</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/pos/cashier">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                        <FaShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-semibold text-sm">Buat</p>
                      <p className="text-white font-semibold text-sm">Transaksi</p>
                    </div>
                  </div>
                </Link>

                <Link href="/inventory">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                        <FaBoxOpen className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-semibold text-sm">Kelola</p>
                      <p className="text-white font-semibold text-sm">Stok</p>
                    </div>
                  </div>
                </Link>

                <Link href="/reports">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                        <FaChartLine className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-semibold text-sm">Lihat</p>
                      <p className="text-white font-semibold text-sm">Laporan</p>
                    </div>
                  </div>
                </Link>

                <Link href="/customers">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                        <FaUsers className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-semibold text-sm">Data</p>
                      <p className="text-white font-semibold text-sm">Pelanggan</p>
                    </div>
                  </div>
                </Link>

                <Link href="/promo-voucher">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                        <FaTicketAlt className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-semibold text-sm">Promo &</p>
                      <p className="text-white font-semibold text-sm">Voucher</p>
                    </div>
                  </div>
                </Link>

                <Link href="/loyalty-program">
                  <div className="group relative overflow-hidden bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                        <FaStar className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-semibold text-sm">Loyalty</p>
                      <p className="text-white font-semibold text-sm">Program</p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FaReceipt className="w-5 h-5 text-blue-600" />
                  <span>Transaksi Terbaru</span>
                </CardTitle>
                <CardDescription>4 transaksi terakhir hari ini</CardDescription>
              </div>
              <Link href="/pos/transactions">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Lihat Semua →
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((trx, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <FaShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{trx.id}</p>
                      <p className="text-sm text-gray-500">{trx.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{trx.amount}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">{trx.time}</p>
                      <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                        Sukses
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
