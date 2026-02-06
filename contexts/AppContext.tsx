import { useState, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Order, ShiftInfo, DashboardStats } from '@/types';
import { mockOrders, mockShiftInfo, mockDashboardStats, mockUser } from '@/mocks/data';

export const [AppProvider, useApp] = createContextHook(() => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [shiftInfo, setShiftInfo] = useState<ShiftInfo>(mockShiftInfo);
  const [dashboardStats] = useState<DashboardStats>(mockDashboardStats);
  const [user] = useState(mockUser);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  }, []);

  const updateProductionStatus = useCallback((orderId: string, productionStatus: Order['productionStatus']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, productionStatus } : order
      )
    );
  }, []);

  const toggleShift = useCallback(() => {
    setShiftInfo(prev => ({
      ...prev,
      isActive: !prev.isActive,
      startTime: !prev.isActive ? new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : prev.startTime,
    }));
  }, []);

  return {
    orders,
    shiftInfo,
    dashboardStats,
    user,
    addOrder,
    updateOrderStatus,
    updateProductionStatus,
    toggleShift,
  };
});
