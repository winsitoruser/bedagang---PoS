import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaWallet, FaCalendarAlt, FaArrowUp, FaArrowDown, 
  FaBuilding, FaChartPie, FaTags, FaTruckLoading,
  FaFileInvoiceDollar, FaMoneyBillWave, FaExclamationTriangle, FaCreditCard,
  FaFileExport, FaFilePdf, FaFileExcel, FaFileCsv, FaFilter, FaSearch,
  FaArrowRight
} from 'react-icons/fa';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
// Perbaikan import - pastikan nama file sesuai dengan yang ada di direktori
import FinanceLayout from '@/components/layouts/finance-layout';
import { formatRupiah, exportToExcel, exportToCSV, exportToPDF } from '@/utils/exportUtils';
import axios from 'axios';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/errorBoundary/ErrorBoundary';

// Import ApexCharts secara dinamis karena ini adalah library client-side
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Import Chart.js components with required registration
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

// Import chart components dari react-chartjs-2
const Pie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), {
  ssr: false,
  loading: () => <div className="h-48 w-48 flex items-center justify-center">Loading chart...</div>
});

// Import komponen BillingDashboardWidget
import { BillingDashboardWidget } from '@/modules/finance/components/BillingDashboardWidget';

// Definisi data chart
interface ChartData {
  labels: string[];
  series: number[];
}

// Definisi warna untuk red-orange theme yang konsisten
const chartColors = {
  primary: '#ef4444',  // Red-500
  secondary: '#f97316',  // Orange-500
  tertiary: '#fb923c',  // Orange-400
  quaternary: '#fca5a5', // Red-300
  background: '#fee2e2', // Red-100
  gradient: ['#ef4444', '#f97316']
};

// Type definitions
interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  cashOnHand: number;
  accountsReceivable: number;
  accountsPayable: number;
  assetValue: number;
  inventoryValue: number;
}

interface InvoiceDebtData {
  totalUnpaid: number;
  overdueInvoices: number;
  upcomingDue: number;
  totalInvoices: number;
  overdueCount: number;
  criticalOverdue: number;
}

interface PartialPayment {
  id: string;
  supplier: string;
  total: number;
  paid: number;
  percentage: number;
  dueDate: string;
}

interface Branch {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  category: string;
}

interface UnpaidInvoice {
  id: string;
  supplier: string;
  total: number;
  paid: number;
  percentage: number;
  dueDate: string;
}

interface IncomeVsExpenseMonthly {
  months: string[];
  income: number[];
  expense: number[];
}

// Custom UI Components - PENTING: Didefinisikan sebelum komponen utama Finance
const Modal: React.FC<{
  show: boolean;
  onHide: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}> = ({ show, onHide, title, children, footer }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500">
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
        <div className="p-4">
          {children}
        </div>
        <div className="px-4 py-3 flex justify-end space-x-2 border-t border-gray-200">
          {footer}
        </div>
      </div>
    </div>
  );
};

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  className = ''
}) => {
  const baseClasses = "px-4 py-2 rounded-md text-white font-medium flex items-center justify-center";
  const variantClasses = variant === 'primary' 
    ? "bg-gradient-to-r from-red-500 to-orange-500" 
    : "bg-gray-500";
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Finance = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');
  const [branch, setBranch] = useState('all');
  const [branches, setBranches] = useState<Branch[]>([
    { id: 'all', name: 'Semua Cabang' },
    { id: 'branch-1', name: 'Cabang Pusat' },
    { id: 'branch-2', name: 'Cabang Utara' }
  ]);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // State data untuk halaman dashboard
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashOnHand: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
    assetValue: 0,
    inventoryValue: 0
  });
  
  const [invoiceDebtData, setInvoiceDebtData] = useState<InvoiceDebtData>({
    totalUnpaid: 0,
    overdueInvoices: 0,
    upcomingDue: 0,
    totalInvoices: 0,
    overdueCount: 0,
    criticalOverdue: 0
  });
  
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  // State untuk data perbandingan pendapatan vs pengeluaran bulanan
  const [incomeVsExpenseMonthly, setIncomeVsExpenseMonthly] = useState<IncomeVsExpenseMonthly>({
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    income: [0, 0, 0, 0, 0, 0],
    expense: [0, 0, 0, 0, 0, 0]
  });
  
  // Default chart data
  const [monthlySummaryData, setMonthlySummaryData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [
      {
        label: 'Pendapatan',
        data: [40000000, 52000000, 60000000, 65000000, 70000000, 78000000],
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Pengeluaran',
        data: [30000000, 40000000, 45000000, 50000000, 55000000, 60000000],
        borderColor: chartColors.secondary,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  });
  
  const [invoiceDebtChartData, setInvoiceDebtChartData] = useState({
    labels: ['Lunas', 'Belum Lunas', 'Jatuh Tempo'],
    datasets: [
      {
        data: [10, 5, 2],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',  // Green
          'rgba(239, 68, 68, 0.7)',   // Red
          'rgba(249, 115, 22, 0.7)',  // Orange
        ],
        borderColor: [
          '#10b981',  // Green
          '#ef4444',  // Red
          '#f97316',  // Orange
        ],
        borderWidth: 1,
      },
    ],
  });
  
  const [revenueByCategory, setRevenueByCategory] = useState({
    labels: ['Obat Resep', 'OTC', 'Konsultasi', 'Alat Kesehatan', 'Lainnya'],
    datasets: [
      {
        data: [525000000, 218750000, 87500000, 21875000, 21875000],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',   // Red
          'rgba(249, 115, 22, 0.7)',  // Orange
          'rgba(251, 146, 60, 0.7)',  // Light Orange
          'rgba(252, 165, 165, 0.7)', // Light Red
          'rgba(254, 226, 226, 0.7)', // Lightest Red
        ],
        borderColor: [
          '#ef4444',
          '#f97316',
          '#fb923c',
          '#fca5a5',
          '#fee2e2',
        ],
        borderWidth: 1,
      },
    ],
  });

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fallback data untuk jika ada kesalahan koneksi atau respons API
      const fallbackData = {
        totalIncome: 71500000,
        totalExpenses: 54250000, 
        netProfit: 17250000,
        cashOnHand: 10350000,
        accountsReceivable: 35000000,
        accountsPayable: 24500000,
        bankAccounts: 24500000,
        inventoryValue: 125000000,
        assetValue: 194850000,
        profitMargin: 24.13
      };
      
      // Fallback invoice debt data
      const fallbackInvoiceDebt = {
        labels: ['Lunas', 'Belum Lunas', 'Jatuh Tempo'],
        values: [60, 30, 10]
      };
      
      // Fallback invoice summary
      const fallbackInvoiceSummary = {
        overdueInvoices: 35000000,
        upcomingDue: 24500000,
        totalInvoices: 17,
        overdueCount: 2,
        criticalOverdue: 1
      };
      
      // Fallback partial payments
      const fallbackPartialPayments = [
        { id: 'default-1', supplier: 'PT Farmasi Utama', total: 35000000, paid: 21000000, percentage: 60, dueDate: '25 Apr 2025' },
        { id: 'default-2', supplier: 'PT Medika Sejahtera', total: 24500000, paid: 12250000, percentage: 50, dueDate: '30 Apr 2025' }
      ];
      
      // Fallback unpaid invoices
      const fallbackUnpaidInvoices = [
        { id: 'default-1', supplier: 'PT Farmasi Utama', total: 35000000, paid: 21000000, percentage: 60, dueDate: '25 Apr 2025' },
        { id: 'default-2', supplier: 'PT Medika Sejahtera', total: 24500000, paid: 12250000, percentage: 50, dueDate: '30 Apr 2025' },
        { id: 'default-3', supplier: 'PT Alkes Indonesia', total: 18750000, paid: 9375000, percentage: 50, dueDate: '05 May 2025' }
      ];
      
      // Fallback transactions
      const fallbackTransactions = [
        { id: 'tx-1', date: '30 Apr 2025', description: 'Penjualan Obat', amount: 5270000, type: 'income', category: 'Penjualan' },
        { id: 'tx-2', date: '29 Apr 2025', description: 'Pembayaran Supplier', amount: 12350000, type: 'expense', category: 'Supplier' },
        { id: 'tx-3', date: '28 Apr 2025', description: 'Konsultasi Pasien', amount: 1750000, type: 'income', category: 'Jasa' }
      ];
      
      // Fallback income vs expense monthly data
      const fallbackIncomeVsExpenseMonthly = {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        income: [65000000, 68000000, 72000000, 71500000, 70000000, 73000000],
        expense: [48000000, 52000000, 49000000, 54250000, 51000000, 53000000]
      };
      
      // Attempt to fetch data dari API - gunakan endpoint API yang terintegrasi dengan database
      const summaryResponse = await fetch(`/api/finance/dashboard-complete`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent long loading times
        signal: AbortSignal.timeout(10000)
      });
      
      // Jika API merespons dengan sukses
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        console.log('Finance data from API:', summaryData);
        
        if (summaryData.data) {
          // Use data from API response
          const apiData = summaryData.data;
          
          // Update financial data
          setFinancialData({
            totalIncome: apiData.totalIncome || 0,
            totalExpenses: apiData.totalExpenses || 0,
            netProfit: apiData.netProfit || 0,
            cashOnHand: apiData.cashOnHand || 0,
            accountsReceivable: apiData.accountsReceivable || 0,
            accountsPayable: apiData.accountsPayable || 0,
            assetValue: apiData.assetValue || 0,
            inventoryValue: apiData.inventoryValue || 0
          });
          
          console.log('Financial data updated:', {
            totalIncome: apiData.totalIncome,
            totalExpenses: apiData.totalExpenses,
            netProfit: apiData.netProfit
          });
          
          // Update invoice debt chart data
          if (apiData.invoiceDebtData && apiData.invoiceDebtData.labels && apiData.invoiceDebtData.values) {
            setInvoiceDebtData({
              labels: apiData.invoiceDebtData.labels,
              datasets: [
                {
                  data: apiData.invoiceDebtData.values,
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.7)',  // Green
                    'rgba(239, 68, 68, 0.7)',   // Red
                    'rgba(249, 115, 22, 0.7)',  // Orange
                  ],
                  borderColor: [
                    '#22c55e',
                    '#ef4444',
                    '#f97316',
                  ],
                  borderWidth: 1,
                },
              ],
            });
            console.log('Invoice debt data updated:', apiData.invoiceDebtData);
          }
          
          // Update income vs expense monthly data
          if (apiData.incomeVsExpenseMonthly) {
            setIncomeVsExpenseMonthly({
              months: apiData.incomeVsExpenseMonthly.months || [],
              income: apiData.incomeVsExpenseMonthly.income || [],
              expense: apiData.incomeVsExpenseMonthly.expense || []
            });
            console.log('Monthly trends updated:', apiData.incomeVsExpenseMonthly);
          }
          
          // Set transactions - always use API data, even if empty
          if (apiData.recentTransactions) {
            const formattedTransactions = apiData.recentTransactions.map((tx: any) => ({
              id: tx.id,
              date: new Date(tx.transaction_date || tx.date).toLocaleDateString('id-ID'),
              description: tx.description,
              amount: parseFloat(tx.amount),
              type: tx.type,
              category: tx.category,
              source: tx.source || 'manual'
            }));
            setRecentTransactions(formattedTransactions);
            console.log('Recent transactions updated:', formattedTransactions.length, 'items');
          } else {
            setRecentTransactions([]);
          }
          
          // Set unpaid invoices - always use API data
          if (apiData.unpaidInvoices) {
            const formattedUnpaid = apiData.unpaidInvoices.map((inv: any) => ({
              id: inv.id,
              supplier: inv.customer_name || inv.supplier_name || 'Unknown',
              total: parseFloat(inv.total_amount),
              paid: parseFloat(inv.paid_amount || 0),
              percentage: inv.total_amount > 0 ? Math.round((parseFloat(inv.paid_amount || 0) / parseFloat(inv.total_amount)) * 100) : 0,
              dueDate: new Date(inv.due_date).toLocaleDateString('id-ID')
            }));
            setUnpaidInvoices(formattedUnpaid);
            console.log('Unpaid invoices updated:', formattedUnpaid.length, 'items');
          } else {
            setUnpaidInvoices([]);
          }
          
          // Set partial payments - always use API data
          if (apiData.partialPayments) {
            const formattedPartial = apiData.partialPayments.map((pay: any) => ({
              id: pay.id,
              supplier: pay.customer_name || pay.supplier_name || 'Unknown',
              total: parseFloat(pay.total_amount),
              paid: parseFloat(pay.paid_amount),
              percentage: pay.total_amount > 0 ? Math.round((parseFloat(pay.paid_amount) / parseFloat(pay.total_amount)) * 100) : 0,
              dueDate: new Date(pay.due_date).toLocaleDateString('id-ID')
            }));
            setPartialPayments(formattedPartial);
            console.log('Partial payments updated:', formattedPartial.length, 'items');
          } else {
            setPartialPayments([]);
          }
          
          // Update subscription status if available
          if (apiData.subscriptionStatus) {
            console.log('Subscription status:', apiData.subscriptionStatus);
          }
          
        } else {
          // Fallback ke mock data jika struktur response tidak sesuai
          setFinancialData(fallbackData);
          setInvoiceDebtData(fallbackInvoiceDebt);
          setPartialPayments(fallbackPartialPayments);
          setUnpaidInvoices(fallbackUnpaidInvoices);
          setRecentTransactions(fallbackTransactions);
          setIncomeVsExpenseMonthly(fallbackIncomeVsExpenseMonthly);
        }
      } else {
        // Jika response tidak OK, gunakan fallback data
        console.error("Error fetching finance data:", summaryResponse.statusText);
        setFinancialData(fallbackData);
        setInvoiceDebtData(fallbackInvoiceDebt);
        setPartialPayments(fallbackPartialPayments);
        setUnpaidInvoices(fallbackUnpaidInvoices);
        setRecentTransactions(fallbackTransactions);
        setIncomeVsExpenseMonthly(fallbackIncomeVsExpenseMonthly);
      }
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError("Terjadi kesalahan saat mengambil data keuangan. Silakan coba lagi nanti.");
      
      // Set fallback data jika terjadi error
      setFinancialData({
        totalIncome: 71500000,
        totalExpenses: 54250000, 
        netProfit: 17250000,
        cashOnHand: 10350000,
        accountsReceivable: 35000000,
        accountsPayable: 24500000,
        bankAccounts: 24500000,
        inventoryValue: 125000000,
        assetValue: 194850000,
        profitMargin: 24.13
      });
      
      setInvoiceDebtData({
        labels: ['Lunas', 'Belum Lunas', 'Jatuh Tempo'],
        datasets: [
          {
            data: [60, 30, 10],
            backgroundColor: [
              'rgba(34, 197, 94, 0.7)',  // Green
              'rgba(239, 68, 68, 0.7)',   // Red
              'rgba(249, 115, 22, 0.7)',  // Orange
            ],
            borderColor: [
              '#22c55e',
              '#ef4444',
              '#f97316',
            ],
            borderWidth: 1,
          },
        ],
      });
      
      setIncomeVsExpenseMonthly(fallbackIncomeVsExpenseMonthly);
      setPartialPayments(fallbackPartialPayments);
      setUnpaidInvoices(fallbackUnpaidInvoices);
      setRecentTransactions(fallbackTransactions);
    } finally {
      setLoading(false);
    }
  }, [period, branch]);

  // Initial data fetch on component mount and when period/branch changes
  useEffect(() => {
    console.log("Finance component mounted or dependencies changed");
    fetchData();
  }, [fetchData]);

  // Handle filter changes  
  const handleBranchChange = (e) => {
    setBranch(e.target.value);
  };
  
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };
  
  const handleApplyFilter = () => {
    fetchData();
  };

  return (
    <ErrorBoundary>
      <FinanceLayout activeModule="/finance">
        {/* Export Modal */}
        <Modal 
          show={showExportModal} 
          onHide={() => setShowExportModal(false)}
          title="Konfirmasi Export Data"
          footer={
            <>
              <Button 
                variant="secondary" 
                onClick={() => setShowExportModal(false)}
              >
                Batal
              </Button>
              <Button 
                onClick={() => {
                  // Implementasi export data
                  setShowExportModal(false);
                }}
              >
                Export
              </Button>
            </>
          }
        >
          <p>Anda akan mengekspor data dashboard keuangan dalam format <strong>Excel</strong>.</p>
          <p>Pastikan data yang ditampilkan sudah sesuai dengan periode dan cabang yang dipilih.</p>
        </Modal>
        
        {/* Loading state */}
        {loading && !error && (
          <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh]">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">Memuat Data Keuangan</h2>
            <p className="text-gray-500">Mohon tunggu sebentar...</p>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh]">
            <div className="bg-white p-8 rounded-lg shadow-md border border-red-100 max-w-lg w-full text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Data Gagal Dimuat</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  fetchData();
                }}
                className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-2 rounded-md font-medium hover:from-red-700 hover:to-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Refresh Halaman
              </button>
            </div>
          </div>
        )}
        
        {/* Content when not loading or error */}
        {!loading && !error && (
          <div className="container mx-auto px-4 py-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-red-100 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-red-500" />
                  <div className="w-full">
                    <label htmlFor="period-filter" className="block text-xs font-medium text-gray-600 mb-1">
                      Periode
                    </label>
                    <div className="relative">
                      <select
                        id="period-filter"
                        value={period}
                        onChange={handlePeriodChange}
                        className="block w-full py-2 pl-3 pr-10 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-md"
                      >
                        <option value="week">Minggu Ini</option>
                        <option value="month">Bulan Ini</option>
                        <option value="quarter">Kuartal Ini</option>
                        <option value="year">Tahun Ini</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <FaBuilding className="text-red-500" />
                  <div className="w-full">
                    <label htmlFor="branch-filter" className="block text-xs font-medium text-gray-600 mb-1">
                      Cabang
                    </label>
                    <div className="relative">
                      <select
                        id="branch-filter"
                        value={branch}
                        onChange={handleBranchChange}
                        className="block w-full py-2 pl-3 pr-10 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-md"
                      >
                        {branches.map((branchItem) => (
                          <option key={branchItem.id} value={branchItem.id}>
                            {branchItem.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end lg:justify-start">
                  <button
                    onClick={handleApplyFilter}
                    className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-md font-medium hover:from-red-700 hover:to-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center"
                  >
                    <FaFilter className="mr-2" />
                    <span>Terapkan Filter</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Total Income */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <FaArrowUp className="text-red-500 text-xl" />
                  </div>
                  <span className="text-gray-500 font-medium">{t('finance.totalIncome')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatRupiah(financialData.totalIncome)}
                </div>
                <div className="flex items-center text-green-500">
                  <FaArrowUp className="mr-1" />
                  <span>+15.3%</span>
                  <span className="text-gray-500 text-sm ml-1">dari bulan lalu</span>
                </div>
              </div>
              
              {/* Total Expenses */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <FaArrowDown className="text-orange-500 text-xl" />
                  </div>
                  <span className="text-gray-500 font-medium">{t('finance.totalExpenses')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatRupiah(financialData.totalExpenses)}
                </div>
                <div className="flex items-center text-red-500">
                  <FaArrowUp className="mr-1" />
                  <span>7.8% dari bulan lalu</span>
                </div>
              </div>
              
              {/* Net Profit */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaWallet className="text-green-500 text-xl" />
                  </div>
                  <span className="text-gray-500 font-medium">{t('finance.netProfit')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatRupiah(financialData.netProfit)}
                </div>
                <div className="flex items-center text-green-500">
                  <FaArrowUp className="mr-1" />
                  <span>15.3% dari bulan lalu</span>
                </div>
              </div>
            </div>

            {/* Invoice Debt Status */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{t('finance.invoiceStatus')}</h2>
                <Link href="/finance/invoices" className="text-red-500 hover:text-red-700 font-medium flex items-center">
                  <span>Lihat Semua Faktur</span>
                  <FaArrowRight className="ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Faktur Belum Lunas</p>
                      <p className="text-xl font-bold text-gray-900">{formatRupiah(invoiceDebtData?.totalUnpaid || 0)}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <FaFileInvoiceDollar className="text-red-500" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Total {invoiceDebtData?.totalInvoices || 0} faktur</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-red-50/30 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Faktur Jatuh Tempo</p>
                      <p className="text-xl font-bold text-gray-900">{formatRupiah(invoiceDebtData?.overdueInvoices || 0)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-100 to-red-100 p-3 rounded-full">
                      <FaExclamationTriangle className="text-red-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{invoiceDebtData?.overdueCount || 0} faktur telah jatuh tempo</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Menunggu Jatuh Tempo</p>
                      <p className="text-xl font-bold text-gray-900">{formatRupiah(invoiceDebtData?.upcomingDue || 0)}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaCalendarAlt className="text-blue-500" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Akan jatuh tempo dalam 30 hari</p>
                </div>
              </div>
              
              {/* Doughnut Chart */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Distribusi Status Faktur</h3>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <div className="w-48 h-48">
                    {typeof window !== 'undefined' && (
                      <Pie 
                        data={invoiceDebtChartData}
                        options={{
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                usePointStyle: true,
                                pointStyle: 'circle'
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.raw || 0;
                                  return `${label}: ${value}`;
                                }
                              }
                            }
                          },
                          maintainAspectRatio: false,
                          cutout: '65%' // Ini membuat pie chart menjadi doughnut
                        }}
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Lunas: {invoiceDebtChartData.datasets[0].data[0]} faktur</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                      <span className="text-sm">Belum Lunas: {invoiceDebtChartData.datasets[0].data[1]} faktur</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">Jatuh Tempo: {invoiceDebtChartData.datasets[0].data[2]} faktur</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Billing Subscription Status Widget */}
            <div className="mb-6">
              <BillingDashboardWidget />
            </div>
            
            {/* Pendapatan vs Pengeluaran per bulan */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium text-gray-800">Pendapatan vs Pengeluaran (6 Bulan Terakhir)</h3>
                <div className="flex space-x-2">
                  <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-2 rounded">
                    <FaFileCsv className="inline mr-1" /> CSV
                  </button>
                  <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-2 rounded">
                    <FaFilePdf className="inline mr-1" /> PDF
                  </button>
                </div>
              </div>
              
              <div className="h-64">
                {typeof window !== 'undefined' && (
                  <ErrorBoundary fallback={<div className="h-full flex items-center justify-center text-red-500">Error loading chart</div>}>
                    <Chart
                      type="bar"
                      height="100%"
                      options={{
                        chart: {
                          type: 'bar',
                          stacked: false,
                          toolbar: {
                            show: false
                          }
                        },
                        colors: [chartColors.secondary, chartColors.primary],
                        plotOptions: {
                          bar: {
                            horizontal: false,
                            columnWidth: '55%',
                            borderRadius: 5
                          },
                        },
                        dataLabels: {
                          enabled: false
                        },
                        stroke: {
                          show: true,
                          width: 2,
                          colors: ['transparent']
                        },
                        xaxis: {
                          categories: incomeVsExpenseMonthly.months,
                        },
                        yaxis: {
                          title: {
                            text: 'Nominal (Rp)'
                          },
                          labels: {
                            formatter: function (value) {
                              // Format untuk jutaan rupiah
                              return (value / 1000000).toFixed(0) + ' Jt';
                            }
                          }
                        },
                        tooltip: {
                          y: {
                            formatter: function (val) {
                              return formatRupiah(val);
                            }
                          }
                        },
                        fill: {
                          opacity: 1
                        },
                        legend: {
                          position: 'top',
                          horizontalAlign: 'right',
                        }
                      }}
                      series={[
                        {
                          name: "Pendapatan",
                          data: incomeVsExpenseMonthly.income
                        },
                        {
                          name: "Pengeluaran",
                          data: incomeVsExpenseMonthly.expense
                        }
                      ]}
                    />
                  </ErrorBoundary>
                )}
              </div>
            </div>
            
            {/* Partial Payments */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Faktur Pembayaran Cicilan</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="py-3 px-4 text-left">Faktur ID</th>
                      <th className="py-3 px-4 text-left">Supplier</th>
                      <th className="py-3 px-4 text-left">Total</th>
                      <th className="py-3 px-4 text-left">Dibayar</th>
                      <th className="py-3 px-4 text-left">Progress</th>
                      <th className="py-3 px-4 text-left">Jatuh Tempo</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {partialPayments && partialPayments.length > 0 ? (
                      partialPayments.map((payment) => (
                        <tr key={payment.id} className="border-t hover:bg-gray-50">
                          <td className="py-3 px-4">{payment.id}</td>
                          <td className="py-3 px-4">{payment.supplier}</td>
                          <td className="py-3 px-4">{formatRupiah(payment.total)}</td>
                          <td className="py-3 px-4">{formatRupiah(payment.paid)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full" 
                                  style={{ width: `${payment.percentage}%` }}
                                ></div>
                              </div>
                              <span className="whitespace-nowrap">{payment.percentage}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{payment.dueDate}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-500">Tidak ada faktur pembayaran cicilan</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Unpaid Invoices */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <h6 className="font-semibold text-lg mb-4">Faktur Belum Lunas</h6>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Faktur</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Supplier</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Jatuh Tempo</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Total</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Dibayar</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidInvoices && unpaidInvoices.length > 0 ? (
                      unpaidInvoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{invoice.id}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{invoice.supplier}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{invoice.dueDate}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatRupiah(invoice.total)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatRupiah(invoice.paid)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full" style={{ width: `${invoice.percentage}%` }}></div>
                              </div>
                              <span className="text-xs">{invoice.percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b hover:bg-gray-50">
                        <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                          Tidak ada faktur yang belum lunas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Transaksi Terbaru</h2>
                <Link href="/finance/transactions" className="text-red-500 hover:text-red-700 font-medium flex items-center">
                  <span>Lihat Semua Transaksi</span>
                  <FaArrowRight className="ml-1" />
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="py-3 px-4 text-left">Tanggal</th>
                      <th className="py-3 px-4 text-left">Deskripsi</th>
                      <th className="py-3 px-4 text-left">Kategori</th>
                      <th className="py-3 px-4 text-left">Tipe</th>
                      <th className="py-3 px-4 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {recentTransactions && recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-t hover:bg-gray-50">
                          <td className="py-3 px-4">{transaction.date}</td>
                          <td className="py-3 px-4">{transaction.description}</td>
                          <td className="py-3 px-4">{transaction.category}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {transaction.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.type === 'income' ? '+' : '-'} {formatRupiah(transaction.amount)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-t">
                        <td colSpan={5} className="py-4 text-center text-gray-500">Tidak ada transaksi terbaru</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </FinanceLayout>
    </ErrorBoundary>
  );
};

export default Finance;
