import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FaStore, FaSave, FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaGlobe, FaClock, FaImage, FaBuilding, FaIdCard, FaArrowLeft
} from 'react-icons/fa';

const StoreSettingsPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [branches, setBranches] = useState([]);

  const [storeData, setStoreData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    logoUrl: '',
    description: ''
  });

  const [operatingHours, setOperatingHours] = useState([
    { day: 'Senin', open: '09:00', close: '21:00', isOpen: true },
    { day: 'Selasa', open: '09:00', close: '21:00', isOpen: true },
    { day: 'Rabu', open: '09:00', close: '21:00', isOpen: true },
    { day: 'Kamis', open: '09:00', close: '21:00', isOpen: true },
    { day: 'Jumat', open: '09:00', close: '21:00', isOpen: true },
    { day: 'Sabtu', open: '09:00', close: '22:00', isOpen: true },
    { day: 'Minggu', open: '10:00', close: '20:00', isOpen: true }
  ]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchStoreSettings();
      fetchBranches();
    }
  }, [session]);

  const fetchStoreSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/store');
      const data = await response.json();

      if (data.success && data.data) {
        setStoreData(data.data.store || storeData);
        if (data.data.operatingHours) {
          setOperatingHours(data.data.operatingHours);
        }
      }
    } catch (error) {
      console.error('Error fetching store settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/settings/store/branches');
      const data = await response.json();
      if (data.success) {
        setBranches(data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStoreData(prev => ({ ...prev, [name]: value }));
  };

  const handleOperatingHoursChange = (index: number, field: string, value: any) => {
    const updated = [...operatingHours];
    updated[index] = { ...updated[index], [field]: value };
    setOperatingHours(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store: storeData,
          operatingHours
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Pengaturan toko berhasil disimpan!');
      } else {
        alert('Gagal menyimpan pengaturan: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving store settings:', error);
      alert('Terjadi kesalahan saat menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat Pengaturan Toko...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Pengaturan Toko | BEDAGANG Cloud POS</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Kembali ke Settings"
            >
              <FaArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Pengaturan Toko</h1>
              <p className="text-blue-100">
                Kelola informasi toko, cabang, dan jam operasional
              </p>
            </div>
            <FaStore className="w-16 h-16 text-white/30" />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBuilding className="inline mr-2" />
                Informasi Toko
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'hours'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaClock className="inline mr-2" />
                Jam Operasional
              </button>
              <button
                onClick={() => router.push('/settings/store/branches')}
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
              >
                <FaStore className="inline mr-2" />
                Cabang ({branches.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Dasar</CardTitle>
                    <CardDescription>Informasi umum tentang toko Anda</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Toko *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={storeData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nama Toko"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaPhone className="inline mr-1" /> Telepon *
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={storeData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="(021) 1234-5678"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaEnvelope className="inline mr-1" /> Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={storeData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="info@toko.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaGlobe className="inline mr-1" /> Website
                        </label>
                        <input
                          type="text"
                          name="website"
                          value={storeData.website}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="www.toko.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi
                      </label>
                      <textarea
                        name="description"
                        value={storeData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Deskripsi singkat tentang toko Anda"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                <Card>
                  <CardHeader>
                    <CardTitle><FaMapMarkerAlt className="inline mr-2" />Alamat</CardTitle>
                    <CardDescription>Lokasi fisik toko Anda</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Lengkap *
                      </label>
                      <textarea
                        name="address"
                        value={storeData.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Jl. Contoh No. 123"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kota *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={storeData.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Jakarta"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Provinsi *
                        </label>
                        <input
                          type="text"
                          name="province"
                          value={storeData.province}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="DKI Jakarta"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kode Pos
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={storeData.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Info */}
                <Card>
                  <CardHeader>
                    <CardTitle><FaIdCard className="inline mr-2" />Informasi Pajak</CardTitle>
                    <CardDescription>NPWP dan informasi perpajakan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NPWP / Tax ID
                      </label>
                      <input
                        type="text"
                        name="taxId"
                        value={storeData.taxId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="01.234.567.8-901.000"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Format: XX.XXX.XXX.X-XXX.XXX
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'hours' && (
              <Card>
                <CardHeader>
                  <CardTitle>Jam Operasional</CardTitle>
                  <CardDescription>Atur jam buka dan tutup toko untuk setiap hari</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {operatingHours.map((day, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-24">
                          <span className="font-medium text-gray-900">{day.day}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={day.isOpen}
                            onChange={(e) => handleOperatingHoursChange(index, 'isOpen', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">Buka</span>
                        </div>
                        {day.isOpen && (
                          <>
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={day.open}
                                onChange={(e) => handleOperatingHoursChange(index, 'open', e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <span className="text-gray-600">-</span>
                              <input
                                type="time"
                                value={day.close}
                                onChange={(e) => handleOperatingHoursChange(index, 'close', e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </>
                        )}
                        {!day.isOpen && (
                          <span className="text-sm text-gray-500 italic">Tutup</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/settings')}
          >
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
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
      </div>
    </DashboardLayout>
  );
};

export default StoreSettingsPage;
