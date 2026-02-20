import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Clock, ChevronRight } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { Order } from '@/types';
import { PaymentBadge } from './PaymentBadge';
import { formatFullCurrency } from '@/utils/format';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const getStatusLineColor = () => {
    switch (order.paymentStatus) {
      case 'lunas':
        return colors.paymentLunas;
      case 'dp':
        return colors.paymentDp;
      case 'belum_bayar':
        return colors.paymentBelumBayar;
      default:
        return colors.border;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statusLine, { backgroundColor: getStatusLineColor() }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.serviceType}>{order.serviceType}</Text>
          </View>
          <PaymentBadge status={order.paymentStatus} />
        </View>
        
        <View style={styles.customerRow}>
          <User size={14} color={colors.textSecondary} />
          <Text style={styles.customerName}>{order.customerName}</Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>{formatFullCurrency(order.totalPrice)}</Text>
          </View>
          <View style={styles.pickupContainer}>
            <Clock size={14} color={colors.textTertiary} />
            <Text style={styles.pickupText}>Ambil {order.pickupTime}</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  statusLine: {
    width: 4,
    height: '100%',
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingLeft: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  serviceType: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  pickupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pickupText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
