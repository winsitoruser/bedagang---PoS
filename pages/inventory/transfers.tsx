import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FaExchangeAlt, FaPlus, FaSearch, FaEye, FaCheck, FaTimes,
  FaShippingFast, FaWarehouse, FaStore, FaClipboardCheck, FaTruck,
  FaSpinner, FaBoxOpen, FaHistory
} from 'react-icons/fa';

interface TransferOrder {
  id: number;
  transfer_number: string;
  from_location_id: number;
  to_location_id: number;
  from_location?: string;
  to_location?: string;
  request_date: string;
  status: string;
  priority: string;
  reason: string;
  items?: any[];
  items_count?: number;
  total_cost: number;
  shipping_cost: number;
  handling_fee?: number;
  requested_by: string;
  approved_by?: string;
  approval_date?: string;
  shipment_date?: string;
  received_date?: string;
  tracking_number?: string;
  courier?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface TransferStats {
  total_transfers: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  total_value: number;
  avg_value: number;
  recent_count: number;
  avg_transfer_days: string;
  success_rate: number;
}

const TransfersManagementPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTransfer, setSelectedTransfer] = useState<TransferOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [transfers, setTransfers] = useState<TransferOrder[]>([]);
  const [stats, setStats] = useState<TransferStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courier, setCourier] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');

  // Fetch transfers from API
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTransfers();
      fetchStats();
    }
  }, [status, filterStatus, searchQuery]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 50,
      };
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get('/api/inventory/transfers', { params });
      
      if (response.data.success) {
        setTransfers(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching transfers:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat data transfer');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/inventory/transfers/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedTransfer) return;
    
    setActionLoading(true);
    try {
      const response = await axios.put(
        `/api/inventory/transfers/${selectedTransfer.id}/approve`,
        {
          approval_notes: approvalNotes,
          estimated_shipment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0]
        }
      );

      if (response.data.success) {
        toast.success('Transfer berhasil disetujui!');
        setShowApproveModal(false);
        setApprovalNotes('');
        fetchTransfers();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyetujui transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTransfer || !rejectionReason) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await axios.put(
        `/api/inventory/transfers/${selectedTransfer.id}/reject`,
        {
          rejection_reason: rejectionReason
        }
      );

      if (response.data.success) {
        toast.success('Transfer ditolak');
        setShowRejectModal(false);
        setRejectionReason('');
        fetchTransfers();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menolak transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShip = async () => {
    if (!selectedTransfer || !trackingNumber || !courier) {
      toast.error('Nomor resi dan kurir harus diisi');
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await axios.put(
        `/api/inventory/transfers/${selectedTransfer.id}/ship`,
        {
          shipment_date: new Date().toISOString(),
          tracking_number: trackingNumber,
          courier: courier,
          estimated_arrival: new Date(Date.now() + 172800000).toISOString().split('T')[0]
        }
      );

      if (response.data.success) {
        toast.success('Transfer berhasil dikirim!');
        setShowShipModal(false);
        setTrackingNumber('');
        setCourier('');
        fetchTransfers();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceive = async () => {
    if (!selectedTransfer) return;
    
    setActionLoading(true);
    try {
      const itemsToReceive = selectedTransfer.items?.map(item => ({
        product_id: item.product_id,
        quantity_received: item.quantity_requested || item.quantity_approved,
        condition: 'good',
        notes: ''
      })) || [];

      const response = await axios.put(
        `/api/inventory/transfers/${selectedTransfer.id}/receive`,
        {
          received_date: new Date().toISOString(),
          items: itemsToReceive,
          receipt_notes: receiptNotes
        }
      );

      if (response.data.success) {
        toast.success('Transfer berhasil diterima!');
        setShowReceiveModal(false);
        setReceiptNotes('');
        fetchTransfers();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menerima transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetail = async (transfer: TransferOrder) => {
    try {
      const response = await axios.get(`/api/inventory/transfers/${transfer.id}`);
      if (response.data.success) {
        setSelectedTransfer(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error: any) {
      toast.error('Gagal memuat detail transfer');
    }
  };

  // Legacy mock data for reference (will be removed)
  const transferOrders_OLD: any[] = [
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

  const filteredTransfers = transfers;

  const displayStats = {
    total: stats?.total_transfers || 0,
    requested: stats?.by_status?.requested || 0,
    approved: stats?.by_status?.approved || 0,
    inTransit: stats?.by_status?.in_transit || 0,
    received: stats?.by_status?.received || 0,
    completed: stats?.by_status?.completed || 0,
    totalValue: stats?.total_value || 0
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data transfer...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
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
                <p className="text-2xl font-bold">{displayStats.total}</p>
              </div>
              <div className="bg-yellow-500/30 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/30">
                <p className="text-xs text-yellow-100">Diminta</p>
                <p className="text-2xl font-bold">{displayStats.requested}</p>
              </div>
              <div className="bg-blue-500/30 backdrop-blur-sm rounded-lg p-3 border border-blue-400/30">
                <p className="text-xs text-blue-100">Dalam Perjalanan</p>
                <p className="text-2xl font-bold">{displayStats.inTransit}</p>
              </div>
              <div className="bg-green-500/30 backdrop-blur-sm rounded-lg p-3 border border-green-400/30">
                <p className="text-xs text-green-100">Selesai</p>
                <p className="text-2xl font-bold">{displayStats.completed}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <p className="text-xs text-indigo-100">Total Nilai</p>
                <p className="text-lg font-bold">{formatCurrency(displayStats.totalValue)}</p>
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
                        <p className="font-semibold text-gray-900">{transfer.transfer_number}</p>
                        <p className="text-xs text-gray-500">oleh {transfer.requested_by}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <FaWarehouse className="text-gray-400" />
                          <span className="text-sm text-gray-900">{transfer.from_location || `Location ${transfer.from_location_id}`}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <FaStore className="text-gray-400" />
                          <span className="text-sm text-gray-900">{transfer.to_location || `Location ${transfer.to_location_id}`}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-gray-900">{new Date(transfer.request_date).toLocaleDateString('id-ID')}</p>
                        {transfer.shipment_date && (
                          <p className="text-xs text-gray-500">Kirim: {new Date(transfer.shipment_date).toLocaleDateString('id-ID')}</p>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <p className="font-semibold text-gray-900">{transfer.items_count || transfer.items?.length || 0}</p>
                      </td>
                      <td className="p-3 text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(transfer.total_cost)}</p>
                        <p className="text-xs text-gray-500">+ {formatCurrency(transfer.shipping_cost)} ongkir</p>
                      </td>
                      <td className="p-3 text-center">
                        {getStatusBadge(transfer.status)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(transfer)}
                          >
                            <FaEye />
                          </Button>
                          {transfer.status === 'requested' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  setSelectedTransfer(transfer);
                                  setShowApproveModal(true);
                                }}
                              >
                                <FaCheck />
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => {
                                  setSelectedTransfer(transfer);
                                  setShowRejectModal(true);
                                }}
                              >
                                <FaTimes />
                              </Button>
                            </>
                          )}
                          {transfer.status === 'approved' && (
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => {
                                setSelectedTransfer(transfer);
                                setShowShipModal(true);
                              }}
                            >
                              <FaTruck className="mr-1" />
                              Kirim
                            </Button>
                          )}
                          {transfer.status === 'in_transit' && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedTransfer(transfer);
                                setShowReceiveModal(true);
                              }}
                            >
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
                <h2 className="text-2xl font-bold">Detail Transfer - {selectedTransfer.transfer_number}</h2>
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
                    <p><span className="text-gray-600">Dari:</span> {selectedTransfer.from_location || `Location ${selectedTransfer.from_location_id}`}</p>
                    <p><span className="text-gray-600">Ke:</span> {selectedTransfer.to_location || `Location ${selectedTransfer.to_location_id}`}</p>
                    <p><span className="text-gray-600">Tanggal Permintaan:</span> {new Date(selectedTransfer.request_date).toLocaleDateString('id-ID')}</p>
                    {selectedTransfer.shipment_date && (
                      <p><span className="text-gray-600">Tanggal Kirim:</span> {new Date(selectedTransfer.shipment_date).toLocaleDateString('id-ID')}</p>
                    )}
                    {selectedTransfer.received_date && (
                      <p><span className="text-gray-600">Tanggal Terima:</span> {new Date(selectedTransfer.received_date).toLocaleDateString('id-ID')}</p>
                    )}
                    <p><span className="text-gray-600">Status:</span> {getStatusBadge(selectedTransfer.status)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Detail Approval</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Diminta oleh:</span> {selectedTransfer.requested_by}</p>
                    {selectedTransfer.approved_by && (
                      <p><span className="text-gray-600">Disetujui oleh:</span> {selectedTransfer.approved_by}</p>
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
                  {selectedTransfer.items?.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-gray-500">{item.product_sku}</p>
                      </td>
                      <td className="p-3 text-center font-semibold">{item.quantity_requested || item.quantity_approved || 0}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unit_cost || 0)}</td>
                      <td className="p-3 text-right font-semibold">{formatCurrency(item.subtotal || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-4">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(selectedTransfer.total_cost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkos Kirim:</span>
                    <span className="font-semibold">{formatCurrency(selectedTransfer.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Biaya Handling:</span>
                    <span className="font-semibold">{formatCurrency(selectedTransfer.handling_fee || 0)}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-indigo-50 px-4 rounded-lg">
                    <span className="text-lg font-bold">TOTAL:</span>
                    <span className="text-xl font-bold text-indigo-600">
                      {formatCurrency(selectedTransfer.total_cost + selectedTransfer.shipping_cost + (selectedTransfer.handling_fee || 0))}
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

      {/* Approve Modal */}
      {showApproveModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Setujui Transfer</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Anda akan menyetujui transfer <strong>{selectedTransfer.transfer_number}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Persetujuan (Opsional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Tambahkan catatan..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowApproveModal(false);
                    setApprovalNotes('');
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={actionLoading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Setujui
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Tolak Transfer</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Anda akan menolak transfer <strong>{selectedTransfer.transfer_number}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Jelaskan alasan penolakan..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={actionLoading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={actionLoading || !rejectionReason}
                >
                  {actionLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FaTimes className="mr-2" />
                      Tolak
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ship Modal */}
      {showShipModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Kirim Transfer</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Tandai transfer <strong>{selectedTransfer.transfer_number}</strong> sebagai dikirim
              </p>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Resi <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Masukkan nomor resi..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kurir <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Kurir</option>
                    <option value="JNE">JNE</option>
                    <option value="J&T">J&T Express</option>
                    <option value="SiCepat">SiCepat</option>
                    <option value="Anteraja">Anteraja</option>
                    <option value="Ninja Express">Ninja Express</option>
                    <option value="Gosend">Gosend</option>
                    <option value="Grab Express">Grab Express</option>
                    <option value="Internal">Internal/Kendaraan Sendiri</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowShipModal(false);
                    setTrackingNumber('');
                    setCourier('');
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={actionLoading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleShip}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={actionLoading || !trackingNumber || !courier}
                >
                  {actionLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FaTruck className="mr-2" />
                      Kirim
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Terima Transfer</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Konfirmasi penerimaan transfer <strong>{selectedTransfer.transfer_number}</strong>
              </p>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Items yang Diterima:</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm">Produk</th>
                        <th className="text-center p-3 text-sm">Qty Dikirim</th>
                        <th className="text-center p-3 text-sm">Kondisi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransfer.items?.map((item, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3">
                            <p className="font-medium text-sm">{item.product_name}</p>
                            <p className="text-xs text-gray-500">{item.product_sku}</p>
                          </td>
                          <td className="p-3 text-center font-semibold">
                            {item.quantity_shipped || item.quantity_approved || 0}
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-green-100 text-green-700">Baik</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Penerimaan (Opsional)
                </label>
                <textarea
                  value={receiptNotes}
                  onChange={(e) => setReceiptNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Tambahkan catatan penerimaan..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowReceiveModal(false);
                    setReceiptNotes('');
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={actionLoading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleReceive}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FaClipboardCheck className="mr-2" />
                      Konfirmasi Terima
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TransfersManagementPage;
