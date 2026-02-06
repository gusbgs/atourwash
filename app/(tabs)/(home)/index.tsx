import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Wallet, ClipboardList, AlertTriangle, TrendingUp, Users, Building2, Package, FileText, BarChart3, Settings, ChevronRight, Droplets } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/utils/format';
import { ShiftBanner } from '@/components/ShiftBanner';
import { OrderCard } from '@/components/OrderCard';

const menuItems = [
  { icon: Users, label: 'Pelanggan', color: '#3B82F6', bgColor: '#EFF6FF' },
  { icon: Building2, label: 'Cabang', color: '#8B5CF6', bgColor: '#F5F3FF' },
  { icon: Wallet, label: 'Keuangan', color: '#23A174', bgColor: '#ECFDF5' },
  { icon: Package, label: 'Inventaris', color: '#F59E0B', bgColor: '#FFFBEB' },
  { icon: FileText, label: 'Laporan', color: '#EC4899', bgColor: '#FDF2F8' },
  { icon: BarChart3, label: 'Statistik', color: '#06B6D4', bgColor: '#ECFEFF' },
  { icon: ClipboardList, label: 'Orders', color: '#6366F1', bgColor: '#EEF2FF' },
  { icon: TrendingUp, label: 'Produksi', color: '#14B8A6', bgColor: '#F0FDFA' },
  { icon: Settings, label: 'Pengaturan', color: '#64748B', bgColor: '#F8FAFC' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { orders, shiftInfo, dashboardStats, toggleShift } = useApp();

  const recentOrders = orders.slice(0, 3);

  const handleMenuPress = (label: string) => {
    switch (label) {
      case 'Orders':
        router.push('/orders');
        break;
      case 'Produksi':
        router.push('/production');
        break;
      case 'Pengaturan':
        router.push('/profile');
        break;
      default:
        console.log('Menu pressed:', label);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={styles.logoMark}>
            <Droplets size={18} color={colors.white} />
          </View>
          <Text style={styles.brandName}>AtourWash</Text>
        </View>
        <View style={styles.badgePill}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Laundry POS</Text>
        </View>
      </View>

      <ShiftBanner
        isActive={shiftInfo.isActive}
        startTime={shiftInfo.startTime}
        onToggle={toggleShift}
      />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: colors.primaryBg }]}>
            <Wallet size={18} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{formatCurrency(dashboardStats.todayRevenue)}</Text>
          <Text style={styles.statLabel}>Omzet Hari Ini</Text>
          <Text style={styles.statChange}>+{dashboardStats.revenueChange}%</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBox, { backgroundColor: colors.infoBg }]}>
            <ClipboardList size={18} color={colors.info} />
          </View>
          <Text style={styles.statValue}>{dashboardStats.activeOrders}</Text>
          <Text style={styles.statLabel}>Order Aktif</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
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
            {menuItems.map((item) => (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
    fontSize: 12,
    color: colors.textSecondary,
  },
  statChange: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.success,
    marginTop: 4,
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
