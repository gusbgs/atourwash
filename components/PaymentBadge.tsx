import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { PaymentStatus } from '@/types';

interface PaymentBadgeProps {
  status: PaymentStatus;
}

const getPaymentConfig = (status: PaymentStatus) => {
  switch (status) {
    case 'lunas':
      return { label: 'Lunas', color: colors.paymentLunas, bg: colors.paymentLunasBg };
    case 'dp':
      return { label: 'DP', color: colors.paymentDp, bg: colors.paymentDpBg };
    case 'belum_bayar':
      return { label: 'Belum Bayar', color: colors.paymentBelumBayar, bg: colors.paymentBelumBayarBg };
    default:
      return { label: 'Unknown', color: colors.textSecondary, bg: colors.surfaceSecondary };
  }
};

export function PaymentBadge({ status }: PaymentBadgeProps) {
  const config = getPaymentConfig(status);

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
});
