import { Order, Service, User, ShiftInfo, DashboardStats, Branch } from '@/types';

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

export const mockServiceDistribution = [
  { label: 'Cuci Reguler', value: 45, color: '#23A174' },
  { label: 'Cuci Express', value: 25, color: '#3B82F6' },
  { label: 'Dry Clean', value: 15, color: '#F59E0B' },
  { label: 'Setrika Saja', value: 10, color: '#8B5CF6' },
  { label: 'Lainnya', value: 5, color: '#94A3B8' },
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
