import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, ClipboardList, Clock, Wallet, Check, X, Settings } from '@/utils/icons';
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
      <View style={styles.container}>
        <View style={styles.appbarBg}>
          <SafeAreaView edges={['top']} style={styles.appbarSafe}>
            <View style={styles.appbar}>
              <Text style={styles.appbarTitle}>Pesanan</Text>
              <View style={styles.appbarRight}>
                <Settings size={20} color={colors.white} />
              </View>
            </View>
          </SafeAreaView>
        </View>
        <OrdersSkeletonLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.appbarBg}>
        <SafeAreaView edges={['top']} style={styles.appbarSafe}>
          <View style={styles.appbar}>
            <View style={styles.appbarTitleSection}>
              <Text style={styles.appbarTitle}>Pesanan</Text>
              <Text style={styles.appbarSubtitle}>Kelola semua pesanan</Text>
            </View>
            <TouchableOpacity style={styles.appbarIconBtn} activeOpacity={0.7}>
              <Settings size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
                <IconComp size={14} color={isActive ? colors.primary : colors.textTertiary} />
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                  numberOfLines={1}
                >
                  {filter.label}
                </Text>
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              width: tabWidth - 16,
              transform: [{ translateX: Animated.add(indicatorTranslateX, 8) }],
            },
          ]}
        />
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari order atau pelanggan..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <X size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appbarBg: {
    backgroundColor: colors.primary,
  },
  appbarSafe: {
    backgroundColor: colors.primary,
  },
  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  appbarTitleSection: {
    flex: 1,
  },
  appbarTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.white,
  },
  appbarSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  appbarIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appbarRight: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 13,
    paddingHorizontal: 2,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textTertiary,
    flexShrink: 1,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  tabBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 5,
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
    color: colors.textTertiary,
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
  searchWrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 10,
    fontSize: 14,
    color: colors.text,
  },
  pagerContainer: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  ordersContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
