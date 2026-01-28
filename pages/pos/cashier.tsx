import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { 
  FaShoppingCart, FaPlus, FaMinus, FaTrash, FaBarcode, 
  FaSearch, FaCreditCard, FaMoneyBillWave, FaReceipt,
  FaTimes, FaCheck, FaCashRegister, FaBox, FaTag, FaQrcode,
  FaChartBar, FaUsers, FaClock
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
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  
  // Customer & Discount states
  const [customerType, setCustomerType] = useState<'walk-in' | 'member'>('walk-in');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '', discount: 10 });
  const [membersList, setMembersList] = useState<any[]>([]);
  
  // Shift Management states
  const [activeShift, setActiveShift] = useState<any>(null);
  const [transactionCount, setTransactionCount] = useState(0);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftAction, setShiftAction] = useState<'open' | 'close'>('open');

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Initialize members list
  React.useEffect(() => {
    const initialMembers = [
      { id: '1', name: 'John Doe', phone: '081234567890', points: 150, discount: 10 },
      { id: '2', name: 'Jane Smith', phone: '081234567891', points: 250, discount: 15 },
      { id: '3', name: 'Bob Wilson', phone: '081234567892', points: 500, discount: 20 },
      { id: '4', name: 'Alice Brown', phone: '081234567893', points: 100, discount: 10 },
    ];
    setMembersList(initialMembers);
  }, []);

  // Filter members based on search
  const filteredMembers = membersList.filter(member =>
    member.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    member.phone.includes(searchMember)
  );

  // Add new member
  const handleAddMember = () => {
    if (newMember.name && newMember.phone) {
      const member = {
        id: Date.now().toString(),
        name: newMember.name,
        phone: newMember.phone,
        points: 0,
        discount: newMember.discount
      };
      setMembersList([...membersList, member]);
      setSelectedMember(member);
      setCustomerType('member');
      setNewMember({ name: '', phone: '', discount: 10 });
      setShowAddMemberForm(false);
      setShowMemberModal(false);
      alert('Member baru berhasil ditambahkan!');
    } else {
      alert('Nama dan nomor telepon harus diisi!');
    }
  };

  // Mock vouchers
  const vouchers = [
    { id: '1', code: 'DISKON10', name: 'Diskon 10%', type: 'percentage', value: 10, minPurchase: 50000 },
    { id: '2', code: 'DISKON20', name: 'Diskon 20%', type: 'percentage', value: 20, minPurchase: 100000 },
    { id: '3', code: 'POTONGAN50K', name: 'Potongan Rp 50.000', type: 'fixed', value: 50000, minPurchase: 200000 },
    { id: '4', code: 'GRATIS10K', name: 'Gratis Ongkir Rp 10.000', type: 'fixed', value: 10000, minPurchase: 0 },
  ];

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

  // Get unique categories
  const categories = ['Semua', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    let discount = 0;

    // Member discount
    if (customerType === 'member' && selectedMember) {
      discount += (subtotal * selectedMember.discount) / 100;
    }

    // Voucher discount
    if (selectedVoucher) {
      if (subtotal >= selectedVoucher.minPurchase) {
        if (selectedVoucher.type === 'percentage') {
          discount += (subtotal * selectedVoucher.value) / 100;
        } else {
          discount += selectedVoucher.value;
        }
      }
    }

    return discount;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
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
    
    // Increment transaction counter
    setTransactionCount(transactionCount + 1);
    
    // Update shift stats if shift is active
    if (activeShift) {
      const total = calculateTotal();
      setActiveShift({
        ...activeShift,
        totalTransactions: (activeShift.totalTransactions || 0) + 1,
        totalSales: (activeShift.totalSales || 0) + total,
        cashSales: paymentMethod === 'cash' ? (activeShift.cashSales || 0) + total : activeShift.cashSales || 0,
        cardSales: paymentMethod === 'card' ? (activeShift.cardSales || 0) + total : activeShift.cardSales || 0,
        ewalletSales: paymentMethod === 'qris' ? (activeShift.ewalletSales || 0) + total : activeShift.ewalletSales || 0
      });
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
            <div className="relative mb-4">
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
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <FaTag className="text-indigo-500 w-4 h-4 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
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

            {/* Customer Type Selection */}
            <div className="mb-3 bg-white rounded-xl p-3 border-2 border-indigo-100">
              <label className="text-xs font-bold text-gray-700 mb-2 block">Jenis Pelanggan</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCustomerType('walk-in');
                    setSelectedMember(null);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    customerType === 'walk-in'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🚶 Walk-in
                </button>
                <button
                  onClick={() => {
                    setCustomerType('member');
                    setShowMemberModal(true);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    customerType === 'member'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  👤 Member
                </button>
              </div>
              {customerType === 'member' && selectedMember && (
                <div className="mt-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-900">{selectedMember.name}</p>
                      <p className="text-xs text-purple-600">{selectedMember.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-600">Diskon {selectedMember.discount}%</p>
                      <p className="text-xs text-purple-500">{selectedMember.points} poin</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Voucher Selection */}
            <div className="mb-3 bg-white rounded-xl p-3 border-2 border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700">Voucher / Kupon</label>
                <button
                  onClick={() => setShowVoucherModal(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Pilih
                </button>
              </div>
              {selectedVoucher ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-2 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-orange-900">{selectedVoucher.code}</p>
                      <p className="text-xs text-orange-600">{selectedVoucher.name}</p>
                    </div>
                    <button
                      onClick={() => setSelectedVoucher(null)}
                      className="ml-2 text-orange-600 hover:text-orange-700"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-xs text-gray-500">Tidak ada voucher dipilih</p>
                </div>
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
                  <span className="font-bold text-gray-900">Rp {calculateSubtotal().toLocaleString('id-ID')}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <FaTag className="w-3 h-3" />
                      Diskon
                    </span>
                    <span className="font-bold text-green-600">- Rp {calculateDiscount().toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Pajak (0%)</span>
                  <span className="font-bold text-gray-900">Rp 0</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-indigo-200">
                  <span className="text-lg font-bold text-gray-900">TOTAL</span>
                  <span className="text-2xl font-bold text-indigo-600">Rp {calculateTotal().toLocaleString('id-ID')}</span>
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

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-2xl border-t-4 border-white/20 backdrop-blur-lg z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Shift Info & Button */}
            <div className="flex items-center gap-2">
              {activeShift ? (
                <div className="bg-green-500/30 border-2 border-green-300 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FaClock className="w-4 h-4 text-white animate-pulse" />
                    <div className="text-white">
                      <p className="text-xs font-semibold">Shift Aktif</p>
                      <p className="text-xs">{activeShift.shiftType || 'Pagi'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShiftAction('open');
                    setShowShiftModal(true);
                  }}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 backdrop-blur-sm px-4 py-2 rounded-xl transition-all shadow-lg"
                >
                  <FaClock className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm hidden md:block">
                    Buka Shift
                  </span>
                </button>
              )}
              
              {/* Transaction Counter */}
              <div className="flex items-center gap-2 text-white mr-4">
                <FaReceipt className="w-4 h-4" />
                <div>
                  <p className="text-xs">Transaksi</p>
                  <p className="text-sm font-bold">{transactionCount}</p>
                </div>
              </div>
            </div>

            {/* Quick Shortcuts */}
            <div className="flex items-center gap-2 flex-1 justify-center overflow-x-auto">
              <button
                onClick={() => router.push('/pos/transactions')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg transition-all whitespace-nowrap"
              >
                <FaShoppingCart className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium hidden sm:block">Transaksi</span>
              </button>
              
              <button
                onClick={() => router.push('/inventory')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg transition-all whitespace-nowrap"
              >
                <FaBox className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium hidden sm:block">Stok</span>
              </button>
              
              <button
                onClick={() => router.push('/pos/reports')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg transition-all whitespace-nowrap"
              >
                <FaChartBar className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium hidden sm:block">Laporan</span>
              </button>
              
              <button
                onClick={() => router.push('/customers')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg transition-all whitespace-nowrap"
              >
                <FaUsers className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium hidden sm:block">Pelanggan</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (cart.length > 0) {
                    setPendingTransactions([...pendingTransactions, { id: Date.now(), cart: [...cart], total: calculateTotal(), time: new Date() }]);
                    clearCart();
                    alert('Transaksi ditahan!');
                  }
                }}
                disabled={cart.length === 0}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-xl transition-all shadow-lg"
              >
                <FaClock className="w-4 h-4 text-white" />
                <span className="text-white font-semibold text-xs hidden lg:block">
                  Tahan
                </span>
              </button>
              
              {/* Pending Transactions */}
              <button
                onClick={() => setShowPendingModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-xl transition-all group"
              >
                <div className="relative">
                  <FaReceipt className="w-4 h-4 text-white" />
                  {pendingTransactions.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse text-[10px]">
                      {pendingTransactions.length}
                    </span>
                  )}
                </div>
                <span className="text-white font-semibold text-xs hidden lg:block">
                  Transaksi Gantung
                </span>
              </button>
              
              {activeShift && (
                <button
                  onClick={() => {
                    setShiftAction('close');
                    setShowShiftModal(true);
                  }}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-xl transition-all shadow-lg"
                >
                  <FaClock className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-xs hidden lg:block">
                    Tutup Shift
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Member Selection Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
                  <FaUsers className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Pilih Member</h2>
              </div>
              <button
                onClick={() => {
                  setShowMemberModal(false);
                  setSearchMember('');
                  setShowAddMemberForm(false);
                }}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama atau nomor telepon..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all text-sm"
                />
              </div>
            </div>

            {/* Add Member Button */}
            <button
              onClick={() => setShowAddMemberForm(!showAddMemberForm)}
              className="w-full mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              {showAddMemberForm ? 'Batal Tambah Member' : 'Tambah Member Baru'}
            </button>

            {/* Add Member Form */}
            {showAddMemberForm && (
              <div className="mb-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3">Data Member Baru</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor Telepon</label>
                    <input
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Diskon Member (%)</label>
                    <select
                      value={newMember.discount}
                      onChange={(e) => setNewMember({ ...newMember, discount: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-400 text-sm"
                    >
                      <option value={5}>5%</option>
                      <option value={10}>10%</option>
                      <option value={15}>15%</option>
                      <option value={20}>20%</option>
                      <option value={25}>25%</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddMember}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold transition-all"
                  >
                    Simpan Member
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <FaUsers className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Member tidak ditemukan</p>
                  <p className="text-gray-400 text-sm mt-1">Coba kata kunci lain atau tambah member baru</p>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMember(member);
                      setCustomerType('member');
                      setShowMemberModal(false);
                      setSearchMember('');
                      setShowAddMemberForm(false);
                    }}
                    className="w-full bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all text-left hover:border-purple-400"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-600">Diskon {member.discount}%</p>
                        <p className="text-xs text-purple-500">{member.points} poin</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Voucher Selection Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-xl">
                  <FaTag className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Pilih Voucher</h2>
              </div>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {vouchers.map((voucher) => {
                const subtotal = calculateSubtotal();
                const isEligible = subtotal >= voucher.minPurchase;
                
                return (
                  <button
                    key={voucher.id}
                    onClick={() => {
                      if (isEligible) {
                        setSelectedVoucher(voucher);
                        setShowVoucherModal(false);
                      }
                    }}
                    disabled={!isEligible}
                    className={`w-full rounded-xl p-4 text-left transition-all ${
                      isEligible
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:shadow-lg hover:border-yellow-400'
                        : 'bg-gray-100 border-2 border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{voucher.code}</p>
                        <p className="text-sm text-gray-600">{voucher.name}</p>
                      </div>
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                        {voucher.type === 'percentage' ? `${voucher.value}%` : `Rp ${(voucher.value / 1000).toFixed(0)}K`}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={isEligible ? 'text-gray-600' : 'text-red-600 font-semibold'}>
                        Min. pembelian: Rp {voucher.minPurchase.toLocaleString('id-ID')}
                      </span>
                      {!isEligible && (
                        <span className="text-red-600 font-semibold">
                          Kurang Rp {(voucher.minPurchase - subtotal).toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pending Transactions Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-xl">
                  <FaReceipt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Transaksi Gantung</h2>
                  <p className="text-sm text-gray-500">{pendingTransactions.length} transaksi tertunda</p>
                </div>
              </div>
              <button
                onClick={() => setShowPendingModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <FaReceipt className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Tidak ada transaksi tertunda</p>
                </div>
              ) : (
                pendingTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">Transaksi #{index + 1}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.time).toLocaleTimeString('id-ID')} - {transaction.cart.length} item
                        </p>
                      </div>
                      <p className="text-xl font-bold text-yellow-600">
                        Rp {transaction.total.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCart(transaction.cart);
                          setPendingTransactions(pendingTransactions.filter(t => t.id !== transaction.id));
                          setShowPendingModal(false);
                        }}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                      >
                        Lanjutkan
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Hapus transaksi ini?')) {
                            setPendingTransactions(pendingTransactions.filter(t => t.id !== transaction.id));
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* Shift Management Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${shiftAction === 'open' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-pink-600'}`}>
                  <FaClock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {shiftAction === 'open' ? 'Buka Shift' : 'Tutup Shift'}
                </h2>
              </div>
              <button
                onClick={() => setShowShiftModal(false)}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all"
              >
                <FaTimes className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {shiftAction === 'open' ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-900 font-semibold mb-2">Informasi Kasir</p>
                  <p className="text-sm text-blue-700">Nama: {session?.user?.name || 'Kasir'}</p>
                  <p className="text-sm text-blue-700">Waktu: {new Date().toLocaleString('id-ID')}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Modal Awal</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                    <input
                      type="number"
                      defaultValue="1000000"
                      className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-400 text-lg font-bold"
                      id="openingBalance"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowShiftModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      const openingBalance = (document.getElementById('openingBalance') as HTMLInputElement)?.value || '1000000';
                      setActiveShift({
                        id: Date.now().toString(),
                        shiftType: 'Pagi',
                        startTime: new Date(),
                        openingBalance: parseFloat(openingBalance),
                        totalTransactions: 0,
                        totalSales: 0,
                        cashSales: 0,
                        cardSales: 0,
                        ewalletSales: 0
                      });
                      setTransactionCount(0);
                      setShowShiftModal(false);
                      alert('Shift berhasil dibuka!');
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                  >
                    Buka Shift
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3">REKAP SHIFT</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Transaksi:</span>
                      <span className="font-bold">{activeShift?.totalTransactions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Penjualan:</span>
                      <span className="font-bold text-blue-600">
                        Rp {(activeShift?.totalSales || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">• Cash:</span>
                      <span>Rp {(activeShift?.cashSales || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">• Card:</span>
                      <span>Rp {(activeShift?.cardSales || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">• E-Wallet:</span>
                      <span>Rp {(activeShift?.ewalletSales || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-900 font-semibold mb-1">⚠️ Perhatian</p>
                  <p className="text-xs text-yellow-700">
                    Pastikan Anda sudah menghitung cash di laci sebelum menutup shift.
                    Untuk rekap lengkap, gunakan halaman Shift Management.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowShiftModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      setActiveShift(null);
                      setShowShiftModal(false);
                      alert('Shift ditutup! Silakan lakukan rekap lengkap di halaman Shift Management.');
                      router.push('/pos/shifts-complete');
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
                  >
                    Tutup Shift
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CashierPage;
