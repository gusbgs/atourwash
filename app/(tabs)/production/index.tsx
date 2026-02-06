import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { ProductionStatus } from '@/types';
import { ProductionSkeletonLoader } from '@/components/Skeleton';

type FilterType = 'semua' | ProductionStatus;

const filters: { key: FilterType; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'antrian', label: 'Antrian' },
  { key: 'dicuci', label: 'Dicuci' },
  { key: 'disetrika', label: 'Disetrika' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductionScreen() {
  const { orders } = useApp();
  const router = useRouter();
  const [activeFilterIndex, setActiveFilterIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getOrdersForFilter = (filter: FilterType) => {
    const filtered = orders.filter(order => order.status !== 'selesai');
    if (filter === 'semua') return filtered;
    return filtered.filter(order => order.productionStatus === filter);
  };

  const getFilterCount = (filter: FilterType) => {
    const filtered = orders.filter(order => order.status !== 'selesai');
    if (filter === 'semua') return filtered.length;
    return filtered.filter(order => order.productionStatus === filter).length;
  };

  const handleTabPress = (index: number) => {
    setActiveFilterIndex(index);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeFilterIndex && index >= 0 && index < filters.length) {
      setActiveFilterIndex(index);
    }
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/production-detail?id=${orderId}`);
  };

  const getStatusLineColor = (order: typeof orders[0]) => {
    if (order.status === 'terlambat') return colors.error;
    switch (order.productionStatus) {
      case 'antrian':
        return colors.warning;
      case 'dicuci':
        return colors.primary;
      case 'disetrika':
        return colors.info;
      default:
        return colors.success;
    }
  };

  const getProductionLabel = (status: ProductionStatus) => {
    switch (status) {
      case 'antrian':
        return 'Antrian';
      case 'dicuci':
        return 'Sedang Dicuci';
      case 'disetrika':
        return 'Sedang Disetrika';
      case 'selesai':
        return 'Selesai';
      default:
        return status;
    }
  };

  const renderOrderCard = (order: typeof orders[0]) => {
    return (
      <TouchableOpacity 
        key={order.id} 
        style={styles.card}
        onPress={() => handleOrderPress(order.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.statusLine, { backgroundColor: getStatusLineColor(order) }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardLeft}>
              <View style={styles.orderIdRow}>
                <Text style={styles.orderId}>{order.id}</Text>
                {order.status === 'terlambat' && (
                  <View style={styles.lateBadge}>
                    <Text style={styles.lateBadgeText}>Terlambat</Text>
                  </View>
                )}
              </View>
              <View style={styles.customerRow}>
                <User size={14} color={colors.textSecondary} />
                <Text style={styles.customerName}>{order.customerName}</Text>
              </View>
              <Text style={styles.itemDetails}>{order.itemDetails}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getStatusLineColor(order) }]} />
                <Text style={styles.statusText}>{getProductionLabel(order.productionStatus)}</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProductionSkeletonLoader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Produksi</Text>
        <Text style={styles.subtitle}>Antrian & status cucian</Text>
      </View>

      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          {filters.map((filter, index) => {
            const count = getFilterCount(filter.key);
            const isActive = activeFilterIndex === index;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => handleTabPress(index)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {filter.label}
                </Text>
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.pagerContainer}
      >
        {filters.map((filter) => {
          const filterOrders = getOrdersForFilter(filter.key);
          return (
            <View key={filter.key} style={styles.page}>
              <ScrollView
                contentContainerStyle={styles.ordersContent}
                showsVerticalScrollIndicator={false}
              >
                {filterOrders.map(order => renderOrderCard(order))}
                {filterOrders.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Tidak ada order dalam antrian</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabsWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '600' as const,
  },
  tabBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: colors.primary,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: colors.white,
  },
  pagerContainer: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  ordersContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
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
  cardContent: {
    padding: 16,
    paddingLeft: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  lateBadge: {
    backgroundColor: colors.errorBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lateBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.error,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemDetails: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
