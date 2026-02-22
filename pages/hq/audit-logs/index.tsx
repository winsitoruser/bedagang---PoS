import React, { useState, useEffect } from 'react';
import HQLayout from '../../../components/hq/HQLayout';
import DataTable, { Column } from '../../../components/hq/ui/DataTable';
import Modal from '../../../components/hq/ui/Modal';
import { StatusBadge } from '../../../components/hq/ui';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  User,
  Building2,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  FileText,
  Package,
  DollarSign,
  Settings,
  Trash2,
  Edit,
  Plus,
  Lock,
  Unlock,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  resourceName: string;
  details: Record<string, any>;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  isHqIntervention: boolean;
  targetBranchId: string | null;
  targetBranchName: string | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  APPROVE: 'bg-emerald-100 text-emerald-800',
  REJECT: 'bg-orange-100 text-orange-800',
  LOCK: 'bg-yellow-100 text-yellow-800',
  UNLOCK: 'bg-cyan-100 text-cyan-800',
  EXPORT: 'bg-indigo-100 text-indigo-800'
};

const actionIcons: Record<string, React.ReactNode> = {
  CREATE: <Plus className="w-3 h-3" />,
  UPDATE: <Edit className="w-3 h-3" />,
  DELETE: <Trash2 className="w-3 h-3" />,
  LOGIN: <User className="w-3 h-3" />,
  LOGOUT: <User className="w-3 h-3" />,
  APPROVE: <Shield className="w-3 h-3" />,
  REJECT: <AlertTriangle className="w-3 h-3" />,
  LOCK: <Lock className="w-3 h-3" />,
  UNLOCK: <Unlock className="w-3 h-3" />,
  EXPORT: <Download className="w-3 h-3" />
};

const resourceIcons: Record<string, React.ReactNode> = {
  Branch: <Building2 className="w-4 h-4" />,
  Product: <Package className="w-4 h-4" />,
  ProductPrice: <DollarSign className="w-4 h-4" />,
  User: <User className="w-4 h-4" />,
  InternalRequisition: <FileText className="w-4 h-4" />,
  GlobalSettings: <Settings className="w-4 h-4" />,
  default: <FileText className="w-4 h-4" />
};

const mockLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Super Admin',
    userRole: 'SUPER_ADMIN',
    action: 'UPDATE',
    resource: 'GlobalSettings',
    resourceId: 'hq',
    resourceName: 'Global Settings',
    details: { type: 'tax_update' },
    oldValues: { ppnRate: 10 },
    newValues: { ppnRate: 11 },
    isHqIntervention: true,
    targetBranchId: null,
    targetBranchName: 'Semua Cabang',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    createdAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: '2',
    userId: '1',
    userName: 'Super Admin',
    userRole: 'SUPER_ADMIN',
    action: 'LOCK',
    resource: 'ProductPrice',
    resourceId: '1',
    resourceName: 'Nasi Goreng Special',
    details: { type: 'price_lock' },
    oldValues: { isStandard: false },
    newValues: { isStandard: true },
    isHqIntervention: true,
    targetBranchId: null,
    targetBranchName: 'Semua Cabang',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    createdAt: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: '3',
    userId: '1',
    userName: 'Super Admin',
    userRole: 'SUPER_ADMIN',
    action: 'APPROVE',
    resource: 'InternalRequisition',
    resourceId: 'IR-BR002-2602-0001',
    resourceName: 'IR Cabang Bandung',
    details: { type: 'ir_approval' },
    oldValues: { status: 'submitted' },
    newValues: { status: 'approved' },
    isHqIntervention: true,
    targetBranchId: '2',
    targetBranchName: 'Cabang Bandung',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    createdAt: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: '4',
    userId: '2',
    userName: 'Ahmad Wijaya',
    userRole: 'BRANCH_MANAGER',
    action: 'CREATE',
    resource: 'InternalRequisition',
    resourceId: 'IR-HQ001-2602-0005',
    resourceName: 'Permintaan Stok Harian',
    details: { type: 'ir_create' },
    oldValues: null,
    newValues: { totalItems: 15, estimatedValue: 5000000 },
    isHqIntervention: false,
    targetBranchId: '1',
    targetBranchName: 'Cabang Pusat Jakarta',
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0...',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: '5',
    userId: '3',
    userName: 'Siti Rahayu',
    userRole: 'BRANCH_MANAGER',
    action: 'UPDATE',
    resource: 'Product',
    resourceId: '5',
    resourceName: 'Es Krim Coklat',
    details: { type: 'product_update', blocked: true },
    oldValues: { price: 25000 },
    newValues: { price: 28000 },
    isHqIntervention: false,
    targetBranchId: '2',
    targetBranchName: 'Cabang Bandung',
    ipAddress: '192.168.1.15',
    userAgent: 'Mozilla/5.0...',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '6',
    userId: '1',
    userName: 'Super Admin',
    userRole: 'SUPER_ADMIN',
    action: 'CREATE',
    resource: 'Branch',
    resourceId: '6',
    resourceName: 'Cabang Semarang',
    details: { type: 'branch_create' },
    oldValues: null,
    newValues: { code: 'BR-006', city: 'Semarang' },
    isHqIntervention: true,
    targetBranchId: null,
    targetBranchName: null,
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '7',
    userId: '1',
    userName: 'Super Admin',
    userRole: 'SUPER_ADMIN',
    action: 'DELETE',
    resource: 'User',
    resourceId: '10',
    resourceName: 'Eko Prasetyo',
    details: { type: 'user_delete' },
    oldValues: { name: 'Eko Prasetyo', role: 'STAFF' },
    newValues: null,
    isHqIntervention: true,
    targetBranchId: '3',
    targetBranchName: 'Cabang Surabaya',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export default function AuditLogViewer() {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterResource, setFilterResource] = useState<string>('all');
  const [filterHqOnly, setFilterHqOnly] = useState<boolean>(false);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  
  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      if (filterAction !== 'all') params.append('action', filterAction);
      if (filterResource !== 'all') params.append('resource', filterResource);
      if (filterHqOnly) params.append('hqOnly', 'true');
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`/api/hq/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || mockLogs);
        setTotal(data.total || mockLogs.length);
      } else {
        setLogs(mockLogs);
        setTotal(mockLogs.length);
      }
    } catch (error) {
      setLogs(mockLogs);
      setTotal(mockLogs.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchLogs();
  }, [page, pageSize, filterAction, filterResource, filterHqOnly]);

  if (!mounted) {
    return null;
  }

  const handleExport = async () => {
    // Export logs to CSV
    const csvContent = [
      ['Waktu', 'User', 'Role', 'Aksi', 'Resource', 'Detail', 'HQ Intervention', 'IP Address'].join(','),
      ...logs.map(log => [
        new Date(log.createdAt).toISOString(),
        log.userName,
        log.userRole,
        log.action,
        `${log.resource}: ${log.resourceName}`,
        JSON.stringify(log.details),
        log.isHqIntervention ? 'Ya' : 'Tidak',
        log.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeSince = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (seconds < 60) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'createdAt',
      header: 'Waktu',
      sortable: true,
      width: '150px',
      render: (value) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{getTimeSince(value)}</div>
          <div className="text-xs text-gray-500">{formatDate(value)}</div>
        </div>
      )
    },
    {
      key: 'userName',
      header: 'User',
      render: (_, log) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {log.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{log.userName}</div>
            <div className="text-xs text-gray-500">{log.userRole}</div>
          </div>
        </div>
      )
    },
    {
      key: 'action',
      header: 'Aksi',
      render: (value) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${actionColors[value] || 'bg-gray-100 text-gray-800'}`}>
          {actionIcons[value]}
          {value}
        </span>
      )
    },
    {
      key: 'resource',
      header: 'Resource',
      render: (_, log) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-100 rounded">
            {resourceIcons[log.resource] || resourceIcons.default}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{log.resourceName}</div>
            <div className="text-xs text-gray-500">{log.resource} #{log.resourceId}</div>
          </div>
        </div>
      )
    },
    {
      key: 'isHqIntervention',
      header: 'HQ',
      align: 'center',
      render: (value, log) => (
        <div className="flex flex-col items-center gap-1">
          {value ? (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              <Shield className="w-3 h-3" />
              HQ
            </span>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
          {log.targetBranchName && (
            <span className="text-xs text-gray-500">{log.targetBranchName}</span>
          )}
        </div>
      )
    },
    {
      key: 'ipAddress',
      header: 'IP',
      render: (value) => (
        <span className="text-xs text-gray-500 font-mono">{value}</span>
      )
    },
    {
      key: 'actions',
      header: '',
      width: '50px',
      render: (_, log) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedLog(log); setShowDetailModal(true); }}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          title="Lihat Detail"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <HQLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
            <p className="text-gray-500">Riwayat semua aktivitas dan perubahan sistem</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Aksi</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
              <option value="LOCK">Lock</option>
              <option value="UNLOCK">Unlock</option>
            </select>
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Resource</option>
              <option value="Branch">Branch</option>
              <option value="Product">Product</option>
              <option value="ProductPrice">ProductPrice</option>
              <option value="User">User</option>
              <option value="InternalRequisition">Internal Requisition</option>
              <option value="GlobalSettings">Global Settings</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterHqOnly}
                onChange={(e) => setFilterHqOnly(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Hanya HQ Intervention</span>
            </label>
            <div className="flex items-center gap-2 ml-auto">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <button
                onClick={fetchLogs}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Log</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <History className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">HQ Interventions</p>
                <p className="text-2xl font-bold text-purple-600">{logs.filter(l => l.isHqIntervention).length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Changes Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Edit className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Deletions</p>
                <p className="text-2xl font-bold text-red-600">{logs.filter(l => l.action === 'DELETE').length}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          searchable={false}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
            onPageSizeChange: setPageSize
          }}
          actions={{
            onRefresh: fetchLogs
          }}
          onRowClick={(log) => { setSelectedLog(log); setShowDetailModal(true); }}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedLog(null); }}
        title="Detail Audit Log"
        size="lg"
        footer={
          <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Tutup
          </button>
        }
      >
        {selectedLog && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {selectedLog?.userName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '-'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{selectedLog?.userName}</h3>
                  <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">{selectedLog?.userRole}</span>
                  {selectedLog?.isHqIntervention && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      HQ Intervention
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{formatDate(selectedLog?.createdAt)}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${actionColors[selectedLog?.action] || ''}`}>
                {actionIcons[selectedLog?.action]}
                {selectedLog?.action}
              </span>
            </div>

            {/* Resource Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Resource yang Terpengaruh</h4>
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {resourceIcons[selectedLog?.resource] || resourceIcons.default}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedLog?.resourceName}</p>
                  <p className="text-sm text-gray-500">{selectedLog?.resource} • ID: {selectedLog?.resourceId}</p>
                </div>
              </div>
            </div>

            {/* Target Branch */}
            {selectedLog?.targetBranchName && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Cabang Terkait</h4>
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">{selectedLog?.targetBranchName}</span>
                </div>
              </div>
            )}

            {/* Changes */}
            {(selectedLog?.oldValues || selectedLog?.newValues) && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Perubahan Data</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedLog?.oldValues && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-medium text-red-600 mb-2">Nilai Sebelum</p>
                      <pre className="text-xs text-red-800 overflow-auto">
                        {JSON.stringify(selectedLog?.oldValues, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog?.newValues && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xs font-medium text-green-600 mb-2">Nilai Sesudah</p>
                      <pre className="text-xs text-green-800 overflow-auto">
                        {JSON.stringify(selectedLog?.newValues, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Detail Teknis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">IP Address</span>
                  <span className="font-mono text-gray-900">{selectedLog.ipAddress}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">User Agent</span>
                  <span className="text-gray-900 truncate max-w-xs" title={selectedLog.userAgent}>
                    {selectedLog.userAgent.substring(0, 50)}...
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Log ID</span>
                  <span className="font-mono text-gray-900">{selectedLog.id}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </HQLayout>
  );
}
