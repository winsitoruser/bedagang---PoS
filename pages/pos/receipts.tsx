import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  FaReceipt, FaSearch, FaDownload, FaPrint, 
  FaEye, FaEnvelope, FaFileInvoice
} from 'react-icons/fa';

const ReceiptsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');

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
            <p className="mt-4 text-gray-700">Memuat Struk & Invoice...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const receipts = [
    { id: "RCP-001", invoiceNo: "INV-2024-001", date: "2024-01-19", customer: "John Doe", amount: 250000, type: "Struk", status: "Tercetak" },
    { id: "RCP-002", invoiceNo: "INV-2024-002", date: "2024-01-19", customer: "Jane Smith", amount: 180000, type: "Invoice", status: "Terkirim" },
    { id: "RCP-003", invoiceNo: "INV-2024-003", date: "2024-01-19", customer: "Bob Wilson", amount: 320000, type: "Struk", status: "Tercetak" },
    { id: "RCP-004", invoiceNo: "INV-2024-004", date: "2024-01-19", customer: "Alice Brown", amount: 150000, type: "Invoice", status: "Draft" },
    { id: "RCP-005", invoiceNo: "INV-2024-005", date: "2024-01-19", customer: "Charlie Davis", amount: 280000, type: "Struk", status: "Tercetak" },
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
        <title>Struk & Invoice | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Struk & Invoice</h1>
              <p className="text-purple-100">
                Kelola struk dan invoice penjualan
              </p>
            </div>
            <FaReceipt className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Struk</p>
            <p className="text-2xl font-bold text-gray-900">89</p>
            <span className="text-sm text-green-600 font-medium">Hari ini</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Invoice</p>
            <p className="text-2xl font-bold text-gray-900">67</p>
            <span className="text-sm text-green-600 font-medium">Hari ini</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Tercetak</p>
            <p className="text-2xl font-bold text-gray-900">124</p>
            <span className="text-sm text-gray-600">Dokumen</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Terkirim Email</p>
            <p className="text-2xl font-bold text-gray-900">32</p>
            <span className="text-sm text-gray-600">Dokumen</span>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nomor struk, invoice, pelanggan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <FaFileInvoice />
                <span>Buat Invoice Baru</span>
              </button>
            </div>
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Struk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
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
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-purple-600">{receipt.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{receipt.invoiceNo}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{receipt.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{receipt.customer}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(receipt.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        receipt.type === 'Struk' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {receipt.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        receipt.status === 'Tercetak' 
                          ? 'bg-green-100 text-green-800' 
                          : receipt.status === 'Terkirim'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800" title="Lihat">
                          <FaEye />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800" title="Cetak">
                          <FaPrint />
                        </button>
                        <button className="text-green-600 hover:text-green-800" title="Download">
                          <FaDownload />
                        </button>
                        <button className="text-purple-600 hover:text-purple-800" title="Kirim Email">
                          <FaEnvelope />
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

export default ReceiptsPage;
