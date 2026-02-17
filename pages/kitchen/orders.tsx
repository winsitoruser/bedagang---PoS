import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, Clock, CheckCircle, AlertCircle,
  ChefHat, Calendar, Download, Eye, MoreVertical
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Order {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  customerName?: string;
  items: number;
  status: 'new' | 'preparing' | 'ready' | 'served' | 'cancelled';
  priority: 'normal' | 'urgent';
  receivedAt: Date;
  completedAt?: Date;
  prepTime?: number;
  totalAmount: number;
}

const KitchenOrdersPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Mock data
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        tableNumber: '5',
        orderType: 'dine-in',
        items: 3,
        status: 'preparing',
        priority: 'urgent',
        receivedAt: new Date(Date.now() - 10 * 60000),
        totalAmount: 125000
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        tableNumber: '3',
        orderType: 'dine-in',
        items: 4,
        status: 'ready',
        priority: 'normal',
        receivedAt: new Date(Date.now() - 20 * 60000),
        completedAt: new Date(Date.now() - 2 * 60000),
        prepTime: 18,
        totalAmount: 180000
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        orderType: 'takeaway',
        customerName: 'Budi Santoso',
        items: 5,
        status: 'served',
        priority: 'normal',
        receivedAt: new Date(Date.now() - 45 * 60000),
        completedAt: new Date(Date.now() - 30 * 60000),
        prepTime: 15,
        totalAmount: 250000
      },
      {
        id: '4',
        orderNumber: 'ORD-004',
        orderType: 'delivery',
        customerName: 'Siti Aminah',
        items: 2,
        status: 'new',
        priority: 'normal',
        receivedAt: new Date(Date.now() - 2 * 60000),
        totalAmount: 95000
      },
      {
        id: '5',
        orderNumber: 'ORD-005',
        tableNumber: '8',
        orderType: 'dine-in',
        items: 6,
        status: 'preparing',
        priority: 'normal',
        receivedAt: new Date(Date.now() - 15 * 60000),
        totalAmount: 320000
      }
    ];
    setOrders(mockOrders);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.tableNumber?.includes(searchQuery) ||
                         order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.orderType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-red-100 text-red-800 border-red-200',
      preparing: 'bg-blue-100 text-blue-800 border-blue-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      served: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    const labels = {
      new: 'Baru',
      preparing: 'Dimasak',
      ready: 'Siap',
      served: 'Disajikan',
      cancelled: 'Dibatalkan'
    };
    return (
      <Badge className={`${styles[status as keyof typeof styles]} border`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getOrderTypeLabel = (type: string) => {
    const labels = {
      'dine-in': 'Dine In',
      'takeaway': 'Take Away',
      'delivery': 'Delivery'
    };
    return labels[type as keyof typeof labels];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-sky-600 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    total: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Daftar Pesanan Dapur | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-1.5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Daftar Pesanan Dapur</h1>
              <p className="text-gray-600">Kelola semua pesanan masuk ke dapur</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
              <Calendar className="w-4 h-4 mr-2" />
              Hari Ini
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pesanan Baru</p>
                  <p className="text-2xl font-bold text-red-600">{stats.new}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sedang Dimasak</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.preparing}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Siap Disajikan</p>
                  <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari nomor order, meja, atau nama..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="new">Baru</SelectItem>
                  <SelectItem value="preparing">Dimasak</SelectItem>
                  <SelectItem value="ready">Siap</SelectItem>
                  <SelectItem value="served">Disajikan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipe Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="dine-in">Dine In</SelectItem>
                  <SelectItem value="takeaway">Take Away</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pesanan ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">No. Order</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Lokasi/Pelanggan</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipe</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Waktu</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {order.priority === 'urgent' && (
                            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                          )}
                          <span className="font-medium text-gray-900">{order.orderNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900">
                          {order.tableNumber ? `Meja ${order.tableNumber}` : order.customerName}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{getOrderTypeLabel(order.orderType)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900">{order.items} item</span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{formatTime(order.receivedAt)}</div>
                          {order.prepTime && (
                            <div className="text-gray-500">{order.prepTime} menit</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
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
    </DashboardLayout>
  );
};

export default KitchenOrdersPage;
