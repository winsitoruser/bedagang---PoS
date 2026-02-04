import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FaPrint, FaPlus, FaEdit, FaTrash, FaBarcode, FaCashRegister,
  FaDesktop, FaCheck, FaTimes, FaArrowLeft, FaSpinner
} from 'react-icons/fa';

const HardwareSettingsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [printers, setPrinters] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'thermal',
    connectionType: 'network',
    ipAddress: '',
    port: '9100',
    isDefault: false,
    isActive: true
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchPrinters();
    }
  }, [session]);

  const fetchPrinters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/hardware/printers');
      const data = await response.json();

      if (data.success) {
        setPrinters(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching printers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/settings/hardware/printers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Printer berhasil ditambahkan!');
        setShowAddModal(false);
        resetForm();
        fetchPrinters();
      } else {
        alert('Gagal menambahkan printer: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding printer:', error);
      alert('Terjadi kesalahan saat menambahkan printer');
    }
  };

  const handleEdit = async () => {
    if (!selectedPrinter) return;

    try {
      const response = await fetch(`/api/settings/hardware/printers/${selectedPrinter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Printer berhasil diupdate!');
        setShowEditModal(false);
        resetForm();
        fetchPrinters();
      } else {
        alert('Gagal mengupdate printer: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating printer:', error);
      alert('Terjadi kesalahan saat mengupdate printer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus printer ini?')) return;

    try {
      const response = await fetch(`/api/settings/hardware/printers/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Printer berhasil dihapus!');
        fetchPrinters();
      } else {
        alert('Gagal menghapus printer: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting printer:', error);
      alert('Terjadi kesalahan saat menghapus printer');
    }
  };

  const handleTestPrint = async (id: string) => {
    try {
      const response = await fetch(`/api/settings/hardware/printers/${id}/test`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        alert('Test print berhasil dikirim!');
      } else {
        alert('Gagal test print: ' + data.error);
      }
    } catch (error) {
      console.error('Error test printing:', error);
      alert('Terjadi kesalahan saat test print');
    }
  };

  const openEditModal = (printer: any) => {
    setSelectedPrinter(printer);
    setFormData({
      name: printer.name,
      type: printer.type || 'thermal',
      connectionType: printer.connectionType || 'network',
      ipAddress: printer.ipAddress || '',
      port: printer.port || '9100',
      isDefault: printer.isDefault || false,
      isActive: printer.isActive !== false
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'thermal',
      connectionType: 'network',
      ipAddress: '',
      port: '9100',
      isDefault: false,
      isActive: true
    });
    setSelectedPrinter(null);
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat Pengaturan Hardware...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Pengaturan Hardware | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Kembali ke Settings"
            >
              <FaArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Pengaturan Hardware</h1>
              <p className="text-indigo-100">
                Kelola printer, barcode scanner, dan perangkat lainnya
              </p>
            </div>
            <FaPrint className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaPrint className="text-2xl text-indigo-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Printer</p>
              <p className="text-2xl font-bold text-gray-900">{printers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaCheck className="text-2xl text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Aktif</p>
              <p className="text-2xl font-bold text-green-600">
                {printers.filter(p => p.isActive !== false).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaBarcode className="text-2xl text-indigo-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Barcode Scanner</p>
              <p className="text-sm font-semibold text-gray-900">Belum dikonfigurasi</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FaCashRegister className="text-2xl text-indigo-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Cash Drawer</p>
              <p className="text-sm font-semibold text-gray-900">Belum dikonfigurasi</p>
            </CardContent>
          </Card>
        </div>

        {/* Printers Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Konfigurasi Printer</CardTitle>
                <CardDescription>Kelola printer untuk struk dan invoice</CardDescription>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <FaPlus className="mr-2" />
                Tambah Printer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {printers.length === 0 ? (
              <div className="text-center py-12">
                <FaPrint className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">Belum ada printer terkonfigurasi</p>
                <p className="text-sm text-gray-400">
                  Klik "Tambah Printer" untuk menambahkan printer pertama
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {printers.map((printer) => (
                  <div key={printer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <FaPrint className="text-indigo-600 text-xl" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{printer.name}</p>
                          {printer.isDefault && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              Default
                            </span>
                          )}
                          {printer.isActive !== false ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Aktif
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{printer.type === 'thermal' ? 'Thermal' : 'Inkjet/Laser'}</span>
                          <span>•</span>
                          <span>{printer.connectionType === 'network' ? 'Network' : 'USB'}</span>
                          {printer.ipAddress && (
                            <>
                              <span>•</span>
                              <span>{printer.ipAddress}:{printer.port}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestPrint(printer.id)}
                        title="Test Print"
                      >
                        <FaPrint className="mr-1" /> Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(printer)}
                        title="Edit"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(printer.id)}
                        title="Hapus"
                        className="text-red-600 hover:text-red-700"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other Hardware */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaBarcode className="mr-2 text-indigo-600" />
                Barcode Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Konfigurasi barcode scanner untuk scan produk
              </p>
              <Button variant="outline" className="w-full" disabled>
                Konfigurasi Scanner
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaCashRegister className="mr-2 text-indigo-600" />
                Cash Drawer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Konfigurasi cash drawer otomatis
              </p>
              <Button variant="outline" className="w-full" disabled>
                Konfigurasi Drawer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FaDesktop className="mr-2 text-indigo-600" />
                Customer Display
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Konfigurasi display untuk customer
              </p>
              <Button variant="outline" className="w-full" disabled>
                Konfigurasi Display
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Add Printer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Tambah Printer</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Printer *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Printer Kasir 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Printer
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="thermal">Thermal (80mm)</option>
                    <option value="inkjet">Inkjet/Laser</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Koneksi
                  </label>
                  <select
                    value={formData.connectionType}
                    onChange={(e) => setFormData(prev => ({ ...prev, connectionType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="network">Network (IP)</option>
                    <option value="usb">USB</option>
                  </select>
                </div>

                {formData.connectionType === 'network' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IP Address
                      </label>
                      <input
                        type="text"
                        value={formData.ipAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, ipAddress: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="192.168.1.100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Port
                      </label>
                      <input
                        type="text"
                        value={formData.port}
                        onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="9100"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Set sebagai printer default
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Aktif
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleAdd}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Tambah
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Printer Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Edit Printer</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Printer *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Printer
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="thermal">Thermal (80mm)</option>
                    <option value="inkjet">Inkjet/Laser</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Koneksi
                  </label>
                  <select
                    value={formData.connectionType}
                    onChange={(e) => setFormData(prev => ({ ...prev, connectionType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="network">Network (IP)</option>
                    <option value="usb">USB</option>
                  </select>
                </div>

                {formData.connectionType === 'network' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IP Address
                      </label>
                      <input
                        type="text"
                        value={formData.ipAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, ipAddress: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Port
                      </label>
                      <input
                        type="text"
                        value={formData.port}
                        onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Set sebagai printer default
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Aktif
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleEdit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HardwareSettingsPage;
