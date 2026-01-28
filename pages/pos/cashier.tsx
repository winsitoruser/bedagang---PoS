import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  FaShoppingCart, FaPlus, FaMinus, FaTrash, FaBarcode, 
  FaSearch, FaCreditCard, FaMoneyBillWave, FaReceipt,
  FaTimes, FaCheck, FaCashRegister, FaBox, FaTag, FaQrcode
} from 'react-icons/fa';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

const CashierPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Mock products
  const products = [
    { id: '1', name: 'Kopi Arabica 250g', price: 45000, stock: 50, category: 'Minuman' },
    { id: '2', name: 'Teh Hijau Premium', price: 35000, stock: 30, category: 'Minuman' },
    { id: '3', name: 'Gula Pasir 1kg', price: 15000, stock: 100, category: 'Bahan Pokok' },
    { id: '4', name: 'Minyak Goreng 2L', price: 32000, stock: 75, category: 'Bahan Pokok' },
    { id: '5', name: 'Beras Premium 5kg', price: 85000, stock: 40, category: 'Bahan Pokok' },
    { id: '6', name: 'Susu UHT 1L', price: 18000, stock: 60, category: 'Minuman' },
    { id: '7', name: 'Telur Ayam 1kg', price: 28000, stock: 45, category: 'Protein' },
    { id: '8', name: 'Daging Ayam 1kg', price: 42000, stock: 25, category: 'Protein' },
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: typeof products[0]) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0 && newQuantity <= item.stock) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateChange = () => {
    const cash = parseFloat(cashReceived) || 0;
    const total = calculateTotal();
    return cash - total;
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    if (paymentMethod === 'cash') {
      const change = calculateChange();
      if (change < 0) {
        alert('Uang yang diterima kurang!');
        return;
      }
    }
    
    // Process payment logic here
    alert('Pembayaran berhasil!');
    setShowPaymentModal(false);
    clearCart();
    setCashReceived('');
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-sky-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Memuat kasir...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const total = calculateTotal();

  return (
    <DashboardLayout>
      <Head>
        <title>Kasir | BEDAGANG Cloud POS</title>
      </Head>

      {/* Professional Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <FaCashRegister className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Point of Sale</h1>
              <p className="text-white/80 text-sm">Sistem Kasir Professional</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm mb-1">Kasir</p>
            <p className="text-white font-semibold">{session?.user?.name || 'Admin'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Professional Search Bar */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-indigo-100 p-5">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
              <input
                type="text"
                placeholder="🔍 Cari produk atau scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-14 py-4 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all text-base font-medium placeholder:text-gray-400"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-indigo-100 p-2 rounded-lg cursor-pointer hover:bg-indigo-200 transition-all">
                <FaBarcode className="text-indigo-600 w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Professional Products Grid */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border-2 border-indigo-100 p-5 overflow-y-auto" style={{ height: 'calc(100vh - 320px)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                  <FaBox className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Katalog Produk</h2>
              </div>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                {filteredProducts.length} items
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-3 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
                >
                  <div className="aspect-square bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:scale-110 transition-transform duration-300"></div>
                    <FaBox className="w-8 h-8 text-indigo-600 relative z-10 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-xs text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                      {product.name}
                    </h3>
                    <div>
                      <p className="text-indigo-600 font-bold text-sm">
                        Rp {product.price.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${product.stock > 20 ? 'bg-green-500' : product.stock > 10 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                        Stok: {product.stock}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Professional Cart Section */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border-2 border-indigo-200 p-5 flex flex-col" style={{ height: 'calc(100vh - 250px)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                  <FaShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Keranjang Belanja</h2>
                  <p className="text-xs text-gray-500">{cart.length} item dipilih</p>
                </div>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-1"
                >
                  <FaTrash className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              )}
            </div>

            {/* Professional Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <FaShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Keranjang Masih Kosong</p>
                  <p className="text-gray-400 text-sm mt-1">Pilih produk untuk memulai transaksi</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-3 shadow-md border-2 border-indigo-100 hover:border-indigo-300 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Rp {item.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 p-1.5 rounded-lg transition-all ml-2"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 bg-indigo-50 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 bg-white border-2 border-indigo-200 rounded-lg flex items-center justify-center hover:bg-indigo-100 transition-all"
                        >
                          <FaMinus className="w-2.5 h-2.5 text-indigo-600" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-indigo-600">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 bg-white border-2 border-indigo-200 rounded-lg flex items-center justify-center hover:bg-indigo-100 transition-all"
                        >
                          <FaPlus className="w-2.5 h-2.5 text-indigo-600" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-indigo-600">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Professional Total Section */}
            <div className="border-t-2 border-indigo-200 pt-4 space-y-3">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="font-bold text-gray-900">Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Pajak (0%)</span>
                  <span className="font-bold text-gray-900">Rp 0</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-indigo-200">
                  <span className="text-lg font-bold text-gray-900">TOTAL</span>
                  <span className="text-2xl font-bold text-indigo-600">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <FaCreditCard className="w-5 h-5" />
                <span>Bayar Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 transform transition-all animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                  <FaReceipt className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Pembayaran</h2>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Professional Total Display */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 mb-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm opacity-90 font-medium">Total Pembayaran</p>
                <FaTag className="w-5 h-5 opacity-75" />
              </div>
              <p className="text-4xl font-bold mb-1">Rp {total.toLocaleString('id-ID')}</p>
              <p className="text-sm opacity-75">{cart.length} item dalam keranjang</p>
            </div>

            {/* Professional Payment Method */}
            <div className="mb-6">
              <label className="block text-base font-bold text-gray-900 mb-4">
                Pilih Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-5 border-3 rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                    paymentMethod === 'cash'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-2 ${
                    paymentMethod === 'cash' ? 'bg-green-500' : 'bg-gray-200'
                  }`}>
                    <FaMoneyBillWave className={`w-7 h-7 ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <span className={`font-bold text-sm ${paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-600'}`}>
                    Tunai
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-5 border-3 rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                    paymentMethod === 'card'
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-2 ${
                    paymentMethod === 'card' ? 'bg-indigo-500' : 'bg-gray-200'
                  }`}>
                    <FaCreditCard className={`w-7 h-7 ${paymentMethod === 'card' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <span className={`font-bold text-sm ${paymentMethod === 'card' ? 'text-indigo-600' : 'text-gray-600'}`}>
                    Kartu
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-5 border-3 rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                    paymentMethod === 'qris'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-2 ${
                    paymentMethod === 'qris' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                    <FaQrcode className={`w-7 h-7 ${paymentMethod === 'qris' ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <span className={`font-bold text-sm ${paymentMethod === 'qris' ? 'text-blue-600' : 'text-gray-600'}`}>
                    QRIS
                  </span>
                </button>
              </div>
            </div>

            {/* Professional Cash Input */}
            {paymentMethod === 'cash' && (
              <div className="mb-6">
                <label className="block text-base font-bold text-gray-900 mb-3">
                  💵 Uang Diterima
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg">Rp</span>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-4 py-4 border-2 border-green-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 text-xl font-bold text-gray-900 transition-all"
                  />
                </div>
                {cashReceived && (
                  <div className={`mt-4 p-5 rounded-xl border-2 ${
                    calculateChange() >= 0 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                      : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-bold">Kembalian</span>
                      <span className={`font-bold text-2xl ${
                        calculateChange() >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Rp {Math.abs(calculateChange()).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {calculateChange() < 0 && (
                      <p className="text-red-600 text-sm mt-2 font-medium">⚠️ Uang kurang!</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Professional Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all text-base"
              >
                Batal
              </button>
              <button
                onClick={processPayment}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base"
              >
                <FaCheck className="w-5 h-5" />
                <span>Proses Pembayaran</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CashierPage;
