import React, { useState } from "react";
import { NextPage } from "next";
import InventoryLayout from "@/components/layouts/inventory-layout";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mockCategories, mockProducts, mockStocks } from "@/modules/inventory/types";
import { formatRupiah } from "@/lib/utils";
import { 
  FaChartBar, 
  FaFileExport, 
  FaFilePdf,
  FaFileExcel,
  FaPrint,
  FaChartPie,
  FaChartLine,
  FaBoxOpen,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaWarehouse,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSearch,
  FaMapMarkerAlt,
  FaCubes,
  FaStore,
  FaFilter,
  FaCalendarDay
} from "react-icons/fa";
import StockMovementHistoryModal from "@/modules/inventory/components/StockMovementHistoryModal";
import StockValueSummaryCard from "@/modules/inventory/components/StockValueSummaryCard";
import { 
  generateStockValueData, 
  generateProductStockValueData,
  getProductGroupValueData,
  getLocationStockValueData 
} from "@/modules/inventory/utils/stockReportUtils";

import {
  exportStockValueSummaryToPDF,
  exportStockValueSummaryToExcel,
  exportProductsToExcel,
  printStockValueSummary
} from "@/modules/inventory/utils/exportUtils";

import {
  fetchStockValueReport,
  fetchStockMovementReport,
  fetchLowStockReport,
  fetchProductAnalysisReport,
  generateReport
} from "@/lib/adapters/reports-adapter";

// Helper function to format date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

// Definisikan tipe data untuk StockMovement
interface StockMovement {
  id: string;
  date: Date;
  type: "in" | "out" | "adjustment";
  reference: string;
  productName: string;
  quantity: number;
  fromTo: string;
  notes: string;
}

// Generate movement data dengan timestamps terbaru
const generateMovementData = (): StockMovement[] => {
  const currentDate = new Date();
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  
  const twoDaysAgo = new Date(currentDate);
  twoDaysAgo.setDate(currentDate.getDate() - 2);
  
  const threeDaysAgo = new Date(currentDate);
  threeDaysAgo.setDate(currentDate.getDate() - 3);
  
  const lastWeek = new Date(currentDate);
  lastWeek.setDate(currentDate.getDate() - 7);
  
  const twoWeeksAgo = new Date(currentDate);
  twoWeeksAgo.setDate(currentDate.getDate() - 14);
  
  // Mock data untuk pergerakan stok dengan tanggal yang lebih realistis
  return [
    { id: "SM001", date: twoWeeksAgo, type: "in", reference: "PO-2023-001", productName: "Paracetamol 500mg", quantity: 100, fromTo: "PT Kimia Farma", notes: "Pesanan reguler" },
    { id: "SM002", date: lastWeek, type: "out", reference: "SO-2023-045", productName: "Paracetamol 500mg", quantity: 5, fromTo: "Pelanggan", notes: "Penjualan retail" },
    { id: "SM003", date: lastWeek, type: "in", reference: "PO-2023-002", productName: "Amoxicillin 500mg", quantity: 50, fromTo: "PT Dexa Medica", notes: "Pesanan bulanan" },
    { id: "SM004", date: threeDaysAgo, type: "adjustment", reference: "ADJ-2023-001", productName: "Vitamin C 1000mg", quantity: -2, fromTo: "Gudang", notes: "Kerusakan produk" },
    { id: "SM005", date: twoDaysAgo, type: "out", reference: "SO-2023-046", productName: "Amoxicillin 500mg", quantity: 10, fromTo: "Klinik Sehat", notes: "Penjualan grosir" },
    { id: "SM006", date: yesterday, type: "in", reference: "PO-2023-003", productName: "Minyak Kayu Putih 60ml", quantity: 30, fromTo: "PT Eagle Indo Pharma", notes: "Pesanan mendesak" },
    { id: "SM007", date: currentDate, type: "out", reference: "SO-2023-047", productName: "Vitamin C 1000mg", quantity: 15, fromTo: "Pelanggan", notes: "Penjualan retail" },
    { id: "SM008", date: currentDate, type: "adjustment", reference: "ADJ-2023-002", productName: "Antasida Tablet", quantity: 5, fromTo: "Gudang", notes: "Koreksi stok opname" },
    { id: "SM009", date: currentDate, type: "in", reference: "PO-2023-004", productName: "Ibuprofen 400mg", quantity: 45, fromTo: "PT Kimia Farma", notes: "Pengisian stok bulanan" },
    { id: "SM010", date: yesterday, type: "out", reference: "SO-2023-048", productName: "Betadine Solution 60ml", quantity: 8, fromTo: "Puskesmas Jaya", notes: "Penjualan grosir" },
  ];
};

// Generate low stock data dengan data cabang tambahan
const generateLowStockData = () => {
  // Mock data untuk produk dengan stok rendah
  const products = [
    { id: "LS001", name: "Paracetamol 500mg", sku: "MED-PCT-500", categoryName: "Obat Bebas", currentStock: 10, minStock: 15, price: 12000, supplier: "PT Kimia Farma", branchId: "branch-001" },
    { id: "LS002", name: "Amoxicillin 500mg", sku: "MED-AMX-500", categoryName: "Obat Keras", currentStock: 5, minStock: 20, price: 25000, supplier: "PT Dexa Medica", branchId: "branch-001" },
    { id: "LS003", name: "Vitamin C 1000mg", sku: "SUP-VTC-1000", categoryName: "Vitamin", currentStock: 8, minStock: 25, price: 15000, supplier: "PT Bayer Indonesia", branchId: "branch-002" },
    { id: "LS004", name: "Antasida Tablet", sku: "MED-ANT-001", categoryName: "Obat Bebas", currentStock: 12, minStock: 30, price: 8000, supplier: "PT Kimia Farma", branchId: "branch-002" },
    { id: "LS005", name: "Minyak Kayu Putih 60ml", sku: "OTC-MKP-60", categoryName: "Obat Luar", currentStock: 3, minStock: 10, price: 18000, supplier: "PT Eagle Indo Pharma", branchId: "branch-003" },
    { id: "LS006", name: "Cefixime 200mg", sku: "MED-CFX-200", categoryName: "Obat Keras", currentStock: 7, minStock: 15, price: 35000, supplier: "PT Dexa Medica", branchId: "branch-003" },
    { id: "LS007", name: "Betadine Solution 60ml", sku: "OTC-BET-60", categoryName: "Obat Luar", currentStock: 5, minStock: 12, price: 20000, supplier: "PT Mahakam Beta Farma", branchId: "branch-004" },
    { id: "LS008", name: "Ibuprofen 400mg", sku: "MED-IBU-400", categoryName: "Obat Bebas Terbatas", currentStock: 9, minStock: 20, price: 15000, supplier: "PT Kimia Farma", branchId: "branch-004" },
  ];
  
  return products.filter(product => product.currentStock < product.minStock);
};

const ReportsPage: NextPage = () => {
  const [tab, setTab] = useState("stock-value");
  const [period, setPeriod] = useState("all-time");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [valueView, setValueView] = useState<'category' | 'product' | 'group'>('category');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const [isFromMock, setIsFromMock] = useState(false);
  
  // State untuk filter tanggal
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({ from: oneMonthAgo, to: today });
  
  const [movementType, setMovementType] = useState<string>('all');
  
  // State for Stock Movement History Modal
  const [showMovementHistory, setShowMovementHistory] = useState(false);
  
  // Get data from utilities (fallback data)
  const { totalStockValue, previousTotalValue, categoryValues } = generateStockValueData();
  const productValues = generateProductStockValueData();
  const { totalValue: groupTotalValue, groupValues } = getProductGroupValueData();
  
  // Load reports data from API
  const loadReportsData = async () => {
    setIsLoading(true);
    try {
      let result;
      switch (tab) {
        case 'stock-value':
          result = await fetchStockValueReport({ branch: selectedBranch, period });
          break;
        case 'stock-movement':
          result = await fetchStockMovementReport({ branch: selectedBranch, period });
          break;
        case 'low-stock':
          result = await fetchLowStockReport({ branch: selectedBranch });
          break;
        case 'product-analysis':
          result = await fetchProductAnalysisReport({ branch: selectedBranch, period });
          break;
        default:
          result = await fetchStockValueReport({ branch: selectedBranch, period });
      }
      
      if (result.success) {
        setApiData(result.data);
        setIsFromMock(result.isFromMock);
      }
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on component mount and when filters change
  React.useEffect(() => {
    loadReportsData();
  }, [tab, selectedBranch, period]);
  // Mock branch data
  const mockBranches = [
    {
      id: "all",
      name: "Semua Cabang",
      code: "ALL",
    },
    {
      id: "branch-001",
      name: "Farmanesia Pusat",
      code: "FP-JKT",
      address: "Jl. Sudirman No. 123",
      phone: "021-5551234",
    },
    {
      id: "branch-002",
      name: "Farmanesia Bandung",
      code: "FP-BDG", 
      address: "Jl. Asia Afrika No. 45",
      phone: "022-4201234",
    },
    {
      id: "branch-003",
      name: "Farmanesia Surabaya",
      code: "FP-SBY",
      address: "Jl. Pemuda No. 56",
      phone: "031-5678901",
    },
    {
      id: "branch-004",
      name: "Farmanesia Medan",
      code: "FP-MDN",
      address: "Jl. Diponegoro No. 78",
      phone: "061-4567890",
    }
  ];
  
  // Legacy data for compatibility
  const movementData = generateMovementData();
  const lowStockData = generateLowStockData();
  
  // Handle data export
  const handleExportData = async () => {
    if (isLoading) {
      alert('Sedang memuat data, silakan tunggu...');
      return;
    }
    
    if (!categoryValues.length && !apiData) {
      alert('Tidak ada data untuk diekspor');
      return;
    }
    
    // Try to generate report via API first
    try {
      const result = await generateReport(tab, {
        branch: selectedBranch,
        period: period,
        format: exportFormat
      }, exportFormat);
      
      if (result.success && result.data) {
        // Show success message with download option
        const downloadConfirm = confirm(`Laporan berhasil dibuat!\nID: ${result.data.reportId}\n\nKlik OK untuk mengunduh atau Cancel untuk menutup.`);
        if (downloadConfirm && result.data.downloadUrl) {
          window.open(result.data.downloadUrl, '_blank');
        }
        return;
      }
    } catch (error) {
      console.warn('API export failed, using fallback:', error);
    }

    // Fallback export based on current tab
    const branchCode = selectedBranch !== 'all' ? mockBranches.find(b => b.id === selectedBranch)?.code + '-' : '';
    const dateStr = new Date().toISOString().split('T')[0];
    
    switch (tab) {
      case 'stock-value':
        switch (exportFormat) {
          case 'pdf':
            exportStockValueSummaryToPDF(
              categoryValues,
              `laporan-nilai-stok-${branchCode}${dateStr}.pdf`
            );
            break;
          case 'excel':
            exportStockValueSummaryToExcel(
              categoryValues,
              `laporan-nilai-stok-${branchCode}${dateStr}.xlsx`
            );
            break;
          case 'csv':
            exportStockValueSummaryToExcel(
              categoryValues,
              `laporan-nilai-stok-${branchCode}${dateStr}.csv`
            );
            break;
        }
        break;
      case 'stock-movement':
        exportProductsToExcel(
          movementData.map(m => ({
            id: m.id,
            code: m.reference,
            name: m.productName,
            category: m.type,
            stockQty: m.quantity,
            buyPrice: 0,
            stockValue: 0,
            unit: 'Movement'
          })),
          `laporan-pergerakan-stok-${branchCode}${dateStr}.xlsx`
        );
        break;
      case 'low-stock':
        exportProductsToExcel(
          lowStockData.map(p => ({
            id: p.id,
            code: p.sku,
            name: p.name,
            category: p.categoryName,
            stockQty: p.currentStock,
            buyPrice: p.price,
            stockValue: p.currentStock * p.price,
            unit: 'Pcs'
          })),
          `laporan-stok-minimum-${branchCode}${dateStr}.xlsx`
        );
        break;
      case 'product-analysis':
        alert('Export analisis produk akan segera tersedia');
        break;
      default:
        alert('Format export tidak didukung');
    }
  };
  
  // Handle print report
  const handlePrintReport = () => {
    if (isLoading) {
      alert('Sedang memuat data, silakan tunggu...');
      return;
    }
    
    if (!categoryValues.length && !apiData) {
      alert('Tidak ada data untuk dicetak');
      return;
    }
    
    // Custom print function with branch information
    const branchInfo = selectedBranch === 'all' 
      ? { name: 'Semua Cabang' }
      : mockBranches.find(b => b.id === selectedBranch) || { name: 'Semua Cabang' };
      
    // Create HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ringkasan Nilai Stok - ${branchInfo.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f97316; color: white; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { color: #f97316; margin-bottom: 5px; }
            .total { font-weight: bold; background-color: #fff8f0; }
            .date { text-align: right; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FARMAX APOTEK</h1>
            <h2>Laporan Nilai Stok - ${branchInfo.name}</h2>
          </div>
          <div class="date">
            <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 10%">No</th>
                <th style="width: 40%">Kategori</th>
                <th style="width: 20%">Jumlah Produk</th>
                <th style="width: 30%">Nilai Stok</th>
              </tr>
            </thead>
            <tbody>
              ${categoryValues.map((category, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${category.name}</td>
                  <td>${category.itemCount}</td>
                  <td>${formatRupiah(category.value)}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td colspan="3">Total</td>
                <td>${formatRupiah(categoryValues.reduce((sum, cat) => sum + cat.value, 0))}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    // Create an iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    
    // Write the content to the iframe and print
    printFrame.contentDocument?.open();
    printFrame.contentDocument?.write(printContent);
    printFrame.contentDocument?.close();
    
    // Wait for the iframe to load before printing
    printFrame.onload = () => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      document.body.removeChild(printFrame);
    };
  };
  
  return (
    <InventoryLayout>
      <div className="flex flex-col min-h-screen">
        <Breadcrumbs
          items={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Inventori", href: "/inventory" },
            { title: "Laporan", href: "/inventory/reports" },
          ]}
          className="p-6 pb-0"
        />
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FaChartBar className="mr-3 text-orange-500" /> Laporan Inventori
              </h1>
              <p className="text-gray-600 mt-1">
                Analisis dan laporan mengenai stok, nilai, dan pergerakan inventori
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Format Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={handleExportData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaFileExport className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
              
              {isFromMock && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <FaInfoCircle className="mr-1 h-3 w-3" />
                  Data Simulasi
                </Badge>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="stock-value" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                <FaChartPie className="h-4 w-4 mr-2" />
                <span>Nilai Stok</span>
              </TabsTrigger>
              <TabsTrigger value="stock-movement" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                <FaChartLine className="h-4 w-4 mr-2" />
                <span>Pergerakan Stok</span>
              </TabsTrigger>
              <TabsTrigger value="low-stock" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                <FaArrowDown className="h-4 w-4 mr-2" />
                <span>Stok Minimum</span>
              </TabsTrigger>
              <TabsTrigger value="product-analysis" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                <FaBoxOpen className="h-4 w-4 mr-2" />
                <span>Analisis Produk</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Stock Value Tab Content */}
            <TabsContent value="stock-value" className="space-y-6 mt-6">
              {/* Stock Value View Options */}
              <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Filter Cabang:</span>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Pilih Cabang" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.id === 'all' ? (
                            branch.name
                          ) : (
                            <div className="flex items-center">
                              <FaStore className="mr-2 h-3.5 w-3.5 text-orange-500" />
                              {branch.name} 
                              {branch.code && <span className="ml-1 text-xs text-gray-500">({branch.code})</span>}
                            </div>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                <Button 
                  variant={valueView === 'category' ? 'default' : 'outline'}
                  className={valueView === 'category' ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-200 text-orange-700 hover:bg-orange-50'}
                  onClick={() => setValueView('category')}
                  size="sm"
                >
                  <FaBoxOpen className="mr-2 h-3 w-3" /> Kategori
                </Button>
                <Button 
                  variant={valueView === 'product' ? 'default' : 'outline'}
                  className={valueView === 'product' ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-200 text-orange-700 hover:bg-orange-50'}
                  onClick={() => setValueView('product')}
                  size="sm"
                >
                  <FaCubes className="mr-2 h-3 w-3" /> Produk
                </Button>
                <Button 
                  variant={valueView === 'group' ? 'default' : 'outline'}
                  className={valueView === 'group' ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-200 text-orange-700 hover:bg-orange-50'}
                  onClick={() => setValueView('group')}
                  size="sm"
                >
                  <FaChartPie className="mr-2 h-3 w-3" /> Kelompok
                </Button>
                </div>
              </div>
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center p-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  <span className="ml-3 text-gray-600">Memuat data laporan...</span>
                </div>
              )}
              
              {/* Category View */}
              {!isLoading && valueView === 'category' && (
                <div className="grid grid-cols-1 gap-6">
                  <StockValueSummaryCard
                    totalValue={apiData?.summary?.totalValue || totalStockValue}
                    previousTotalValue={apiData?.summary?.previousTotalValue || previousTotalValue}
                    categoryValues={apiData?.summary?.categories || categoryValues}
                    onPrint={handlePrintReport}
                    onExport={handleExportData}
                  />
                  
                  <Card className="border-orange-200 mt-6">
                    <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Produk dengan Nilai Stok Tertinggi {selectedBranch !== 'all' && `- ${mockBranches.find(b => b.id === selectedBranch)?.name}`}</CardTitle>
                          <CardDescription>
                            Produk-produk yang memberi kontribusi terbesar terhadap total nilai stok
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-orange-50">
                              <TableHead>Produk</TableHead>
                              <TableHead>Kategori</TableHead>
                              <TableHead className="text-center">Stok</TableHead>
                              <TableHead className="text-right">Harga Beli</TableHead>
                              <TableHead className="text-right">Nilai Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productValues.slice(0, 10).map((product) => (
                              <TableRow key={product.id} className="hover:bg-orange-50">
                                <TableCell>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-gray-500">{product.sku}</div>
                                </TableCell>
                                <TableCell>{product.categoryName}</TableCell>
                                <TableCell className="text-center">{product.currentStock}</TableCell>
                                <TableCell className="text-right">{formatRupiah(product.price)}</TableCell>
                                <TableCell className="text-right font-medium">{formatRupiah(product.value)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          <TableFooter className="bg-orange-50">
                            <TableRow>
                              <TableCell colSpan={4} className="text-right font-bold">
                                Total Nilai ({productValues.length} produk)
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatRupiah(totalStockValue)}
                              </TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Product View */}
              {!isLoading && valueView === 'product' && (
                <div className="space-y-6">
                  <Card className="border-orange-200 shadow-md">
                    <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Nilai Stok per Produk {selectedBranch !== 'all' && `- ${mockBranches.find(b => b.id === selectedBranch)?.name}`}</CardTitle>
                          <CardDescription>
                            Detail nilai stok untuk setiap produk dalam inventori
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Input placeholder="Cari produk..." className="pl-9 w-[250px]" />
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                          </div>
                          <Button 
                            variant="outline" 
                            className="border-orange-200 text-orange-600 hover:bg-orange-50"
                            onClick={() => exportProductsToExcel(
                              productValues.map(p => ({
                                id: p.id,
                                code: p.sku,
                                name: p.name,
                                category: p.categoryName,
                                stockQty: p.currentStock,
                                buyPrice: p.price,
                                stockValue: p.value,
                                unit: 'Pcs' // Menggunakan default unit
                              })), 
                              `produk-nilai-stok-${new Date().toISOString().split('T')[0]}.xlsx`
                            )}
                          >
                            <FaFileExcel className="mr-2 h-4 w-4" /> Ekspor Excel
                          </Button>
                          <Button 
                            variant="outline" 
                            className="border-orange-200 text-orange-600 hover:bg-orange-50"
                            onClick={() => window.print()}
                          >
                            <FaPrint className="mr-2 h-4 w-4" /> Cetak
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="border-t">
                        <div className="p-4 bg-orange-50 flex items-center justify-between">
                          <div className="flex items-center">
                            <Badge className="bg-orange-100 text-orange-800 mr-2">Total: {productValues.length} produk</Badge>
                            <span className="text-sm text-gray-600">
                              Nilai Total: <span className="font-bold">{formatRupiah(totalStockValue)}</span>
                            </span>
                          </div>
                          <Select defaultValue="value-desc">
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Urutkan berdasarkan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="value-desc">Nilai (Tertinggi)</SelectItem>
                              <SelectItem value="value-asc">Nilai (Terendah)</SelectItem>
                              <SelectItem value="name-asc">Nama (A-Z)</SelectItem>
                              <SelectItem value="name-desc">Nama (Z-A)</SelectItem>
                              <SelectItem value="stock-desc">Stok (Tertinggi)</SelectItem>
                              <SelectItem value="stock-asc">Stok (Terendah)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="max-h-[600px] overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 z-10">
                            <TableRow className="bg-white">
                              <TableHead>Produk</TableHead>
                              <TableHead>Kategori</TableHead>
                              <TableHead className="text-center">Stok</TableHead>
                              <TableHead className="text-right">Harga Beli</TableHead>
                              <TableHead className="text-right">Nilai Total</TableHead>
                              <TableHead className="text-center">Kadaluarsa</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {productValues.slice(0, 30).map((product) => (
                              <TableRow key={product.id} className="hover:bg-orange-50">
                                <TableCell>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-gray-500">{product.sku}</div>
                                </TableCell>
                                <TableCell>{product.categoryName}</TableCell>
                                <TableCell className="text-center">{product.currentStock}</TableCell>
                                <TableCell className="text-right">{formatRupiah(product.price)}</TableCell>
                                <TableCell className="text-right font-medium">{formatRupiah(product.value)}</TableCell>
                                <TableCell className="text-center">
                                  {product.expiryDate ? formatDate(product.expiryDate) : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="p-4 text-center border-t">
                        <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                          Lihat Semua Produk
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Group View */}
              {!isLoading && valueView === 'group' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-orange-200 md:col-span-2 shadow-md">
                    <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
                      <CardTitle>Nilai Stok Berdasarkan Kelompok Produk {selectedBranch !== 'all' && `- ${mockBranches.find(b => b.id === selectedBranch)?.name}`}</CardTitle>
                      <CardDescription>
                        Distribusi nilai inventori berdasarkan kategori farmasi
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Total Nilai Stok</p>
                            <p className="text-3xl font-bold text-gray-900">
                              {formatRupiah(groupTotalValue)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {groupValues.map((group) => (
                            <div key={group.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: group.color }}
                                  ></div>
                                  <p className="text-sm font-medium">{group.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">{formatRupiah(group.value)}</p>
                                  {group.trend !== 'stable' && (
                                    <Badge className={group.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                      {group.trend === 'up' ? <FaArrowUp className="mr-1 h-3 w-3" /> : <FaArrowDown className="mr-1 h-3 w-3" />}
                                      {group.trendPercentage.toFixed(1)}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full" 
                                  style={{ 
                                    width: `${group.percentage}%`,
                                    backgroundColor: group.color 
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{group.itemCount} produk</span>
                                <span>{group.percentage.toFixed(1)}% dari total</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-orange-200 shadow-md">
                    <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
                      <CardTitle>Detail Kelompok</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {groupValues.map((group) => (
                          <div key={group.id} className={`p-4 rounded-lg bg-opacity-10 border`} style={{ backgroundColor: `${group.color}20`, borderColor: `${group.color}40` }}>
                            <div className="flex items-start">
                              <div className="p-3 rounded-full mr-4" style={{ backgroundColor: `${group.color}30` }}>
                                <div className="h-6 w-6" style={{ color: group.color }}>
                                  <FaBoxOpen />
                                </div>
                              </div>
                              <div>
                                <p className="font-medium" style={{ color: group.color }}>{group.name}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(group.value)}</p>
                                <p className="text-sm text-gray-500 mt-1">{group.itemCount} produk</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              

            </TabsContent>
            
            {/* Stock Movement Tab Content */}
            <TabsContent value="stock-movement" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-orange-200 md:col-span-3">
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Pergerakan Stok</CardTitle>
                        <CardDescription>
                          Riwayat pergerakan stok masuk dan keluar
                        </CardDescription>
                      </div>
                    </div>
                    
                    {/* Filter controls */}
                    <div className="flex flex-wrap gap-4 mt-4 items-center border-t border-gray-100 pt-4">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="dateFrom" className="text-xs font-medium text-gray-700">Dari Tanggal</Label>
                        <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-orange-500">
                          <span className="pl-3 text-gray-400">
                            <FaCalendarDay size={14} />
                          </span>
                          <input 
                            type="date" 
                            id="dateFrom"
                            className="py-1 px-2 outline-none text-sm flex-1" 
                            value={dateRange.from.toISOString().split('T')[0]}
                            onChange={(e) => {
                              const newFrom = new Date(e.target.value);
                              setDateRange({ ...dateRange, from: newFrom });
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="dateTo" className="text-xs font-medium text-gray-700">Sampai Tanggal</Label>
                        <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-orange-500">
                          <span className="pl-3 text-gray-400">
                            <FaCalendarDay size={14} />
                          </span>
                          <input 
                            type="date" 
                            id="dateTo"
                            className="py-1 px-2 outline-none text-sm flex-1" 
                            value={dateRange.to.toISOString().split('T')[0]}
                            onChange={(e) => {
                              const newTo = new Date(e.target.value);
                              setDateRange({ ...dateRange, to: newTo });
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="movementType" className="text-xs font-medium text-gray-700">Jenis Pergerakan</Label>
                        <Select value={movementType} onValueChange={setMovementType}>
                          <SelectTrigger id="movementType" className="w-[180px]">
                            <SelectValue placeholder="Jenis Pergerakan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Pergerakan</SelectItem>
                            <SelectItem value="in">Stok Masuk</SelectItem>
                            <SelectItem value="out">Stok Keluar</SelectItem>
                            <SelectItem value="adjustment">Penyesuaian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <Label className="opacity-0 text-xs">Filter</Label>
                        <Button variant="default" size="sm" className="px-4 bg-orange-600 hover:bg-orange-700">
                          <FaFilter className="mr-2 h-3.5 w-3.5" />
                          Terapkan Filter
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Referensi</TableHead>
                            <TableHead>Produk</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead className="text-center">Jumlah</TableHead>
                            <TableHead>Sumber/Tujuan</TableHead>
                            <TableHead>Catatan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Filter pergerakan stok berdasarkan dateRange dan movementType */}
                      {movementData
                        .filter(movement => {
                          // Filter berdasarkan tanggal
                          const movementDate = new Date(movement.date);
                          const isInDateRange = movementDate >= dateRange.from && 
                                               movementDate <= dateRange.to;
                          
                          // Filter berdasarkan tipe
                          const isTypeMatch = movementType === 'all' || 
                                            movement.type === movementType;
                          
                          return isInDateRange && isTypeMatch;
                        })
                        .map((movement) => (
                            <TableRow key={movement.id} className="hover:bg-gray-50">
                              <TableCell>{formatDate(movement.date)}</TableCell>
                              <TableCell className="font-medium">{movement.reference}</TableCell>
                              <TableCell>{movement.productName}</TableCell>
                              <TableCell>
                                {movement.type === "in" && (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    <FaArrowUp className="mr-1 h-3 w-3" /> Masuk
                                  </Badge>
                                )}
                                {movement.type === "out" && (
                                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                    <FaArrowDown className="mr-1 h-3 w-3" /> Keluar
                                  </Badge>
                                )}
                                {movement.type === "adjustment" && (
                                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                    Penyesuaian
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">{movement.quantity}</TableCell>
                              <TableCell>{movement.fromTo}</TableCell>
                              <TableCell>{movement.notes || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <Button 
                        variant="link" 
                        className="text-indigo-600"
                        onClick={() => setShowMovementHistory(true)}
                      >
                        Lihat Riwayat Lengkap
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Low Stock Tab Content */}
            <TabsContent value="low-stock" className="space-y-6 mt-6">
              <Card className="border-orange-200">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Produk dengan Stok Minimum</CardTitle>
                      <CardDescription>
                        Daftar produk yang memerlukan pengisian ulang
                      </CardDescription>
                    </div>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <FaFileExcel className="mr-2 h-4 w-4" /> Cetak Pesanan Pembelian
                    </Button>
                  </div>
                  
                  {/* Filter controls - Low Stock */}
                  <div className="flex flex-wrap gap-4 mt-4 items-center border-t border-gray-100 pt-4">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="lowStockDateFrom" className="text-xs font-medium text-gray-700">Tanggal Stok</Label>
                      <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-orange-500">
                        <span className="pl-3 text-gray-400">
                          <FaCalendarDay size={14} />
                        </span>
                        <input 
                          type="date" 
                          id="lowStockDateFrom"
                          className="py-1 px-2 outline-none text-sm flex-1" 
                          value={dateRange.from.toISOString().split('T')[0]}
                          onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            setDateRange({ ...dateRange, from: newDate, to: newDate });
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="lowStockBranch" className="text-xs font-medium text-gray-700">Cabang</Label>
                      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger id="lowStockBranch" className="w-[200px]">
                          <SelectValue placeholder="Pilih Cabang" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockBranches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.id === 'all' ? (
                                branch.name
                              ) : (
                                <div className="flex items-center">
                                  <FaStore className="mr-2 h-3.5 w-3.5 text-orange-500" />
                                  {branch.name} 
                                  {branch.code && <span className="ml-1 text-xs text-gray-500">({branch.code})</span>}
                                </div>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <Label className="opacity-0 text-xs">Filter</Label>
                      <Button variant="default" size="sm" className="px-4 bg-orange-600 hover:bg-orange-700">
                        <FaFilter className="mr-2 h-3.5 w-3.5" />
                        Terapkan Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Produk</TableHead>
                          <TableHead className="text-center">Stok Saat Ini</TableHead>
                          <TableHead className="text-center">Stok Minimum</TableHead>
                          <TableHead className="text-center">Defisit</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lowStockData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                              Tidak ada produk yang berada di bawah stok minimum
                            </TableCell>
                          </TableRow>
                        ) : (
                          /* Filter stok minimum berdasarkan cabang yang dipilih */
                          lowStockData
                            .filter(item => selectedBranch === 'all' || item.branchId === selectedBranch)
                            .map((item) => {
                              const deficit = item.minStock - item.currentStock;
                              
                              return (
                                <TableRow key={item.id} className="hover:bg-gray-50">
                                  <TableCell>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-500">{item.sku}</div>
                                  </TableCell>
                                  <TableCell className="text-center">{item.currentStock}</TableCell>
                                  <TableCell className="text-center">{item.minStock}</TableCell>
                                  <TableCell className="text-center font-medium text-red-600">{deficit}</TableCell>
                                  <TableCell>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div 
                                        className="bg-red-600 h-2.5 rounded-full" 
                                        style={{ width: `${Math.round((deficit / item.minStock) * 100)}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {Math.round((deficit / item.minStock) * 100)}% di bawah minimal
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Product Analysis Tab Content */}
            <TabsContent value="product-analysis" className="space-y-6 mt-6">
              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center p-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  <span className="ml-3 text-gray-600">Memuat data analisis produk...</span>
                </div>
              )}
              
              {!isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Selling Products */}
                  <Card className="border-orange-200">
                    <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardTitle className="flex items-center">
                        <FaArrowUp className="mr-2 h-5 w-5 text-green-600" />
                        Produk Terlaris
                      </CardTitle>
                      <CardDescription>
                        Produk dengan penjualan tertinggi dalam periode ini
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {(apiData?.topSellingProducts || [
                          {
                            id: 'top-1',
                            productName: 'Paracetamol 500mg',
                            sku: 'MED-PCT-500',
                            totalSold: 450,
                            revenue: 5400000,
                            profit: 1350000,
                            profitMargin: 25,
                            trend: 'up'
                          },
                          {
                            id: 'top-2',
                            productName: 'Vitamin C 1000mg',
                            sku: 'SUP-VTC-1000',
                            totalSold: 320,
                            revenue: 4800000,
                            profit: 1200000,
                            profitMargin: 25,
                            trend: 'stable'
                          },
                          {
                            id: 'top-3',
                            productName: 'Amoxicillin 500mg',
                            sku: 'MED-AMX-500',
                            totalSold: 280,
                            revenue: 7000000,
                            profit: 1750000,
                            profitMargin: 25,
                            trend: 'up'
                          }
                        ]).map((product, index) => (
                          <div key={product.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center">
                              <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold mr-3">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{product.productName}</p>
                                <p className="text-sm text-gray-500">{product.sku}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{product.totalSold} terjual</p>
                              <p className="text-sm text-gray-600">{formatRupiah(product.revenue)}</p>
                              <div className="flex items-center mt-1">
                                {product.trend === 'up' && <FaArrowUp className="h-3 w-3 text-green-500 mr-1" />}
                                {product.trend === 'down' && <FaArrowDown className="h-3 w-3 text-red-500 mr-1" />}
                                <span className="text-xs text-gray-500">Margin: {product.profitMargin}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Slow Moving Products */}
                  <Card className="border-orange-200">
                    <CardHeader className="border-b bg-gradient-to-r from-red-50 to-pink-50">
                      <CardTitle className="flex items-center">
                        <FaExclamationTriangle className="mr-2 h-5 w-5 text-red-600" />
                        Produk Slow Moving
                      </CardTitle>
                      <CardDescription>
                        Produk dengan pergerakan lambat yang perlu perhatian
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {(apiData?.slowMovingProducts || [
                          {
                            id: 'slow-1',
                            productName: 'Obat Khusus X',
                            sku: 'MED-OKX-001',
                            currentStock: 45,
                            lastSaleDate: '2024-11-15',
                            daysSinceLastSale: 76,
                            value: 2250000,
                            recommendation: 'Consider discount or return to supplier'
                          },
                          {
                            id: 'slow-2',
                            productName: 'Suplemen Langka Y',
                            sku: 'SUP-SLY-002',
                            currentStock: 28,
                            lastSaleDate: '2024-10-20',
                            daysSinceLastSale: 102,
                            value: 1400000,
                            recommendation: 'Consider promotional pricing'
                          }
                        ]).map((product) => (
                          <div key={product.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-900">{product.productName}</p>
                                <p className="text-sm text-gray-500">{product.sku}</p>
                              </div>
                              <Badge className="bg-red-100 text-red-800">
                                {product.daysSinceLastSale} hari
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Stok Tersisa</p>
                                <p className="font-medium">{product.currentStock} unit</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Nilai Stok</p>
                                <p className="font-medium">{formatRupiah(product.value)}</p>
                              </div>
                            </div>
                            <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                              <p className="text-xs text-yellow-800">
                                <FaInfoCircle className="inline mr-1" />
                                {product.recommendation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Product Performance Summary */}
                  <Card className="border-orange-200 lg:col-span-2">
                    <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
                      <CardTitle className="flex items-center">
                        <FaChartBar className="mr-2 h-5 w-5 text-orange-600" />
                        Ringkasan Performa Produk
                      </CardTitle>
                      <CardDescription>
                        Analisis komprehensif performa produk berdasarkan kategori dan lokasi
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <FaCubes className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                          <p className="text-2xl font-bold text-blue-600">156</p>
                          <p className="text-sm text-gray-600">Total Produk Aktif</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <FaArrowUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                          <p className="text-2xl font-bold text-green-600">89%</p>
                          <p className="text-sm text-gray-600">Produk Bergerak Aktif</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <FaExclamationTriangle className="h-8 w-8 mx-auto text-red-600 mb-2" />
                          <p className="text-2xl font-bold text-red-600">17</p>
                          <p className="text-sm text-gray-600">Produk Slow Moving</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <FaChartLine className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                          <p className="text-2xl font-bold text-orange-600">23%</p>
                          <p className="text-sm text-gray-600">Rata-rata Margin</p>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-4">Analisis per Kategori</h4>
                        <div className="space-y-3">
                          {[
                            { name: 'Obat Keras', products: 45, revenue: 1250000000, margin: 28, trend: 'up' },
                            { name: 'Obat Bebas', products: 32, revenue: 850000000, margin: 25, trend: 'up' },
                            { name: 'Vitamin & Suplemen', products: 28, revenue: 425000000, margin: 22, trend: 'stable' },
                            { name: 'Obat Luar', products: 18, revenue: 322500000, margin: 20, trend: 'down' }
                          ].map((category) => (
                            <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                                <div>
                                  <p className="font-medium">{category.name}</p>
                                  <p className="text-sm text-gray-500">{category.products} produk</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatRupiah(category.revenue)}</p>
                                <div className="flex items-center">
                                  {category.trend === 'up' && <FaArrowUp className="h-3 w-3 text-green-500 mr-1" />}
                                  {category.trend === 'down' && <FaArrowDown className="h-3 w-3 text-red-500 mr-1" />}
                                  <span className="text-sm text-gray-600">Margin: {category.margin}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Stock Movement History Modal */}
      <StockMovementHistoryModal
        open={showMovementHistory}
        onClose={() => setShowMovementHistory(false)}
        movements={movementData}
      />
    </InventoryLayout>
  );
};

export default ReportsPage;
