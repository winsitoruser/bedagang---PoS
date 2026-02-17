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
  Search, Plus, Users, Clock, Award, 
  Calendar, ChefHat, Edit, Trash2, Eye
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: 'head_chef' | 'sous_chef' | 'line_cook' | 'prep_cook';
  shift: 'morning' | 'afternoon' | 'night';
  status: 'active' | 'off' | 'leave';
  performance: number;
  ordersCompleted: number;
  avgPrepTime: number;
  joinDate: Date;
}

const KitchenStaffPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Mock data
  useEffect(() => {
    const mockStaff: StaffMember[] = [
      {
        id: '1',
        name: 'Chef Ahmad Rizki',
        role: 'head_chef',
        shift: 'morning',
        status: 'active',
        performance: 95,
        ordersCompleted: 450,
        avgPrepTime: 15,
        joinDate: new Date('2023-01-15')
      },
      {
        id: '2',
        name: 'Siti Nurhaliza',
        role: 'sous_chef',
        shift: 'morning',
        status: 'active',
        performance: 92,
        ordersCompleted: 380,
        avgPrepTime: 17,
        joinDate: new Date('2023-03-20')
      },
      {
        id: '3',
        name: 'Budi Santoso',
        role: 'line_cook',
        shift: 'afternoon',
        status: 'active',
        performance: 88,
        ordersCompleted: 320,
        avgPrepTime: 18,
        joinDate: new Date('2023-06-10')
      },
      {
        id: '4',
        name: 'Dewi Lestari',
        role: 'line_cook',
        shift: 'night',
        status: 'active',
        performance: 85,
        ordersCompleted: 290,
        avgPrepTime: 19,
        joinDate: new Date('2023-08-05')
      },
      {
        id: '5',
        name: 'Andi Wijaya',
        role: 'prep_cook',
        shift: 'morning',
        status: 'off',
        performance: 80,
        ordersCompleted: 250,
        avgPrepTime: 20,
        joinDate: new Date('2023-09-12')
      }
    ];
    setStaff(mockStaff);
  }, []);

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const styles = {
      head_chef: 'bg-purple-100 text-purple-800 border-purple-200',
      sous_chef: 'bg-blue-100 text-blue-800 border-blue-200',
      line_cook: 'bg-green-100 text-green-800 border-green-200',
      prep_cook: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    const labels = {
      head_chef: 'Head Chef',
      sous_chef: 'Sous Chef',
      line_cook: 'Line Cook',
      prep_cook: 'Prep Cook'
    };
    return (
      <Badge className={`${styles[role as keyof typeof styles]} border`}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      off: 'bg-gray-100 text-gray-800 border-gray-200',
      leave: 'bg-amber-100 text-amber-800 border-amber-200'
    };
    const labels = {
      active: 'Aktif',
      off: 'Off',
      leave: 'Cuti'
    };
    return (
      <Badge className={`${styles[status as keyof typeof styles]} border`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getShiftLabel = (shift: string) => {
    const labels = {
      morning: 'Pagi (06:00-14:00)',
      afternoon: 'Siang (14:00-22:00)',
      night: 'Malam (22:00-06:00)'
    };
    return labels[shift as keyof typeof labels];
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
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    avgPerformance: Math.round(staff.reduce((acc, s) => acc + s.performance, 0) / staff.length)
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Tim Dapur | BEDAGANG</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-1.5 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full mr-3"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tim Dapur</h1>
              <p className="text-gray-600">Kelola staff dan shift dapur</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Staff
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Staff Aktif</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Performance</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgPerformance}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <p className="text-sm text-gray-600">{getShiftLabel(member.shift)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getRoleBadge(member.role)}
                    {getStatusBadge(member.status)}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Performance</span>
                      <span className="text-sm font-bold text-purple-600">{member.performance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${member.performance}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-sky-50 rounded-lg p-3">
                      <div className="flex items-center text-sky-600 mb-1">
                        <Award className="w-4 h-4 mr-1" />
                        <span className="text-xs">Orders</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{member.ordersCompleted}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center text-blue-600 mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-xs">Avg. Time</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{member.avgPrepTime}m</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    Bergabung: {member.joinDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KitchenStaffPage;
