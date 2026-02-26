import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, ClipboardList, Clock, Wallet, Check } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { OrderCard } from '@/components/OrderCard';
import { PaymentStatus } from '@/types';
import { OrdersSkeletonLoader } from '@/components/Skeleton';

type FilterType = 'semua' | PaymentStatus;

const filters: { key: FilterType; label: string; icon: React.FC<{ size?: number; color?: string }> }[] = [
  { key: 'semua', label: 'Semua', icon: ClipboardList },
  { key: 'belum_bayar', label: 'Belum Bayar', icon: Clock },
  { key: 'dp', label: 'DP', icon: Wallet },
  { key: 'lunas', label: 'Lunas', icon: Check },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OrdersScreen() {
  const { orders } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterIndex, setActiveFilterIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const animateIndicator = useCallback((index: number) => {
    Animated.spring(indicatorAnim, {
      toValue: index,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [indicatorAnim]);

  const getFilterCount = (filter: FilterType) => {
    if (filter === 'semua') return orders.length;
    return orders.filter(order => order.paymentStatus === filter).length;
  };

  const handleTabPress = (index: number) => {
    setActiveFilterIndex(index);
    animateIndicator(index);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeFilterIndex && index >= 0 && index < filters.length) {
      setActiveFilterIndex(index);
      animateIndicator(index);
    }
  };

  const getOrdersForFilter = (filter: FilterType) => {
    let filtered = orders;
    if (filter !== 'semua') {
      filtered = filtered.filter(order => order.paymentStatus === filter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        order =>
          order.id.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/order-detail?id=${orderId}` as any);
  };

  const tabWidth = SCREEN_WIDTH / filters.length;
  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: filters.map((_, i) => i),
    outputRange: filters.map((_, i) => i * tabWidth),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <OrdersSkeletonLoader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Pesanan</Text>
        <Text style={styles.subtitle}>Kelola semua pesanan</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari order atau pelanggan..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.tabRow}>
        {filters.map((filter, index) => {
          const count = getFilterCount(filter.key);
          const isActive = activeFilterIndex === index;
          const IconComp = filter.icon;
          return (
            <TouchableOpacity
              key={filter.key}
              style={styles.tabItem}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <IconComp size={16} color={isActive ? colors.primary : colors.textSecondary} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {filter.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              width: tabWidth - 24,
              transform: [{ translateX: Animated.add(indicatorTranslateX, 12) }],
            },
          ]}
        />
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
                {filterOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onPress={() => handleOrderPress(order.id)}
                  />
                ))}
                {filterOrders.length === 0 && (
                  <View style={styles.emptyState}>
                    <ClipboardList size={48} color={colors.border} />
                    <Text style={styles.emptyTitle}>Tidak ada pesanan</Text>
                    <Text style={styles.emptyText}>Belum ada order untuk kategori ini</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative' as const,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  tabBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: colors.primaryBg,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: colors.primary,
  },
  tabIndicator: {
    position: 'absolute' as const,
    bottom: 0,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
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
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
