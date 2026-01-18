import React, { useState } from 'react';
import { useRouter } from 'next/router';
import CustomersLayout from '@/components/customers/CustomersLayout';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSave, FaTimes } from 'react-icons/fa';

const CustomerNewPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    
    // Validate form
    if (!formData.name || !formData.phoneNumber) {
      setFormError('Nama dan nomor telepon harus diisi');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Submit form data
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          membershipLevel: 'BRONZE',
          loyaltyPoints: 0,
          registrationDate: new Date().toISOString(),
          isActive: true,
          totalSpent: 0
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan pelanggan baru');
      }
      
      setFormSuccess('Pelanggan baru berhasil ditambahkan');
      
      // Reset form
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        address: '',
        notes: ''
      });
      
      // Redirect after successful creation
      setTimeout(() => {
        router.push('/customers/list');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating customer:', error);
      setFormError(error instanceof Error ? error.message : 'Terjadi kesalahan, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomersLayout title="Pelanggan Baru | FARMANESIA-EVO">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tambah Pelanggan Baru</h1>
        
        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {formError}
          </div>
        )}
        
        {formSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
            {formSuccess}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pelanggan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Contoh: 081234567890"
                />
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Contoh: nama@email.com"
                />
              </div>
            </div>
            
            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Masukkan alamat lengkap"
                />
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Catatan Tambahan
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Informasi tambahan tentang pelanggan..."
            ></textarea>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <FaTimes className="text-gray-500" />
              <span>Batal</span>
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-md flex items-center space-x-2 hover:from-red-700 hover:to-orange-600 disabled:opacity-50"
            >
              <FaSave />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pelanggan'}</span>
            </button>
          </div>
        </form>
      </div>
    </CustomersLayout>
  );
};

export default CustomerNewPage;
