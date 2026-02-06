import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Wallet, ClipboardList, AlertTriangle, TrendingUp, Users, Building2, Package, FileText, ChevronRight, Droplets, Bell, Grid3x3 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/utils/format';
import { ShiftBanner } from '@/components/ShiftBanner';
import { OrderCard } from '@/components/OrderCard';
import { HomeSkeletonLoader } from '@/components/Skeleton';

const favoriteMenuItems = [
  { icon: Users, label: 'Pelanggan', color: '#3B82F6', bgColor: '#EFF6FF' },
  { icon: Building2, label: 'Cabang', color: '#8B5CF6', bgColor: '#F5F3FF' },
  { icon: Wallet, label: 'Keuangan', color: '#23A174', bgColor: '#ECFDF5' },
  { icon: Package, label: 'Inventaris', color: '#F59E0B', bgColor: '#FFFBEB' },
  { icon: FileText, label: 'Laporan', color: '#EC4899', bgColor: '#FDF2F8' },
];

const lainnyaItem = { icon: Grid3x3, label: 'Lainnya', color: '#64748B', bgColor: '#F1F5F9' };

export default function HomeScreen() {
  const router = useRouter();
  const { orders, shiftInfo, dashboardStats, toggleShift } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const recentOrders = orders.slice(0, 3);

  const handleMenuPress = (label: string) => {
    switch (label) {
      case 'Lainnya':
        console.log('Open all menus');
        break;
      default:
        console.log('Menu pressed:', label);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.greenHeader}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerBarInner}>
              <View style={styles.headerLeft}>
                <View style={styles.logoMark}>
                  <Droplets size={18} color={colors.white} />
                </View>
                <Text style={styles.brandName}>AtourWash</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
        <HomeSkeletonLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.greenHeader}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerBarInner}>
            <View style={styles.headerLeft}>
              <View style={styles.logoMark}>
                <Droplets size={18} color={colors.white} />
              </View>
              <Text style={styles.brandName}>AtourWash</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerIconBtn}>
                <Bell size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.occupancyCard}>
            <View style={styles.occupancyTop}>
              <View style={styles.badgePill}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>Laundry POS</Text>
              </View>
            </View>
            <View style={styles.occupancyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.occupancyLabel}>Omzet Hari Ini</Text>
                <Text style={styles.occupancyValue}>{formatCurrency(dashboardStats.todayRevenue)}</Text>
              </View>
              <View style={styles.changeChip}>
                <TrendingUp size={12} color={colors.white} />
                <Text style={styles.changeText}>+{dashboardStats.revenueChange}%</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ShiftBanner
          isActive={shiftInfo.isActive}
          startTime={shiftInfo.startTime}
          onToggle={toggleShift}
        />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: colors.infoBg }]}>
              <ClipboardList size={18} color={colors.info} />
            </View>
            <Text style={styles.statValue}>{dashboardStats.activeOrders}</Text>
            <Text style={styles.statLabel}>Order Aktif</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: colors.errorBg }]}>
              <AlertTriangle size={18} color={colors.error} />
            </View>
            <Text style={styles.statValue}>{dashboardStats.overdueOrders}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: colors.successBg }]}>
              <TrendingUp size={18} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{dashboardStats.completedOrders}</Text>
            <Text style={styles.statLabel}>Selesai</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          <View style={styles.menuCard}>
            <View style={styles.menuGrid}>
              {favoriteMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item.label)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.bgColor }]}>
                    <item.icon size={22} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel} numberOfLines={1}>{item.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuPress('Lainnya')}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconBox, { backgroundColor: lainnyaItem.bgColor }]}>
                  <lainnyaItem.icon size={22} color={lainnyaItem.color} />
                </View>
                <Text style={styles.menuLabel} numberOfLines={1}>{lainnyaItem.label}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Terbaru</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/orders')}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {recentOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  greenHeader: {
    backgroundColor: colors.primary,
    paddingBottom: 0,
  },
  headerBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  occupancyCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  occupancyTop: {
    marginBottom: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start' as const,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.white,
  },
  occupancyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  occupancyLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  occupancyValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.white,
  },
  changeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.white,
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  menuSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuItem: {
    width: '33.33%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  menuIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.text,
    textAlign: 'center' as const,
  },
  recentSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
});
