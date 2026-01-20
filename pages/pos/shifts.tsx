import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  FaClock, FaPlay, FaStop, FaUser, FaMoneyBillWave,
  FaCalendar, FaDownload, FaEye
} from 'react-icons/fa';

const ShiftsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeShift, setActiveShift] = useState(true);

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
            <p className="mt-4 text-gray-700">Memuat Shift...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const shifts = [
    { 
      id: "SHF-001", 
      cashier: "John Doe", 
      startTime: "08:00", 
      endTime: "16:00", 
      date: "2024-01-19",
      openingCash: 1000000, 
      closingCash: 3500000, 
      transactions: 45, 
      status: "Selesai" 
    },
    { 
      id: "SHF-002", 
      cashier: "Jane Smith", 
      startTime: "16:00", 
      endTime: "00:00", 
      date: "2024-01-19",
      openingCash: 3500000, 
      closingCash: 5200000, 
      transactions: 38, 
      status: "Selesai" 
    },
    { 
      id: "SHF-003", 
      cashier: "Bob Wilson", 
      startTime: "08:00", 
      endTime: "16:00", 
      date: "2024-01-18",
      openingCash: 1000000, 
      closingCash: 3200000, 
      transactions: 42, 
      status: "Selesai" 
    },
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
        <title>Riwayat Shift | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Riwayat Shift</h1>
              <p className="text-red-100">
                Kelola shift kasir dan handover
              </p>
            </div>
            <FaClock className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Current Shift Status */}
        {activeShift && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaPlay className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-green-100">Shift Aktif</p>
                  <p className="text-xl font-bold">John Doe - Shift Pagi</p>
                  <p className="text-sm text-green-100">Dimulai: 08:00 | Modal Awal: Rp 1.000.000</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold">
                <FaStop />
                <span>Tutup Shift</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaClock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Shift Hari Ini</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">3</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Total Penjualan</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">Rp 8.7 Jt</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaUser className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Kasir Aktif</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">5</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaCalendar className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600">Shift Bulan Ini</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">89</p>
          </div>
        </div>

        {/* Actions */}
        {!activeShift && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak Ada Shift Aktif</h3>
                <p className="text-sm text-gray-600">Mulai shift baru untuk memulai transaksi</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                <FaPlay />
                <span>Mulai Shift Baru</span>
              </button>
            </div>
          </div>
        )}

        {/* Shift History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Riwayat Shift</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <FaDownload />
                <span>Export</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kasir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam Mulai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam Selesai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modal Awal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modal Akhir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaksi
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
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-red-600">{shift.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <FaUser className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-900">{shift.cashier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{shift.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{shift.startTime}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{shift.endTime}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatCurrency(shift.openingCash)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(shift.closingCash)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{shift.transactions}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {shift.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800" title="Lihat Detail">
                        <FaEye />
                      </button>
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

export default ShiftsPage;
