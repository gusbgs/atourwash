import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Animated, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, ClipboardList, Clock, Wallet, Check, X, Settings, FilterHorizontal, Calendar } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { OrderCard } from '@/components/OrderCard';
import { PaymentStatus } from '@/types';
import { OrdersSkeletonLoader } from '@/components/Skeleton';
import { OrderStatus } from '@/types';

type SortOption = 'terbaru' | 'terlama' | 'harga_tinggi' | 'harga_rendah';

const serviceTypes = ['Semua', 'Cuci Reguler', 'Cuci Express', 'Dry Clean', 'Setrika Saja'];
const statusOptions: { key: OrderStatus | 'semua'; label: string }[] = [
  { key: 'semua', label: 'Semua Status' },
  { key: 'dalam_proses', label: 'Dalam Proses' },
  { key: 'siap_diambil', label: 'Siap Diambil' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'terlambat', label: 'Terlambat' },
];
const sortOptions: { key: SortOption; label: string }[] = [
  { key: 'terbaru', label: 'Terbaru' },
  { key: 'terlama', label: 'Terlama' },
  { key: 'harga_tinggi', label: 'Harga Tertinggi' },
  { key: 'harga_rendah', label: 'Harga Terendah' },
];

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
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filterService, setFilterService] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'semua'>('semua');
  const [filterSort, setFilterSort] = useState<SortOption>('terbaru');
  const [tempService, setTempService] = useState('Semua');
  const [tempStatus, setTempStatus] = useState<OrderStatus | 'semua'>('semua');
  const [tempSort, setTempSort] = useState<SortOption>('terbaru');
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const activeFilterCount = (filterService !== 'Semua' ? 1 : 0) + (filterStatus !== 'semua' ? 1 : 0) + (filterSort !== 'terbaru' ? 1 : 0);

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

  const openFilterSheet = useCallback(() => {
    setTempService(filterService);
    setTempStatus(filterStatus);
    setTempSort(filterSort);
    setShowFilterSheet(true);
    Animated.spring(sheetAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [filterService, filterStatus, filterSort, sheetAnim]);

  const closeFilterSheet = useCallback(() => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowFilterSheet(false));
  }, [sheetAnim]);

  const applyFilters = useCallback(() => {
    setFilterService(tempService);
    setFilterStatus(tempStatus);
    setFilterSort(tempSort);
    closeFilterSheet();
  }, [tempService, tempStatus, tempSort, closeFilterSheet]);

  const resetFilters = useCallback(() => {
    setTempService('Semua');
    setTempStatus('semua');
    setTempSort('terbaru');
  }, []);

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
    if (filterService !== 'Semua') {
      filtered = filtered.filter(order => order.serviceType === filterService);
    }
    if (filterStatus !== 'semua') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }
    switch (filterSort) {
      case 'terbaru':
        filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'terlama':
        filtered = [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'harga_tinggi':
        filtered = [...filtered].sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'harga_rendah':
        filtered = [...filtered].sort((a, b) => a.totalPrice - b.totalPrice);
        break;
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
        <View style={styles.searchRow}>
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
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7} onPress={openFilterSheet}>
            <FilterHorizontal size={20} color={colors.primary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
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
                {filterOrders.map((order, idx) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onPress={() => handleOrderPress(order.id)}
                    isLast={idx === filterOrders.length - 1}
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
      <Modal
        visible={showFilterSheet}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeFilterSheet}
      >
        <Pressable style={styles.sheetOverlay} onPress={closeFilterSheet}>
          <Animated.View
            style={[
              styles.sheetOverlayBg,
              {
                opacity: sheetAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          />
        </Pressable>
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [
                {
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter Pesanan</Text>
            <TouchableOpacity onPress={resetFilters} activeOpacity={0.7}>
              <Text style={styles.sheetReset}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetScroll}>
            <Text style={styles.sheetSectionTitle}>Jenis Layanan</Text>
            <View style={styles.chipRow}>
              {serviceTypes.map((svc) => (
                <TouchableOpacity
                  key={svc}
                  style={[styles.chip, tempService === svc && styles.chipActive]}
                  onPress={() => setTempService(svc)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, tempService === svc && styles.chipTextActive]}>{svc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetSectionTitle}>Status Order</Text>
            <View style={styles.chipRow}>
              {statusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.chip, tempStatus === opt.key && styles.chipActive]}
                  onPress={() => setTempStatus(opt.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, tempStatus === opt.key && styles.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetSectionTitle}>Urutkan</Text>
            <View style={styles.sortList}>
              {sortOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.sortItem}
                  onPress={() => setTempSort(opt.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sortRadioOuter}>
                    {tempSort === opt.key && <View style={styles.sortRadioInner} />}
                  </View>
                  <Text style={[styles.sortText, tempSort === opt.key && styles.sortTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.sheetBtnCancel} onPress={closeFilterSheet} activeOpacity={0.7}>
              <Text style={styles.sheetBtnCancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetBtnApply} onPress={applyFilters} activeOpacity={0.7}>
              <Text style={styles.sheetBtnApplyText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
    position: 'relative' as const,
  },
  filterBadge: {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.white,
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
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 100,
    gap: 0,
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
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%' as const,
    paddingBottom: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center' as const,
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
  },
  sheetReset: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  sheetScroll: {
    paddingHorizontal: 20,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginTop: 18,
    marginBottom: 10,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  sortList: {
    gap: 4,
    marginBottom: 10,
  },
  sortItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 11,
    gap: 12,
  },
  sortRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  sortRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  sortText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  sortTextActive: {
    color: colors.text,
    fontWeight: '600' as const,
  },
  sheetFooter: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sheetBtnCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center' as const,
  },
  sheetBtnCancelText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  sheetBtnApply: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center' as const,
  },
  sheetBtnApplyText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.white,
  },
});
