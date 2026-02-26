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
  paymentMethod?: PaymentMethod;
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
  totalIncome: number;
  totalIncomeTransactions: number;
  totalExpense: number;
  totalExpenseTransactions: number;
  todayOrders: number;
  todayTransactions: number;
  todayExpense: number;
  todayExpenseTransactions: number;
  cashierTodayOrders: number;
  cashierTodayRevenue: number;
  cashierTodayTransactions: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
}

export interface BroadcastTemplate {
  id: string;
  name: string;
  message: string;
  category: 'promo' | 'info' | 'ucapan' | 'lainnya';
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastHistory {
  id: string;
  templateId: string;
  templateName: string;
  recipientCount: number;
  sentAt: string;
  status: 'terkirim' | 'gagal' | 'sebagian';
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  category: string;
  price?: number;
  supplier?: string;
  location?: string;
  createdAt: string;
}

export type NotificationType = 'order' | 'payment' | 'production' | 'promo' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
  icon: string;
}

export type PaymentMethod = 'tunai' | 'transfer' | 'qris' | 'edc';

export type StockMovementType = 'masuk' | 'keluar';

export type BillCategory = 'air' | 'listrik';
export type BillStatus = 'lunas' | 'belum_bayar' | 'jatuh_tempo';

export interface OperationalBill {
  id: string;
  category: BillCategory;
  month: string;
  year: number;
  amount: number;
  usage: number;
  unit: string;
  dueDate: string;
  paidDate?: string;
  status: BillStatus;
  notes?: string;
  provider: string;
  accountNumber: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: StockMovementType;
  quantity: number;
  unit: string;
  note: string;
  date: string;
  balanceBefore: number;
  balanceAfter: number;
}
