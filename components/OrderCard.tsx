import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Clock, ChevronRight, Phone, Calendar } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { Order, ProductionStatus } from '@/types';
import { PaymentBadge } from './PaymentBadge';
import { formatFullCurrency, formatDate } from '@/utils/format';

const PRODUCTION_STEPS: { key: ProductionStatus; label: string; color: string; bgColor: string }[] = [
  { key: 'antrian', label: 'Diterima', color: '#3B82F6', bgColor: '#DBEAFE' },
  { key: 'diproses', label: 'Proses', color: '#F59E0B', bgColor: '#FEF3C7' },
  { key: 'siap_diambil', label: 'Siap Diambil', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { key: 'selesai', label: 'Selesai', color: '#10B981', bgColor: '#D1FAE5' },
];

function getStepIndex(status: ProductionStatus): number {
  const idx = PRODUCTION_STEPS.findIndex(s => s.key === status);
  return idx >= 0 ? idx + 1 : 0;
}

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  isLast?: boolean;
}

function StepCheckIcon({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <Text style={{ fontSize: size - 1, color, fontWeight: '800' as const, marginTop: -1 }}>
      {'\u2713'}
    </Text>
  );
}

export function OrderCard({ order, onPress, isLast = false }: OrderCardProps) {
  const stepIdx = getStepIndex(order.productionStatus);

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
          <View style={styles.stepsContainer}>
            <View style={styles.stepsDotsRow}>
              {PRODUCTION_STEPS.map((step, i) => {
                const completed = stepIdx > i;
                const active = stepIdx === i + 1;
                const isLastStep = i === PRODUCTION_STEPS.length - 1;
                const lineCompleted = stepIdx > i + 1;
                return (
                  <React.Fragment key={step.key}>
                    <View style={[
                      styles.stepDot,
                      completed && { backgroundColor: step.color, borderColor: step.color },
                      active && { borderColor: step.color, backgroundColor: step.bgColor },
                    ]}>
                      {completed && <StepCheckIcon color={colors.white} size={13} />}
                      {active && <StepCheckIcon color={step.color} size={13} />}
                    </View>
                    {!isLastStep && (
                      <View style={[
                        styles.stepLine,
                        lineCompleted && { backgroundColor: PRODUCTION_STEPS[i + 1].color },
                      ]} />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
            <View style={styles.stepsLabelsRow}>
              {PRODUCTION_STEPS.map((step, i) => {
                const completed = stepIdx > i;
                const active = stepIdx === i + 1;
                return (
                  <Text
                    key={step.key}
                    style={[
                      styles.stepLabel,
                      (completed || active) && { color: step.color, fontWeight: '600' as const },
                    ]}
                    numberOfLines={1}
                  >
                    {step.label}
                  </Text>
                );
              })}
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
  stepsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  stepsDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stepsLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    flex: 1,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 3,
  },
});
