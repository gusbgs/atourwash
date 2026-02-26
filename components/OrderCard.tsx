import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Clock, ChevronRight, Phone, Calendar } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { Order, ProductionStatus } from '@/types';
import { PaymentBadge } from './PaymentBadge';
import { formatFullCurrency, formatDate } from '@/utils/format';

const PRODUCTION_STEPS: { key: ProductionStatus; label: string }[] = [
  { key: 'antrian', label: 'Antrian' },
  { key: 'diproses', label: 'Diproses' },
  { key: 'siap_diambil', label: 'Siap Diambil' },
];

function getStepIndex(status: ProductionStatus): number {
  if (status === 'selesai') return 3;
  const idx = PRODUCTION_STEPS.findIndex(s => s.key === status);
  return idx >= 0 ? idx + 1 : 0;
}

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
            <View style={styles.phoneSeparator} />
            <Phone size={12} color={colors.textTertiary} />
            <Text style={styles.customerPhone}>{order.customerPhone}</Text>
          </View>
          <View style={styles.dateRow}>
            <Calendar size={12} color={colors.textTertiary} />
            <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.priceValue}>{formatFullCurrency(order.totalPrice)}</Text>
            <View style={styles.pickupContainer}>
              <Clock size={12} color={colors.textTertiary} />
              <Text style={styles.pickupText}>{order.pickupTime}</Text>
            </View>
          </View>
          <View style={styles.stepsRow}>
            {PRODUCTION_STEPS.map((step, i) => {
              const completed = getStepIndex(order.productionStatus) > i;
              const active = getStepIndex(order.productionStatus) === i + 1 && order.productionStatus !== 'selesai';
              const isLast = i === PRODUCTION_STEPS.length - 1;
              return (
                <React.Fragment key={step.key}>
                  <View style={styles.stepItem}>
                    <View style={[
                      styles.stepDot,
                      completed && styles.stepDotCompleted,
                      active && styles.stepDotActive,
                    ]}>
                      {completed && <Text style={styles.stepCheck}>\u2713</Text>}
                    </View>
                    <Text style={[
                      styles.stepLabel,
                      completed && styles.stepLabelCompleted,
                      active && styles.stepLabelActive,
                    ]} numberOfLines={1}>{step.label}</Text>
                  </View>
                  {!isLast && (
                    <View style={[
                      styles.stepLine,
                      completed && styles.stepLineCompleted,
                    ]} />
                  )}
                </React.Fragment>
              );
            })}
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
  phoneSeparator: {
    width: 1,
    height: 10,
    backgroundColor: colors.border,
    marginHorizontal: 6,
  },
  customerPhone: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    color: colors.textTertiary,
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
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  stepCheck: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700' as const,
    marginTop: -1,
  },
  stepLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '500' as const,
  },
  stepLabelCompleted: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: colors.primary,
  },
});
