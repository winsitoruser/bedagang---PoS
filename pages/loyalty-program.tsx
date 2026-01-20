import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FaStar, FaGift, FaTrophy, FaUsers, FaChartLine,
  FaPlus, FaEdit, FaTrash, FaSearch, FaDownload,
  FaMedal, FaCrown, FaAward, FaCoins
} from 'react-icons/fa';

const LoyaltyProgramPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Mock data
  const tiers = [
    { id: '1', name: 'Bronze', minPoints: 0, maxPoints: 999, benefits: ['Diskon 5%', 'Poin 1x'], members: 1234, color: 'bg-orange-600' },
    { id: '2', name: 'Silver', minPoints: 1000, maxPoints: 4999, benefits: ['Diskon 10%', 'Poin 1.5x', 'Free Shipping'], members: 567, color: 'bg-gray-400' },
    { id: '3', name: 'Gold', minPoints: 5000, maxPoints: 9999, benefits: ['Diskon 15%', 'Poin 2x', 'Free Shipping', 'Priority Support'], members: 234, color: 'bg-yellow-500' },
    { id: '4', name: 'Platinum', minPoints: 10000, maxPoints: null, benefits: ['Diskon 20%', 'Poin 3x', 'Free Shipping', 'Priority Support', 'Exclusive Deals'], members: 89, color: 'bg-purple-600' },
  ];

  const topMembers = [
    { id: '1', name: 'Ahmad Rizki', email: 'ahmad@email.com', tier: 'Platinum', points: 15420, totalSpent: 25000000, transactions: 145 },
    { id: '2', name: 'Siti Nurhaliza', email: 'siti@email.com', tier: 'Gold', points: 8750, totalSpent: 18000000, transactions: 98 },
    { id: '3', name: 'Budi Santoso', email: 'budi@email.com', tier: 'Gold', points: 7230, totalSpent: 15000000, transactions: 87 },
    { id: '4', name: 'Dewi Lestari', email: 'dewi@email.com', tier: 'Silver', points: 3450, totalSpent: 8500000, transactions: 56 },
    { id: '5', name: 'Eko Prasetyo', email: 'eko@email.com', tier: 'Silver', points: 2890, totalSpent: 7200000, transactions: 43 },
  ];

  const rewards = [
    { id: '1', name: 'Voucher Rp 50.000', points: 500, stock: 100, claimed: 45, type: 'voucher' },
    { id: '2', name: 'Voucher Rp 100.000', points: 1000, stock: 50, claimed: 23, type: 'voucher' },
    { id: '3', name: 'Free Product Sample', points: 250, stock: 200, claimed: 156, type: 'product' },
    { id: '4', name: 'Exclusive Merchandise', points: 2000, stock: 30, claimed: 12, type: 'merchandise' },
  ];

  const stats = [
    { label: 'Total Member', value: '2,124', icon: FaUsers, color: 'bg-blue-500', change: '+12%' },
    { label: 'Poin Ditukar Bulan Ini', value: '45,678', icon: FaCoins, color: 'bg-green-500', change: '+8%' },
    { label: 'Reward Diklaim', value: '236', icon: FaGift, color: 'bg-purple-500', change: '+15%' },
    { label: 'Engagement Rate', value: '68%', icon: FaChartLine, color: 'bg-orange-500', change: '+5%' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTierIcon = (tier: string) => {
    switch(tier) {
      case 'Bronze': return FaMedal;
      case 'Silver': return FaAward;
      case 'Gold': return FaTrophy;
      case 'Platinum': return FaCrown;
      default: return FaStar;
    }
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'Bronze': return 'text-orange-600';
      case 'Silver': return 'text-gray-500';
      case 'Gold': return 'text-yellow-500';
      case 'Platinum': return 'text-purple-600';
      default: return 'text-gray-400';
    }
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-orange-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Loyalty Program | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FaStar className="mr-3 h-6 w-6" />
                Loyalty Program
              </h1>
              <p className="text-orange-50 mt-1 text-sm">
                Kelola program loyalitas dan reward pelanggan
              </p>
            </div>
            <Button className="bg-white text-orange-600 hover:bg-orange-50">
              <FaPlus className="mr-2 h-4 w-4" />
              Tambah Reward
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
                    <span className="text-xs font-medium text-green-600">{stat.change}</span>
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
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-6">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <FaChartLine className="mr-2 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger 
              value="tiers"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <FaTrophy className="mr-2 h-4 w-4" /> Tier
            </TabsTrigger>
            <TabsTrigger 
              value="rewards"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <FaGift className="mr-2 h-4 w-4" /> Rewards
            </TabsTrigger>
            <TabsTrigger 
              value="members"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <FaUsers className="mr-2 h-4 w-4" /> Members
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tier Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Member per Tier</CardTitle>
                  <CardDescription>Jumlah member di setiap tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tiers.map((tier) => {
                      const Icon = getTierIcon(tier.name);
                      const totalMembers = tiers.reduce((sum, t) => sum + t.members, 0);
                      const percentage = (tier.members / totalMembers) * 100;
                      
                      return (
                        <div key={tier.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className={`h-5 w-5 ${getTierColor(tier.name)}`} />
                              <span className="font-medium">{tier.name}</span>
                            </div>
                            <span className="text-sm text-gray-600">{tier.members} member</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Top Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Member</CardTitle>
                  <CardDescription>Member dengan poin tertinggi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topMembers.map((member, index) => {
                      const Icon = getTierIcon(member.tier);
                      return (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full text-orange-600 font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Icon className={`h-4 w-4 ${getTierColor(member.tier)}`} />
                              <span className="text-sm font-medium">{member.points.toLocaleString()} pts</span>
                            </div>
                            <p className="text-xs text-gray-500">{member.transactions} transaksi</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tiers Tab */}
          <TabsContent value="tiers" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tier Membership</CardTitle>
                    <CardDescription>Kelola tier dan benefit program loyalitas</CardDescription>
                  </div>
                  <Button>
                    <FaPlus className="mr-2 h-4 w-4" />
                    Tambah Tier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiers.map((tier) => {
                    const Icon = getTierIcon(tier.name);
                    return (
                      <Card key={tier.id} className="border-2">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`${tier.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{tier.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {tier.minPoints.toLocaleString()} - {tier.maxPoints ? tier.maxPoints.toLocaleString() : '∞'} poin
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <FaEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <FaTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <p className="text-sm font-medium text-gray-700">Benefit:</p>
                            <ul className="space-y-1">
                              {tier.benefits.map((benefit, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Total Member</span>
                              <span className="font-bold text-gray-900">{tier.members.toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Katalog Reward</CardTitle>
                    <CardDescription>Kelola reward yang dapat ditukar dengan poin</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FaDownload className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button>
                      <FaPlus className="mr-2 h-4 w-4" />
                      Tambah Reward
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Reward</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Poin Dibutuhkan</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Diklaim</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rewards.map((reward) => (
                        <TableRow key={reward.id}>
                          <TableCell className="font-medium">{reward.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {reward.type === 'voucher' ? 'Voucher' : 
                               reward.type === 'product' ? 'Produk' : 'Merchandise'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <FaCoins className="h-4 w-4 text-orange-500" />
                              <span className="font-medium">{reward.points.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>{reward.stock}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">{reward.claimed} / {reward.stock}</div>
                              <Progress value={(reward.claimed / reward.stock) * 100} className="h-1.5" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={reward.stock > reward.claimed ? 'default' : 'secondary'}>
                              {reward.stock > reward.claimed ? 'Tersedia' : 'Habis'}
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

          {/* Members Tab */}
          <TabsContent value="members" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Daftar Member</CardTitle>
                    <CardDescription>Kelola member program loyalitas</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <FaDownload className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Cari member..."
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
                        <TableHead>Member</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Poin</TableHead>
                        <TableHead>Total Belanja</TableHead>
                        <TableHead>Transaksi</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topMembers.map((member) => {
                        const Icon = getTierIcon(member.tier);
                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-500">{member.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Icon className={`h-5 w-5 ${getTierColor(member.tier)}`} />
                                <span className="font-medium">{member.tier}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <FaCoins className="h-4 w-4 text-orange-500" />
                                <span className="font-medium">{member.points.toLocaleString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>{formatCurrency(member.totalSpent)}</TableCell>
                            <TableCell>{member.transactions}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <FaEdit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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

export default LoyaltyProgramPage;
