import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { NextPage } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Draggable from 'react-draggable';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FaCog, FaPrint, FaReceipt, FaSave, FaUndo, FaSearch, 
  FaUsb, FaBluetooth, FaNetworkWired, FaWrench,
  FaImage, FaPlus, FaMinus, FaExpand, FaSync, FaSpinner,
  FaArrowLeft, FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Interfaces
interface PrinterSettings {
  printerName: string;
  printerType: 'thermal' | 'inkjet' | 'laser' | 'dotmatrix';
  connectionType: 'usb' | 'bluetooth' | 'network' | 'serial';
  ipAddress?: string;
  port?: string;
  driverName?: string;
  thermalModel?: string;
  driverProfile?: string;
  paperCutter?: boolean;
}

interface ReceiptSettings {
  showLogo: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showCashier: boolean;
  showTimestamp: boolean;
  showVAT: boolean;
  showThankyouMessage: boolean;
  showFooter: boolean;
  thankyouMessage: string;
  footerText: string;
  fontSize: number;
  headerAlignment: 'left' | 'center' | 'right';
  itemsAlignment: 'left' | 'center' | 'right';
  footerAlignment: 'left' | 'center' | 'right';
  paperWidth: number;
  logoUrl: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
}

interface DetectedPrinter {
  name: string;
  type?: string;
  connection?: string;
  driver?: string;
  isDefault?: boolean;
}

// Thermal printer models
const thermalPrinterModels = [
  { value: 'epson-tm-t82', label: 'Epson TM-T82', manufacturer: 'Epson' },
  { value: 'epson-tm-t88', label: 'Epson TM-T88 Series', manufacturer: 'Epson' },
  { value: 'epson-tm-t20', label: 'Epson TM-T20 Series', manufacturer: 'Epson' },
  { value: 'star-tsp100', label: 'Star TSP100 Series', manufacturer: 'Star Micronics' },
  { value: 'star-tsp650', label: 'Star TSP650 Series', manufacturer: 'Star Micronics' },
  { value: 'xprinter-xp80', label: 'XPrinter XP-80', manufacturer: 'XPrinter' },
  { value: 'xprinter-xp58', label: 'XPrinter XP-58', manufacturer: 'XPrinter' },
  { value: 'other', label: 'Printer Lainnya', manufacturer: 'Other' },
];

// Thermal printer drivers
const thermalPrinterDrivers = [
  { value: 'escpos', label: 'ESC/POS Command Set' },
  { value: 'escpos-network', label: 'ESC/POS Network' },
  { value: 'escpos-usb', label: 'ESC/POS USB' },
  { value: 'star-line', label: 'Star Line Mode' },
  { value: 'epson-default', label: 'Epson Default Driver' },
  { value: 'generic-text', label: 'Generic Text Only Driver' },
];

// Default settings
const defaultPrinterSettings: PrinterSettings = {
  printerName: 'POS Printer',
  printerType: 'thermal',
  connectionType: 'usb',
  ipAddress: '',
  port: '9100',
  driverName: '',
  thermalModel: '',
  driverProfile: 'escpos',
  paperCutter: true
};

const defaultReceiptSettings: ReceiptSettings = {
  showLogo: true,
  showAddress: true,
  showPhone: true,
  showEmail: true,
  showCashier: true,
  showTimestamp: true,
  showVAT: true,
  showThankyouMessage: true,
  showFooter: true,
  thankyouMessage: 'Terima kasih telah berbelanja!',
  footerText: 'Barang yang sudah dibeli tidak dapat dikembalikan',
  fontSize: 12,
  headerAlignment: 'center',
  itemsAlignment: 'left',
  footerAlignment: 'center',
  paperWidth: 80,
  logoUrl: '',
  storeAddress: 'Jl. Contoh No. 123, Jakarta',
  storePhone: '021-1234567',
  storeEmail: 'info@toko.com'
};

const POSSettingsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>(defaultPrinterSettings);
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>(defaultReceiptSettings);
  const [scale, setScale] = useState(1);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [detectedPrinters, setDetectedPrinters] = useState<DetectedPrinter[]>([]);

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Load settings from API
  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pos/settings');
      const data = await response.json();
      
      if (data.success) {
        if (data.data.printer) {
          setPrinterSettings({ ...defaultPrinterSettings, ...data.data.printer });
        }
        if (data.data.receipt) {
          setReceiptSettings({ ...defaultReceiptSettings, ...data.data.receipt });
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrinterSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/pos/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printer: printerSettings })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Pengaturan printer berhasil disimpan');
      } else {
        toast.error(data.error || 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      console.error('Error saving printer settings:', error);
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReceiptSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/pos/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt: receiptSettings })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Pengaturan struk berhasil disimpan');
      } else {
        toast.error(data.error || 'Gagal menyimpan pengaturan');
      }
    } catch (error) {
      console.error('Error saving receipt settings:', error);
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const detectPrinters = async () => {
    setIsDetecting(true);
    try {
      // Simulate printer detection
      setTimeout(() => {
        const mockPrinters: DetectedPrinter[] = [
          {
            name: 'EPSON TM-T82',
            type: 'thermal',
            connection: 'usb',
            driver: 'EPSON TM-T82 Series',
            isDefault: true
          },
          {
            name: 'HP LaserJet Pro',
            type: 'laser',
            connection: 'network',
            driver: 'HP Universal Print Driver'
          }
        ];
        setDetectedPrinters(mockPrinters);
        toast.success(`${mockPrinters.length} printer terdeteksi`);
        setIsDetecting(false);
      }, 2000);
    } catch (error) {
      toast.error('Gagal mendeteksi printer');
      setIsDetecting(false);
    }
  };

  const handleTestPrint = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/pos/test-print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerSettings, receiptSettings })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Test print berhasil dikirim');
      } else {
        toast.error(data.error || 'Test print gagal');
      }
    } catch (error) {
      console.error('Error test print:', error);
      toast.error('Terjadi kesalahan saat test print');
    } finally {
      setIsTesting(false);
    }
  };

  const updatePrinterSetting = (key: keyof PrinterSettings, value: any) => {
    setPrinterSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateReceiptSetting = (key: keyof ReceiptSettings, value: any) => {
    setReceiptSettings(prev => ({ ...prev, [key]: value }));
  };

<<<<<<< HEAD
  // Fungsi untuk menguji printer
  const handleTestPrint = () => {
    setIsTestingPrinter(true);
    
    // Simulasi print test (dalam aplikasi nyata, ini akan memanggil API printer)
    setTimeout(() => {
      setIsTestingPrinter(false);
      toast({
        title: "Test Print Berhasil",
        description: "Print test berhasil dikirim ke printer.",
      });
    }, 2000);
  };

  // Fungsi untuk menyimpan pengaturan printer
  const handleSavePrinterSettings = () => {
    // Simulasi menyimpan ke server (dalam aplikasi nyata, ini akan memanggil API)
    setTimeout(() => {
      toast({
        title: "Pengaturan Printer Disimpan",
        description: "Pengaturan printer berhasil disimpan.",
      });
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="-m-6 flex flex-col flex-1 overflow-hidden">

        <style jsx global>{`
          .printer-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .printer-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          }
          
          .printer-type-card {
            border: 2px solid #e5e7eb;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .printer-type-card:hover {
            border-color: #7dd3fc;
            background-color: #f0f9ff;
          }
          
          .printer-type-card.active {
            border-color: #0ea5e9;
            background: linear-gradient(to bottom, rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.05));
          }
          
          .printer-icon {
            font-size: 2rem;
            color: #6b7280;
            transition: all 0.3s ease;
          }
          
          .printer-icon-thermal {
            color: #0ea5e9;
            animation: pulse 1s ease-in-out;
          }
          
          .printer-icon-inkjet {
            color: #3b82f6;
            animation: pulse 1s ease-in-out;
          }
          
          .printer-icon-laser {
            color: #10b981;
            animation: pulse 1s ease-in-out;
          }
          
          .printer-icon-dotmatrix {
            color: #8b5cf6;
            animation: pulse 1s ease-in-out;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          
          .connecting-animation {
            position: relative;
            overflow: hidden;
          }
          
          .connecting-animation::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 50%;
            animation: loadingBar 2s infinite linear;
            background: linear-gradient(to right, transparent, #0ea5e9, transparent);
          }

          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>

        <div className="flex-1 overflow-auto p-6">
          <div className="w-full">
            <Tabs defaultValue="printer" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList className="bg-white dark:bg-gray-800">
                  <TabsTrigger value="printer">Printer & Struk</TabsTrigger>
                  <TabsTrigger value="receipt">Desain Struk</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="printer" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Printer Selection Card */}
                  <Card className="col-span-3 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FaPrint className="mr-2 text-sky-500" />
                        Pengaturan Printer
                      </CardTitle>
                      <CardDescription>
                        Konfigurasi printer untuk mencetak struk dan dokumen lainnya
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500 flex items-center">
                            <FaSearch className="mr-1" /> Deteksi printer yang terhubung
                          </div>
                          <Button 
                            onClick={detectPrinters} 
                            variant="outline" 
                            size="sm"
                            disabled={isDetectingPrinters}
                            className="bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600"
                          >
                            {isDetectingPrinters ? (
                              <>
                                <FaSync className="mr-2 animate-spin" /> Mendeteksi...
                              </>
                            ) : (
                              <>
                                <FaSearch className="mr-2" /> Deteksi Printer
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="printerName">Nama Printer</Label>
                          <div className="flex space-x-2">
                            <Input 
                              id="printerName" 
                              placeholder="Masukkan nama printer" 
                              value={printerSettings.printerName}
                              onChange={(e) => updatePrinterSetting('printerName', e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={detectPrinters}
                              title="Deteksi printer"
                            >
                              <FaSearch />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2" id="printer-animation-container">
                          <Label htmlFor="printerType">Jenis Printer</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div 
                              className={`printer-type-card rounded-lg p-4 flex flex-col items-center justify-center text-center ${printerSettings.printerType === 'thermal' ? 'active' : ''}`}
                              onClick={() => handlePrinterTypeChange('thermal')}
                            >
                              <div className={`printer-icon ${printerSettings.printerType === 'thermal' ? 'printer-icon-thermal' : ''} mb-2`}>
                                <FaPrint />
                              </div>
                              <h3 className="font-semibold">Thermal</h3>
                              <p className="text-xs text-gray-500 mt-1">Printer Struk</p>
                            </div>

                            <div 
                              className={`printer-type-card rounded-lg p-4 flex flex-col items-center justify-center text-center ${printerSettings.printerType === 'inkjet' ? 'active' : ''}`}
                              onClick={() => handlePrinterTypeChange('inkjet')}
                            >
                              <div className={`printer-icon ${printerSettings.printerType === 'inkjet' ? 'printer-icon-inkjet' : ''} mb-2`}>
                                <FaPrint />
                              </div>
                              <h3 className="font-semibold">Inkjet</h3>
                              <p className="text-xs text-gray-500 mt-1">Printer Tinta</p>
                            </div>

                            <div 
                              className={`printer-type-card rounded-lg p-4 flex flex-col items-center justify-center text-center ${printerSettings.printerType === 'laser' ? 'active' : ''}`}
                              onClick={() => handlePrinterTypeChange('laser')}
                            >
                              <div className={`printer-icon ${printerSettings.printerType === 'laser' ? 'printer-icon-laser' : ''} mb-2`}>
                                <FaPrint />
                              </div>
                              <h3 className="font-semibold">Laser</h3>
                              <p className="text-xs text-gray-500 mt-1">Printer Laser</p>
                            </div>

                            <div 
                              className={`printer-type-card rounded-lg p-4 flex flex-col items-center justify-center text-center ${printerSettings.printerType === 'dotmatrix' ? 'active' : ''}`}
                              onClick={() => handlePrinterTypeChange('dotmatrix')}
                            >
                              <div className={`printer-icon ${printerSettings.printerType === 'dotmatrix' ? 'printer-icon-dotmatrix' : ''} mb-2`}>
                                <FaPrint />
                              </div>
                              <h3 className="font-semibold">Dot Matrix</h3>
                              <p className="text-xs text-gray-500 mt-1">Printer Jarum</p>
                            </div>
                          </div>

                          <div className="hidden">
                            <Select 
                              value={printerSettings.printerType} 
                              onValueChange={handlePrinterTypeChange}
                            >
                              <SelectTrigger id="printerType" className="w-full">
                                <SelectValue placeholder="Pilih jenis printer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="thermal">Thermal Printer</SelectItem>
                                <SelectItem value="inkjet">Inkjet Printer</SelectItem>
                                <SelectItem value="laser">Laser Printer</SelectItem>
                                <SelectItem value="dotmatrix">Dot Matrix Printer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {printerSettings.printerType === 'thermal' && (
                          <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
                            <h3 className="font-medium text-sm text-sky-600">Pengaturan Printer Thermal</h3>
                            
                            {/* Model Printer Thermal */}
                            <div className="space-y-2">
                              <Label htmlFor="thermalModel">Model Printer Thermal</Label>
                              <Select 
                                value={printerSettings.thermalModel || 'placeholder'} 
                                onValueChange={(value) => updatePrinterSetting('thermalModel', value === 'placeholder' ? '' : value)}
                              >
                                <SelectTrigger id="thermalModel" className="w-full">
                                  <SelectValue placeholder="Pilih model printer" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  <SelectItem value="placeholder">-- Pilih Model Printer --</SelectItem>
                                  {thermalPrinterModels.map((model) => (
                                    <SelectItem key={model.value} value={model.value}>
                                      {model.label} ({model.manufacturer})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Driver Profile */}
                            <div className="space-y-2">
                              <Label htmlFor="driverProfile">Driver Printer</Label>
                              <Select 
                                value={printerSettings.driverProfile || 'escpos'} 
                                onValueChange={(value) => updatePrinterSetting('driverProfile', value)}
                              >
                                <SelectTrigger id="driverProfile" className="w-full">
                                  <SelectValue placeholder="Pilih driver printer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {thermalPrinterDrivers.map((driver) => (
                                    <SelectItem key={driver.value} value={driver.value}>
                                      {driver.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-gray-500">
                                {printerSettings.driverProfile === 'escpos' && 'ESC/POS adalah standar perintah untuk sebagian besar printer struk.'}
                                {printerSettings.driverProfile === 'star-line' && 'Mode baris Star Printer untuk kompatibilitas optimal dengan printer Star.'}
                                {printerSettings.driverProfile === 'epson-default' && 'Driver default Epson untuk printer Epson TM Series.'}
                                {printerSettings.driverProfile === 'custom-driver' && 'Gunakan driver kustom untuk printer non-standar.'}
                                {(!printerSettings.driverProfile || printerSettings.driverProfile === 'placeholder') && 'Pilih driver yang sesuai dengan printer Anda.'}
                              </p>
                            </div>
                            
                            {/* Paper Cutter Option */}
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="paperCutter" 
                                checked={printerSettings.paperCutter}
                                onCheckedChange={(checked) => 
                                  updatePrinterSetting('paperCutter', checked === true ? true : false)
                                }
                              />
                              <Label htmlFor="paperCutter" className="text-sm">
                                Aktifkan Auto-Cutter (Pemotong Kertas Otomatis)
                              </Label>
                            </div>
                            
                            {/* Thermal Printer List */}
                            <div className="space-y-2 mt-4">
                              <h3 className="font-medium text-sm text-sky-600">Printer Thermal yang Didukung</h3>
                              <div className="border rounded-lg h-40 overflow-y-auto p-2">
                                <div className="space-y-1">
                                  {thermalPrinterModels.filter(m => m.value !== 'other').map((model) => (
                                    <div 
                                      key={model.value} 
                                      className={`p-2 text-sm rounded flex justify-between items-center hover:bg-gray-50 cursor-pointer ${printerSettings.thermalModel === model.value ? 'bg-sky-50 border border-sky-100' : ''}`}
                                      onClick={() => updatePrinterSetting('thermalModel', model.value)}
                                    >
                                      <span className="font-medium">{model.label}</span>
                                      <span className="text-xs text-gray-500">{model.manufacturer}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 italic">
                                Klik pada model untuk memilih. Jika printer Anda tidak ada dalam daftar, pilih "Printer Lainnya".
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="connectionType">Metode Koneksi</Label>
                          <div className="grid grid-cols-4 gap-2 mb-4">
                            <Button
                              type="button"
                              variant={printerSettings.connectionType === 'usb' ? 'default' : 'outline'}
                              className={`flex flex-col items-center justify-center h-20 ${printerSettings.connectionType === 'usb' ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white' : ''}`}
                              onClick={() => updatePrinterSetting('connectionType', 'usb')}
                            >
                              <FaUsb className="text-xl mb-1" />
                              <span className="text-xs">USB</span>
                            </Button>

                            <Button
                              type="button"
                              variant={printerSettings.connectionType === 'bluetooth' ? 'default' : 'outline'}
                              className={`flex flex-col items-center justify-center h-20 ${printerSettings.connectionType === 'bluetooth' ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white' : ''}`}
                              onClick={() => updatePrinterSetting('connectionType', 'bluetooth')}
                            >
                              <FaBluetooth className="text-xl mb-1" />
                              <span className="text-xs">Bluetooth</span>
                            </Button>

                            <Button
                              type="button"
                              variant={printerSettings.connectionType === 'network' ? 'default' : 'outline'}
                              className={`flex flex-col items-center justify-center h-20 ${printerSettings.connectionType === 'network' ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white' : ''}`}
                              onClick={() => updatePrinterSetting('connectionType', 'network')}
                            >
                              <FaNetworkWired className="text-xl mb-1" />
                              <span className="text-xs">Network</span>
                            </Button>

                            <Button
                              type="button"
                              variant={printerSettings.connectionType === 'serial' ? 'default' : 'outline'}
                              className={`flex flex-col items-center justify-center h-20 ${printerSettings.connectionType === 'serial' ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white' : ''}`}
                              onClick={() => updatePrinterSetting('connectionType', 'serial')}
                            >
                              <FaWrench className="text-xl mb-1" />
                              <span className="text-xs">Serial</span>
                            </Button>
                          </div>

                          <div className="hidden">
                            <Select 
                              value={printerSettings.connectionType} 
                              onValueChange={(value) => updatePrinterSetting('connectionType', value)}
                            >
                              <SelectTrigger id="connectionType" className="w-full">
                                <SelectValue placeholder="Pilih metode koneksi" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usb">USB</SelectItem>
                                <SelectItem value="bluetooth">Bluetooth</SelectItem>
                                <SelectItem value="network">Network</SelectItem>
                                <SelectItem value="serial">Serial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {printerSettings.connectionType === 'network' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="ipAddress">Alamat IP</Label>
                              <Input 
                                id="ipAddress" 
                                placeholder="192.168.1.1" 
                                value={printerSettings.ipAddress}
                                onChange={(e) => updatePrinterSetting('ipAddress', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="port">Port</Label>
                              <Input 
                                id="port" 
                                placeholder="9100" 
                                value={printerSettings.port}
                                onChange={(e) => updatePrinterSetting('port', e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="driverName">Nama Driver</Label>
                          <Input 
                            id="driverName" 
                            placeholder="Nama driver printer"
                            value={printerSettings.driverName || ''}
                            onChange={(e) => updatePrinterSetting('driverName', e.target.value)}
                          />
                          <p className="text-xs text-gray-500">
                            Driver terdeteksi secara otomatis saat printer ditemukan.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={handleResetPrinterSettings}
                      >
                        <FaUndo className="mr-2" /> Atur Ulang
                      </Button>
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={handleTestPrint}
                          disabled={isTestingPrinter}
                        >
                          {isTestingPrinter ? (
                            <>
                              <FaSpinner className="mr-2 animate-spin" /> Testing...
                            </>
                          ) : (
                            <>
                              <FaPrint className="mr-2" /> Test Print
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={handleSavePrinterSettings}
                          className="bg-gradient-to-r from-sky-500 to-blue-500 text-white"
                        >
                          <FaSave className="mr-2" /> Simpan
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab Desain Struk */}
              <TabsContent value="receipt" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Receipt Editor Card */}
                  <Card className="col-span-3 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FaReceipt className="mr-2 text-sky-500" />
                        Editor Struk
                      </CardTitle>
                      <CardDescription>
                        Desain format struk sesuai kebutuhan bisnis Anda
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-end mb-4 space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}>
                            <FaMinus className="mr-1" /> Perkecil
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setScale(1)}>
                            <FaExpand className="mr-1" /> Reset
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.min(prev + 0.1, 1.5))}>
                            <FaPlus className="mr-1" /> Perbesar
                          </Button>
                        </div>

                        <div className="bg-white border rounded-lg p-4 h-[500px] overflow-auto">
                          <div className="mx-auto" style={{ width: `${receiptSettings.paperWidth * 3.78}px`, transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                            <div className="bg-white border border-gray-200 p-4 shadow-sm" style={{ width: '100%' }}>
                              {/* Logo */}
                              {receiptSettings.showLogo && (
                                <div className="flex justify-center mb-3">
                                  {receiptSettings.logoUrl ? (
                                    <div className="h-16 flex items-center justify-center">
                                      <img 
                                        src={logoPreview || receiptSettings.logoUrl} 
                                        alt="Logo" 
                                        className="max-h-16 max-w-32 object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <div className="border border-dashed border-gray-300 rounded h-16 w-32 flex items-center justify-center">
                                      <FaImage className="text-gray-400" />
                                      <span className="text-xs text-gray-500 ml-1">Logo</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Header */}
                              <div className={`text-center mb-3`}>
                                <h2 className="font-bold text-lg">APOTEK FARMANESIA</h2>
                                {receiptSettings.showAddress && (
                                  <p className="text-sm">{receiptSettings.storeAddress}</p>
                                )}
                                {receiptSettings.showPhone && (
                                  <p className="text-sm">Telp: {receiptSettings.storePhone}</p>
                                )}
                                {receiptSettings.showEmail && (
                                  <p className="text-sm">Email: {receiptSettings.storeEmail}</p>
                                )}
                              </div>
                              
                              {/* Receipt Info */}
                              <div className="border-t border-b border-gray-300 py-2 mb-3">
                                <div className="flex justify-between text-sm">
                                  <span>No. Transaksi:</span>
                                  <span>INV-20230501-001</span>
                                </div>
                                {receiptSettings.showTimestamp && (
                                  <div className="flex justify-between text-sm">
                                    <span>Tanggal:</span>
                                    <span>01 Mei 2023 15:30</span>
                                  </div>
                                )}
                                {receiptSettings.showCashier && (
                                  <div className="flex justify-between text-sm">
                                    <span>Kasir:</span>
                                    <span>Admin</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Items */}
                              <div className="mb-3">
                                <div className={`text-${receiptSettings.itemsAlignment} text-sm font-medium mb-1`}>
                                  <div className="flex justify-between">
                                    <span className="w-5/12">Item</span>
                                    <span className="w-2/12 text-center">Qty</span>
                                    <span className="w-2/12 text-right">Harga</span>
                                    <span className="w-3/12 text-right">Subtotal</span>
                                  </div>
                                </div>
                                <div className="border-t border-gray-300 py-1"></div>
                                {/* Sample Items */}
                                <div className="text-sm">
                                  <div className="flex justify-between py-1">
                                    <span className="w-5/12">Paracetamol 500mg</span>
                                    <span className="w-2/12 text-center">2</span>
                                    <span className="w-2/12 text-right">10.000</span>
                                    <span className="w-3/12 text-right">20.000</span>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <span className="w-5/12">Amoxicillin 500mg</span>
                                    <span className="w-2/12 text-center">1</span>
                                    <span className="w-2/12 text-right">25.000</span>
                                    <span className="w-3/12 text-right">25.000</span>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <span className="w-5/12">Vitamin C 1000mg</span>
                                    <span className="w-2/12 text-center">1</span>
                                    <span className="w-2/12 text-right">35.000</span>
                                    <span className="w-3/12 text-right">35.000</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Totals */}
                              <div className="border-t border-gray-300 pt-2 mb-3">
                                <div className="flex justify-between text-sm">
                                  <span>Subtotal:</span>
                                  <span>80.000</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Diskon:</span>
                                  <span>0</span>
                                </div>
                                {receiptSettings.showVAT && (
                                  <div className="flex justify-between text-sm">
                                    <span>PPN (11%):</span>
                                    <span>8.800</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-sm mt-1">
                                  <span>Total:</span>
                                  <span>88.800</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                  <span>Tunai:</span>
                                  <span>100.000</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Kembali:</span>
                                  <span>11.200</span>
                                </div>
                              </div>
                              
                              {/* Thank You Message */}
                              {receiptSettings.showThankyouMessage && (
                                <div className={`text-${receiptSettings.footerAlignment} text-sm mt-4`}>
                                  <p>{receiptSettings.thankyouMessage}</p>
                                </div>
                              )}
                              
                              {/* Footer */}
                              {receiptSettings.showFooter && (
                                <div className={`text-${receiptSettings.footerAlignment} text-xs text-gray-500 mt-2`}>
                                  <p>{receiptSettings.footerText}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setReceiptSettings(defaultReceiptSettings)}>
                        <FaUndo className="mr-2" /> Atur Ulang
                      </Button>
                      <Button className="bg-gradient-to-r from-sky-500 to-blue-500 text-white">
                        <FaSave className="mr-2" /> Simpan
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Receipt Settings Card */}
                  <Card className="md:row-span-2 col-span-3 md:col-span-1">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <FaCog className="mr-2 text-sky-500" />
                        Pengaturan Struk
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-5">
                        <div className="space-y-3">
                          <h3 className="font-medium text-sm">Konten Struk</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showLogo" className="text-sm">Tampilkan Logo</Label>
                              <Switch 
                                id="showLogo" 
                                checked={receiptSettings.showLogo}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showLogo: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showAddress" className="text-sm">Alamat</Label>
                              <Switch 
                                id="showAddress" 
                                checked={receiptSettings.showAddress}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showAddress: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showPhone" className="text-sm">Nomor Telepon</Label>
                              <Switch 
                                id="showPhone" 
                                checked={receiptSettings.showPhone}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showPhone: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showEmail" className="text-sm">Email</Label>
                              <Switch 
                                id="showEmail" 
                                checked={receiptSettings.showEmail}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showEmail: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showCashier" className="text-sm">Nama Kasir</Label>
                              <Switch 
                                id="showCashier" 
                                checked={receiptSettings.showCashier}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showCashier: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showTimestamp" className="text-sm">Tanggal & Waktu</Label>
                              <Switch 
                                id="showTimestamp" 
                                checked={receiptSettings.showTimestamp}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showTimestamp: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showVAT" className="text-sm">PPN</Label>
                              <Switch 
                                id="showVAT" 
                                checked={receiptSettings.showVAT}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showVAT: checked }))}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-medium text-sm">Pesan & Footer</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="showThankyouMessage" className="text-sm">Pesan Terima Kasih</Label>
                              <Switch 
                                id="showThankyouMessage" 
                                checked={receiptSettings.showThankyouMessage}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showThankyouMessage: checked }))}
                              />
                            </div>
                            {receiptSettings.showThankyouMessage && (
                              <div className="space-y-1">
                                <Label htmlFor="thankyouMessage" className="text-sm">Teks Pesan</Label>
                                <Textarea 
                                  id="thankyouMessage" 
                                  placeholder="Masukkan pesan terima kasih" 
                                  value={receiptSettings.thankyouMessage}
                                  onChange={(e) => setReceiptSettings(prev => ({ ...prev, thankyouMessage: e.target.value }))}
                                  className="h-20"
                                />
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <Label htmlFor="showFooter" className="text-sm">Teks Footer</Label>
                              <Switch 
                                id="showFooter" 
                                checked={receiptSettings.showFooter}
                                onCheckedChange={(checked) => setReceiptSettings(prev => ({ ...prev, showFooter: checked }))}
                              />
                            </div>
                            {receiptSettings.showFooter && (
                              <div className="space-y-1">
                                <Label htmlFor="footerText" className="text-sm">Teks Footer</Label>
                                <Textarea 
                                  id="footerText" 
                                  placeholder="Masukkan teks footer" 
                                  value={receiptSettings.footerText}
                                  onChange={(e) => setReceiptSettings(prev => ({ ...prev, footerText: e.target.value }))}
                                  className="h-20"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-medium text-sm">Format & Ukuran</h3>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <Label htmlFor="fontSize" className="text-sm">Ukuran Font</Label>
                                <span className="text-sm">{receiptSettings.fontSize}pt</span>
                              </div>
                              <Slider 
                                id="fontSize"
                                min={8} 
                                max={16} 
                                step={1}
                                value={[receiptSettings.fontSize]}
                                onValueChange={(value) => setReceiptSettings(prev => ({ ...prev, fontSize: value[0] }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="paperWidth" className="text-sm">Lebar Kertas (mm)</Label>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className={receiptSettings.paperWidth === 58 ? 'bg-sky-50 border-sky-200' : ''}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, paperWidth: 58 }))}
                                >
                                  58mm
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={receiptSettings.paperWidth === 80 ? 'bg-sky-50 border-sky-200' : ''}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, paperWidth: 80 }))}
                                >
                                  80mm
                                </Button>
                                <Input 
                                  type="number" 
                                  min={40} 
                                  max={210}
                                  value={receiptSettings.paperWidth}
                                  onChange={(e) => setReceiptSettings(prev => ({ ...prev, paperWidth: parseInt(e.target.value) }))}
                                  className="w-20"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="headerAlignment" className="text-sm">Perataan Header</Label>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className={`flex-1 ${receiptSettings.headerAlignment === 'left' ? 'bg-sky-50 border-sky-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, headerAlignment: 'left' }))}
                                >
                                  <FaAlignLeft className="mr-1" /> Kiri
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={`flex-1 ${receiptSettings.headerAlignment === 'center' ? 'bg-sky-50 border-sky-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, headerAlignment: 'center' }))}
                                >
                                  <FaAlignCenter className="mr-1" /> Tengah
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={`flex-1 ${receiptSettings.headerAlignment === 'right' ? 'bg-sky-50 border-sky-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, headerAlignment: 'right' }))}
                                >
                                  <FaAlignRight className="mr-1" /> Kanan
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="footerAlignment" className="text-sm">Perataan Footer</Label>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className={`flex-1 ${receiptSettings.footerAlignment === 'left' ? 'bg-sky-50 border-sky-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, footerAlignment: 'left' }))}
                                >
                                  <FaAlignLeft className="mr-1" /> Kiri
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={`flex-1 ${receiptSettings.footerAlignment === 'center' ? 'bg-sky-50 border-sky-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, footerAlignment: 'center' }))}
                                >
                                  <FaAlignCenter className="mr-1" /> Tengah
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={`flex-1 ${receiptSettings.footerAlignment === 'right' ? 'bg-sky-50 border-sky-200' : ''}`}
                                  onClick={() => setReceiptSettings(prev => ({ ...prev, footerAlignment: 'right' }))}
                                >
                                  <FaAlignRight className="mr-1" /> Kanan
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Logo Upload */}
                        {receiptSettings.showLogo && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-medium text-sm mb-2">Logo Struk</h4>
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-center">
                                {logoPreview || receiptSettings.logoUrl ? (
                                  <div className="relative mb-2">
                                    <img 
                                      src={logoPreview || receiptSettings.logoUrl} 
                                      alt="Logo Preview" 
                                      className="max-h-16 max-w-full object-contain border rounded p-1" 
                                    />
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                                      onClick={() => {
                                        setLogoPreview(null);
                                        setReceiptSettings(prev => ({ ...prev, logoUrl: '' }));
                                        if (fileInputRef.current) {
                                          fileInputRef.current.value = '';
                                        }
                                      }}
                                    >
                                      <FaTrash size={12} />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-gray-300 rounded p-4 mb-2 flex items-center justify-center w-full">
                                    <FaImage className="text-gray-400 mr-2" />
                                    <span className="text-gray-500">Logo belum diunggah</span>
                                  </div>
                                )}
                              </div>
                              <input
                                type="file"
                                id="logo-upload"
                                className="hidden"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const result = event.target?.result as string;
                                      setLogoPreview(result);
                                      setReceiptSettings(prev => ({ ...prev, logoUrl: result }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <FaUpload className="mr-2" /> Unggah Logo
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Address */}
                        {receiptSettings.showAddress && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-medium text-sm mb-2">Alamat Toko</h4>
                            <Textarea 
                              value={receiptSettings.storeAddress}
                              onChange={(e) => setReceiptSettings(prev => ({ ...prev, storeAddress: e.target.value }))}
                              className="resize-none text-sm"
                              placeholder="Masukkan alamat toko"
                              rows={2}
                            />
                          </div>
                        )}
                        
                        {/* Phone */}
                        {receiptSettings.showPhone && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-medium text-sm mb-2">Nomor Telepon</h4>
                            <Input 
                              value={receiptSettings.storePhone}
                              onChange={(e) => setReceiptSettings(prev => ({ ...prev, storePhone: e.target.value }))}
                              className="text-sm"
                              placeholder="Contoh: 021-1234567"
                            />
                          </div>
                        )}
                        
                        {/* Email */}
                        {receiptSettings.showEmail && (
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-medium text-sm mb-2">Email</h4>
                            <Input 
                              value={receiptSettings.storeEmail}
                              onChange={(e) => setReceiptSettings(prev => ({ ...prev, storeEmail: e.target.value }))}
                              className="text-sm"
                              placeholder="Contoh: info@tokoanda.com"
                              type="email"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
      {/* Modal for printer detection */}
      <Dialog open={showPrinterDetectionModal} onOpenChange={setShowPrinterDetectionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FaPrint className="mr-2 text-sky-500" />
              Deteksi Printer
            </DialogTitle>
            <DialogDescription>
              {isDetectingPrinters 
                ? "Mendeteksi printer yang terhubung ke sistem..." 
                : "Printer yang terdeteksi dan tersedia di sistem Anda."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isDetectingPrinters ? (
              <div className="space-y-4">
                <div className="connecting-animation h-2 w-full bg-gray-100 rounded"></div>
                <div className="text-center py-8">
                  <FaSync className="animate-spin mx-auto text-4xl text-sky-500 mb-4" />
                  <p className="text-gray-700 font-medium">Mencari printer yang terhubung...</p>
                  <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
=======
  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat Pengaturan POS...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Pengaturan POS | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/pos')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Kembali ke POS"
              >
                <FaArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FaCog className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Pengaturan POS</h1>
                    <p className="text-blue-100 text-sm">Konfigurasi printer dan desain struk penjualan</p>
                  </div>
>>>>>>> 2cb7229a590c660b7247f7a4b89425bb3fb86e38
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="printer" className="w-full">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="printer" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FaPrint className="mr-2" />
              Printer & Koneksi
            </TabsTrigger>
            <TabsTrigger value="receipt" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FaReceipt className="mr-2" />
              Desain Struk
            </TabsTrigger>
          </TabsList>

          {/* Printer Settings Tab */}
          <TabsContent value="printer" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Settings */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <FaPrint className="mr-3 text-blue-600" />
                    Konfigurasi Printer
                  </CardTitle>
                  <CardDescription>
                    Atur printer untuk mencetak struk dan dokumen lainnya
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Printer Detection */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-blue-900">Deteksi Printer Otomatis</h3>
                        <p className="text-sm text-blue-700 mt-1">Cari printer yang terhubung ke sistem</p>
                      </div>
                      <Button
                        onClick={detectPrinters}
                        disabled={isDetecting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isDetecting ? (
                          <>
                            <FaSync className="mr-2 animate-spin" />
                            Mendeteksi...
                          </>
                        ) : (
                          <>
                            <FaSearch className="mr-2" />
                            Deteksi Printer
                          </>
                        )}
                      </Button>
                    </div>

                    {detectedPrinters.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-blue-900">Printer Terdeteksi:</p>
                        {detectedPrinters.map((printer, index) => (
                          <div
                            key={index}
                            className="bg-white border border-blue-200 rounded p-3 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => {
                              setPrinterSettings(prev => ({
                                ...prev,
                                printerName: printer.name,
                                printerType: (printer.type as any) || prev.printerType,
                                connectionType: (printer.connection as any) || prev.connectionType
                              }));
                              toast.success(`${printer.name} dipilih`);
                            }}
                          >
                            <div>
                              <p className="font-medium">{printer.name}</p>
                              <p className="text-xs text-gray-600">{printer.driver}</p>
                            </div>
                            {printer.isDefault && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                Default
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Printer Name */}
                  <div className="space-y-2">
                    <Label htmlFor="printerName">Nama Printer</Label>
                    <Input
                      id="printerName"
                      placeholder="Masukkan nama printer"
                      value={printerSettings.printerName}
                      onChange={(e) => updatePrinterSetting('printerName', e.target.value)}
                    />
                  </div>

                  {/* Printer Type */}
                  <div className="space-y-2">
                    <Label>Jenis Printer</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'thermal', label: 'Thermal', icon: FaPrint, color: 'blue' },
                        { value: 'inkjet', label: 'Inkjet', icon: FaPrint, color: 'purple' },
                        { value: 'laser', label: 'Laser', icon: FaPrint, color: 'green' },
                        { value: 'dotmatrix', label: 'Dot Matrix', icon: FaPrint, color: 'orange' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => updatePrinterSetting('printerType', type.value)}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            printerSettings.printerType === type.value
                              ? `border-${type.color}-600 bg-${type.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <type.icon className={`mx-auto mb-2 text-2xl ${
                            printerSettings.printerType === type.value ? `text-${type.color}-600` : 'text-gray-400'
                          }`} />
                          <p className="text-sm font-medium">{type.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thermal Printer Settings */}
                  {printerSettings.printerType === 'thermal' && (
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-medium text-blue-900">Pengaturan Printer Thermal</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="thermalModel">Model Printer</Label>
                        <Select
                          value={printerSettings.thermalModel || ''}
                          onValueChange={(value) => updatePrinterSetting('thermalModel', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih model printer" />
                          </SelectTrigger>
                          <SelectContent>
                            {thermalPrinterModels.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label} ({model.manufacturer})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="driverProfile">Driver Printer</Label>
                        <Select
                          value={printerSettings.driverProfile || 'escpos'}
                          onValueChange={(value) => updatePrinterSetting('driverProfile', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {thermalPrinterDrivers.map((driver) => (
                              <SelectItem key={driver.value} value={driver.value}>
                                {driver.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="paperCutter"
                          checked={printerSettings.paperCutter}
                          onCheckedChange={(checked) => updatePrinterSetting('paperCutter', checked)}
                        />
                        <Label htmlFor="paperCutter">Aktifkan Auto-Cutter (Pemotong Kertas Otomatis)</Label>
                      </div>
                    </div>
                  )}

<<<<<<< HEAD
          <DialogFooter className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setShowPrinterDetectionModal(false)}
              disabled={isDetectingPrinters}
            >
              Batal
            </Button>
            {!isDetectingPrinters && (
              <Button onClick={detectPrinters} className="bg-gradient-to-r from-sky-500 to-blue-500 text-white">
                <FaSync className="mr-2" />
                Scan Ulang
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
=======
                  {/* Connection Type */}
                  <div className="space-y-2">
                    <Label>Metode Koneksi</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { value: 'usb', label: 'USB', icon: FaUsb },
                        { value: 'bluetooth', label: 'Bluetooth', icon: FaBluetooth },
                        { value: 'network', label: 'Network', icon: FaNetworkWired },
                        { value: 'serial', label: 'Serial', icon: FaWrench }
                      ].map((conn) => (
                        <button
                          key={conn.value}
                          type="button"
                          onClick={() => updatePrinterSetting('connectionType', conn.value)}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            printerSettings.connectionType === conn.value
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <conn.icon className={`mx-auto mb-1 text-xl ${
                            printerSettings.connectionType === conn.value ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <p className="text-xs font-medium">{conn.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Network Settings */}
                  {printerSettings.connectionType === 'network' && (
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="ipAddress">Alamat IP</Label>
                        <Input
                          id="ipAddress"
                          placeholder="192.168.1.100"
                          value={printerSettings.ipAddress}
                          onChange={(e) => updatePrinterSetting('ipAddress', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input
                          id="port"
                          placeholder="9100"
                          value={printerSettings.port}
                          onChange={(e) => updatePrinterSetting('port', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between bg-gray-50">
                  <Button
                    variant="outline"
                    onClick={() => setPrinterSettings(defaultPrinterSettings)}
                  >
                    <FaUndo className="mr-2" />
                    Atur Ulang
                  </Button>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleTestPrint}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <>
                          <FaSpinner className="mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <FaPrint className="mr-2" />
                          Test Print
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleSavePrinterSettings}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Simpan Pengaturan
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Printer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Nama</span>
                      <span className="text-sm font-medium">{printerSettings.printerName || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Jenis</span>
                      <span className="text-sm font-medium capitalize">{printerSettings.printerType}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Koneksi</span>
                      <span className="text-sm font-medium capitalize">{printerSettings.connectionType}</span>
                    </div>
                    {printerSettings.connectionType === 'network' && printerSettings.ipAddress && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">IP Address</span>
                        <span className="text-sm font-medium">{printerSettings.ipAddress}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Tips:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Pastikan printer sudah terhubung</li>
                      <li>• Gunakan driver yang sesuai</li>
                      <li>• Test print sebelum menyimpan</li>
                      <li>• Untuk thermal, pilih model yang tepat</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Receipt Design Tab */}
          <TabsContent value="receipt" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Receipt Preview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-xl">
                        <FaReceipt className="mr-3 text-blue-600" />
                        Preview Struk
                      </CardTitle>
                      <CardDescription>
                        Lihat tampilan struk sesuai pengaturan Anda
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}>
                        <FaMinus />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setScale(1)}>
                        <FaExpand />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setScale(prev => Math.min(prev + 0.1, 1.5))}>
                        <FaPlus />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 border rounded-lg p-6 min-h-[600px] flex items-start justify-center overflow-auto">
                    <div 
                      className="bg-white border-2 border-gray-300 shadow-lg p-6"
                      style={{ 
                        width: `${receiptSettings.paperWidth * 3.78}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center'
                      }}
                    >
                      {/* Logo */}
                      {receiptSettings.showLogo && (
                        <div className={`text-${receiptSettings.headerAlignment} mb-4`}>
                          {receiptSettings.logoUrl ? (
                            <img src={receiptSettings.logoUrl} alt="Logo" className="h-16 mx-auto" />
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded h-16 flex items-center justify-center">
                              <FaImage className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Header */}
                      <div className={`text-${receiptSettings.headerAlignment} mb-4`}>
                        <h2 className="font-bold text-lg">TOKO BEDAGANG</h2>
                        {receiptSettings.showAddress && (
                          <p className="text-sm">{receiptSettings.storeAddress}</p>
                        )}
                        {receiptSettings.showPhone && (
                          <p className="text-sm">Telp: {receiptSettings.storePhone}</p>
                        )}
                        {receiptSettings.showEmail && (
                          <p className="text-sm">Email: {receiptSettings.storeEmail}</p>
                        )}
                      </div>

                      {/* Transaction Info */}
                      <div className="border-t border-b border-gray-400 py-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>No. Transaksi:</span>
                          <span>INV-2026-001</span>
                        </div>
                        {receiptSettings.showTimestamp && (
                          <div className="flex justify-between text-sm">
                            <span>Tanggal:</span>
                            <span>{new Date().toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        {receiptSettings.showCashier && (
                          <div className="flex justify-between text-sm">
                            <span>Kasir:</span>
                            <span>Admin</span>
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2">
                          <div className="flex justify-between">
                            <span className="w-6/12">Item</span>
                            <span className="w-2/12 text-center">Qty</span>
                            <span className="w-4/12 text-right">Total</span>
                          </div>
                        </div>
                        <div className="border-t border-gray-300 mb-2"></div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="w-6/12">Produk A</span>
                            <span className="w-2/12 text-center">2</span>
                            <span className="w-4/12 text-right">50.000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="w-6/12">Produk B</span>
                            <span className="w-2/12 text-center">1</span>
                            <span className="w-4/12 text-right">75.000</span>
                          </div>
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="border-t border-gray-400 pt-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>125.000</span>
                        </div>
                        {receiptSettings.showVAT && (
                          <div className="flex justify-between text-sm">
                            <span>PPN (11%):</span>
                            <span>13.750</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-sm mt-1">
                          <span>Total:</span>
                          <span>138.750</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>Tunai:</span>
                          <span>150.000</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Kembali:</span>
                          <span>11.250</span>
                        </div>
                      </div>

                      {/* Thank You */}
                      {receiptSettings.showThankyouMessage && (
                        <div className={`text-${receiptSettings.footerAlignment} text-sm mt-4`}>
                          <p>{receiptSettings.thankyouMessage}</p>
                        </div>
                      )}

                      {/* Footer */}
                      {receiptSettings.showFooter && (
                        <div className={`text-${receiptSettings.footerAlignment} text-xs text-gray-500 mt-2`}>
                          <p>{receiptSettings.footerText}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-gray-50">
                  <Button
                    variant="outline"
                    onClick={() => setReceiptSettings(defaultReceiptSettings)}
                  >
                    <FaUndo className="mr-2" />
                    Atur Ulang
                  </Button>
                  <Button
                    onClick={handleSaveReceiptSettings}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Simpan Desain
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Receipt Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pengaturan Struk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Content Settings */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Konten Struk</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'showLogo', label: 'Tampilkan Logo' },
                        { key: 'showAddress', label: 'Alamat Toko' },
                        { key: 'showPhone', label: 'Nomor Telepon' },
                        { key: 'showEmail', label: 'Email' },
                        { key: 'showCashier', label: 'Nama Kasir' },
                        { key: 'showTimestamp', label: 'Tanggal & Waktu' },
                        { key: 'showVAT', label: 'PPN' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <Label htmlFor={item.key} className="text-sm">{item.label}</Label>
                          <Switch
                            id={item.key}
                            checked={receiptSettings[item.key as keyof ReceiptSettings] as boolean}
                            onCheckedChange={(checked) => updateReceiptSetting(item.key as keyof ReceiptSettings, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-medium text-sm">Pesan & Footer</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showThankyouMessage" className="text-sm">Pesan Terima Kasih</Label>
                        <Switch
                          id="showThankyouMessage"
                          checked={receiptSettings.showThankyouMessage}
                          onCheckedChange={(checked) => updateReceiptSetting('showThankyouMessage', checked)}
                        />
                      </div>
                      {receiptSettings.showThankyouMessage && (
                        <Textarea
                          placeholder="Masukkan pesan terima kasih"
                          value={receiptSettings.thankyouMessage}
                          onChange={(e) => updateReceiptSetting('thankyouMessage', e.target.value)}
                          className="h-20"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showFooter" className="text-sm">Teks Footer</Label>
                        <Switch
                          id="showFooter"
                          checked={receiptSettings.showFooter}
                          onCheckedChange={(checked) => updateReceiptSetting('showFooter', checked)}
                        />
                      </div>
                      {receiptSettings.showFooter && (
                        <Textarea
                          placeholder="Masukkan teks footer"
                          value={receiptSettings.footerText}
                          onChange={(e) => updateReceiptSetting('footerText', e.target.value)}
                          className="h-20"
                        />
                      )}
                    </div>
                  </div>

                  {/* Alignment */}
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-medium text-sm">Perataan Teks</h4>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Header</Label>
                        <Select
                          value={receiptSettings.headerAlignment}
                          onValueChange={(value: any) => updateReceiptSetting('headerAlignment', value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Kiri</SelectItem>
                            <SelectItem value="center">Tengah</SelectItem>
                            <SelectItem value="right">Kanan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Footer</Label>
                        <Select
                          value={receiptSettings.footerAlignment}
                          onValueChange={(value: any) => updateReceiptSetting('footerAlignment', value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Kiri</SelectItem>
                            <SelectItem value="center">Tengah</SelectItem>
                            <SelectItem value="right">Kanan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Paper Width */}
                  <div className="space-y-2 border-t pt-4">
                    <Label className="text-sm">Lebar Kertas: {receiptSettings.paperWidth}mm</Label>
                    <Select
                      value={receiptSettings.paperWidth.toString()}
                      onValueChange={(value) => updateReceiptSetting('paperWidth', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="58">58mm (Thermal Kecil)</SelectItem>
                        <SelectItem value="80">80mm (Thermal Standard)</SelectItem>
                        <SelectItem value="210">210mm (A4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
>>>>>>> 2cb7229a590c660b7247f7a4b89425bb3fb86e38
    </DashboardLayout>
  );
};

export default POSSettingsPage;
