import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, ChevronRight, Package } from '@/utils/icons';
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
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);


  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'semua') return order.productionStatus !== 'selesai';
    return order.productionStatus === activeFilter;
  });

  const getFilterCount = (filter: FilterType) => {
    if (filter === 'semua') return orders.filter(o => o.productionStatus !== 'selesai').length;
    return orders.filter(o => o.productionStatus === filter).length;
  };

  const handleOrderPress = (orderId: string) => {
    router.push(`/production-detail?id=${orderId}` as any);
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
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
        {filterOptions.map((f) => {
          const isActive = activeFilter === f.key;
          const count = getFilterCount(f.key);
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {f.label}
              </Text>
              {count > 0 && (
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
  tabBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 20,
    paddingHorizontal: 14,
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontWeight: '600' as const,
    color: colors.white,
  },
  tabBadge: {
    backgroundColor: colors.border,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.textTertiary,
  },
  tabBadgeTextActive: {
    color: colors.white,
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

});
