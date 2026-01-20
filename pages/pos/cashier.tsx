import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  FaShoppingCart, FaPlus, FaMinus, FaTrash, FaBarcode, 
  FaSearch, FaCreditCard, FaMoneyBillWave, FaReceipt,
  FaTimes, FaCheck
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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk atau scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <FaBarcode className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl cursor-pointer hover:text-sky-600" />
            </div>
          </div>

          {/* Products Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Produk</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-sky-500 hover:shadow-md transition-all text-left"
                >
                  <div className="aspect-square bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg mb-2 flex items-center justify-center">
                    <FaShoppingCart className="w-8 h-8 text-sky-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sky-600 font-bold text-sm mb-1">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">Stok: {product.stock}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Keranjang</h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <FaShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Keranjang kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm text-gray-900 flex-1">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                        >
                          <FaMinus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                        >
                          <FaPlus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                      <p className="font-bold text-sm text-sky-600">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pajak (0%)</span>
                <span className="font-semibold">Rp 0</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-3">
                <span>Total</span>
                <span className="text-sky-600">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pembayaran</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-6 mb-6 text-white">
              <p className="text-sm opacity-90 mb-1">Total Pembayaran</p>
              <p className="text-3xl font-bold">Rp {total.toLocaleString('id-ID')}</p>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaMoneyBillWave className={`w-8 h-8 mb-2 ${paymentMethod === 'cash' ? 'text-sky-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${paymentMethod === 'cash' ? 'text-sky-600' : 'text-gray-600'}`}>
                    Tunai
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                    paymentMethod === 'card'
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaCreditCard className={`w-8 h-8 mb-2 ${paymentMethod === 'card' ? 'text-sky-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${paymentMethod === 'card' ? 'text-sky-600' : 'text-gray-600'}`}>
                    Kartu
                  </span>
                </button>
              </div>
            </div>

            {/* Cash Input */}
            {paymentMethod === 'cash' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uang Diterima
                </label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-lg"
                />
                {cashReceived && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Kembalian</span>
                      <span className={`font-bold text-lg ${calculateChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Rp {Math.abs(calculateChange()).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={processPayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center"
              >
                <FaCheck className="mr-2" />
                Proses
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CashierPage;
