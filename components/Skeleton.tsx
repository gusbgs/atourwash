import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function HomeSkeletonLoader() {
  return (
    <View style={styles.container}>
      <View style={styles.headerSkel}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Skeleton width={34} height={34} borderRadius={10} />
          <Skeleton width={120} height={22} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <Skeleton width={32} height={32} borderRadius={16} />
        </View>
      </View>
      <Skeleton width="100%" height={72} borderRadius={16} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <Skeleton width="48%" height={100} borderRadius={16} />
        <Skeleton width="48%" height={100} borderRadius={16} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <Skeleton width="48%" height={100} borderRadius={16} />
        <Skeleton width="48%" height={100} borderRadius={16} />
      </View>
      <Skeleton width={60} height={18} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={200} borderRadius={18} style={{ marginBottom: 24 }} />
      <Skeleton width={100} height={18} style={{ marginBottom: 12 }} />
      <Skeleton width="100%" height={80} borderRadius={16} style={{ marginBottom: 10 }} />
      <Skeleton width="100%" height={80} borderRadius={16} />
    </View>
  );
}

export function OrdersSkeletonLoader() {
  return (
    <View style={styles.container}>
      <Skeleton width={140} height={28} style={{ marginBottom: 6 }} />
      <Skeleton width={180} height={14} style={{ marginBottom: 20 }} />
      <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 16 }} />
      <Skeleton width="100%" height={44} borderRadius={12} style={{ marginBottom: 20 }} />
      {[1, 2, 3].map(i => (
        <Skeleton key={i} width="100%" height={90} borderRadius={16} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
}

export function ProductionSkeletonLoader() {
  return (
    <View style={styles.container}>
      <Skeleton width={120} height={28} style={{ marginBottom: 6 }} />
      <Skeleton width={180} height={14} style={{ marginBottom: 20 }} />
      <Skeleton width="100%" height={44} borderRadius={12} style={{ marginBottom: 20 }} />
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} width="100%" height={90} borderRadius={16} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
}

export function ProfileSkeletonLoader() {
  return (
    <View style={[styles.container, { alignItems: 'center' as const }]}>
      <Skeleton width={80} height={80} borderRadius={40} style={{ marginBottom: 12 }} />
      <Skeleton width={140} height={22} style={{ marginBottom: 6 }} />
      <Skeleton width={180} height={14} style={{ marginBottom: 8 }} />
      <Skeleton width={60} height={24} borderRadius={12} style={{ marginBottom: 28 }} />
      <Skeleton width="100%" height={120} borderRadius={16} style={{ marginBottom: 24 }} />
      <Skeleton width="100%" height={100} borderRadius={16} style={{ marginBottom: 20 }} />
      <Skeleton width="100%" height={160} borderRadius={16} style={{ marginBottom: 20 }} />
      <Skeleton width="100%" height={200} borderRadius={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
  container: {
    padding: 20,
  },
  headerSkel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});
