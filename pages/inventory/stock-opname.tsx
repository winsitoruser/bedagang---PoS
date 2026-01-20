import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  FaClipboardList, FaSearch, FaSave, FaDownload, 
  FaPrint, FaPlus, FaEdit, FaCheck, FaTimes
} from 'react-icons/fa';

interface StockOpnameItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  status: 'pending' | 'verified' | 'adjusted';
  notes: string;
}

const StockOpnamePage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<StockOpnameItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [opnameData, setOpnameData] = useState({
    opnameNumber: `SO-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    location: '',
    performedBy: session?.user?.name || '',
    notes: ''
  });

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockProducts: StockOpnameItem[] = [
        {
          id: '1',
          productId: 'prod-001',
          productName: 'Paracetamol 500mg',
          sku: 'MED-PCT-500',
          category: 'Obat',
          systemStock: 120,
          physicalStock: 0,
          difference: 0,
          status: 'pending',
          notes: ''
        },
        {
          id: '2',
          productId: 'prod-002',
          productName: 'Amoxicillin 500mg',
          sku: 'MED-AMX-500',
          category: 'Obat',
          systemStock: 85,
          physicalStock: 0,
          difference: 0,
          status: 'pending',
          notes: ''
        },
        {
          id: '3',
          productId: 'prod-003',
          productName: 'Vitamin C 1000mg',
          sku: 'SUP-VTC-1000',
          category: 'Suplemen',
          systemStock: 200,
          physicalStock: 0,
          difference: 0,
          status: 'pending',
          notes: ''
        },
        {
          id: '4',
          productId: 'prod-004',
          productName: 'Vitamin B Complex',
          sku: 'SUP-VTB-COMP',
          category: 'Suplemen',
          systemStock: 150,
          physicalStock: 0,
          difference: 0,
          status: 'pending',
          notes: ''
        },
        {
          id: '5',
          productId: 'prod-005',
          productName: 'Ibuprofen 400mg',
          sku: 'MED-IBU-400',
          category: 'Obat',
          systemStock: 75,
          physicalStock: 0,
          difference: 0,
          status: 'pending',
          notes: ''
        }
      ];
      setItems(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhysicalStockChange = (id: string, value: string) => {
    const physicalStock = parseInt(value) || 0;
    setItems(items.map(item => {
      if (item.id === id) {
        const difference = physicalStock - item.systemStock;
        return {
          ...item,
          physicalStock,
          difference,
          status: difference !== 0 ? 'verified' : 'pending'
        };
      }
      return item;
    }));
  };

  const handleNotesChange = (id: string, notes: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, notes } : item
    ));
  };

  const handleVerifyItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, status: 'verified' as const } : item
    ));
  };

  const handleSaveOpname = async () => {
    setLoading(true);
    try {
      const opnamePayload = {
        ...opnameData,
        items: items.filter(item => item.physicalStock > 0 || item.difference !== 0)
      };

      // Mock API call - replace with actual API
      console.log('Saving stock opname:', opnamePayload);
      
      alert('Stock opname berhasil disimpan!');
      router.push('/inventory');
    } catch (error) {
      console.error('Error saving stock opname:', error);
      alert('Gagal menyimpan stock opname');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdjustment = async () => {
    const itemsWithDifference = items.filter(item => item.difference !== 0);
    
    if (itemsWithDifference.length === 0) {
      alert('Tidak ada perbedaan stok yang perlu disesuaikan');
      return;
    }

    setLoading(true);
    try {
      const adjustmentItems = itemsWithDifference.map(item => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        currentStock: item.systemStock,
        newStock: item.physicalStock,
        adjustmentQuantity: item.difference,
        adjustmentType: item.difference > 0 ? 'increase' : 'decrease',
        reason: 'Stock Opname',
        notes: item.notes || `Penyesuaian dari stock opname ${opnameData.opnameNumber}`
      }));

      const adjustmentPayload = {
        date: opnameData.date,
        adjustedBy: opnameData.performedBy,
        status: 'pending',
        notes: `Adjustment dari stock opname ${opnameData.opnameNumber}`,
        items: adjustmentItems
      };

      console.log('Creating adjustment:', adjustmentPayload);
      
      alert('Adjustment berhasil dibuat!');
      router.push('/inventory/adjustment');
    } catch (error) {
      console.error('Error creating adjustment:', error);
      alert('Gagal membuat adjustment');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDifference = items.reduce((sum, item) => sum + Math.abs(item.difference), 0);
  const itemsWithDifference = items.filter(item => item.difference !== 0).length;
  const verifiedItems = items.filter(item => item.status === 'verified').length;

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Stock Opname | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Stock Opname</h1>
              <p className="text-indigo-100">
                Lakukan penghitungan fisik stok barang
              </p>
            </div>
            <FaClipboardList className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Opname Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Stock Opname</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor SO
              </label>
              <input
                type="text"
                value={opnameData.opnameNumber}
                onChange={(e) => setOpnameData({...opnameData, opnameNumber: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={opnameData.date}
                onChange={(e) => setOpnameData({...opnameData, date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi
              </label>
              <input
                type="text"
                value={opnameData.location}
                onChange={(e) => setOpnameData({...opnameData, location: e.target.value})}
                placeholder="Gudang/Rak"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dilakukan Oleh
              </label>
              <input
                type="text"
                value={opnameData.performedBy}
                onChange={(e) => setOpnameData({...opnameData, performedBy: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Produk</p>
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Terverifikasi</p>
            <p className="text-2xl font-bold text-gray-900">{verifiedItems}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Ada Selisih</p>
            <p className="text-2xl font-bold text-gray-900">{itemsWithDifference}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Selisih</p>
            <p className="text-2xl font-bold text-gray-900">{totalDifference}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={handleSaveOpname}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <FaSave />
              <span>Simpan</span>
            </button>
            <button
              onClick={handleCreateAdjustment}
              disabled={loading || itemsWithDifference === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FaCheck />
              <span>Buat Adjustment</span>
            </button>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Sistem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Fisik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selisih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{item.productName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.sku}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{item.systemStock}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={item.physicalStock || ''}
                        onChange={(e) => handlePhysicalStockChange(item.id, e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${
                        item.difference > 0 ? 'text-green-600' : 
                        item.difference < 0 ? 'text-red-600' : 
                        'text-gray-900'
                      }`}>
                        {item.difference > 0 ? '+' : ''}{item.difference}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        placeholder="Catatan..."
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'verified' ? 'bg-green-100 text-green-800' :
                        item.status === 'adjusted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status === 'verified' ? 'Terverifikasi' :
                         item.status === 'adjusted' ? 'Disesuaikan' :
                         'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.status !== 'verified' && (
                        <button
                          onClick={() => handleVerifyItem(item.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Verifikasi"
                        >
                          <FaCheck />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockOpnamePage;
