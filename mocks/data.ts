import { Order, Service, User, ShiftInfo, DashboardStats, Branch, BroadcastTemplate, BroadcastHistory, InventoryItem, StockMovement, Notification } from '@/types';

export const mockUser: User = {
  id: '1',
  name: 'Kasir 01',
  email: 'kasir01@atourwash.com',
  role: 'Kasir',
};

export const mockShiftInfo: ShiftInfo = {
  isActive: true,
  startTime: '08:00',
  totalRevenue: 850000,
  totalOrders: 15,
  completedOrders: 8,
  overdueOrders: 2,
};

export const mockDashboardStats: DashboardStats = {
  todayRevenue: 850000,
  revenueChange: 12,
  activeOrders: 12,
  overdueOrders: 2,
  completedOrders: 8,
  totalIncome: 13450000,
  totalIncomeTransactions: 187,
  totalExpense: 4280000,
  totalExpenseTransactions: 43,
};

export const mockServices: Service[] = [
  { id: '1', name: 'Cuci Reguler', duration: '2-3 hari', pricePerUnit: 7000, unit: 'kg' },
  { id: '2', name: 'Cuci Express', duration: '1 hari', pricePerUnit: 12000, unit: 'kg' },
  { id: '3', name: 'Dry Clean', duration: '3-5 hari', pricePerUnit: 25000, unit: 'item' },
  { id: '4', name: 'Setrika Saja', duration: '1 hari', pricePerUnit: 5000, unit: 'kg' },
];

export const mockKiloanServices: Service[] = [
  { id: 'k1', name: 'Cuci Reguler', duration: '2-3 hari', pricePerUnit: 7000, unit: 'kg' },
  { id: 'k2', name: 'Cuci Express', duration: '1 hari', pricePerUnit: 12000, unit: 'kg' },
  { id: 'k3', name: 'Cuci Setrika', duration: '2-3 hari', pricePerUnit: 9000, unit: 'kg' },
  { id: 'k4', name: 'Setrika Saja', duration: '1 hari', pricePerUnit: 5000, unit: 'kg' },
];

export const mockFragrances = [
  { id: 'f1', name: 'Lavender', icon: '💜', color: '#A78BFA' },
  { id: 'f2', name: 'Ocean Breeze', icon: '🌊', color: '#38BDF8' },
  { id: 'f3', name: 'Rose', icon: '🌹', color: '#FB7185' },
  { id: 'f4', name: 'Fresh Lemon', icon: '🍋', color: '#FACC15' },
  { id: 'f5', name: 'Sakura', icon: '🌸', color: '#F9A8D4' },
  { id: 'f6', name: 'Tanpa Pengharum', icon: '🚫', color: '#94A3B8' },
];

export const mockSatuanItems = [
  { id: 's1', name: 'Kemeja', price: 8000, icon: '👔' },
  { id: 's2', name: 'Celana', price: 8000, icon: '👖' },
  { id: 's3', name: 'Kaos', price: 6000, icon: '👕' },
  { id: 's4', name: 'Jaket', price: 15000, icon: '🧥' },
  { id: 's5', name: 'Jas/Blazer', price: 25000, icon: '🤵' },
  { id: 's6', name: 'Gaun/Dress', price: 20000, icon: '👗' },
  { id: 's7', name: 'Selimut', price: 20000, icon: '🛏️' },
  { id: 's8', name: 'Sprei', price: 15000, icon: '🛌' },
  { id: 's9', name: 'Gordyn (m²)', price: 12000, icon: '🪟' },
  { id: 's10', name: 'Sepatu', price: 30000, icon: '👟' },
  { id: 's11', name: 'Tas', price: 25000, icon: '👜' },
  { id: 's12', name: 'Boneka Kecil', price: 15000, icon: '🧸' },
];

export const mockBranches: Branch[] = [
  { id: 'b1', name: 'AtourWash Pusat', address: 'Jl. Sudirman No. 12' },
  { id: 'b2', name: 'AtourWash Cabang BSD', address: 'Jl. BSD Raya No. 5' },
  { id: 'b3', name: 'AtourWash Cabang Depok', address: 'Jl. Margonda No. 88' },
];

export const mockWeeklyRevenue = [
  { label: 'W1', value: 2400000 },
  { label: 'W2', value: 3100000 },
  { label: 'W3', value: 2800000 },
  { label: 'W4', value: 3500000 },
];

export const mockMonthlyRevenue = [
  { label: 'Jan', value: 9500000 },
  { label: 'Feb', value: 11200000 },
  { label: 'Mar', value: 10800000 },
  { label: 'Apr', value: 12500000 },
  { label: 'Mei', value: 13100000 },
  { label: 'Jun', value: 11800000 },
];

export const mockYearlyRevenue = [
  { label: '2024', value: 120000000 },
  { label: '2025', value: 145000000 },
  { label: '2026', value: 38000000 },
];

export const mockWeeklyCashFlow = [
  { label: 'W1', income: 2400000, expense: 980000 },
  { label: 'W2', income: 3100000, expense: 1200000 },
  { label: 'W3', income: 2800000, expense: 1050000 },
  { label: 'W4', income: 3500000, expense: 1350000 },
];

export const mockMonthlyCashFlow = [
  { label: 'Jan', income: 9500000, expense: 3800000 },
  { label: 'Feb', income: 11200000, expense: 4100000 },
  { label: 'Mar', income: 10800000, expense: 3950000 },
  { label: 'Apr', income: 12500000, expense: 4600000 },
  { label: 'Mei', income: 13100000, expense: 4280000 },
  { label: 'Jun', income: 11800000, expense: 4050000 },
];

export const mockYearlyCashFlow = [
  { label: '2024', income: 120000000, expense: 48000000 },
  { label: '2025', income: 145000000, expense: 55000000 },
  { label: '2026', income: 38000000, expense: 14500000 },
];

export const mockMonthlySummary = {
  month: 'Februari 2026',
  totalIncome: 13450000,
  totalIncomeTransactions: 187,
  totalExpense: 4280000,
  totalExpenseTransactions: 43,
  netProfit: 9170000,
};

export const mockServiceDistribution = [
  { label: 'Cuci Reguler', value: 45, color: '#23A174' },
  { label: 'Cuci Express', value: 25, color: '#3B82F6' },
  { label: 'Dry Clean', value: 15, color: '#F59E0B' },
  { label: 'Setrika Saja', value: 10, color: '#8B5CF6' },
  { label: 'Lainnya', value: 5, color: '#94A3B8' },
];

export const mockBroadcastTemplates: BroadcastTemplate[] = [
  {
    id: 'bt1',
    name: 'Promo Akhir Pekan',
    message: 'Halo {nama}! 🎉 Spesial weekend ini, nikmati DISKON 20% untuk semua layanan cuci di AtourWash. Berlaku s/d hari Minggu. Yuk, segera kunjungi outlet terdekat!',
    category: 'promo',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'bt2',
    name: 'Pesanan Siap Diambil',
    message: 'Halo {nama}, pesanan laundry Anda sudah selesai dan siap diambil di outlet kami. Terima kasih telah menggunakan AtourWash! 😊',
    category: 'info',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 'bt3',
    name: 'Ucapan Ulang Tahun',
    message: 'Selamat Ulang Tahun, {nama}! 🎂 Sebagai hadiah dari kami, Anda mendapat voucher FREE cuci 3kg. Berlaku 7 hari. Semoga harimu menyenangkan!',
    category: 'ucapan',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'bt4',
    name: 'Promo Member Baru',
    message: 'Hai {nama}! Terima kasih sudah menjadi pelanggan setia AtourWash. Dapatkan CASHBACK 15% untuk transaksi berikutnya dengan kode MEMBER15. Jangan lewatkan! 💚',
    category: 'promo',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z',
  },
];

export const mockBroadcastHistory: BroadcastHistory[] = [
  {
    id: 'bh1',
    templateId: 'bt1',
    templateName: 'Promo Akhir Pekan',
    recipientCount: 24,
    sentAt: '2024-01-20T10:00:00Z',
    status: 'terkirim',
  },
  {
    id: 'bh2',
    templateId: 'bt3',
    templateName: 'Ucapan Ulang Tahun',
    recipientCount: 3,
    sentAt: '2024-01-19T08:30:00Z',
    status: 'terkirim',
  },
  {
    id: 'bh3',
    templateId: 'bt4',
    templateName: 'Promo Member Baru',
    recipientCount: 15,
    sentAt: '2024-01-18T14:00:00Z',
    status: 'sebagian',
  },
];

export const mockInventoryItems: InventoryItem[] = [
  { id: '1', name: 'Deterjen Bubuk', stock: 25, unit: 'kg', minStock: 10, category: 'Bahan Cuci', price: 35000, supplier: 'PT Kimia Jaya', location: 'Rak A1', createdAt: '2024-01-05T08:00:00Z' },
  { id: '2', name: 'Pewangi Lavender', stock: 8, unit: 'liter', minStock: 5, category: 'Pewangi', price: 28000, supplier: 'CV Aroma Sejati', location: 'Rak B2', createdAt: '2024-01-05T08:00:00Z' },
  { id: '3', name: 'Pemutih', stock: 3, unit: 'liter', minStock: 5, category: 'Bahan Cuci', price: 22000, supplier: 'PT Kimia Jaya', location: 'Rak A2', createdAt: '2024-01-06T08:00:00Z' },
  { id: '4', name: 'Plastik Packing (Besar)', stock: 150, unit: 'lembar', minStock: 50, category: 'Packing', price: 500, supplier: 'UD Plastik Makmur', location: 'Rak C1', createdAt: '2024-01-06T08:00:00Z' },
  { id: '5', name: 'Plastik Packing (Kecil)', stock: 40, unit: 'lembar', minStock: 50, category: 'Packing', price: 300, supplier: 'UD Plastik Makmur', location: 'Rak C2', createdAt: '2024-01-07T08:00:00Z' },
  { id: '6', name: 'Pewangi Rose', stock: 12, unit: 'liter', minStock: 5, category: 'Pewangi', price: 30000, supplier: 'CV Aroma Sejati', location: 'Rak B3', createdAt: '2024-01-07T08:00:00Z' },
  { id: '7', name: 'Softener', stock: 6, unit: 'liter', minStock: 5, category: 'Bahan Cuci', price: 25000, supplier: 'PT Kimia Jaya', location: 'Rak A3', createdAt: '2024-01-08T08:00:00Z' },
];

export const mockStockMovements: StockMovement[] = [
  { id: 'sm1', itemId: '1', itemName: 'Deterjen Bubuk', type: 'masuk', quantity: 10, unit: 'kg', note: 'Pembelian dari PT Kimia Jaya', date: '2024-01-20T09:00:00Z', balanceBefore: 15, balanceAfter: 25 },
  { id: 'sm2', itemId: '1', itemName: 'Deterjen Bubuk', type: 'keluar', quantity: 3, unit: 'kg', note: 'Pemakaian harian', date: '2024-01-19T14:00:00Z', balanceBefore: 18, balanceAfter: 15 },
  { id: 'sm3', itemId: '2', itemName: 'Pewangi Lavender', type: 'masuk', quantity: 5, unit: 'liter', note: 'Restock dari CV Aroma Sejati', date: '2024-01-18T10:30:00Z', balanceBefore: 3, balanceAfter: 8 },
  { id: 'sm4', itemId: '2', itemName: 'Pewangi Lavender', type: 'keluar', quantity: 2, unit: 'liter', note: 'Pemakaian cuci express', date: '2024-01-17T16:00:00Z', balanceBefore: 5, balanceAfter: 3 },
  { id: 'sm5', itemId: '3', itemName: 'Pemutih', type: 'keluar', quantity: 2, unit: 'liter', note: 'Pemakaian cuci putih', date: '2024-01-19T11:00:00Z', balanceBefore: 5, balanceAfter: 3 },
  { id: 'sm6', itemId: '4', itemName: 'Plastik Packing (Besar)', type: 'masuk', quantity: 100, unit: 'lembar', note: 'Pembelian UD Plastik Makmur', date: '2024-01-18T08:00:00Z', balanceBefore: 50, balanceAfter: 150 },
  { id: 'sm7', itemId: '5', itemName: 'Plastik Packing (Kecil)', type: 'keluar', quantity: 30, unit: 'lembar', note: 'Pemakaian packing harian', date: '2024-01-20T15:00:00Z', balanceBefore: 70, balanceAfter: 40 },
  { id: 'sm8', itemId: '6', itemName: 'Pewangi Rose', type: 'masuk', quantity: 8, unit: 'liter', note: 'Restock dari CV Aroma Sejati', date: '2024-01-17T09:00:00Z', balanceBefore: 4, balanceAfter: 12 },
  { id: 'sm9', itemId: '7', itemName: 'Softener', type: 'masuk', quantity: 4, unit: 'liter', note: 'Pembelian dari PT Kimia Jaya', date: '2024-01-16T10:00:00Z', balanceBefore: 2, balanceAfter: 6 },
  { id: 'sm10', itemId: '1', itemName: 'Deterjen Bubuk', type: 'keluar', quantity: 5, unit: 'kg', note: 'Pemakaian order besar', date: '2024-01-18T13:00:00Z', balanceBefore: 23, balanceAfter: 18 },
  { id: 'sm11', itemId: '3', itemName: 'Pemutih', type: 'masuk', quantity: 3, unit: 'liter', note: 'Pembelian dari PT Kimia Jaya', date: '2024-01-15T08:00:00Z', balanceBefore: 2, balanceAfter: 5 },
  { id: 'sm12', itemId: '7', itemName: 'Softener', type: 'keluar', quantity: 1.5, unit: 'liter', note: 'Pemakaian cuci reguler', date: '2024-01-19T10:00:00Z', balanceBefore: 7.5, balanceAfter: 6 },
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'Pesanan Baru Masuk',
    message: 'Pesanan ORD-007 dari Rina Marlina telah dibuat. Layanan: Cuci Express, 3.5 kg.',
    isRead: false,
    createdAt: '2024-01-20T14:30:00Z',
    orderId: 'ORD-007',
  },
  {
    id: 'n2',
    type: 'production',
    title: 'Produksi Selesai',
    message: 'Pesanan ORD-002 (Siti Rahayu) telah selesai diproduksi dan siap diambil.',
    isRead: false,
    createdAt: '2024-01-20T12:00:00Z',
    orderId: 'ORD-002',
  },
  {
    id: 'n3',
    type: 'payment',
    title: 'Pembayaran Diterima',
    message: 'Pembayaran lunas sebesar Rp 50.400 diterima untuk pesanan ORD-002 (Siti Rahayu).',
    isRead: false,
    createdAt: '2024-01-20T11:45:00Z',
    orderId: 'ORD-002',
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Stok Menipis',
    message: 'Stok Pemutih tersisa 3 liter, di bawah batas minimum (5 liter). Segera lakukan restock.',
    isRead: true,
    createdAt: '2024-01-20T09:00:00Z',
  },
  {
    id: 'n5',
    type: 'promo',
    title: 'Promo Akhir Pekan Aktif',
    message: 'Promo diskon 20% untuk semua layanan cuci telah aktif. Berlaku hingga Minggu.',
    isRead: true,
    createdAt: '2024-01-19T18:00:00Z',
  },
  {
    id: 'n6',
    type: 'order',
    title: 'Pesanan Terlambat',
    message: 'Pesanan ORD-003 (Ahmad Wijaya) melewati estimasi pengambilan. Harap segera proses.',
    isRead: true,
    createdAt: '2024-01-19T16:00:00Z',
    orderId: 'ORD-003',
  },
  {
    id: 'n7',
    type: 'payment',
    title: 'DP Diterima',
    message: 'DP sebesar Rp 10.000 diterima untuk pesanan ORD-001 (Budi Santoso).',
    isRead: true,
    createdAt: '2024-01-19T10:00:00Z',
    orderId: 'ORD-001',
  },
  {
    id: 'n8',
    type: 'production',
    title: 'Mulai Diproses',
    message: 'Pesanan ORD-001 (Budi Santoso) mulai diproses di mesin cuci.',
    isRead: true,
    createdAt: '2024-01-19T08:30:00Z',
    orderId: 'ORD-001',
  },
  {
    id: 'n9',
    type: 'system',
    title: 'Shift Dimulai',
    message: 'Shift pagi telah dimulai oleh Kasir 01 pada pukul 08:00.',
    isRead: true,
    createdAt: '2024-01-19T08:00:00Z',
  },
  {
    id: 'n10',
    type: 'promo',
    title: 'Broadcast Terkirim',
    message: 'Broadcast "Promo Akhir Pekan" berhasil dikirim ke 24 pelanggan.',
    isRead: true,
    createdAt: '2024-01-18T14:00:00Z',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    items: 3,
    weight: 2.5,
    pickupTime: '14:00',
    status: 'dalam_proses',
    serviceType: 'Cuci Reguler',
    totalPrice: 17500,
    paidAmount: 10000,
    paymentStatus: 'dp',
    createdAt: '2024-01-15T08:00:00Z',
    productionStatus: 'diproses',
    itemDetails: '3 kemeja, 2 celana',
    notes: 'Pisahkan warna gelap dan terang',
    estimatedDate: '2024-01-17',
  },
  {
    id: 'ORD-002',
    customerName: 'Siti Rahayu',
    customerPhone: '081234567891',
    items: 5,
    weight: 4.2,
    pickupTime: '12:00',
    status: 'siap_diambil',
    serviceType: 'Cuci Express',
    totalPrice: 50400,
    paidAmount: 50400,
    paymentStatus: 'lunas',
    createdAt: '2024-01-15T07:30:00Z',
    productionStatus: 'selesai',
    itemDetails: '5 baju',
    estimatedDate: '2024-01-16',
  },
  {
    id: 'ORD-003',
    customerName: 'Ahmad Wijaya',
    customerPhone: '081234567892',
    items: 2,
    weight: 1.8,
    pickupTime: '10:00',
    status: 'terlambat',
    serviceType: 'Dry Clean',
    totalPrice: 50000,
    paidAmount: 0,
    paymentStatus: 'belum_bayar',
    createdAt: '2024-01-14T09:00:00Z',
    productionStatus: 'antrian',
    itemDetails: '2 jas',
    notes: 'Handle with care',
    estimatedDate: '2024-01-19',
  },
  {
    id: 'ORD-004',
    customerName: 'Dewi Lestari',
    customerPhone: '081234567893',
    items: 4,
    weight: 3.1,
    pickupTime: '16:00',
    status: 'dalam_proses',
    serviceType: 'Cuci Reguler',
    totalPrice: 21700,
    paidAmount: 21700,
    paymentStatus: 'lunas',
    createdAt: '2024-01-15T09:30:00Z',
    productionStatus: 'siap_diambil',
    itemDetails: '4 blouse, 1 rok',
    estimatedDate: '2024-01-17',
  },
  {
    id: 'ORD-005',
    customerName: 'Eko Prasetyo',
    customerPhone: '081234567894',
    items: 6,
    weight: 5.0,
    pickupTime: '09:00',
    status: 'selesai',
    serviceType: 'Setrika Saja',
    totalPrice: 25000,
    paidAmount: 25000,
    paymentStatus: 'lunas',
    createdAt: '2024-01-15T06:00:00Z',
    productionStatus: 'selesai',
    itemDetails: '6 kemeja',
    estimatedDate: '2024-01-16',
  },
  {
    id: 'ORD-006',
    customerName: 'Fitri Handayani',
    customerPhone: '081234567895',
    items: 2,
    weight: 1.5,
    pickupTime: '15:00',
    status: 'siap_diambil',
    serviceType: 'Cuci Express',
    totalPrice: 18000,
    paidAmount: 10000,
    paymentStatus: 'dp',
    createdAt: '2024-01-15T10:00:00Z',
    productionStatus: 'antrian',
    itemDetails: '2 dress',
    estimatedDate: '2024-01-16',
  },
];
