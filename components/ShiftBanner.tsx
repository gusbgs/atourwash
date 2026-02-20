import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, LogOut } from '@/utils/icons';
import { colors } from '@/constants/colors';

interface ShiftBannerProps {
  isActive: boolean;
  startTime: string;
  onToggle: () => void;
}

export function ShiftBanner({ isActive, startTime, onToggle }: ShiftBannerProps) {
  return (
    <View style={[styles.banner, !isActive && styles.bannerInactive]}>
      <View style={styles.left}>
        <View style={[styles.iconContainer, !isActive && styles.iconContainerInactive]}>
          <Clock size={20} color={isActive ? colors.primary : colors.textSecondary} />
        </View>
        <View>
          <Text style={[styles.title, !isActive && styles.titleInactive]}>
            {isActive ? 'Shift Aktif' : 'Shift Tidak Aktif'}
          </Text>
          <Text style={styles.subtitle}>
            {isActive ? `Mulai ${startTime}` : 'Klik untuk memulai shift'}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.button, !isActive && styles.buttonStart]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <LogOut size={16} color={isActive ? colors.textSecondary : colors.white} />
        <Text style={[styles.buttonText, !isActive && styles.buttonTextStart]}>
          {isActive ? 'Tutup' : 'Mulai'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primaryBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerInactive: {
    backgroundColor: colors.surfaceSecondary,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerInactive: {
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  titleInactive: {
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  buttonStart: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  buttonTextStart: {
    color: colors.white,
  },
});
