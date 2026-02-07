import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, ChevronRight, SlidersHorizontal, X, Package } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { ProductionStatus } from '@/types';
import { ProductionSkeletonLoader } from '@/components/Skeleton';
import { formatFullCurrency } from '@/utils/format';

type FilterType = 'semua' | ProductionStatus;

interface FilterOption {
  key: FilterType;
  label: string;
  icon: string;
  color: string;
}

const filterOptions: FilterOption[] = [
  { key: 'semua', label: 'Semua', icon: '📋', color: colors.text },
  { key: 'antrian', label: 'Antrian', icon: '⏳', color: colors.warning },
  { key: 'diproses', label: 'Diproses', icon: '🔄', color: colors.primary },
  { key: 'siap_diambil', label: 'Siap Diambil', icon: '✅', color: colors.success },
];

export default function ProductionScreen() {
  const { orders } = useApp();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('semua');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const openSheet = useCallback(() => {
    setShowFilterSheet(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, backdropAnim]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setShowFilterSheet(false));
  }, [slideAnim, backdropAnim]);

  const selectFilter = useCallback((key: FilterType) => {
    setActiveFilter(key);
    closeSheet();
  }, [closeSheet]);

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'semua') return order.productionStatus !== 'selesai';
    return order.productionStatus === activeFilter;
  });

  const getFilterCount = (filter: FilterType) => {
    if (filter === 'semua') return orders.filter(o => o.productionStatus !== 'selesai').length;
    return orders.filter(o => o.productionStatus === filter).length;
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/production-detail?id=${orderId}`);
  };

  const getStatusColor = (status: ProductionStatus) => {
    switch (status) {
      case 'antrian': return colors.warning;
      case 'diproses': return colors.primary;
      case 'siap_diambil': return colors.success;
      default: return colors.info;
    }
  };

  const getStatusLabel = (status: ProductionStatus) => {
    switch (status) {
      case 'antrian': return 'Antrian';
      case 'diproses': return 'Diproses';
      case 'siap_diambil': return 'Siap Diambil';
      case 'selesai': return 'Selesai';
      default: return status;
    }
  };

  const activeFilterLabel = filterOptions.find(f => f.key === activeFilter)?.label ?? 'Semua';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProductionSkeletonLoader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <Text style={styles.appBarTitle}>Produksi</Text>
          <Text style={styles.appBarSubtitle}>Antrian & status cucian</Text>
        </View>
        <TouchableOpacity style={[styles.filterButton, activeFilter !== 'semua' && styles.filterButtonActive]} onPress={openSheet} activeOpacity={0.7}>
          <SlidersHorizontal size={18} color={activeFilter !== 'semua' ? colors.white : colors.textSecondary} />
          {activeFilter !== 'semua' && (
            <View style={styles.filterActiveDot} />
          )}
        </TouchableOpacity>
      </View>

      {activeFilter !== 'semua' && (
        <View style={styles.activeFilterBar}>
          <View style={[styles.activeFilterChip, { backgroundColor: filterOptions.find(f => f.key === activeFilter)?.color + '15' }]}>
            <Text style={{ fontSize: 14 }}>{filterOptions.find(f => f.key === activeFilter)?.icon}</Text>
            <Text style={[styles.activeFilterText, { color: filterOptions.find(f => f.key === activeFilter)?.color }]}>
              {activeFilterLabel}
            </Text>
            <Text style={[styles.activeFilterCount, { color: filterOptions.find(f => f.key === activeFilter)?.color }]}>
              {getFilterCount(activeFilter)}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setActiveFilter('semua')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statsRow}>
        {filterOptions.filter(f => f.key !== 'semua').map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.statCard, activeFilter === f.key && { borderColor: f.color }]}
            onPress={() => setActiveFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.statIcon}>{f.icon}</Text>
            <Text style={[styles.statCount, { color: f.color }]}>{getFilterCount(f.key)}</Text>
            <Text style={styles.statLabel}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.ordersContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.map(order => {
          const statusColor = order.status === 'terlambat' ? colors.error : getStatusColor(order.productionStatus);
          return (
            <TouchableOpacity
              key={order.id}
              style={styles.card}
              onPress={() => handleOrderPress(order.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.statusLine, { backgroundColor: statusColor }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTopLeft}>
                    <Text style={styles.orderId}>{order.id}</Text>
                    {order.status === 'terlambat' && (
                      <View style={styles.lateBadge}>
                        <Text style={styles.lateBadgeText}>Terlambat</Text>
                      </View>
                    )}
                  </View>
                  <ChevronRight size={18} color={colors.textTertiary} />
                </View>
                <View style={styles.cardMiddle}>
                  <View style={styles.infoRow}>
                    <User size={13} color={colors.textSecondary} />
                    <Text style={styles.customerName}>{order.customerName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Package size={13} color={colors.textSecondary} />
                    <Text style={styles.itemDetails} numberOfLines={1}>{order.itemDetails}</Text>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {getStatusLabel(order.productionStatus)}
                    </Text>
                  </View>
                  <Text style={styles.priceText}>{formatFullCurrency(order.totalPrice)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {filteredOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Tidak ada pesanan</Text>
            <Text style={styles.emptyText}>Belum ada pesanan untuk filter ini</Text>
          </View>
        )}
      </ScrollView>

      {showFilterSheet && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          </Animated.View>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter Status</Text>
            <Text style={styles.sheetSubtitle}>Pilih status produksi</Text>
            <View style={styles.sheetOptions}>
              {filterOptions.map(option => {
                const isActive = activeFilter === option.key;
                const count = getFilterCount(option.key);
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.sheetOption, isActive && { backgroundColor: option.color + '12', borderColor: option.color }]}
                    onPress={() => selectFilter(option.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sheetOptionIcon}>{option.icon}</Text>
                    <View style={styles.sheetOptionInfo}>
                      <Text style={[styles.sheetOptionLabel, isActive && { color: option.color, fontWeight: '600' as const }]}>
                        {option.label}
                      </Text>
                    </View>
                    <View style={[styles.sheetOptionCount, isActive && { backgroundColor: option.color }]}>
                      <Text style={[styles.sheetOptionCountText, isActive && { color: colors.white }]}>{count}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  appBarLeft: {
    flex: 1,
  },
  appBarTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.text,
  },
  appBarSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterActiveDot: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  activeFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeFilterText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  activeFilterCount: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statCount: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500' as const,
  },
  ordersContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 10,
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
  cardContent: {
    padding: 14,
    paddingLeft: 18,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  lateBadge: {
    backgroundColor: colors.errorBg,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lateBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.error,
  },
  cardMiddle: {
    gap: 4,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemDetails: {
    fontSize: 12,
    color: colors.textTertiary,
    flex: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  sheetOptions: {
    gap: 8,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  sheetOptionIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  sheetOptionInfo: {
    flex: 1,
  },
  sheetOptionLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  sheetOptionCount: {
    backgroundColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 32,
    alignItems: 'center',
  },
  sheetOptionCountText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textSecondary,
  },
});
