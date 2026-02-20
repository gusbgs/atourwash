import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Polyline, Line, Circle as SvgCircle, Text as SvgText, Path, G } from 'react-native-svg';
import { Wallet, TrendingUp, Users, Building2, Package, FileText, ChevronRight, Droplets, Bell, Grid3x3, ChevronDown, MapPin, Check, Clock, Loader, PackageCheck } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency } from '@/utils/format';
import { OrderCard } from '@/components/OrderCard';
import { HomeSkeletonLoader } from '@/components/Skeleton';
import { mockBranches, mockWeeklyRevenue, mockMonthlyRevenue, mockYearlyRevenue, mockServiceDistribution } from '@/mocks/data';

const MENU_COLOR = colors.primary;
const MENU_BG = colors.primaryBg;
const SCREEN_WIDTH = Dimensions.get('window').width;

const favoriteMenuItems = [
  { icon: Users, label: 'Pelanggan', color: MENU_COLOR, bgColor: MENU_BG, route: '/pelanggan' },
  { icon: Building2, label: 'Cabang', color: MENU_COLOR, bgColor: MENU_BG, route: '/cabang' },
  { icon: Wallet, label: 'Keuangan', color: MENU_COLOR, bgColor: MENU_BG, route: '/keuangan' },
  { icon: Package, label: 'Inventaris', color: MENU_COLOR, bgColor: MENU_BG, route: '/inventaris' },
  { icon: FileText, label: 'Laporan', color: MENU_COLOR, bgColor: MENU_BG, route: '/laporan' },
];

const lainnyaItem = { icon: Grid3x3, label: 'Lainnya', color: MENU_COLOR, bgColor: MENU_BG };

type ChartPeriod = 'weekly' | 'monthly' | 'yearly';

interface RevenueDataPoint {
  label: string;
  value: number;
}

function formatShortCurrency(val: number): string {
  if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}M`;
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
  return `${val}`;
}

function LineChart({ data }: { data: RevenueDataPoint[] }) {
  const chartW = SCREEN_WIDTH - 80;
  const chartH = 140;
  const padL = 45;
  const padR = 15;
  const padT = 15;
  const padB = 30;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const maxVal = Math.max(...data.map(d => d.value));
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: padL + (innerW / Math.max(data.length - 1, 1)) * i,
    y: padT + innerH - ((d.value - minVal) / range) * innerH,
  }));

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const gridLines = [0, 0.5, 1].map(frac => ({
    y: padT + innerH - frac * innerH,
    label: formatShortCurrency(minVal + frac * range),
  }));

  return (
    <Svg width={chartW} height={chartH}>
      {gridLines.map((g, i) => (
        <G key={i}>
          <Line x1={padL} y1={g.y} x2={chartW - padR} y2={g.y} stroke={colors.borderLight} strokeWidth={1} />
          <SvgText x={padL - 6} y={g.y + 4} fontSize={9} fill={colors.textTertiary} textAnchor="end">{g.label}</SvgText>
        </G>
      ))}
      <Polyline points={polylinePoints} fill="none" stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <SvgCircle key={i} cx={p.x} cy={p.y} r={4} fill={colors.white} stroke={colors.primary} strokeWidth={2.5} />
      ))}
      {data.map((d, i) => (
        <SvgText key={i} x={points[i].x} y={chartH - 6} fontSize={10} fill={colors.textSecondary} textAnchor="middle">{d.label}</SvgText>
      ))}
    </Svg>
  );
}

function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 54;
  const total = data.reduce((s, d) => s + d.value, 0);

  let startAngle = -90;
  const slices = data.map(d => {
    const angle = (d.value / total) * 360;
    const start = startAngle;
    startAngle += angle;
    return { ...d, startAngle: start, angle };
  });

  const describeArc = (sa: number, ea: number) => {
    const s = (sa * Math.PI) / 180;
    const e = (ea * Math.PI) / 180;
    const largeArc = ea - sa > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <View style={pieStyles.container}>
      <Svg width={size} height={size}>
        {slices.map((sl, i) => (
          <Path key={i} d={describeArc(sl.startAngle, sl.startAngle + sl.angle)} fill={sl.color} />
        ))}
        <SvgCircle cx={cx} cy={cy} r={28} fill={colors.white} />
        <SvgText x={cx} y={cy + 5} fontSize={14} fontWeight="bold" fill={colors.text} textAnchor="middle">{total}</SvgText>
        <SvgText x={cx} y={cy + 17} fontSize={8} fill={colors.textSecondary} textAnchor="middle">Order</SvgText>
      </Svg>
      <View style={pieStyles.legend}>
        {data.map((d, i) => (
          <View key={i} style={pieStyles.legendRow}>
            <View style={[pieStyles.legendDot, { backgroundColor: d.color }]} />
            <Text style={pieStyles.legendLabel} numberOfLines={1}>{d.label}</Text>
            <Text style={pieStyles.legendValue}>{d.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const pieStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legend: { flex: 1, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 12, color: colors.text },
  legendValue: { fontSize: 12, fontWeight: '600' as const, color: colors.textSecondary },
});

export default function HomeScreen() {
  const router = useRouter();
  const { orders, dashboardStats } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(mockBranches[0]);
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('weekly');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const recentOrders = orders.slice(0, 3);

  const antrianCount = useMemo(() => orders.filter(o => o.productionStatus === 'antrian').length, [orders]);
  const diprosesCount = useMemo(() => orders.filter(o => o.productionStatus === 'diproses').length, [orders]);
  const siapDiambilCount = useMemo(() => orders.filter(o => o.productionStatus === 'siap_diambil').length, [orders]);

  const chartData = useMemo(() => {
    if (chartPeriod === 'weekly') return mockWeeklyRevenue;
    if (chartPeriod === 'monthly') return mockMonthlyRevenue;
    return mockYearlyRevenue;
  }, [chartPeriod]);

  const handleMenuPress = useCallback((item: { label: string; route?: string }) => {
    if (item.route) {
      router.push(item.route as any);
    } else if (item.label === 'Lainnya') {
      router.push('/lainnya' as any);
    }
  }, [router]);

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

          <TouchableOpacity
            style={styles.branchDropdown}
            onPress={() => setBranchModalVisible(true)}
            activeOpacity={0.7}
          >
            <MapPin size={14} color={colors.white} />
            <Text style={styles.branchDropdownText} numberOfLines={1}>{selectedBranch.name}</Text>
            <ChevronDown size={16} color={colors.white} />
          </TouchableOpacity>

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
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FFF3E0' }]}>
              <Clock size={18} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{antrianCount}</Text>
            <Text style={styles.statLabel}>Antrian</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: colors.primaryBg }]}>
              <Loader size={18} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{diprosesCount}</Text>
            <Text style={styles.statLabel}>Diproses</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: colors.successBg }]}>
              <PackageCheck size={18} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{siapDiambilCount}</Text>
            <Text style={styles.statLabel}>Siap Diambil</Text>
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
                  onPress={() => handleMenuPress(item)}
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
                onPress={() => handleMenuPress({ label: 'Lainnya', route: '/lainnya' })}
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

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Trend Pemasukan</Text>
          <View style={styles.chartCard}>
            <View style={styles.periodTabs}>
              {([
                { key: 'weekly' as ChartPeriod, label: 'Mingguan' },
                { key: 'monthly' as ChartPeriod, label: 'Bulanan' },
                { key: 'yearly' as ChartPeriod, label: 'Tahunan' },
              ]).map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.periodTab, chartPeriod === tab.key && styles.periodTabActive]}
                  onPress={() => setChartPeriod(tab.key)}
                >
                  <Text style={[styles.periodTabText, chartPeriod === tab.key && styles.periodTabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.chartContainer}>
              <LineChart data={chartData} />
            </View>
          </View>
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Order Berdasarkan Layanan</Text>
          <View style={styles.chartCard}>
            <PieChart data={mockServiceDistribution} />
          </View>
        </View>

        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Terbaru</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/orders' as any)}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {recentOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={branchModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBranchModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setBranchModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Cabang</Text>
            {mockBranches.map(branch => (
              <TouchableOpacity
                key={branch.id}
                style={[styles.branchOption, selectedBranch.id === branch.id && styles.branchOptionActive]}
                onPress={() => {
                  setSelectedBranch(branch);
                  setBranchModalVisible(false);
                }}
              >
                <View style={styles.branchOptionLeft}>
                  <View style={[styles.branchIcon, selectedBranch.id === branch.id && styles.branchIconActive]}>
                    <Building2 size={16} color={selectedBranch.id === branch.id ? colors.white : colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.branchOptionName, selectedBranch.id === branch.id && styles.branchOptionNameActive]}>{branch.name}</Text>
                    <Text style={styles.branchOptionAddr}>{branch.address}</Text>
                  </View>
                </View>
                {selectedBranch.id === branch.id && (
                  <Check size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 8,
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
  branchDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start' as const,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  branchDropdownText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.white,
    maxWidth: 180,
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
    marginBottom: 16,
    marginTop: 4,
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
  chartSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  periodTabText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  periodTabTextActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  chartContainer: {
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  branchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  branchOptionActive: {
    backgroundColor: colors.primaryBg,
  },
  branchOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  branchIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchIconActive: {
    backgroundColor: colors.primary,
  },
  branchOptionName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  branchOptionNameActive: {
    color: colors.primary,
  },
  branchOptionAddr: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
