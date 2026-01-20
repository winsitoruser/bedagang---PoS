import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  FaCashRegister, FaShoppingCart, FaReceipt, FaChartBar, 
  FaHistory, FaClock, FaUsers, FaBoxes
} from 'react-icons/fa';

const PosPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

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

  const stats = [
    { label: "Transaksi Hari Ini", value: "156", change: "+12%", isPositive: true },
    { label: "Total Penjualan", value: "Rp 12.5 Jt", change: "+8%", isPositive: true },
    { label: "Produk Terjual", value: "342", change: "+15%", isPositive: true },
    { label: "Rata-rata Transaksi", value: "Rp 80K", change: "-2%", isPositive: false },
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <span
                  className={`text-sm font-medium ${
                    stat.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
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

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <FaCashRegister className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Buka Kasir</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <FaShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Transaksi Baru</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <FaReceipt className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Cetak Struk</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <FaChartBar className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Lihat Laporan</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Transaksi Terbaru</h2>
          <div className="space-y-4">
            {[
              { id: "TRX-001", time: "10:30", customer: "John Doe", amount: "Rp 250.000", status: "Selesai" },
              { id: "TRX-002", time: "10:15", customer: "Jane Smith", amount: "Rp 180.000", status: "Selesai" },
              { id: "TRX-003", time: "09:45", customer: "Bob Wilson", amount: "Rp 320.000", status: "Selesai" },
              { id: "TRX-004", time: "09:30", customer: "Alice Brown", amount: "Rp 150.000", status: "Selesai" },
            ].map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.id}</p>
                    <p className="text-sm text-gray-600">{transaction.customer} • {transaction.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{transaction.amount}</p>
                  <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PosPage;
