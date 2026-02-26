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
  isLast?: boolean;
}

export function OrderCard({ order, onPress, isLast = false }: OrderCardProps) {
  const getStatusColor = () => {
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
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.content, !isLast && styles.contentBorder]}>
        <View style={styles.mainInfo}>
          <View style={styles.topRow}>
            <Text style={styles.orderId}>{order.id}</Text>
            <PaymentBadge status={order.paymentStatus} />
          </View>
          <Text style={styles.serviceType}>{order.serviceType}</Text>
          <View style={styles.customerRow}>
            <User size={13} color={colors.textTertiary} />
            <Text style={styles.customerName}>{order.customerName}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.priceValue}>{formatFullCurrency(order.totalPrice)}</Text>
            <View style={styles.pickupContainer}>
              <Clock size={12} color={colors.textTertiary} />
              <Text style={styles.pickupText}>{order.pickupTime}</Text>
            </View>
          </View>
        </View>
        <ChevronRight size={18} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  contentBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  mainInfo: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  serviceType: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  customerName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
  },
  pickupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pickupText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});
