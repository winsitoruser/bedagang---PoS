import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FaTicketAlt, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
  FaPercentage, FaMoneyBillWave, FaCalendarAlt, FaUsers,
  FaChartLine, FaCopy, FaDownload, FaTag
} from 'react-icons/fa';

const PromoVoucherPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('promo');

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Mock data
  const promos = [
    { id: '1', name: 'Diskon Akhir Tahun', code: 'NEWYEAR2026', type: 'percentage', value: 20, minPurchase: 100000, maxDiscount: 50000, startDate: '2026-01-01', endDate: '2026-01-31', used: 45, limit: 100, status: 'active' },
    { id: '2', name: 'Gratis Ongkir', code: 'FREESHIPJAN', type: 'fixed', value: 15000, minPurchase: 50000, maxDiscount: 15000, startDate: '2026-01-01', endDate: '2026-01-31', used: 123, limit: 500, status: 'active' },
    { id: '3', name: 'Cashback 10%', code: 'CASHBACK10', type: 'percentage', value: 10, minPurchase: 200000, maxDiscount: 100000, startDate: '2026-01-15', endDate: '2026-02-15', used: 28, limit: 200, status: 'active' },
  ];

  const vouchers = [
    { id: '1', code: 'WELCOME50K', type: 'fixed', value: 50000, minPurchase: 250000, validUntil: '2026-12-31', used: 234, limit: 1000, status: 'active', category: 'welcome' },
    { id: '2', code: 'MEMBER20', type: 'percentage', value: 20, minPurchase: 100000, validUntil: '2026-06-30', used: 567, limit: null, status: 'active', category: 'member' },
    { id: '3', code: 'BIRTHDAY100K', type: 'fixed', value: 100000, minPurchase: 500000, validUntil: '2026-12-31', used: 89, limit: 500, status: 'active', category: 'birthday' },
  ];

  const stats = [
    { label: 'Total Promo Aktif', value: '12', icon: FaTicketAlt, color: 'bg-blue-500' },
    { label: 'Total Voucher Aktif', value: '25', icon: FaTag, color: 'bg-green-500' },
    { label: 'Penggunaan Bulan Ini', value: '1,234', icon: FaUsers, color: 'bg-purple-500' },
    { label: 'Total Diskon Diberikan', value: 'Rp 45 Jt', icon: FaMoneyBillWave, color: 'bg-orange-500' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-purple-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Promo & Voucher Management | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FaTicketAlt className="mr-3 h-6 w-6" />
                Promo & Voucher Management
              </h1>
              <p className="text-purple-50 mt-1 text-sm">
                Kelola promo, voucher, dan diskon untuk pelanggan
              </p>
            </div>
            <Button 
              className="bg-white text-purple-600 hover:bg-purple-50"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Buat Promo/Voucher
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger 
              value="promo"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <FaPercentage className="mr-2 h-4 w-4" /> Promo
            </TabsTrigger>
            <TabsTrigger 
              value="voucher"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <FaTag className="mr-2 h-4 w-4" /> Voucher
            </TabsTrigger>
          </TabsList>

          {/* Promo Tab */}
          <TabsContent value="promo" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Daftar Promo</CardTitle>
                    <CardDescription>Kelola promo dan diskon untuk pelanggan</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FaFilter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <FaDownload className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Cari promo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Promo</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Nilai</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead>Penggunaan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promos.map((promo) => (
                        <TableRow key={promo.id}>
                          <TableCell className="font-medium">{promo.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <code className="px-2 py-1 bg-gray-100 rounded text-sm">{promo.code}</code>
                              <Button variant="ghost" size="sm">
                                <FaCopy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={promo.type === 'percentage' ? 'default' : 'secondary'}>
                              {promo.type === 'percentage' ? 'Persentase' : 'Fixed'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {promo.type === 'percentage' ? `${promo.value}%` : formatCurrency(promo.value)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {promo.used} / {promo.limit}
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-purple-600 h-1.5 rounded-full" 
                                  style={{ width: `${(promo.used / promo.limit) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>
                              {promo.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <FaEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <FaTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voucher Tab */}
          <TabsContent value="voucher" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Daftar Voucher</CardTitle>
                    <CardDescription>Kelola voucher untuk pelanggan</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FaFilter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <FaDownload className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Cari voucher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode Voucher</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Nilai</TableHead>
                        <TableHead>Min. Pembelian</TableHead>
                        <TableHead>Valid Hingga</TableHead>
                        <TableHead>Penggunaan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vouchers.map((voucher) => (
                        <TableRow key={voucher.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <code className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-semibold">
                                {voucher.code}
                              </code>
                              <Button variant="ghost" size="sm">
                                <FaCopy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {voucher.category === 'welcome' ? 'Welcome' : 
                               voucher.category === 'member' ? 'Member' : 'Birthday'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={voucher.type === 'percentage' ? 'default' : 'secondary'}>
                              {voucher.type === 'percentage' ? 'Persentase' : 'Fixed'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {voucher.type === 'percentage' ? `${voucher.value}%` : formatCurrency(voucher.value)}
                          </TableCell>
                          <TableCell>{formatCurrency(voucher.minPurchase)}</TableCell>
                          <TableCell>{formatDate(voucher.validUntil)}</TableCell>
                          <TableCell>
                            {voucher.used} {voucher.limit ? `/ ${voucher.limit}` : '/ Unlimited'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={voucher.status === 'active' ? 'default' : 'secondary'}>
                              {voucher.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <FaEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <FaTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PromoVoucherPage;
