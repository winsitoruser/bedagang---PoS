import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    </DashboardLayout>
  );
};

export default POSSettingsPage;
