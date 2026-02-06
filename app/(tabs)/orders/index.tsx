import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { OrderCard } from '@/components/OrderCard';
import { PaymentStatus } from '@/types';
import { OrdersSkeletonLoader } from '@/components/Skeleton';

type FilterType = 'semua' | PaymentStatus;

const filters: { key: FilterType; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'belum_bayar', label: 'Belum Bayar' },
  { key: 'dp', label: 'DP' },
  { key: 'lunas', label: 'Lunas' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OrdersScreen() {
  const { orders } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterIndex, setActiveFilterIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getFilterCount = (filter: FilterType) => {
    if (filter === 'semua') return orders.length;
    return orders.filter(order => order.paymentStatus === filter).length;
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
    router.push(`/order-detail?id=${orderId}`);
  };

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
                {filterOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onPress={() => handleOrderPress(order.id)}
                  />
                ))}
                {filterOrders.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Tidak ada order ditemukan</Text>
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
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
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
    fontSize: 12,
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
