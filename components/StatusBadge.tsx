import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { OrderStatus } from '@/types';
import { getStatusLabel } from '@/utils/format';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusColors = () => {
    switch (status) {
      case 'dalam_proses':
        return { bg: colors.warningBg, text: colors.warning };
      case 'siap_diambil':
        return { bg: colors.successBg, text: colors.success };
      case 'selesai':
        return { bg: colors.infoBg, text: colors.info };
      case 'terlambat':
        return { bg: colors.errorBg, text: colors.error };
      default:
        return { bg: colors.surfaceSecondary, text: colors.textSecondary };
    }
  };

  const statusColors = getStatusColors();
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: statusColors.bg },
      isSmall && styles.badgeSmall,
    ]}>
      <Text style={[
        styles.text,
        { color: statusColors.text },
        isSmall && styles.textSmall,
      ]}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  textSmall: {
    fontSize: 10,
  },
});
