import React, { useState, useEffect } from 'react';
import PosLayout from "@/components/layouts/pos-layout";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '@/lib/i18n';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ShiftManager from '@/modules/pos/components/ShiftManager';
import ShiftLog from '@/components/pos/premium/ShiftLog';
import { mockShiftLogs } from '@/data/mockShiftLogs';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PharmacyAIAssistant from '@/components/pos/ai/PharmacyAIAssistant';
import AIAssistantDialog from '@/components/pos/ai/AIAssistantDialog';

import { 
  FaCashRegister, FaArrowRight, FaStar, FaHistory, FaChartBar, FaUserFriends, 
  FaReceipt, FaClipboardList, FaBoxes, FaTag, FaPercent, FaSearchDollar, 
  FaChartPie, FaCalendarAlt, FaShoppingCart, FaCreditCard, FaMoneyBillWave, 
  FaFileInvoiceDollar, FaExchangeAlt, FaChartLine, FaSyncAlt, FaCog, FaUsers, 
  FaClipboardCheck, FaTicketAlt, FaShieldAlt, FaQrcode, FaBell, FaCheckCircle, 
  FaPlus, FaExclamationTriangle, FaLock, FaChevronRight, FaInfoCircle, FaPrint,
  FaClock, FaUserClock, FaHandshake, FaMoneyBill, FaUnlock, FaSignOutAlt, FaRobot, 
  FaArrowLeft, FaCoins, FaCrown, FaGift
} from 'react-icons/fa';

const PosPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<{active: boolean, startTime?: Date, cashAmount?: number}>({ active: false });
  const [isHandoverDialogOpen, setIsHandoverDialogOpen] = useState(false);
  const [isConfirmHandoverOpen, setIsConfirmHandoverOpen] = useState(false);
  const [handoverDetails, setHandoverDetails] = useState({
    handoverTo: '',
    handoverToRole: '',
    finalCashAmount: '',
    notes: ''
  });
  const [isTransactionDetailOpen, setIsTransactionDetailOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  // Fetch employees data
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const response = await fetch('/api/hr/employees');
        if (response.ok) {
          const data = await response.json();
          setEmployees(data.employees || []);
        } else {
          // Fallback to mock data if API fails
          setEmployees([
            { id: '1', name: 'Ani Wijaya', position: 'Kasir Senior', department: 'POS' },
            { id: '2', name: 'Budi Santoso', position: 'Kasir', department: 'POS' },
            { id: '3', name: 'Citra Dewi', position: 'Kasir', department: 'POS' },
            { id: '4', name: 'Dimas Prayoga', position: 'Supervisor', department: 'POS' },
            { id: '5', name: 'Eka Putri', position: 'Kasir', department: 'POS' },
            { id: '6', name: 'Fajar Rahman', position: 'Kasir Senior', department: 'POS' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        // Fallback to mock data
        setEmployees([
          { id: '1', name: 'Ani Wijaya', position: 'Kasir Senior', department: 'POS' },
          { id: '2', name: 'Budi Santoso', position: 'Kasir', department: 'POS' },
          { id: '3', name: 'Citra Dewi', position: 'Kasir', department: 'POS' },
          { id: '4', name: 'Dimas Prayoga', position: 'Supervisor', department: 'POS' },
          { id: '5', name: 'Eka Putri', position: 'Kasir', department: 'POS' },
          { id: '6', name: 'Fajar Rahman', position: 'Kasir Senior', department: 'POS' },
        ]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    
    fetchEmployees();
  }, []);
  
  // Mock sales data for charts/stats
  const totalSales = 12500000;
  const totalTransactions = 120;
  const averageTransaction = Math.round(totalSales / totalTransactions);
  const totalCustomers = 45;
  const todayTransactions = 15;
  const todaySales = 2500000;
  
  // Mock shift data with detailed status
  const shiftData = {
    // Current active shift
    isShiftOpen: true,
    currentShift: "Siang",
    shiftStart: new Date('2025-04-23T14:00:00'),
    shiftEnd: new Date('2025-04-23T22:00:00'),
    currentShiftPerson: "Ani Wijaya",
    currentShiftRole: "Kasir Senior",
    shiftOpenedBy: "Ani Wijaya",
    shiftOpenedAt: new Date('2025-04-23T14:05:00'),
    initialCashAmount: 2000000,
    
    // Current cash status
    cashDrawerAmount: 3750000,
    salesDuringShift: 1850000,
    transactionsDuringShift: 8,
    expectedCashAmount: 3850000, // initialCash + sales
    cashDifference: -100000, // actual - expected
    
    // Previous shift (closed)
    previousShift: "Pagi",
    previousShiftPerson: "Budi Santoso",
    previousShiftRole: "Kasir",
    previousShiftClosedAt: new Date('2025-04-23T14:00:00'),
    previousShiftFinalCash: 4200000,
    previousShiftHandoverTo: "Ani Wijaya",
    previousShiftHandoverRole: "Kasir Senior",
    
    // Next shift
    nextShift: "Malam",
    nextShiftPerson: "Dimas Prayoga",
    nextShiftRole: "Supervisor",
    nextShiftStart: new Date('2025-04-23T22:00:00'),
    
    shiftNotes: "Tutup kasir untuk sebentar pada pukul 16:00-16:30 untuk maintenance sistem."  
  };
  
  // Feature cards data
  const getFeatureCards = (t: any) => [
    { 
      title: t('pos.cashier'),
      description: t('pos.cashierSystemDescription'),
      icon: <FaCashRegister className="w-5 h-5 text-white" />,
      path: '/pos/kasir',
      color: 'from-red-600 to-orange-500',
      bgIcon: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    { 
      title: t('pos.sales'),
      description: t('pos.manageSalesHistory'),
      icon: <FaReceipt className="w-5 h-5 text-white" />,
      path: '/pos/penjualan',
      color: 'from-red-600 to-orange-500',
      bgIcon: 'bg-orange-100',
      iconColor: 'text-red-600',
      borderColor: 'border-orange-200'
    },
    { 
      title: t('pos.customers'),
      description: t('pos.manageCustomerData'),
      icon: <FaUserFriends className="w-5 h-5 text-white" />,
      path: '/pos/customer',
      color: 'from-red-600 to-orange-500',
      bgIcon: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    { 
      title: t('pos.promosDiscounts'),
      description: t('pos.managePromosVouchers'),
      icon: <FaTag className="w-5 h-5 text-white" />,
      path: '/pos/promo',
      color: 'from-red-600 to-orange-500',
      bgIcon: 'bg-orange-100',
      iconColor: 'text-red-600',
      borderColor: 'border-orange-200'
    },
    { 
      title: t('pos.salesAnalysis'),
      description: t('pos.salesReportsAnalysis'),
      icon: <FaChartBar className="w-5 h-5 text-white" />,
      path: '/pos/transaksi',
      color: 'from-red-600 to-orange-500',
      bgIcon: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    { 
      title: t('common.settings'),
      description: t('pos.posSystemConfiguration'),
      icon: <FaCog className="w-5 h-5 text-white" />,
      path: '/pos/settings',
      color: 'from-red-600 to-orange-500',
      bgIcon: 'bg-orange-100',
      iconColor: 'text-red-600',
      borderColor: 'border-orange-200'
    },
  ];
  
  const featureCards = getFeatureCards(t);
  
  // Recent transactions mock data with product items
  const recentTransactions = [
    { 
      id: 'TRX001', 
      date: new Date('2025-04-23T08:15:00'), 
      customer: 'Umum', 
      total: 125000, 
      items: 3, 
      status: 'completed',
      paymentMethod: 'Cash',
      cashier: 'Ani Wijaya',
      products: [
        { name: 'Paracetamol 500mg', sku: 'MED-001', quantity: 2, price: 25000, subtotal: 50000 },
        { name: 'Amoxicillin 500mg', sku: 'MED-002', quantity: 1, price: 45000, subtotal: 45000 },
        { name: 'Vitamin C 1000mg', sku: 'SUP-001', quantity: 1, price: 30000, subtotal: 30000 }
      ]
    },
    { 
      id: 'TRX002', 
      date: new Date('2025-04-23T09:20:00'), 
      customer: 'Budi Santoso', 
      total: 275000, 
      items: 5, 
      status: 'completed',
      paymentMethod: 'Transfer',
      cashier: 'Ani Wijaya',
      products: [
        { name: 'Obat Batuk Sirup', sku: 'MED-010', quantity: 2, price: 35000, subtotal: 70000 },
        { name: 'Masker Medis (Box)', sku: 'MED-020', quantity: 1, price: 50000, subtotal: 50000 },
        { name: 'Hand Sanitizer 100ml', sku: 'HYG-001', quantity: 3, price: 25000, subtotal: 75000 },
        { name: 'Termometer Digital', sku: 'MED-030', quantity: 1, price: 80000, subtotal: 80000 }
      ]
    },
    { 
      id: 'TRX003', 
      date: new Date('2025-04-23T10:05:00'), 
      customer: 'Umum', 
      total: 85000, 
      items: 2, 
      status: 'completed',
      paymentMethod: 'Cash',
      cashier: 'Ani Wijaya',
      products: [
        { name: 'Betadine 30ml', sku: 'MED-015', quantity: 1, price: 35000, subtotal: 35000 },
        { name: 'Plester Luka (Box)', sku: 'MED-025', quantity: 1, price: 50000, subtotal: 50000 }
      ]
    },
    { 
      id: 'TRX004', 
      date: new Date('2025-04-23T10:30:00'), 
      customer: 'Ani Wijaya', 
      total: 345000, 
      items: 6, 
      status: 'completed',
      paymentMethod: 'Card',
      cashier: 'Ani Wijaya',
      products: [
        { name: 'Multivitamin (30 Tablet)', sku: 'SUP-010', quantity: 2, price: 75000, subtotal: 150000 },
        { name: 'Omega 3 Fish Oil', sku: 'SUP-020', quantity: 1, price: 120000, subtotal: 120000 },
        { name: 'Vitamin D3', sku: 'SUP-030', quantity: 1, price: 75000, subtotal: 75000 }
      ]
    },
    { 
      id: 'TRX005', 
      date: new Date('2025-04-23T11:15:00'), 
      customer: 'Umum', 
      total: 95000, 
      items: 1, 
      status: 'completed',
      paymentMethod: 'QRIS',
      cashier: 'Ani Wijaya',
      products: [
        { name: 'Salep Kulit Antibiotik', sku: 'MED-040', quantity: 1, price: 95000, subtotal: 95000 }
      ]
    },
  ];
  
  // Format currency in IDR
  const formatIDR = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date and time
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Format duration in hours, minutes and seconds
  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    } else if (minutes > 0) {
      return `${minutes} menit ${remainingSeconds} detik`;
    } else {
      return `${remainingSeconds} detik`;
    }
  };
  
  // Handle print shift report
  const handlePrintShiftReport = () => {
    // Show loading toast
    toast({
      title: "Menyiapkan laporan shift",
      description: "Laporan shift sedang disiapkan untuk dicetak.",
      duration: 2000,
    });
    
    // Simulate API call with timeout
    setTimeout(() => {
      setPrintDialogOpen(true);
      
      // Generate the report content
      const reportContent = `
        <html>
          <head>
            <title>Laporan Shift ${shiftData.currentShift} - ${formatDateTime(shiftData.shiftStart)}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .logo { font-weight: bold; font-size: 24px; margin-bottom: 5px; }
              .title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
              .info-section { margin-bottom: 20px; }
              .info-title { font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .info-label { font-weight: normal; color: #555; }
              .info-value { font-weight: bold; }
              .notes { background-color: #f9f9f9; padding: 10px; border: 1px solid #eee; margin-top: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th { background-color: #f2f2f2; text-align: left; padding: 8px; }
              td { border-bottom: 1px solid #ddd; padding: 8px; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">FARMANESIA EVO</div>
              <div>Laporan Shift Kasir</div>
            </div>
            
            <div class="title">Shift ${shiftData.currentShift} - ${formatDateTime(shiftData.shiftStart)}</div>
            
            <div class="info-section">
              <div class="info-title">Informasi Shift</div>
              <div class="info-row">
                <span class="info-label">Petugas Kasir:</span>
                <span class="info-value">${shiftData.currentShiftPerson}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Waktu Shift:</span>
                <span class="info-value">
                  ${shiftData.shiftStart.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} - 
                  ${shiftData.shiftEnd.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Shift Sebelumnya:</span>
                <span class="info-value">${shiftData.previousShift} - ${shiftData.previousShiftPerson}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Shift Berikutnya:</span>
                <span class="info-value">${shiftData.nextShift} - ${shiftData.nextShiftPerson}</span>
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-title">Keuangan Shift</div>
              <div class="info-row">
                <span class="info-label">Saldo Awal Kas:</span>
                <span class="info-value">${formatIDR(shiftData.cashDrawerAmount - shiftData.salesDuringShift)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Penjualan:</span>
                <span class="info-value">${formatIDR(shiftData.salesDuringShift)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Jumlah Transaksi:</span>
                <span class="info-value">${shiftData.transactionsDuringShift}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Rata-rata per Transaksi:</span>
                <span class="info-value">${formatIDR(shiftData.salesDuringShift / shiftData.transactionsDuringShift)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Kas di Laci:</span>
                <span class="info-value">${formatIDR(shiftData.cashDrawerAmount)}</span>
              </div>
            </div>
            
            ${shiftData.shiftNotes ? `
            <div class="notes">
              <div class="info-title">Catatan Shift</div>
              <p>${shiftData.shiftNotes}</p>
            </div>
            ` : ''}
            
            <div class="footer">
              <p suppressHydrationWarning>Laporan dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
              <p>FARMANESIA EVO - Sistem Manajemen Apotek</p>
            </div>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; background-color: #e11d48; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Cetak Laporan
              </button>
              <button onclick="window.close()" style="margin-left: 10px; padding: 10px 20px; background-color: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Tutup
              </button>
            </div>
          </body>
        </html>
      `;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(reportContent);
        printWindow.document.close();
        
        // Automatically trigger print dialog after content is loaded
        printWindow.onload = function() {
          setTimeout(() => {
            // printWindow.print(); // Uncomment for auto-print
            setPrintDialogOpen(false);
          }, 500);
        };
      } else {
        // If popup blocked
        toast({
          variant: "destructive",
          title: "Popup diblokir!",
          description: "Harap izinkan popup untuk mencetak laporan.",
        });
        setPrintDialogOpen(false);
      }
    }, 1000);
  };

  // Handle shift handover - show confirmation first
  const handleShiftHandover = () => {
    // Validate required fields
    if (!handoverDetails.handoverTo || !handoverDetails.handoverToRole || !handoverDetails.finalCashAmount) {
      toast({
        title: "Data tidak lengkap",
        description: "Harap lengkapi semua field yang diperlukan untuk serah terima shift",
        variant: "destructive",
      });
      return;
    }
    
    // Show confirmation dialog
    setIsHandoverDialogOpen(false);
    setIsConfirmHandoverOpen(true);
  };
  
  // Confirm and process shift handover
  const confirmShiftHandover = () => {
    // Parse final cash amount
    const finalCashAmount = parseFloat(handoverDetails.finalCashAmount.replace(/[^\d]/g, ''));
    
    // Close confirmation dialog
    setIsConfirmHandoverOpen(false);
    
    // Show success notification with detailed information
    toast({
      title: "✅ Pergantian Shift Berhasil!",
      description: `Serah terima shift telah dilakukan. Shift ditutup oleh ${shiftData.currentShiftPerson} dan diserahkan kepada ${handoverDetails.handoverTo} (${handoverDetails.handoverToRole}) dengan kas akhir ${formatIDR(finalCashAmount)}. Status: Serah terima berhasil.`,
      duration: 6000,
    });
    
    // Show additional success toast with status
    setTimeout(() => {
      toast({
        title: "📋 Status Serah Terima",
        description: `Pergantian shift dari ${shiftData.currentShift} berhasil dilakukan. Data serah terima telah tercatat dalam sistem.`,
        duration: 5000,
      });
    }, 500);
    
    // Reset form
    setHandoverDetails({
      handoverTo: '',
      handoverToRole: '',
      finalCashAmount: '',
      notes: ''
    });
  };

  // Handle currency input format
  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const numValue = value === '' ? '' : parseInt(value, 10).toString();
    const formattedValue = numValue === '' ? '' : formatIDR(parseInt(numValue));
    
    setHandoverDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  // Handle print transaction report
  const handlePrintTransactionReport = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Transaksi Terbaru - ${new Date().toLocaleDateString('id-ID')}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e11d48; padding-bottom: 15px; }
          .header h1 { margin: 0; font-size: 28px; color: #e11d48; }
          .header p { margin: 5px 0; color: #666; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .summary-card { background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #e11d48; }
          .summary-card h3 { margin: 0 0 5px 0; font-size: 12px; color: #666; text-transform: uppercase; }
          .summary-card p { margin: 0; font-size: 24px; font-weight: bold; color: #e11d48; }
          .transactions-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #e11d48; color: white; text-align: left; padding: 12px; font-size: 14px; }
          td { border-bottom: 1px solid #ddd; padding: 10px; font-size: 13px; }
          tr:hover { background-color: #f9f9f9; }
          .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; background: #22c55e; color: white; font-size: 11px; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
          @media print { 
            .no-print { display: none; }
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FARMANESIA EVO</h1>
          <p>Laporan Transaksi Terbaru</p>
          <p>${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Transaksi Hari Ini</h3>
            <p>${todayTransactions}</p>
          </div>
          <div class="summary-card">
            <h3>Penjualan Hari Ini</h3>
            <p>${formatIDR(todaySales)}</p>
          </div>
          <div class="summary-card">
            <h3>Total Transaksi</h3>
            <p>${totalTransactions}</p>
          </div>
          <div class="summary-card">
            <h3>Rata-rata</h3>
            <p>${formatIDR(averageTransaction)}</p>
          </div>
        </div>
        
        <div class="transactions-title">Transaksi Terbaru</div>
        
        <table>
          <thead>
            <tr>
              <th>ID Transaksi</th>
              <th>Waktu</th>
              <th>Pelanggan</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${recentTransactions.map(tx => `
              <tr>
                <td><strong>${tx.id}</strong></td>
                <td>${formatDateTime(tx.date)}</td>
                <td>${tx.customer}</td>
                <td><strong>${formatIDR(tx.total)}</strong></td>
                <td><span class="status-badge">✓ Selesai</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Laporan dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
          <p>FARMANESIA EVO - Sistem Point of Sales</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 10px 20px; background-color: #e11d48; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
            Cetak Laporan
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background-color: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Tutup
          </button>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      toast({
        title: "Laporan Siap Dicetak",
        description: "Jendela cetak telah dibuka",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Popup Diblokir",
        description: "Harap izinkan popup untuk mencetak laporan",
      });
    }
  };
  
  return (
    <PosLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        {/* Inventory Page Header - with red-orange gradient */}
        <div className="relative mb-6 overflow-hidden bg-gradient-to-r from-red-600 to-orange-500 rounded-xl shadow-lg border border-red-200">
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-gradient-to-br from-orange-300 to-red-400 opacity-20 blur-2xl transform translate-x-16 -translate-y-16"></div>
          <div className="absolute left-0 bottom-0 w-48 h-48 rounded-full bg-gradient-to-tr from-red-400 to-orange-300 opacity-20 blur-xl transform -translate-x-8 translate-y-12"></div>
          
          <div className="relative py-6 px-6 sm:px-8 z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 font-sans flex items-center">
                  <FaCashRegister className="h-7 w-7 mr-2 text-white" />
                  {t('pos.pointOfSales')}
                </h2>
                <p className="text-red-50 text-base max-w-lg font-sans leading-relaxed">
                  {t('pos.manageSalesTransactions')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/pos/kasir" legacyBehavior>
                  <Button className="bg-white text-red-600 hover:bg-red-50 gap-1" size="sm">
                    <FaCashRegister className="h-4 w-4" />
                    Buka Kasir
                  </Button>
                </Link>
                <Link href="/pos/promo" legacyBehavior>
                  <Button variant="outline" className="bg-red-700/20 text-white border-red-400/30 hover:bg-red-700/30 hover:text-white gap-1" size="sm">
                    <FaTag className="h-4 w-4" />
                    Kelola Promo
                  </Button>
                </Link>
                <AIAssistantDialog />
                <Button 
                  variant="outline" 
                  className="bg-red-700/20 text-white border-red-400/30 hover:bg-red-700/30 hover:text-white gap-1" 
                  size="sm"
                  onClick={() => setIsShiftDialogOpen(true)}
                >
                  {currentShift.active ? (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
                      Aktif Shift
                    </>
                  ) : (
                    <>
                      <FaUserClock className="h-4 w-4" />
                      Buka Shift
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-red-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Transaksi Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-800">{todayTransactions}</div>
                <div className="p-2 rounded-full bg-red-100">
                  <FaReceipt className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Rp {(todaySales / 1000000).toFixed(1)} juta</p>
            </CardContent>
          </Card>
          
          <Card className="border-orange-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Penjualan (Bulan Ini)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-800">{formatIDR(totalSales)}</div>
                <div className="p-2 rounded-full bg-orange-100">
                  <FaMoneyBillWave className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{totalTransactions} transaksi</p>
            </CardContent>
          </Card>
          
          <Card className="border-red-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Rata-rata Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-800">{formatIDR(averageTransaction)}</div>
                <div className="p-2 rounded-full bg-red-100">
                  <FaChartLine className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Per transaksi</p>
            </CardContent>
          </Card>
          
          <Card className="border-orange-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-800">{totalCustomers}</div>
                <div className="p-2 rounded-full bg-orange-100">
                  <FaUsers className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{Math.round(totalTransactions/totalCustomers)} transaksi/pelanggan</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for main content */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <FaChartPie className="h-4 w-4 mr-2" />
              Ikhtisar
            </TabsTrigger>
            <TabsTrigger value="transaction_history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <FaReceipt className="h-4 w-4 mr-2" />
              Riwayat Transaksi
            </TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <FaBoxes className="h-4 w-4 mr-2" />
              Modul
            </TabsTrigger>
            <TabsTrigger value="shift_log" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <FaHistory className="h-4 w-4 mr-2" />
              Riwayat Shift
            </TabsTrigger>
            <TabsTrigger value="loyalty_management" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <FaStar className="h-4 w-4 mr-2" />
              Loyalty Point Management
            </TabsTrigger>
            <TabsTrigger value="ai_assistant" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <FaRobot className="h-4 w-4 mr-2" />
              Asisten AI
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Shift Status Information Card - Simplified */}
            <Card className="border-orange-100 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaUserClock className="h-5 w-5 text-orange-500" />
                      Status Kas Saat Ini
                    </CardTitle>
                    <CardDescription>Informasi shift aktif dan kas</CardDescription>
                  </div>
                  <Badge className="bg-green-600 text-white hover:bg-green-700 px-3 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>Shift {shiftData.currentShift}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Shift Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-blue-700">Kas Awal</p>
                      <FaMoneyBillWave className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-xl font-bold text-blue-900">{formatIDR(shiftData.initialCashAmount)}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-green-700">Penjualan</p>
                      <FaChartLine className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-xl font-bold text-green-900">{formatIDR(shiftData.salesDuringShift)}</p>
                    <p className="text-xs text-green-600 mt-1">{shiftData.transactionsDuringShift} transaksi</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-orange-700">Total Kas</p>
                      <FaCashRegister className="h-4 w-4 text-orange-600" />
                    </div>
                    <p className="text-xl font-bold text-orange-900">{formatIDR(shiftData.cashDrawerAmount)}</p>
                    {shiftData.cashDifference !== 0 && (
                      <Badge variant={shiftData.cashDifference < 0 ? "destructive" : "default"} className="text-xs mt-1">
                        {shiftData.cashDifference > 0 ? '+' : ''}{formatIDR(shiftData.cashDifference)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Shift Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Shift */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUnlock className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Shift Aktif</h3>
                        <p className="text-xs text-gray-500">
                          {shiftData.shiftStart.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} - {shiftData.shiftEnd.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Petugas:</span>
                        <span className="font-medium text-gray-900">{shiftData.currentShiftPerson}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Jabatan:</span>
                        <span className="text-gray-700">{shiftData.currentShiftRole}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Dibuka:</span>
                        <span className="text-gray-700">{shiftData.shiftOpenedAt.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>

                  {/* Previous Shift */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <FaLock className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Shift Sebelumnya</h3>
                        <p className="text-xs text-gray-500">Shift {shiftData.previousShift}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ditutup oleh:</span>
                        <span className="font-medium text-gray-900">{shiftData.previousShiftPerson}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Kas Akhir:</span>
                        <span className="font-semibold text-red-600">{formatIDR(shiftData.previousShiftFinalCash)}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <FaHandshake className="h-3 w-3" />
                          <span>Diserahkan kepada:</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{shiftData.previousShiftHandoverTo}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {shiftData.shiftNotes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <FaInfoCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-800">Catatan Shift</p>
                        <p className="text-sm text-amber-900 mt-1">{shiftData.shiftNotes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-600 border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                  onClick={() => setIsHandoverDialogOpen(true)}
                >
                  <FaExchangeAlt className="h-4 w-4 mr-1" /> Serah Terima Shift
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handlePrintShiftReport}
                >
                  <FaPrint className="h-4 w-4 mr-1" /> Cetak Laporan Shift
                </Button>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="border-red-100">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaClipboardList className="h-5 w-5 text-red-500" />
                      Transaksi Terbaru
                    </CardTitle>
                    <CardDescription>Data transaksi hari ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 font-medium text-gray-500">ID</th>
                            <th className="text-left py-2 font-medium text-gray-500">Waktu</th>
                            <th className="text-left py-2 font-medium text-gray-500">Pelanggan</th>
                            <th className="text-right py-2 font-medium text-gray-500">Total</th>
                            <th className="text-center py-2 font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentTransactions.map((tx) => (
                            <tr 
                              key={tx.id} 
                              className="border-b border-gray-100 hover:bg-red-50 cursor-pointer transition-colors"
                              onClick={() => {
                                setSelectedTransaction(tx);
                                setIsTransactionDetailOpen(true);
                              }}
                            >
                              <td className="py-3 text-gray-800 font-medium">{tx.id}</td>
                              <td className="py-3 text-gray-600">{formatDateTime(tx.date)}</td>
                              <td className="py-3 text-gray-600">{tx.customer}</td>
                              <td className="py-3 text-gray-800 font-medium text-right">{formatIDR(tx.total)}</td>
                              <td className="py-3">
                                <div className="flex justify-center">
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                                    <FaCheckCircle className="h-3 w-3 mr-1" />
                                    Selesai
                                  </Badge>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-100 pt-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      onClick={handlePrintTransactionReport}
                    >
                      <FaPrint className="h-4 w-4 mr-1" /> Cetak Laporan
                    </Button>
                    <Link href="/pos/penjualan" legacyBehavior>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Lihat Semua <FaChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card className="border-orange-100 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaBell className="h-5 w-5 text-orange-500" />
                      Notifikasi
                    </CardTitle>
                    <CardDescription>Pemberitahuan sistem</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                        <div className="text-red-500 mt-0.5">
                          <FaExclamationTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-red-800">Stok Menipis</h4>
                          <p className="text-xs text-red-700">5 produk memiliki stok di bawah minimum</p>
                          <Link href="/inventory?filter=low_stock" legacyBehavior>
                            <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 p-0">
                              Lihat Detail
                            </Button>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                        <div className="text-orange-500 mt-0.5">
                          <FaCalendarAlt className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-orange-800">Produk Kedaluwarsa</h4>
                          <p className="text-xs text-orange-700">3 produk akan kedaluwarsa dalam 30 hari</p>
                          <Link href="/inventory?filter=expiring" legacyBehavior>
                            <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-100 p-0">
                              Lihat Detail
                            </Button>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                        <div className="text-green-500 mt-0.5">
                          <FaTicketAlt className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-green-800">Promo Aktif</h4>
                          <p className="text-xs text-green-700">2 promo & voucher sedang berjalan</p>
                          <Link href="/pos/promo" legacyBehavior>
                            <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-100 p-0">
                              Lihat Detail
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="transaction_history" className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              {/* Transaction History Summary Card */}
              <Card className="border-red-100 shadow-sm">
                <div className="h-1.5 w-full bg-gradient-to-r from-red-600 to-orange-500"></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800">Riwayat Transaksi</CardTitle>
                      <CardDescription>Kelola dan pantau semua transaksi penjualan</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href="/pos/penjualan">
                        <Button className="bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600">
                          <FaReceipt className="h-4 w-4 mr-2" />
                          Lihat Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Transaksi Hari Ini</p>
                          <p className="text-2xl font-bold text-red-600">{todayTransactions}</p>
                        </div>
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <FaReceipt className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Penjualan Hari Ini</p>
                          <p className="text-2xl font-bold text-red-600">Rp {(todaySales / 1000000).toFixed(1)}M</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FaMoneyBillWave className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                          <p className="text-2xl font-bold text-red-600">{totalTransactions}</p>
                        </div>
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <FaChartBar className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Rata-rata Transaksi</p>
                          <p className="text-2xl font-bold text-red-600">Rp {(averageTransaction / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FaChartLine className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Transaksi Terbaru</h3>
                      <Link href="/pos/penjualan" legacyBehavior>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          Lihat Semua <FaChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        { 
                          id: 'TRX-001', 
                          customer: 'Budi Santoso', 
                          total: 450000, 
                          time: '14:30', 
                          status: 'completed',
                          date: new Date('2025-04-23T14:30:00'),
                          paymentMethod: 'Transfer',
                          cashier: 'Ani Wijaya',
                          items: 4,
                          products: [
                            { name: 'Ibuprofen 400mg', sku: 'MED-005', quantity: 2, price: 50000, subtotal: 100000 },
                            { name: 'Antasida Tablet', sku: 'MED-006', quantity: 3, price: 35000, subtotal: 105000 },
                            { name: 'Vitamin B Complex', sku: 'SUP-005', quantity: 2, price: 75000, subtotal: 150000 },
                            { name: 'Salep Luka Bakar', sku: 'MED-050', quantity: 1, price: 95000, subtotal: 95000 }
                          ]
                        },
                        { 
                          id: 'TRX-002', 
                          customer: 'Siti Nurhayati', 
                          total: 780000, 
                          time: '14:15', 
                          status: 'completed',
                          date: new Date('2025-04-23T14:15:00'),
                          paymentMethod: 'Cash',
                          cashier: 'Ani Wijaya',
                          items: 5,
                          products: [
                            { name: 'Antibiotik Amoxilin 500mg', sku: 'MED-008', quantity: 3, price: 60000, subtotal: 180000 },
                            { name: 'Obat Flu & Batuk', sku: 'MED-012', quantity: 2, price: 45000, subtotal: 90000 },
                            { name: 'Vitamin C 1000mg (Box)', sku: 'SUP-002', quantity: 2, price: 120000, subtotal: 240000 },
                            { name: 'Minyak Kayu Putih', sku: 'MED-018', quantity: 2, price: 35000, subtotal: 70000 },
                            { name: 'Plester Luka (Pack)', sku: 'MED-026', quantity: 2, price: 100000, subtotal: 200000 }
                          ]
                        },
                        { 
                          id: 'TRX-003', 
                          customer: 'Joko Widodo', 
                          total: 320000, 
                          time: '13:45', 
                          status: 'completed',
                          date: new Date('2025-04-23T13:45:00'),
                          paymentMethod: 'Card',
                          cashier: 'Ani Wijaya',
                          items: 3,
                          products: [
                            { name: 'Obat Maag Cair', sku: 'MED-014', quantity: 2, price: 55000, subtotal: 110000 },
                            { name: 'Obat Diare', sku: 'MED-016', quantity: 1, price: 45000, subtotal: 45000 },
                            { name: 'Oralit (Box)', sku: 'MED-022', quantity: 1, price: 165000, subtotal: 165000 }
                          ]
                        },
                        { 
                          id: 'TRX-004', 
                          customer: 'Dewi Lestari', 
                          total: 560000, 
                          time: '13:20', 
                          status: 'completed',
                          date: new Date('2025-04-23T13:20:00'),
                          paymentMethod: 'QRIS',
                          cashier: 'Ani Wijaya',
                          items: 4,
                          products: [
                            { name: 'Suplemen Kalsium', sku: 'SUP-008', quantity: 2, price: 150000, subtotal: 300000 },
                            { name: 'Minyak Ikan Omega 3', sku: 'SUP-021', quantity: 1, price: 180000, subtotal: 180000 },
                            { name: 'Vitamin E', sku: 'SUP-012', quantity: 1, price: 80000, subtotal: 80000 }
                          ]
                        },
                        { 
                          id: 'TRX-005', 
                          customer: 'Agus Setiawan', 
                          total: 890000, 
                          time: '12:55', 
                          status: 'completed',
                          date: new Date('2025-04-23T12:55:00'),
                          paymentMethod: 'Transfer',
                          cashier: 'Ani Wijaya',
                          items: 6,
                          products: [
                            { name: 'Obat Diabetes', sku: 'MED-100', quantity: 2, price: 200000, subtotal: 400000 },
                            { name: 'Obat Darah Tinggi', sku: 'MED-102', quantity: 1, price: 180000, subtotal: 180000 },
                            { name: 'Obat Kolesterol', sku: 'MED-104', quantity: 1, price: 150000, subtotal: 150000 },
                            { name: 'Vitamin untuk Jantung', sku: 'SUP-025', quantity: 1, price: 160000, subtotal: 160000 }
                          ]
                        }
                      ].map((transaction, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setIsTransactionDetailOpen(true);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <FaReceipt className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.id}</p>
                              <p className="text-sm text-gray-500">{transaction.customer}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">Rp {transaction.total.toLocaleString('id-ID')}</p>
                            <p className="text-sm text-gray-500">{transaction.time}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <FaCheckCircle className="h-3 w-3 mr-1" />
                            Selesai
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="modules" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureCards.map((card, index) => (
                <Link href={card.path} key={index}>
                  <Card className={`hover:shadow-md transition-all ${card.borderColor} overflow-hidden h-full`}>
                    <div className={`h-1.5 w-full bg-gradient-to-r ${card.color}`}></div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">{card.title}</CardTitle>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bgIcon}`}>
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center shadow-sm`}>
                            {card.icon}
                          </div>
                        </div>
                      </div>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Buka <FaChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="shift_log" className="space-y-4">
            <Card className="border-red-100 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FaHistory className="h-5 w-5 text-red-500" />
                  Riwayat Serah Terima Kas
                </CardTitle>
                <CardDescription>
                  Informasi lengkap aktivitas buka dan tutup shift serta serah terima kas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ShiftLog entries={mockShiftLogs} />
              </CardContent>
            </Card>
            
            <Card className="border-orange-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FaMoneyBill className="h-5 w-5 text-orange-500" />
                  Status Kas Saat Ini
                </CardTitle>
                <CardDescription>
                  Informasi status dan kondisi kas pada shift aktif
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-xl p-4 border border-red-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Status Shift:</span>
                        <Badge className={currentShift.active ? 
                          "bg-gradient-to-r from-green-500 to-green-600" : 
                          "bg-gradient-to-r from-red-600 to-orange-500"}>
                          {currentShift.active ? 
                            <><FaUnlock className="mr-1" /> Shift Aktif</> : 
                            <><FaLock className="mr-1" /> Shift Tutup</>}
                        </Badge>
                      </div>
                      
                      {currentShift.active && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Waktu Mulai:</span>
                            <span className="text-sm font-medium">
                              <span suppressHydrationWarning>
                                {currentShift.startTime?.toLocaleString('id-ID', {
                                  dateStyle: 'short',
                                  timeStyle: 'short'
                                }) || '-'}
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Durasi Shift:</span>
                            <span className="text-sm font-medium">
                              {currentShift.startTime ? 
                                formatDuration(new Date().getTime() - currentShift.startTime.getTime()) : 
                                '-'}
                            </span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Kasir:</span>
                        <span className="text-sm font-medium">Ani Wijaya</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Kas Awal:</span>
                        <span className="text-sm font-medium">{formatIDR(shiftData.cashDrawerAmount - shiftData.salesDuringShift)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Penjualan:</span>
                        <span className="text-sm font-medium text-green-600">+{formatIDR(shiftData.salesDuringShift)}</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Jumlah Kas Saat Ini:</span>
                        <span className="text-sm font-bold text-gray-800">{formatIDR(shiftData.cashDrawerAmount)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-dashed border-red-100">
                    <div className="flex justify-between">
                      <Button 
                        onClick={() => setIsShiftDialogOpen(true)}
                        className={currentShift.active ? 
                          "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white" : 
                          "border border-red-600 text-red-600 hover:bg-red-50"}
                      >
                        {currentShift.active ? 
                          <><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div> Aktif Shift</> : 
                          <><FaUnlock className="mr-2 h-4 w-4" /> Buka Shift</>}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={handlePrintShiftReport}
                      >
                        <FaPrint className="mr-2 h-4 w-4" /> Cetak Laporan Shift
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loyalty Point Management Tab */}
          <TabsContent value="loyalty_management" className="space-y-4">
            <Card className="border-orange-100 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaStar className="h-5 w-5 text-orange-500" />
                      Loyalty Point Management
                    </CardTitle>
                    <CardDescription>Kelola poin loyalitas pelanggan dan program reward</CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push('/customers/loyalty')}
                    className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
                  >
                    <FaCog className="mr-2" />
                    Pengaturan Program
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-blue-700">Total Member</p>
                      <FaUsers className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">1,250</p>
                    <p className="text-xs text-blue-600 mt-1">980 aktif</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-green-700">Poin Diterbitkan</p>
                      <FaCoins className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">125,000</p>
                    <p className="text-xs text-green-600 mt-1">45,000 ditukar</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-orange-700">Rata-rata Poin</p>
                      <FaChartLine className="h-4 w-4 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-900">100</p>
                    <p className="text-xs text-orange-600 mt-1">per member</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-purple-700">Tier Terbanyak</p>
                      <FaCrown className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900">Gold</p>
                    <p className="text-xs text-purple-600 mt-1">450 member</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Aksi Cepat</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto py-3 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaCoins className="text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Tambah Poin Manual</p>
                          <p className="text-xs text-gray-500">Berikan poin ke pelanggan</p>
                        </div>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto py-3 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <FaGift className="text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Tukar Reward</p>
                          <p className="text-xs text-gray-500">Proses penukaran poin</p>
                        </div>
                      </div>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="justify-start h-auto py-3 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <FaExchangeAlt className="text-purple-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Riwayat Transaksi</p>
                          <p className="text-xs text-gray-500">Lihat histori poin</p>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Member Tiers */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Tier Member</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="w-full h-2 bg-gradient-to-r from-amber-700 to-amber-500 rounded-full mb-2"></div>
                      <h4 className="font-semibold text-gray-900">Bronze</h4>
                      <p className="text-xs text-gray-500 mt-1">Min. Rp 0</p>
                      <p className="text-lg font-bold text-gray-800 mt-2">312</p>
                      <p className="text-xs text-gray-500">member</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="w-full h-2 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full mb-2"></div>
                      <h4 className="font-semibold text-gray-900">Silver</h4>
                      <p className="text-xs text-gray-500 mt-1">Min. Rp 2jt</p>
                      <p className="text-lg font-bold text-gray-800 mt-2">313</p>
                      <p className="text-xs text-gray-500">member</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="w-full h-2 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full mb-2"></div>
                      <h4 className="font-semibold text-gray-900">Gold</h4>
                      <p className="text-xs text-gray-500 mt-1">Min. Rp 4jt</p>
                      <p className="text-lg font-bold text-gray-800 mt-2">450</p>
                      <p className="text-xs text-gray-500">member</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="w-full h-2 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full mb-2"></div>
                      <h4 className="font-semibold text-gray-900">Platinum</h4>
                      <p className="text-xs text-gray-500 mt-1">Min. Rp 8jt</p>
                      <p className="text-lg font-bold text-gray-800 mt-2">175</p>
                      <p className="text-xs text-gray-500">member</p>
                    </div>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaStar className="text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Program Loyalitas Aktif</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Setiap pembelian Rp 1.000 = 1 poin. Member dapat menukar poin dengan berbagai reward menarik.
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => router.push('/customers/loyalty')}
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                      >
                        Kelola Program Lengkap
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai_assistant" className="space-y-4">
            <PharmacyAIAssistant />
          </TabsContent>
        </Tabs>
      </div>
      {/* Shift Dialog */}
      <Dialog
        open={isShiftDialogOpen}
        onOpenChange={(open) => setIsShiftDialogOpen(open)}
      >
        <DialogContent className="max-w-md">
          <ShiftManager
            userId="cashier_1" // Gunakan ID kasir yang sesuai dari konteks otentikasi
            userName="Kasir" // Gunakan nama kasir yang sesuai dari konteks otentikasi
            onShiftUpdate={(isActive, cashAmount) => {
              setCurrentShift({
                active: isActive,
                startTime: isActive ? new Date() : undefined,
                cashAmount: cashAmount || 0
              });
              setIsShiftDialogOpen(false);
              
              // Show toast notification
              toast({
                title: isActive ? "Shift dibuka" : "Shift ditutup",
                description: isActive
                  ? `Shift berhasil dibuka dengan kas awal ${formatIDR(cashAmount || 0)}`
                  : `Shift berhasil ditutup`,
                variant: "default",
              });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Shift Handover Dialog */}
      <Dialog 
        open={isHandoverDialogOpen} 
        onOpenChange={(open) => setIsHandoverDialogOpen(open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FaHandshake className="text-red-500" /> Serah Terima Shift
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="handoverTo" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Penerima Shift
              </Label>
              <Select
                value={handoverDetails.handoverTo}
                onValueChange={(value) => {
                  const selectedEmployee = employees.find(emp => emp.name === value);
                  setHandoverDetails({
                    ...handoverDetails,
                    handoverTo: value,
                    handoverToRole: selectedEmployee?.position || ''
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingEmployees ? "Memuat data karyawan..." : "Pilih karyawan penerima shift"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.name}>
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="handoverToRole" className="block text-sm font-medium text-gray-700 mb-1">
                Jabatan Penerima
              </Label>
              <Input
                type="text"
                id="handoverToRole"
                placeholder="Jabatan akan terisi otomatis"
                value={handoverDetails.handoverToRole}
                readOnly
                className="w-full bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="finalCashAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Kas Akhir
              </Label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <Input
                  type="text"
                  id="finalCashAmount"
                  placeholder="Rp 0"
                  value={handoverDetails.finalCashAmount}
                  onChange={(e) => handleCurrencyInput(e, 'finalCashAmount')}
                  className="w-full pl-8"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">Rp</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Catatan (Opsional)
              </Label>
              <textarea
                id="notes"
                rows={3}
                className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Tambahkan catatan terkait serah terima shift..."
                value={handoverDetails.notes}
                onChange={(e) => setHandoverDetails({...handoverDetails, notes: e.target.value})}
              />
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Kasir Saat Ini:</span>
                  <div className="font-medium">Ani Wijaya</div>
                </div>
                <div>
                  <span className="text-gray-500">Jumlah Kas:</span>
                  <div className="font-medium">{formatIDR(shiftData.cashDrawerAmount)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsHandoverDialogOpen(false)}
              className="border-gray-300 text-gray-700"
            >
              Batal
            </Button>
            <Button
              onClick={handleShiftHandover}
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
            >
              <FaHandshake className="mr-2" />
              Konfirmasi Serah Terima
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Shift Handover */}
      <Dialog open={isConfirmHandoverOpen} onOpenChange={setIsConfirmHandoverOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <FaExclamationTriangle className="h-5 w-5" />
              Konfirmasi Serah Terima Shift
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-900 font-medium mb-3">
                Apakah Anda yakin ingin melakukan serah terima shift?
              </p>
              <p className="text-xs text-amber-700">
                Tindakan ini akan menutup shift saat ini dan mencatat serah terima kas.
              </p>
            </div>
            
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Detail Serah Terima:</h4>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shift Ditutup Oleh:</span>
                <span className="font-semibold text-gray-900">{shiftData.currentShiftPerson}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Jabatan:</span>
                <span className="font-medium text-gray-900">{shiftData.currentShiftRole}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Diserahkan Kepada:</span>
                <span className="font-semibold text-gray-900">{handoverDetails.handoverTo}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Jabatan Penerima:</span>
                <span className="font-medium text-gray-900">{handoverDetails.handoverToRole}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kas Akhir:</span>
                <span className="font-bold text-red-600">{handoverDetails.finalCashAmount}</span>
              </div>
              
              {handoverDetails.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-xs text-gray-600">Catatan:</span>
                    <p className="text-sm text-gray-900 mt-1">{handoverDetails.notes}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  Setelah konfirmasi, shift akan ditutup dan data serah terima akan tercatat dalam sistem.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmHandoverOpen(false);
                setIsHandoverDialogOpen(true);
              }}
              className="border-gray-300 text-gray-700"
            >
              <FaArrowLeft className="mr-2 h-3 w-3" />
              Kembali
            </Button>
            <Button
              onClick={confirmShiftHandover}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <FaCheckCircle className="mr-2" />
              Ya, Konfirmasi Serah Terima
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Detail Dialog */}
      <Dialog open={isTransactionDetailOpen} onOpenChange={setIsTransactionDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FaReceipt className="text-red-500" />
              Detail Transaksi {selectedTransaction?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              {/* Transaction Info */}
              <Card className="border-red-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">Informasi Transaksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">ID Transaksi</p>
                      <p className="font-medium">{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tanggal & Waktu</p>
                      <p className="font-medium">{formatDateTime(selectedTransaction.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pelanggan</p>
                      <p className="font-medium">{selectedTransaction.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kasir</p>
                      <p className="font-medium">{selectedTransaction.cashier}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Metode Pembayaran</p>
                      <Badge variant="outline" className={`${
                        selectedTransaction.paymentMethod === 'Cash' 
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : selectedTransaction.paymentMethod === 'Transfer'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : selectedTransaction.paymentMethod === 'Card'
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-orange-100 text-orange-800 border-orange-300'
                      }`}>
                        {selectedTransaction.paymentMethod}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge className="bg-green-100 text-green-800 border-0">
                        <FaCheckCircle className="h-3 w-3 mr-1" />
                        Selesai
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Items */}
              <Card className="border-red-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaShoppingCart className="text-red-500" />
                    Produk yang Dibeli ({selectedTransaction.products?.length || 0} item)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium text-gray-500">Produk</th>
                          <th className="text-center py-2 px-3 font-medium text-gray-500">Qty</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-500">Harga</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-500">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTransaction.products?.map((product: any, index: number) => (
                          <tr key={index} className="border-t border-gray-100">
                            <td className="py-3 px-3">
                              <div>
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.sku}</p>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center font-medium">{product.quantity}</td>
                            <td className="py-3 px-3 text-right">{formatIDR(product.price)}</td>
                            <td className="py-3 px-3 text-right font-medium">{formatIDR(product.subtotal)}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-gray-200 bg-red-50">
                          <td colSpan={3} className="py-3 px-3 text-right font-bold text-gray-800">
                            Total
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-red-600 text-lg">
                            {formatIDR(selectedTransaction.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsTransactionDetailOpen(false)}
              className="border-gray-300 text-gray-700"
            >
              Tutup
            </Button>
            <Button
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
              onClick={() => {
                toast({
                  title: "Cetak Struk",
                  description: "Fitur cetak struk akan segera tersedia",
                });
              }}
            >
              <FaPrint className="mr-2" />
              Cetak Struk
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PosLayout>
  );
};

export default PosPage;