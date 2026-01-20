import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  FaHistory, FaSearch, FaFilter, FaDownload, 
  FaEye, FaPrint, FaCalendar, FaShoppingCart
} from 'react-icons/fa';

const HistoryPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');

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
            <p className="mt-4 text-gray-700">Memuat Riwayat...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const transactions = [
    { id: "TRX-2024-001", date: "2024-01-19", time: "14:30", cashier: "John Doe", customer: "Alice Brown", items: 5, total: 250000, payment: "Cash", status: "Selesai" },
    { id: "TRX-2024-002", date: "2024-01-19", time: "14:15", cashier: "Jane Smith", customer: "Bob Wilson", items: 3, total: 180000, payment: "Card", status: "Selesai" },
    { id: "TRX-2024-003", date: "2024-01-19", time: "13:45", cashier: "John Doe", customer: "Charlie Davis", items: 7, total: 320000, payment: "E-Wallet", status: "Selesai" },
    { id: "TRX-2024-004", date: "2024-01-19", time: "13:30", cashier: "Jane Smith", customer: "Diana Evans", items: 2, total: 150000, payment: "Cash", status: "Selesai" },
    { id: "TRX-2024-005", date: "2024-01-19", time: "13:00", cashier: "John Doe", customer: "Edward Fox", items: 4, total: 280000, payment: "Card", status: "Selesai" },
    { id: "TRX-2024-006", date: "2024-01-18", time: "16:45", cashier: "Jane Smith", customer: "Frank Green", items: 6, total: 420000, payment: "E-Wallet", status: "Selesai" },
    { id: "TRX-2024-007", date: "2024-01-18", time: "16:20", cashier: "John Doe", customer: "Grace Hill", items: 3, total: 190000, payment: "Cash", status: "Selesai" },
    { id: "TRX-2024-008", date: "2024-01-18", time: "15:50", cashier: "Jane Smith", customer: "Henry Irving", items: 8, total: 560000, payment: "Card", status: "Selesai" },
    { id: "TRX-2024-009", date: "2024-01-18", time: "15:30", cashier: "John Doe", customer: "Iris Jones", items: 2, total: 120000, payment: "Cash", status: "Selesai" },
    { id: "TRX-2024-010", date: "2024-01-18", time: "15:00", cashier: "Jane Smith", customer: "Jack King", items: 5, total: 340000, payment: "E-Wallet", status: "Selesai" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(trx => {
    const matchesSearch = searchTerm === '' || 
      trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.cashier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && trx.date === '2024-01-19') ||
      (dateFilter === 'yesterday' && trx.date === '2024-01-18');
    
    return matchesSearch && matchesDate;
  });

  return (
    <DashboardLayout>
      <Head>
        <title>Riwayat Transaksi | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Riwayat Transaksi</h1>
              <p className="text-pink-100">
                Lihat semua riwayat transaksi lengkap
              </p>
            </div>
            <FaHistory className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Transaksi</p>
            <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
            <span className="text-sm text-gray-600">Ditampilkan</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Penjualan</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(filteredTransactions.reduce((sum, trx) => sum + trx.total, 0))}
            </p>
            <span className="text-sm text-green-600 font-medium">Periode dipilih</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Rata-rata Transaksi</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(filteredTransactions.reduce((sum, trx) => sum + trx.total, 0) / filteredTransactions.length || 0)}
            </p>
            <span className="text-sm text-gray-600">Per transaksi</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredTransactions.reduce((sum, trx) => sum + trx.items, 0)}
            </p>
            <span className="text-sm text-gray-600">Produk terjual</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari ID transaksi, pelanggan, kasir..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="today">Hari Ini</option>
                <option value="yesterday">Kemarin</option>
                <option value="all">Semua</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FaFilter className="text-gray-600" />
                <span className="text-gray-700">Filter Lanjutan</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                <FaDownload />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal & Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kasir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pembayaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-pink-600">{transaction.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.date}</div>
                      <div className="text-sm text-gray-500">{transaction.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{transaction.cashier}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{transaction.customer}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{transaction.items} items</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{transaction.payment}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800" title="Lihat Detail">
                          <FaEye />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800" title="Cetak">
                          <FaPrint />
                        </button>
                      </div>
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

export default HistoryPage;
