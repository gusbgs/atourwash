import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import type { HugeIcon } from '@/utils/icons';

interface StatCardProps {
  icon: HugeIcon;
  iconColor: string;
  iconBgColor: string;
  value: string;
  label: string;
  subtitle?: string;
  subtitleColor?: string;
}

export function StatCard({ 
  icon: Icon, 
  iconColor, 
  iconBgColor, 
  value, 
  label, 
  subtitle,
  subtitleColor,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Icon size={20} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, subtitleColor ? { color: subtitleColor } : undefined]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
});
