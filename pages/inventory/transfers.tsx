import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FaExchangeAlt, FaPlus, FaSearch, FaEye, FaCheck, FaTimes,
  FaShippingFast, FaWarehouse, FaStore, FaClipboardCheck
} from 'react-icons/fa';

interface TransferOrder {
  id: string;
  transferNumber: string;
  fromLocation: string;
  toLocation: string;
  requestDate: string;
  status: 'requested' | 'approved' | 'in_transit' | 'received' | 'rejected';
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    subtotal: number;
  }[];
  totalCost: number;
  shippingCost: number;
  requestedBy: string;
  approvedBy?: string;
  shipmentDate?: string;
  receivedDate?: string;
  notes?: string;
}

const TransfersManagementPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTransfer, setSelectedTransfer] = useState<TransferOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Mock data
  const transferOrders: TransferOrder[] = [
    {
      id: 'TRF001',
      transferNumber: 'TRF-2024-001',
      fromLocation: 'Gudang Pusat',
      toLocation: 'Toko Cabang A',
      requestDate: '2024-01-22',
      status: 'received',
      items: [
        { productId: '1', productName: 'Kopi Arabica Premium 250g', sku: 'KOP-001', quantity: 50, unitCost: 30000, subtotal: 1500000 },
        { productId: '2', productName: 'Teh Hijau Organik', sku: 'TEH-001', quantity: 30, unitCost: 22000, subtotal: 660000 }
      ],
      totalCost: 2160000,
      shippingCost: 150000,
      requestedBy: 'Manager Cabang A',
      approvedBy: 'Manager Gudang',
      shipmentDate: '2024-01-23',
      receivedDate: '2024-01-24',
      notes: 'Transfer rutin mingguan'
    },
    {
      id: 'TRF002',
      transferNumber: 'TRF-2024-002',
      fromLocation: 'Gudang Pusat',
      toLocation: 'Toko Cabang B',
      requestDate: '2024-01-24',
      status: 'in_transit',
      items: [
        { productId: '3', productName: 'Gula Pasir 1kg', sku: 'GUL-001', quantity: 100, unitCost: 12000, subtotal: 1200000 },
        { productId: '4', productName: 'Minyak Goreng 2L', sku: 'MIN-001', quantity: 50, unitCost: 28000, subtotal: 1400000 }
      ],
      totalCost: 2600000,
      shippingCost: 200000,
      requestedBy: 'Manager Cabang B',
      approvedBy: 'Manager Gudang',
      shipmentDate: '2024-01-24',
      notes: 'Pengiriman ekspres'
    },
    {
      id: 'TRF003',
      transferNumber: 'TRF-2024-003',
      fromLocation: 'Toko Cabang A',
      toLocation: 'Toko Cabang C',
      requestDate: '2024-01-24',
      status: 'approved',
      items: [
        { productId: '5', productName: 'Beras Premium 5kg', sku: 'BER-001', quantity: 20, unitCost: 70000, subtotal: 1400000 }
      ],
      totalCost: 1400000,
      shippingCost: 100000,
      requestedBy: 'Manager Cabang C',
      approvedBy: 'Manager Regional',
      notes: 'Transfer antar cabang'
    },
    {
      id: 'TRF004',
      transferNumber: 'TRF-2024-004',
      fromLocation: 'Gudang Regional Jakarta',
      toLocation: 'Toko Cabang D',
      requestDate: '2024-01-25',
      status: 'requested',
      items: [
        { productId: '6', productName: 'Susu UHT 1L', sku: 'SUS-001', quantity: 100, unitCost: 14000, subtotal: 1400000 },
        { productId: '7', productName: 'Roti Tawar', sku: 'ROT-001', quantity: 50, unitCost: 8000, subtotal: 400000 }
      ],
      totalCost: 1800000,
      shippingCost: 120000,
      requestedBy: 'Manager Cabang D',
      notes: 'Permintaan urgent untuk promo'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      requested: { color: 'bg-yellow-100 text-yellow-700', label: 'Diminta' },
      approved: { color: 'bg-blue-100 text-blue-700', label: 'Disetujui' },
      in_transit: { color: 'bg-indigo-100 text-indigo-700', label: 'Dalam Perjalanan' },
      received: { color: 'bg-green-100 text-green-700', label: 'Diterima' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Ditolak' }
    };
    const statusConfig = config[status as keyof typeof config] || config.requested;
    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  const filteredTransfers = transferOrders.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transfer.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transfer.toLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transfer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: transferOrders.length,
    requested: transferOrders.filter(t => t.status === 'requested').length,
    inTransit: transferOrders.filter(t => t.status === 'in_transit').length,
    received: transferOrders.filter(t => t.status === 'received').length,
    totalValue: transferOrders.reduce((sum, t) => sum + t.totalCost + t.shippingCost, 0)
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Transfer Antar Lokasi | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FaExchangeAlt className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Transfer Antar Lokasi</h1>
                    <p className="text-indigo-100 text-sm">Kelola transfer stok antar toko dan gudang</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => router.push('/inventory/transfers/create')}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <FaPlus className="mr-2" />
                Buat Transfer Baru
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <p className="text-xs text-indigo-100">Total Transfer</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-yellow-500/30 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/30">
                <p className="text-xs text-yellow-100">Diminta</p>
                <p className="text-2xl font-bold">{stats.requested}</p>
              </div>
              <div className="bg-blue-500/30 backdrop-blur-sm rounded-lg p-3 border border-blue-400/30">
                <p className="text-xs text-blue-100">Dalam Perjalanan</p>
                <p className="text-2xl font-bold">{stats.inTransit}</p>
              </div>
              <div className="bg-green-500/30 backdrop-blur-sm rounded-lg p-3 border border-green-400/30">
                <p className="text-xs text-green-100">Diterima</p>
                <p className="text-2xl font-bold">{stats.received}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <p className="text-xs text-indigo-100">Total Nilai</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Cari nomor transfer atau lokasi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="requested">Diminta</option>
                  <option value="approved">Disetujui</option>
                  <option value="in_transit">Dalam Perjalanan</option>
                  <option value="received">Diterima</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transfers List */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Daftar Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">No. Transfer</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Dari</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Ke</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">Tanggal</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-700">Items</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">Total Nilai</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransfers.map((transfer) => (
                    <tr key={transfer.id} className="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                      <td className="p-3">
                        <p className="font-semibold text-gray-900">{transfer.transferNumber}</p>
                        <p className="text-xs text-gray-500">oleh {transfer.requestedBy}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <FaWarehouse className="text-gray-400" />
                          <span className="text-sm text-gray-900">{transfer.fromLocation}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <FaStore className="text-gray-400" />
                          <span className="text-sm text-gray-900">{transfer.toLocation}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-gray-900">{transfer.requestDate}</p>
                        {transfer.shipmentDate && (
                          <p className="text-xs text-gray-500">Kirim: {transfer.shipmentDate}</p>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <p className="font-semibold text-gray-900">{transfer.items.length}</p>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(transfer.totalCost)}</p>
                        <p className="text-xs text-gray-500">+ {formatCurrency(transfer.shippingCost)} ongkir</p>
                      </td>
                      <td className="p-3 text-center">
                        {getStatusBadge(transfer.status)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTransfer(transfer);
                              setShowDetailModal(true);
                            }}
                          >
                            <FaEye />
                          </Button>
                          {transfer.status === 'requested' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <FaCheck />
                              </Button>
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                <FaTimes />
                              </Button>
                            </>
                          )}
                          {transfer.status === 'in_transit' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <FaClipboardCheck className="mr-1" />
                              Terima
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Detail Transfer - {selectedTransfer.transferNumber}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Informasi Transfer</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Dari:</span> {selectedTransfer.fromLocation}</p>
                    <p><span className="text-gray-600">Ke:</span> {selectedTransfer.toLocation}</p>
                    <p><span className="text-gray-600">Tanggal Permintaan:</span> {selectedTransfer.requestDate}</p>
                    {selectedTransfer.shipmentDate && (
                      <p><span className="text-gray-600">Tanggal Kirim:</span> {selectedTransfer.shipmentDate}</p>
                    )}
                    {selectedTransfer.receivedDate && (
                      <p><span className="text-gray-600">Tanggal Terima:</span> {selectedTransfer.receivedDate}</p>
                    )}
                    <p><span className="text-gray-600">Status:</span> {getStatusBadge(selectedTransfer.status)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Detail Approval</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Diminta oleh:</span> {selectedTransfer.requestedBy}</p>
                    {selectedTransfer.approvedBy && (
                      <p><span className="text-gray-600">Disetujui oleh:</span> {selectedTransfer.approvedBy}</p>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-700 mb-3">Items Transfer</h3>
              <table className="w-full mb-6">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-sm">Produk</th>
                    <th className="text-center p-3 text-sm">Qty</th>
                    <th className="text-right p-3 text-sm">Biaya Unit</th>
                    <th className="text-right p-3 text-sm">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransfer.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-gray-500">{item.sku}</p>
                      </td>
                      <td className="p-3 text-center font-semibold">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unitCost)}</td>
                      <td className="p-3 text-right font-semibold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-4">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(selectedTransfer.totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkos Kirim:</span>
                    <span className="font-semibold">{formatCurrency(selectedTransfer.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-indigo-50 px-4 rounded-lg">
                    <span className="text-lg font-bold">TOTAL:</span>
                    <span className="text-xl font-bold text-indigo-600">
                      {formatCurrency(selectedTransfer.totalCost + selectedTransfer.shippingCost)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedTransfer.notes && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm text-gray-700"><span className="font-semibold">Catatan:</span> {selectedTransfer.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TransfersManagementPage;
