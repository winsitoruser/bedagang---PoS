import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import Modal, { ConfirmDialog } from '../../../components/hq/ui/Modal';
import { StatusBadge } from '../../../components/hq/ui/Badge';
import {
  ShoppingCart,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Truck,
  Package,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Download,
  Filter,
  Building2
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: { id: string; name: string; code: string };
  status: 'draft' | 'pending' | 'approved' | 'sent' | 'partial' | 'received' | 'cancelled';
  totalItems: number;
  totalQuantity: number;
  totalAmount: number;
  expectedDelivery: string | null;
  createdBy: string;
  createdAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  notes: string;
  items: POItem[];
}

interface POItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  total: number;
  status: 'pending' | 'partial' | 'received';
}

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2602-0001',
    supplier: { id: '1', name: 'PT Supplier Utama', code: 'SUP-001' },
    status: 'approved',
    totalItems: 15,
    totalQuantity: 500,
    totalAmount: 45000000,
    expectedDelivery: '2026-02-25',
    createdBy: 'Admin HQ',
    createdAt: '2026-02-20T08:00:00Z',
    approvedBy: 'Manager',
    approvedAt: '2026-02-20T10:00:00Z',
    notes: 'Urgent restock untuk cabang Jakarta',
    items: [
      { id: '1-1', productId: '1', productName: 'Beras Premium 5kg', sku: 'BRS-001', quantity: 100, receivedQuantity: 0, unitPrice: 70000, total: 7000000, status: 'pending' },
      { id: '1-2', productId: '2', productName: 'Minyak Goreng 2L', sku: 'MYK-001', quantity: 200, receivedQuantity: 0, unitPrice: 30000, total: 6000000, status: 'pending' }
    ]
  },
  {
    id: '2',
    poNumber: 'PO-2602-0002',
    supplier: { id: '2', name: 'CV Distributor Jaya', code: 'SUP-002' },
    status: 'sent',
    totalItems: 8,
    totalQuantity: 300,
    totalAmount: 28500000,
    expectedDelivery: '2026-02-24',
    createdBy: 'Admin HQ',
    createdAt: '2026-02-19T14:00:00Z',
    approvedBy: 'Manager',
    approvedAt: '2026-02-19T16:00:00Z',
    notes: '',
    items: []
  },
  {
    id: '3',
    poNumber: 'PO-2602-0003',
    supplier: { id: '1', name: 'PT Supplier Utama', code: 'SUP-001' },
    status: 'partial',
    totalItems: 12,
    totalQuantity: 450,
    totalAmount: 38000000,
    expectedDelivery: '2026-02-22',
    createdBy: 'Admin HQ',
    createdAt: '2026-02-18T09:00:00Z',
    approvedBy: 'Manager',
    approvedAt: '2026-02-18T11:00:00Z',
    notes: 'Sebagian sudah diterima',
    items: []
  },
  {
    id: '4',
    poNumber: 'PO-2602-0004',
    supplier: { id: '3', name: 'UD Grosir Makmur', code: 'SUP-003' },
    status: 'draft',
    totalItems: 5,
    totalQuantity: 150,
    totalAmount: 12000000,
    expectedDelivery: null,
    createdBy: 'Admin HQ',
    createdAt: '2026-02-22T06:00:00Z',
    approvedBy: null,
    approvedAt: null,
    notes: 'Draft PO untuk mingguan',
    items: []
  },
  {
    id: '5',
    poNumber: 'PO-2602-0005',
    supplier: { id: '2', name: 'CV Distributor Jaya', code: 'SUP-002' },
    status: 'received',
    totalItems: 10,
    totalQuantity: 400,
    totalAmount: 32000000,
    expectedDelivery: '2026-02-20',
    createdBy: 'Admin HQ',
    createdAt: '2026-02-15T10:00:00Z',
    approvedBy: 'Manager',
    approvedAt: '2026-02-15T12:00:00Z',
    notes: 'Sudah diterima lengkap',
    items: []
  }
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending: { label: 'Menunggu Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Disetujui', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  sent: { label: 'Dikirim ke Supplier', color: 'bg-purple-100 text-purple-800', icon: Send },
  partial: { label: 'Diterima Sebagian', color: 'bg-orange-100 text-orange-800', icon: Package },
  received: { label: 'Diterima Lengkap', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function PurchaseOrders() {
  const [mounted, setMounted] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hq/purchase-orders');
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data.purchaseOrders || mockPurchaseOrders);
      } else {
        setPurchaseOrders(mockPurchaseOrders);
      }
    } catch (error) {
      setPurchaseOrders(mockPurchaseOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchPurchaseOrders();
  }, []);

  if (!mounted) {
    return null;
  }

  const handleApprove = async (po: PurchaseOrder) => {
    setPurchaseOrders(prev => prev.map(p => 
      p.id === po.id ? { ...p, status: 'approved' as const, approvedBy: 'Admin HQ', approvedAt: new Date().toISOString() } : p
    ));
  };

  const handleSendToSupplier = async (po: PurchaseOrder) => {
    setPurchaseOrders(prev => prev.map(p => 
      p.id === po.id ? { ...p, status: 'sent' as const } : p
    ));
  };

  const handleDelete = async () => {
    if (!selectedPO) return;
    setPurchaseOrders(prev => prev.filter(p => p.id !== selectedPO.id));
    setShowDeleteConfirm(false);
    setSelectedPO(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter(p => p.status === 'draft').length,
    pending: purchaseOrders.filter(p => ['pending', 'approved', 'sent'].includes(p.status)).length,
    received: purchaseOrders.filter(p => p.status === 'received').length,
    totalValue: purchaseOrders.reduce((sum, p) => sum + p.totalAmount, 0)
  };

  return (
    <HQLayout title="Purchase Orders" subtitle="Kelola pembelian ke supplier">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total PO</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                <p className="text-sm text-gray-500">Draft</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-500">Dalam Proses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.received}</p>
                <p className="text-sm text-gray-500">Diterima</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                <p className="text-sm text-gray-500">Total Nilai</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari PO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Menunggu Approval</option>
                  <option value="approved">Disetujui</option>
                  <option value="sent">Dikirim</option>
                  <option value="partial">Diterima Sebagian</option>
                  <option value="received">Diterima Lengkap</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchPurchaseOrders}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Buat PO
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredPOs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Tidak ada purchase order ditemukan
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">No. PO</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Supplier</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Items</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Tgl Kirim</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Dibuat</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPOs.map((po) => {
                    const StatusIcon = statusConfig[po.status].icon;
                    return (
                      <tr key={po.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-mono font-medium text-blue-600">{po.poNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{po.supplier.name}</p>
                            <p className="text-sm text-gray-500">{po.supplier.code}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                            {po.totalItems} items ({po.totalQuantity} qty)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(po.totalAmount)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[po.status].color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig[po.status].label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">
                          {po.expectedDelivery ? formatDate(po.expectedDelivery) : '-'}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">
                          {formatDate(po.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedPO(po);
                                setShowViewModal(true);
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {po.status === 'draft' && (
                              <>
                                <button
                                  onClick={() => handleApprove(po)}
                                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedPO(po);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {po.status === 'approved' && (
                              <button
                                onClick={() => handleSendToSupplier(po)}
                                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                                title="Kirim ke Supplier"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={`Detail PO - ${selectedPO?.poNumber}`}
          size="xl"
        >
          {selectedPO && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Supplier</p>
                    <p className="font-medium text-gray-900">{selectedPO.supplier.name}</p>
                    <p className="text-sm text-gray-500">{selectedPO.supplier.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedPO.status].color}`}>
                      {statusConfig[selectedPO.status].label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Catatan</p>
                    <p className="text-gray-900">{selectedPO.notes || '-'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Nilai</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedPO.totalAmount)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Items</p>
                      <p className="font-medium">{selectedPO.totalItems} produk</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium">{selectedPO.totalQuantity} unit</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Dibuat</p>
                      <p className="font-medium">{formatDate(selectedPO.createdAt)}</p>
                      <p className="text-sm text-gray-500">{selectedPO.createdBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Disetujui</p>
                      <p className="font-medium">{selectedPO.approvedAt ? formatDate(selectedPO.approvedAt) : '-'}</p>
                      <p className="text-sm text-gray-500">{selectedPO.approvedBy || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPO.items.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Daftar Item</h4>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Produk</th>
                        <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">Qty</th>
                        <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">Diterima</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Harga</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPO.items.map(item => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-2 px-3">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-500">{item.sku}</p>
                          </td>
                          <td className="py-2 px-3 text-center">{item.quantity}</td>
                          <td className="py-2 px-3 text-center">{item.receivedQuantity}</td>
                          <td className="py-2 px-3 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Modal>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Hapus Purchase Order"
          message={`Apakah Anda yakin ingin menghapus PO "${selectedPO?.poNumber}"?`}
          confirmText="Hapus"
          variant="danger"
        />
      </div>
    </HQLayout>
  );
}
