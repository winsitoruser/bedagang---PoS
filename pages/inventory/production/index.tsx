import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import WasteRecordModal from '@/components/inventory/WasteRecordModal';
import {
  FaIndustry, FaPlus, FaPlay, FaCheck, FaClock, FaBoxOpen,
  FaClipboardCheck, FaExclamationTriangle, FaChartLine, FaFlask,
  FaWarehouse, FaCheckCircle, FaTimes, FaArrowLeft, FaHistory,
  FaEdit, FaTrash, FaEye, FaCalendar, FaUser, FaDollarSign,
  FaRecycle, FaTools, FaShoppingCart, FaHandHoldingHeart
} from 'react-icons/fa';

interface Production {
  id: number;
  batch_number: string;
  recipe_id: number;
  planned_quantity: number;
  produced_quantity: number;
  unit: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  production_date: string;
  start_time?: string;
  completion_time?: string;
  total_cost: number;
  quality_grade?: string;
  notes?: string;
  recipe?: {
    id: number;
    code: string;
    name: string;
    batch_size: number;
    batch_unit: string;
  };
  materials?: Array<{
    id: number;
    product_id: number;
    planned_quantity: number;
    used_quantity: number;
    unit: string;
    material?: {
      id: number;
      name: string;
      sku: string;
    };
  }>;
  producer?: {
    id: number;
    name: string;
  };
}

interface Recipe {
  id: number;
  code: string;
  name: string;
  batch_size: number;
  batch_unit: string;
  total_cost: number;
  ingredients?: Array<{
    product_id: number;
    quantity: number;
    unit: string;
  }>;
}

interface WasteRecord {
  id: number;
  waste_number: string;
  production_id?: number;
  waste_type: string;
  waste_category: string;
  quantity: number;
  unit: string;
  cost_value: number;
  disposal_method: string;
  clearance_price: number;
  net_loss: number;
  reason?: string;
  notes?: string;
  waste_date: string;
  status: string;
  created_at: string;
  production?: {
    batch_number: string;
  };
}

const ProductionPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'production' | 'waste'>('production');
  const [productions, setProductions] = useState<Production[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [wasteSummary, setWasteSummary] = useState({ total_records: 0, total_loss: 0, total_recovery: 0, net_loss: 0 });

  useEffect(() => {
    fetchProductions();
    fetchRecipes();
    fetchWasteRecords();
  }, [filterStatus]);

  const fetchProductions = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`/api/productions?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProductions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching productions:', error);
      toast({
        title: '❌ Gagal Memuat Data',
        description: 'Tidak dapat memuat data produksi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes?status=active');
      const data = await response.json();
      
      if (data.success) {
        setRecipes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchWasteRecords = async () => {
    try {
      const response = await fetch('/api/waste');
      const data = await response.json();
      
      if (data.success) {
        setWasteRecords(data.data || []);
        setWasteSummary(data.summary || { total_records: 0, total_loss: 0, total_recovery: 0, net_loss: 0 });
      }
    } catch (error) {
      console.error('Error fetching waste records:', error);
    }
  };

  const handleWasteSubmit = async (wasteData: any) => {
    try {
      const response = await fetch('/api/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...wasteData,
          recorded_by: 1,
          waste_date: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: '✅ Limbah Tercatat!',
          description: `${data.data.waste_number} - Kerugian bersih: Rp ${data.data.net_loss.toLocaleString('id-ID')}`,
          className: 'bg-green-50 border-green-200'
        });
        setShowWasteModal(false);
        fetchWasteRecords();
      } else {
        toast({
          title: '❌ Gagal Mencatat Limbah',
          description: data.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error recording waste:', error);
      toast({
        title: '❌ Terjadi Kesalahan',
        description: 'Gagal mencatat limbah',
        variant: 'destructive'
      });
    }
  };

  const handleStartProduction = async (recipeId: number) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    try {
      const productionData = {
        recipe_id: recipeId,
        planned_quantity: recipe.batch_size,
        production_date: new Date().toISOString(),
        unit: recipe.batch_unit,
        total_cost: recipe.total_cost,
        materials: recipe.ingredients || [],
        produced_by: 1
      };

      const response = await fetch('/api/productions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productionData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: '✅ Produksi Dimulai!',
          description: `Batch ${data.data.batch_number} berhasil dibuat`,
          className: 'bg-green-50 border-green-200'
        });
        fetchProductions();
      } else {
        toast({
          title: '❌ Gagal Memulai Produksi',
          description: data.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error starting production:', error);
      toast({
        title: '❌ Terjadi Kesalahan',
        description: 'Gagal memulai produksi',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStatus = async (productionId: number, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        changed_by: 1
      };

      if (newStatus === 'in_progress') {
        updateData.start_time = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.completion_time = new Date().toISOString();
        const production = productions.find(p => p.id === productionId);
        if (production) {
          updateData.produced_quantity = production.planned_quantity;
        }
      }

      const response = await fetch(`/api/productions/${productionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (data.success) {
        const statusLabel = newStatus === 'in_progress' ? 'Sedang Proses' : 
                           newStatus === 'completed' ? 'Selesai' : newStatus;
        toast({
          title: '✅ Status Diperbarui!',
          description: `Status produksi berhasil diubah ke ${statusLabel}`,
          className: 'bg-green-50 border-green-200'
        });
        fetchProductions();
      } else {
        toast({
          title: '❌ Gagal Memperbarui',
          description: data.message || 'Terjadi kesalahan saat memperbarui status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: '❌ Gagal Memperbarui',
        description: 'Terjadi kesalahan saat memperbarui status',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      planned: { color: 'bg-blue-100 text-blue-700', icon: FaClock, label: 'Direncanakan' },
      in_progress: { color: 'bg-yellow-100 text-yellow-700', icon: FaPlay, label: 'Sedang Proses' },
      completed: { color: 'bg-green-100 text-green-700', icon: FaCheckCircle, label: 'Selesai' },
      cancelled: { color: 'bg-red-100 text-red-700', icon: FaTimes, label: 'Dibatalkan' }
    };
    const statusConfig = config[status as keyof typeof config] || config.planned;
    const Icon = statusConfig.icon;
    return (
      <Badge className={statusConfig.color}>
        <Icon className="mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      raw_material: 'bg-orange-100 text-orange-700',
      work_in_progress: 'bg-yellow-100 text-yellow-700',
      finished_product: 'bg-blue-100 text-blue-700',
      packaging: 'bg-purple-100 text-purple-700',
      other: 'bg-gray-100 text-gray-700'
    };
    const labels = {
      raw_material: 'Bahan Baku',
      work_in_progress: 'WIP',
      finished_product: 'Produk Jadi',
      packaging: 'Kemasan',
      other: 'Lainnya'
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100'}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      defect: 'bg-red-100 text-red-700',
      expired: 'bg-orange-100 text-orange-700',
      damaged: 'bg-yellow-100 text-yellow-700',
      overproduction: 'bg-blue-100 text-blue-700',
      spillage: 'bg-purple-100 text-purple-700',
      contamination: 'bg-pink-100 text-pink-700'
    };
    const labels = {
      defect: 'Cacat',
      expired: 'Kadaluarsa',
      damaged: 'Rusak',
      overproduction: 'Overproduksi',
      spillage: 'Tumpah',
      contamination: 'Kontaminasi'
    };
    return (
      <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100'}>
        {labels[category as keyof typeof labels] || category}
      </Badge>
    );
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      discard: 'Buang',
      recycle: 'Daur Ulang',
      rework: 'Rework',
      clearance_sale: 'Clearance Sale',
      donation: 'Donasi'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const filteredProductions = productions.filter(prod =>
    prod.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.recipe?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWaste = wasteRecords.filter(waste =>
    waste.waste_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    waste.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    waste.production?.batch_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: productions.length,
    planned: productions.filter(p => p.status === 'planned').length,
    inProgress: productions.filter(p => p.status === 'in_progress').length,
    completed: productions.filter(p => p.status === 'completed').length,
    totalProduced: productions.reduce((sum, p) => sum + (p.produced_quantity || 0), 0)
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.push('/inventory')}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <FaArrowLeft className="mr-2" />
                  Kembali
                </Button>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <FaIndustry className="w-7 h-7" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">Manajemen Produksi</h1>
                      <p className="text-indigo-100 text-sm">Kelola produksi & limbah dengan tracking real-time</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => router.push('/inventory/production/history')}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <FaHistory className="mr-2" />
                Riwayat Produksi
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <p className="text-xs text-indigo-100">Total Batch</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-500/30 backdrop-blur-sm rounded-lg p-3 border border-blue-400/30">
                <p className="text-xs text-blue-100">Direncanakan</p>
                <p className="text-2xl font-bold">{stats.planned}</p>
              </div>
              <div className="bg-yellow-500/30 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/30">
                <p className="text-xs text-yellow-100">Sedang Proses</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <div className="bg-green-500/30 backdrop-blur-sm rounded-lg p-3 border border-green-400/30">
                <p className="text-xs text-green-100">Selesai</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <div className="bg-purple-500/30 backdrop-blur-sm rounded-lg p-3 border border-purple-400/30">
                <p className="text-xs text-purple-100">Total Diproduksi</p>
                <p className="text-2xl font-bold">{stats.totalProduced}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('production')}
                  className={`${
                    activeTab === 'production'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <FaIndustry />
                  <span>Produksi</span>
                </button>
                <button
                  onClick={() => setActiveTab('waste')}
                  className={`${
                    activeTab === 'waste'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <FaTrash />
                  <span>Limbah & Produk Sisa</span>
                  {wasteSummary.total_records > 0 && (
                    <Badge className="bg-red-100 text-red-700">{wasteSummary.total_records}</Badge>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {/* Production Tab Content */}
          {activeTab === 'production' && (
            <>
              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Cari batch atau resep..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                      <FaClipboardCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">Semua Status</option>
                      <option value="planned">Direncanakan</option>
                      <option value="in_progress">Sedang Proses</option>
                      <option value="completed">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Available Recipes */}
              {recipes.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FaFlask className="mr-2 text-indigo-600" />
                      Resep Tersedia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recipes.slice(0, 3).map((recipe) => (
                        <div key={recipe.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{recipe.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Batch: {recipe.batch_size} {recipe.batch_unit}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-500">Biaya</span>
                            <span className="font-bold text-indigo-600">{formatCurrency(recipe.total_cost)}</span>
                          </div>
                          <Button
                            onClick={() => handleStartProduction(recipe.id)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            size="sm"
                          >
                            <FaPlay className="mr-2" />
                            Mulai Produksi
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Production List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaClipboardCheck className="mr-2 text-indigo-600" />
                    Daftar Produksi ({filteredProductions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredProductions.length === 0 ? (
                    <div className="text-center py-12">
                      <FaIndustry className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Belum Ada Produksi
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Mulai produksi pertama Anda dengan memilih resep di atas
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredProductions.map((production) => (
                        <div key={production.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-bold text-xl text-gray-900">{production.batch_number}</h3>
                                {getStatusBadge(production.status)}
                                {production.quality_grade && (
                                  <Badge className="bg-purple-100 text-purple-700">
                                    Grade {production.quality_grade}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600">{production.recipe?.name}</p>
                              <p className="text-sm text-gray-500">SKU: {production.recipe?.code}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 flex items-center justify-end">
                                <FaCalendar className="mr-1" />
                                {formatDate(production.production_date)}
                              </p>
                              {production.producer && (
                                <p className="text-xs text-gray-500 flex items-center justify-end mt-1">
                                  <FaUser className="mr-1" />
                                  {production.producer.name}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-xs text-gray-500">Rencana</p>
                              <p className="text-lg font-bold text-gray-900">
                                {production.planned_quantity} {production.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Diproduksi</p>
                              <p className="text-lg font-bold text-indigo-600">
                                {production.produced_quantity} {production.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Total Biaya</p>
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(production.total_cost)}
                              </p>
                            </div>
                          </div>

                          {production.notes && (
                            <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded mb-4">
                              <p className="text-sm text-gray-700">{production.notes}</p>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            {production.status === 'planned' && (
                              <Button
                                onClick={() => handleUpdateStatus(production.id, 'in_progress')}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                                size="sm"
                              >
                                <FaPlay className="mr-2" />
                                Mulai Proses
                              </Button>
                            )}
                            {production.status === 'in_progress' && (
                              <Button
                                onClick={() => handleUpdateStatus(production.id, 'completed')}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                <FaCheck className="mr-2" />
                                Selesaikan Produksi
                              </Button>
                            )}
                            <Button
                              onClick={() => {
                                toast({
                                  title: 'ℹ️ Detail Produksi',
                                  description: `Batch: ${production.batch_number} - ${production.recipe?.name}`,
                                  className: 'bg-blue-50 border-blue-200'
                                });
                              }}
                              variant="outline"
                              className="flex-1"
                              size="sm"
                            >
                              <FaEye className="mr-2" />
                              Lihat Detail
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Waste Tab Content */}
          {activeTab === 'waste' && (
            <>
              {/* Waste Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600 mb-1">Total Limbah</p>
                        <p className="text-3xl font-bold text-red-700">{wasteSummary.total_records}</p>
                        <p className="text-xs text-gray-600 mt-1">Record</p>
                      </div>
                      <FaTrash className="text-4xl text-red-300" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600 mb-1">Total Kerugian</p>
                        <p className="text-xl font-bold text-orange-700">
                          {formatCurrency(wasteSummary.total_loss)}
                        </p>
                      </div>
                      <FaDollarSign className="text-4xl text-orange-300" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 mb-1">Recovery</p>
                        <p className="text-xl font-bold text-green-700">
                          {formatCurrency(wasteSummary.total_recovery)}
                        </p>
                      </div>
                      <FaShoppingCart className="text-4xl text-green-300" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-pink-100 border-red-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600 mb-1">Kerugian Bersih</p>
                        <p className="text-xl font-bold text-red-700">
                          {formatCurrency(wasteSummary.net_loss)}
                        </p>
                      </div>
                      <FaExclamationTriangle className="text-4xl text-red-300" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Waste Management Card */}
              <Card className="mb-6 border-2 border-red-200">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <FaTrash className="mr-2 text-red-600" />
                      Manajemen Limbah & Produk Sisa
                    </CardTitle>
                    <Button
                      onClick={() => setShowWasteModal(true)}
                      className="bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      <FaPlus className="mr-2" />
                      Catat Limbah Baru
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Input
                      type="text"
                      placeholder="Cari nomor limbah, batch, atau alasan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {filteredWaste.length === 0 ? (
                    <div className="text-center py-12">
                      <FaCheckCircle className="text-6xl text-green-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Belum Ada Limbah Tercatat
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Klik "Catat Limbah Baru" untuk mencatat produk cacat atau limbah produksi
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredWaste.map((waste) => (
                        <div key={waste.id} className="border-2 border-red-200 rounded-xl p-5 hover:border-red-300 transition-colors bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className="bg-red-100 text-red-700 text-sm">{waste.waste_number}</Badge>
                                {getTypeBadge(waste.waste_type)}
                                {getCategoryBadge(waste.waste_category)}
                                {waste.production && (
                                  <Badge className="bg-indigo-100 text-indigo-700">
                                    {waste.production.batch_number}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-semibold">{waste.quantity} {waste.unit}</span>
                                {waste.reason && ` • ${waste.reason}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(waste.net_loss)}
                              </p>
                              <p className="text-xs text-gray-500">Kerugian Bersih</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Nilai Kerugian</p>
                              <p className="text-sm font-bold text-orange-600">
                                {formatCurrency(waste.cost_value)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Recovery</p>
                              <p className="text-sm font-bold text-green-600">
                                {formatCurrency(waste.clearance_price)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Metode</p>
                              <p className="text-sm font-semibold text-gray-700">
                                {getMethodLabel(waste.disposal_method)}
                              </p>
                            </div>
                          </div>

                          {waste.notes && (
                            <div className="p-2 bg-blue-50 border-l-4 border-blue-400 rounded text-xs text-gray-700 mb-2">
                              <strong>Catatan:</strong> {waste.notes}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <FaCalendar className="mr-1" />
                                {formatDate(waste.waste_date)}
                              </span>
                            </div>
                            <Badge className={
                              waste.status === 'recovered' ? 'bg-green-100 text-green-700' :
                              waste.status === 'disposed' ? 'bg-gray-100 text-gray-700' :
                              'bg-blue-100 text-blue-700'
                            }>
                              {waste.status === 'recovered' ? 'Recovered' :
                               waste.status === 'disposed' ? 'Disposed' : 'Recorded'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Waste Record Modal */}
      <WasteRecordModal
        isOpen={showWasteModal}
        onClose={() => setShowWasteModal(false)}
        onSubmit={handleWasteSubmit}
        productions={productions}
      />

      <Toaster />
    </DashboardLayout>
  );
};

export default ProductionPage;
