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
  FaClock, FaShippingFast, FaWarehouse, FaStore, FaClipboardCheck,
  FaFileAlt, FaEdit, FaTrash, FaDownload, FaPrint
} from 'react-icons/fa';

interface StockRequestItem {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  requestedQty: number;
  approvedQty?: number;
  unit: string;
  urgency: 'normal' | 'urgent' | 'critical';
  notes?: string;
}

interface StockRequest {
  id: string;
  requestNumber: string;
  requestType: 'rac' | 'restock' | 'emergency';
  fromLocation: string;
  toLocation: string;
  requestDate: string;
  requiredDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'processing' | 'shipped' | 'received' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  items: StockRequestItem[];
  totalItems: number;
  requestedBy: string;
  approvedBy?: string;
  processedBy?: string;
  approvalDate?: string;
  shipmentDate?: string;
  receivedDate?: string;
  reason: string;
  notes?: string;
  attachments?: string[];
}

const RACManagementPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');

  // Mock data
  const stockRequests: StockRequest[] = [
    {
      id: 'RAC001',
      requestNumber: 'RAC-2024-001',
      requestType: 'rac',
      fromLocation: 'Toko Cabang A',
      toLocation: 'Gudang Pusat',
      requestDate: '2024-01-24',
      requiredDate: '2024-01-26',
      status: 'submitted',
      priority: 'high',
      items: [
        {
          productId: '1',
          productName: 'Kopi Arabica Premium 250g',
          sku: 'KOP-001',
          currentStock: 5,
          requestedQty: 50,
          unit: 'pcs',
          urgency: 'urgent',
          notes: 'Stok hampir habis, promo minggu depan'
        },
        {
          productId: '2',
          productName: 'Teh Hijau Organik',
          sku: 'TEH-001',
          currentStock: 8,
          requestedQty: 30,
          unit: 'pcs',
          urgency: 'normal'
        }
      ],
      totalItems: 2,
      requestedBy: 'Manager Cabang A',
      reason: 'Stok menipis untuk produk fast moving',
      notes: 'Mohon diprioritaskan karena ada promo'
    },
    {
      id: 'RAC002',
      requestNumber: 'RAC-2024-002',
      requestType: 'emergency',
      fromLocation: 'Toko Cabang B',
      toLocation: 'Gudang Regional Jakarta',
      requestDate: '2024-01-24',
      requiredDate: '2024-01-25',
      status: 'approved',
      priority: 'critical',
      items: [
        {
          productId: '3',
          productName: 'Gula Pasir 1kg',
          sku: 'GUL-001',
          currentStock: 0,
          requestedQty: 100,
          approvedQty: 80,
          unit: 'pcs',
          urgency: 'critical',
          notes: 'Stok habis total'
        }
      ],
      totalItems: 1,
      requestedBy: 'Manager Cabang B',
      approvedBy: 'Manager Regional',
      approvalDate: '2024-01-24',
      reason: 'Stock out - kebutuhan urgent',
      notes: 'Emergency request, customer complaint'
    },
    {
      id: 'RAC003',
      requestNumber: 'RAC-2024-003',
      requestType: 'restock',
      fromLocation: 'Toko Cabang C',
      toLocation: 'Gudang Pusat',
      requestDate: '2024-01-23',
      requiredDate: '2024-01-28',
      status: 'completed',
      priority: 'medium',
      items: [
        {
          productId: '4',
          productName: 'Minyak Goreng 2L',
          sku: 'MIN-001',
          currentStock: 15,
          requestedQty: 50,
          approvedQty: 50,
          unit: 'pcs',
          urgency: 'normal'
        },
        {
          productId: '5',
          productName: 'Beras Premium 5kg',
          sku: 'BER-001',
          currentStock: 10,
          requestedQty: 30,
          approvedQty: 30,
          unit: 'pcs',
          urgency: 'normal'
        }
      ],
      totalItems: 2,
      requestedBy: 'Manager Cabang C',
      approvedBy: 'Manager Gudang',
      processedBy: 'Staff Gudang',
      approvalDate: '2024-01-23',
      shipmentDate: '2024-01-24',
      receivedDate: '2024-01-25',
      reason: 'Restock rutin mingguan'
    },
    {
      id: 'RAC004',
      requestNumber: 'RAC-2024-004',
      requestType: 'rac',
      fromLocation: 'Toko Cabang D',
      toLocation: 'Toko Cabang A',
      requestDate: '2024-01-25',
      requiredDate: '2024-01-27',
      status: 'processing',
      priority: 'medium',
      items: [
        {
          productId: '6',
          productName: 'Susu UHT 1L',
          sku: 'SUS-001',
          currentStock: 20,
          requestedQty: 40,
          approvedQty: 40,
          unit: 'pcs',
          urgency: 'normal'
        }
      ],
      totalItems: 1,
      requestedBy: 'Manager Cabang D',
      approvedBy: 'Manager Regional',
      processedBy: 'Staff Cabang A',
      approvalDate: '2024-01-25',
      reason: 'Transfer antar cabang - stok berlebih di Cabang A',
      notes: 'Koordinasi dengan Cabang A sudah dilakukan'
    }
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft', icon: FaFileAlt },
      submitted: { color: 'bg-yellow-100 text-yellow-700', label: 'Menunggu Persetujuan', icon: FaClock },
      approved: { color: 'bg-blue-100 text-blue-700', label: 'Disetujui', icon: FaCheck },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Ditolak', icon: FaTimes },
      processing: { color: 'bg-indigo-100 text-indigo-700', label: 'Sedang Diproses', icon: FaClipboardCheck },
      shipped: { color: 'bg-purple-100 text-purple-700', label: 'Dalam Pengiriman', icon: FaShippingFast },
      received: { color: 'bg-teal-100 text-teal-700', label: 'Sudah Diterima', icon: FaCheck },
      completed: { color: 'bg-green-100 text-green-700', label: 'Selesai', icon: FaCheck }
    };
    const statusConfig = config[status as keyof typeof config] || config.draft;
    const Icon = statusConfig.icon;
    return (
      <Badge className={statusConfig.color}>
        <Icon className="mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { color: 'bg-gray-100 text-gray-700', label: 'Rendah' },
      medium: { color: 'bg-blue-100 text-blue-700', label: 'Sedang' },
      high: { color: 'bg-orange-100 text-orange-700', label: 'Tinggi' },
      critical: { color: 'bg-red-100 text-red-700', label: 'Kritis' }
    };
    const priorityConfig = config[priority as keyof typeof config] || config.medium;
    return <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const config = {
      rac: { color: 'bg-purple-100 text-purple-700', label: 'RAC (Relokasi Antar Cabang)' },
      restock: { color: 'bg-blue-100 text-blue-700', label: 'Restock Rutin' },
      emergency: { color: 'bg-red-100 text-red-700', label: 'Emergency' }
    };
    const typeConfig = config[type as keyof typeof config] || config.rac;
    return <Badge className={typeConfig.color}>{typeConfig.label}</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    const config = {
      normal: { color: 'bg-green-100 text-green-700', label: 'Normal' },
      urgent: { color: 'bg-orange-100 text-orange-700', label: 'Urgent' },
      critical: { color: 'bg-red-100 text-red-700', label: 'Kritis' }
    };
    const urgencyConfig = config[urgency as keyof typeof config] || config.normal;
    return <Badge className={urgencyConfig.color}>{urgencyConfig.label}</Badge>;
  };

  const filteredRequests = stockRequests.filter(req => {
    const matchesSearch = req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.toLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    
    let matchesTab = true;
    if (activeTab === 'pending') {
      matchesTab = req.status === 'submitted' || req.status === 'draft';
    } else if (activeTab === 'approved') {
      matchesTab = req.status === 'approved' || req.status === 'processing' || req.status === 'shipped';
    } else if (activeTab === 'completed') {
      matchesTab = req.status === 'completed' || req.status === 'received';
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });

  const stats = {
    total: stockRequests.length,
    pending: stockRequests.filter(r => r.status === 'submitted' || r.status === 'draft').length,
    approved: stockRequests.filter(r => r.status === 'approved' || r.status === 'processing').length,
    completed: stockRequests.filter(r => r.status === 'completed').length,
    critical: stockRequests.filter(r => r.priority === 'critical').length
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Manajemen Request Stok & RAC | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
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
                    <h1 className="text-3xl font-bold">Manajemen Request Stok & RAC</h1>
                    <p className="text-purple-100 text-sm">Sistem permintaan stok dan relokasi antar cabang</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => router.push('/inventory/rac/create')}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <FaPlus className="mr-2" />
                Buat Request Baru
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <p className="text-xs text-purple-100">Total Request</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-yellow-500/30 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/30">
                <p className="text-xs text-yellow-100">Menunggu</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-blue-500/30 backdrop-blur-sm rounded-lg p-3 border border-blue-400/30">
                <p className="text-xs text-blue-100">Disetujui</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <div className="bg-green-500/30 backdrop-blur-sm rounded-lg p-3 border border-green-400/30">
                <p className="text-xs text-green-100">Selesai</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <div className="bg-red-500/30 backdrop-blur-sm rounded-lg p-3 border border-red-400/30">
                <p className="text-xs text-red-100">Kritis</p>
                <p className="text-2xl font-bold">{stats.critical}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'all'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Semua Request
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'pending'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Menunggu Persetujuan ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'approved'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Disetujui ({stats.approved})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'completed'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Selesai ({stats.completed})
          </button>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Cari nomor request, lokasi asal, atau tujuan..."
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Menunggu</option>
                  <option value="approved">Disetujui</option>
                  <option value="processing">Diproses</option>
                  <option value="shipped">Dikirim</option>
                  <option value="completed">Selesai</option>
                  <option value="rejected">Ditolak</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Semua Prioritas</option>
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                  <option value="critical">Kritis</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Daftar Request Stok & RAC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-xl text-gray-900">{request.requestNumber}</h3>
                        {getTypeBadge(request.requestType)}
                        {getPriorityBadge(request.priority)}
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{request.reason}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FaStore className="text-gray-400" />
                          <span>Dari: <span className="font-semibold text-gray-700">{request.fromLocation}</span></span>
                        </div>
                        <FaExchangeAlt className="text-gray-400" />
                        <div className="flex items-center space-x-1">
                          <FaWarehouse className="text-gray-400" />
                          <span>Ke: <span className="font-semibold text-gray-700">{request.toLocation}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Request</p>
                      <p className="font-semibold text-gray-900">{request.requestDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tanggal Dibutuhkan</p>
                      <p className="font-semibold text-gray-900">{request.requiredDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Items</p>
                      <p className="font-semibold text-gray-900">{request.totalItems} item</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Diminta oleh</p>
                      <p className="font-semibold text-gray-900">{request.requestedBy}</p>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                    <div className="space-y-2">
                      {request.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-sm">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">{item.sku} | Stok saat ini: {item.currentStock}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getUrgencyBadge(item.urgency)}
                            <span className="font-semibold text-purple-600">{item.requestedQty} {item.unit}</span>
                          </div>
                        </div>
                      ))}
                      {request.items.length > 2 && (
                        <p className="text-xs text-gray-500 text-center">+{request.items.length - 2} item lainnya</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailModal(true);
                      }}
                    >
                      <FaEye className="mr-2" />
                      Lihat Detail
                    </Button>
                    {request.status === 'submitted' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <FaCheck className="mr-2" />
                          Setujui
                        </Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          <FaTimes className="mr-2" />
                          Tolak
                        </Button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <FaShippingFast className="mr-2" />
                        Proses Pengiriman
                      </Button>
                    )}
                    {request.status === 'shipped' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <FaClipboardCheck className="mr-2" />
                        Konfirmasi Diterima
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <FaPrint />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Detail Request - {selectedRequest.requestNumber}</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    {getTypeBadge(selectedRequest.requestType)}
                    {getPriorityBadge(selectedRequest.priority)}
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Informasi Request</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dari Lokasi:</span>
                        <span className="font-semibold text-gray-900">{selectedRequest.fromLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ke Lokasi:</span>
                        <span className="font-semibold text-gray-900">{selectedRequest.toLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal Request:</span>
                        <span className="font-semibold text-gray-900">{selectedRequest.requestDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal Dibutuhkan:</span>
                        <span className="font-semibold text-red-600">{selectedRequest.requiredDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Alasan:</span> {selectedRequest.reason}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Status & Approval</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Diminta oleh:</span>
                        <span className="font-semibold text-gray-900">{selectedRequest.requestedBy}</span>
                      </div>
                      {selectedRequest.approvedBy && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Disetujui oleh:</span>
                            <span className="font-semibold text-gray-900">{selectedRequest.approvedBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tanggal Approval:</span>
                            <span className="font-semibold text-gray-900">{selectedRequest.approvalDate}</span>
                          </div>
                        </>
                      )}
                      {selectedRequest.processedBy && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Diproses oleh:</span>
                          <span className="font-semibold text-gray-900">{selectedRequest.processedBy}</span>
                        </div>
                      )}
                      {selectedRequest.shipmentDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tanggal Kirim:</span>
                          <span className="font-semibold text-gray-900">{selectedRequest.shipmentDate}</span>
                        </div>
                      )}
                      {selectedRequest.receivedDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tanggal Terima:</span>
                          <span className="font-semibold text-green-600">{selectedRequest.receivedDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Detail Items Request</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Produk</th>
                        <th className="text-center p-3 text-sm font-semibold text-gray-700">Stok Saat Ini</th>
                        <th className="text-center p-3 text-sm font-semibold text-gray-700">Qty Request</th>
                        {selectedRequest.status !== 'draft' && selectedRequest.status !== 'submitted' && (
                          <th className="text-center p-3 text-sm font-semibold text-gray-700">Qty Disetujui</th>
                        )}
                        <th className="text-center p-3 text-sm font-semibold text-gray-700">Urgency</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="p-3">
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">{item.sku}</p>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-semibold ${item.currentStock === 0 ? 'text-red-600' : item.currentStock < 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                              {item.currentStock} {item.unit}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-semibold text-purple-600">{item.requestedQty} {item.unit}</span>
                          </td>
                          {selectedRequest.status !== 'draft' && selectedRequest.status !== 'submitted' && (
                            <td className="p-3 text-center">
                              <span className="font-semibold text-green-600">{item.approvedQty || item.requestedQty} {item.unit}</span>
                            </td>
                          )}
                          <td className="p-3 text-center">
                            {getUrgencyBadge(item.urgency)}
                          </td>
                          <td className="p-3">
                            <p className="text-xs text-gray-600">{item.notes || '-'}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded mb-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Catatan Tambahan:</span> {selectedRequest.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Tutup
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <FaPrint className="mr-2" />
                  Cetak
                </Button>
                {selectedRequest.status === 'submitted' && (
                  <>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <FaCheck className="mr-2" />
                      Setujui Request
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <FaTimes className="mr-2" />
                      Tolak Request
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RACManagementPage;
