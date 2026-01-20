import React, { useState } from 'react';
import { FaUsers, FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaPhone, FaEnvelope } from 'react-icons/fa';

const CRMModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "08123456789", totalPurchases: 15, totalSpent: 3500000, lastVisit: "2024-01-19", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "08234567890", totalPurchases: 23, totalSpent: 5200000, lastVisit: "2024-01-18", status: "Active" },
    { id: 3, name: "Bob Wilson", email: "bob@example.com", phone: "08345678901", totalPurchases: 8, totalSpent: 1800000, lastVisit: "2024-01-15", status: "Active" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", phone: "08456789012", totalPurchases: 31, totalSpent: 7200000, lastVisit: "2024-01-19", status: "VIP" },
    { id: 5, name: "Charlie Davis", email: "charlie@example.com", phone: "08567890123", totalPurchases: 5, totalSpent: 950000, lastVisit: "2024-01-10", status: "Inactive" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Pelanggan</p>
          <p className="text-2xl font-bold text-gray-900">1,234</p>
          <span className="text-sm text-green-600 font-medium">+12% bulan ini</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Pelanggan Aktif</p>
          <p className="text-2xl font-bold text-gray-900">892</p>
          <span className="text-sm text-green-600 font-medium">72% dari total</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Pelanggan VIP</p>
          <p className="text-2xl font-bold text-gray-900">156</p>
          <span className="text-sm text-gray-600">13% dari total</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Lifetime Value</p>
          <p className="text-2xl font-bold text-gray-900">Rp 45.2 Jt</p>
          <span className="text-sm text-green-600 font-medium">Rata-rata</span>
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
                placeholder="Cari nama, email, atau nomor telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <FaPlus />
            <span>Tambah Pelanggan</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pembelian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Belanja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kunjungan Terakhir
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
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <FaUsers className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <FaEnvelope className="w-3 h-3 text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <FaPhone className="w-3 h-3 text-gray-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{customer.totalPurchases} kali</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{customer.lastVisit}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.status === 'VIP' 
                        ? 'bg-purple-100 text-purple-800' 
                        : customer.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800" title="Lihat">
                        <FaEye />
                      </button>
                      <button className="text-green-600 hover:text-green-800" title="Edit">
                        <FaEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-800" title="Hapus">
                        <FaTrash />
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
  );
};

export default CRMModule;
