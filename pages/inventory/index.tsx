import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ProductDetailModal, { ProductDetail } from '@/components/inventory/ProductDetailModal';
import {
  FaBoxOpen, FaLayerGroup, FaExclamationTriangle, FaChartBar,
  FaArrowRight, FaDollarSign, FaShoppingCart, FaCoins,
  FaPlus, FaSearch, FaFilter, FaDownload, FaUpload,
  FaWarehouse, FaTruck, FaClipboardList, FaChartLine
} from 'react-icons/fa';

const InventoryPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Mock data
  const stats = {
    totalProducts: 342,
    totalValue: 125000000,
    lowStock: 23,
    outOfStock: 5,
    categories: 12,
    suppliers: 8
  };

  const products = [
    { id: '1', name: 'Kopi Arabica Premium 250g', sku: 'KOP-001', category: 'Minuman', price: 45000, cost: 30000, stock: 50, minStock: 10, supplier: 'PT Kopi Nusantara', status: 'active' as const },
    { id: '2', name: 'Teh Hijau Organik', sku: 'TEH-001', category: 'Minuman', price: 35000, cost: 22000, stock: 8, minStock: 10, supplier: 'CV Teh Sehat', status: 'active' as const },
    { id: '3', name: 'Gula Pasir 1kg', sku: 'GUL-001', category: 'Bahan Pokok', price: 15000, cost: 12000, stock: 100, minStock: 20, supplier: 'PT Gula Manis', status: 'active' as const },
    { id: '4', name: 'Minyak Goreng 2L', sku: 'MIN-001', category: 'Bahan Pokok', price: 32000, cost: 28000, stock: 2, minStock: 15, supplier: 'PT Minyak Sejahtera', status: 'active' as const },
    { id: '5', name: 'Beras Premium 5kg', sku: 'BER-001', category: 'Bahan Pokok', price: 85000, cost: 70000, stock: 40, minStock: 10, supplier: 'CV Beras Padi', status: 'active' as const },
  ];

  const recentActivities = [
    { type: 'in', product: 'Kopi Arabica Premium', quantity: 50, time: '10 menit lalu', user: 'Admin' },
    { type: 'out', product: 'Teh Hijau Organik', quantity: 12, time: '25 menit lalu', user: 'Kasir 1' },
    { type: 'adjustment', product: 'Gula Pasir 1kg', quantity: -5, time: '1 jam lalu', user: 'Admin' },
    { type: 'in', product: 'Minyak Goreng 2L', quantity: 30, time: '2 jam lalu', user: 'Admin' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat inventory...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Inventory Management | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
              <p className="text-sky-100">Kelola stok produk dan inventory Anda</p>
            </div>
            <FaBoxOpen className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaBoxOpen className="text-3xl opacity-80" />
              </div>
              <p className="text-sm opacity-90">Total Produk</p>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaDollarSign className="text-3xl opacity-80" />
              </div>
              <p className="text-sm opacity-90">Nilai Stok</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaExclamationTriangle className="text-3xl opacity-80" />
              </div>
              <p className="text-sm opacity-90">Stok Rendah</p>
              <p className="text-3xl font-bold">{stats.lowStock}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaExclamationTriangle className="text-3xl opacity-80" />
              </div>
              <p className="text-sm opacity-90">Stok Habis</p>
              <p className="text-3xl font-bold">{stats.outOfStock}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaLayerGroup className="text-3xl opacity-80" />
              </div>
              <p className="text-sm opacity-90">Kategori</p>
              <p className="text-3xl font-bold">{stats.categories}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaTruck className="text-3xl opacity-80" />
              </div>
              <p className="text-sm opacity-90">Supplier</p>
              <p className="text-3xl font-bold">{stats.suppliers}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Link href="/inventory/products/new">
                <Button className="w-full h-24 flex flex-col items-center justify-center bg-sky-600 hover:bg-sky-700">
                  <FaPlus className="text-2xl mb-2" />
                  <span>Tambah Produk</span>
                </Button>
              </Link>
              <Link href="/inventory/adjustment">
                <Button className="w-full h-24 flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700">
                  <FaClipboardList className="text-2xl mb-2" />
                  <span>Penyesuaian Stok</span>
                </Button>
              </Link>
              <Link href="/inventory/stock-opname">
                <Button className="w-full h-24 flex flex-col items-center justify-center bg-indigo-600 hover:bg-indigo-700">
                  <FaClipboardList className="text-2xl mb-2" />
                  <span>Stock Opname</span>
                </Button>
              </Link>
              <Link href="/inventory/receive">
                <Button className="w-full h-24 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700">
                  <FaWarehouse className="text-2xl mb-2" />
                  <span>Terima Barang</span>
                </Button>
              </Link>
              <Link href="/inventory/reports">
                <Button className="w-full h-24 flex flex-col items-center justify-center bg-orange-600 hover:bg-orange-700">
                  <FaChartBar className="text-2xl mb-2" />
                  <span>Laporan</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daftar Produk</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FaFilter className="mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <FaDownload className="mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Cari produk atau SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredProducts.map((product) => {
                    const stockPercentage = (product.stock / (product.minStock * 3)) * 100;
                    const isLowStock = product.stock <= product.minStock;
                    const isOutOfStock = product.stock === 0;

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                          </div>
                          <Badge variant={isOutOfStock ? 'destructive' : isLowStock ? 'secondary' : 'default'}>
                            {isOutOfStock ? 'Habis' : isLowStock ? 'Rendah' : 'Normal'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Kategori</p>
                            <p className="text-sm font-medium">{product.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Harga Jual</p>
                            <p className="text-sm font-medium text-green-600">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Stok</p>
                            <p className="text-sm font-medium">{product.stock} unit</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Stok: {product.stock}/{product.minStock * 3}</span>
                            <span>{stockPercentage.toFixed(0)}%</span>
                          </div>
                          <Progress value={stockPercentage} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FaChartLine className="text-sky-600" />
                  <span>Aktivitas Terbaru</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'in' ? 'bg-green-100' :
                        activity.type === 'out' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {activity.type === 'in' ? (
                          <FaArrowRight className="text-green-600 transform rotate-180" />
                        ) : activity.type === 'out' ? (
                          <FaArrowRight className="text-red-600" />
                        ) : (
                          <FaClipboardList className="text-yellow-600 text-sm" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.product}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.type === 'in' ? 'Masuk' : activity.type === 'out' ? 'Keluar' : 'Penyesuaian'}: {Math.abs(activity.quantity)} unit
                        </p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stock Health */}
            <Card>
              <CardHeader>
                <CardTitle>Kesehatan Stok</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Stok Normal</span>
                      <span className="font-semibold text-green-600">
                        {stats.totalProducts - stats.lowStock - stats.outOfStock}
                      </span>
                    </div>
                    <Progress 
                      value={((stats.totalProducts - stats.lowStock - stats.outOfStock) / stats.totalProducts) * 100} 
                      className="h-2 bg-green-100"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Stok Rendah</span>
                      <span className="font-semibold text-yellow-600">{stats.lowStock}</span>
                    </div>
                    <Progress 
                      value={(stats.lowStock / stats.totalProducts) * 100} 
                      className="h-2 bg-yellow-100"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Stok Habis</span>
                      <span className="font-semibold text-red-600">{stats.outOfStock}</span>
                    </div>
                    <Progress 
                      value={(stats.outOfStock / stats.totalProducts) * 100} 
                      className="h-2 bg-red-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onEdit={(product) => {
          console.log('Edit product:', product);
          setShowProductModal(false);
        }}
        onDelete={(productId) => {
          console.log('Delete product:', productId);
          setShowProductModal(false);
        }}
      />
    </DashboardLayout>
  );
};

export default InventoryPage;
