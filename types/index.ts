export type OrderStatus = 'dalam_proses' | 'siap_diambil' | 'selesai' | 'terlambat';

export type ProductionStatus = 'antrian' | 'diproses' | 'siap_diambil' | 'selesai';

export type PaymentStatus = 'belum_bayar' | 'dp' | 'lunas';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: number;
  weight: number;
  pickupTime: string;
  status: OrderStatus;
  serviceType: string;
  totalPrice: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  productionStatus: ProductionStatus;
  itemDetails?: string;
  notes?: string;
  estimatedDate: string;
  fragrance?: string;
}

export interface Service {
  id: string;
  name: string;
  duration: string;
  pricePerUnit: number;
  unit: 'kg' | 'item';
}

export interface ShiftInfo {
  isActive: boolean;
  startTime: string;
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  overdueOrders: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  todayRevenue: number;
  revenueChange: number;
  activeOrders: number;
  overdueOrders: number;
  completedOrders: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
}
