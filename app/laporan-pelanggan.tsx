import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, TrendingUp, Users, Star, Crown } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { formatFullCurrency } from '@/utils/format';

const customerStats = {
  total: 342,
  newThisMonth: 28,
  returning: 85,
  avgOrderValue: 45000,
};

const topCustomers = [
  { name: 'Siti Rahayu', orders: 24, totalSpent: 1250000, lastVisit: '2 hari lalu' },
  { name: 'Budi Santoso', orders: 18, totalSpent: 980000, lastVisit: '1 hari lalu' },
  { name: 'Dewi Lestari', orders: 15, totalSpent: 870000, lastVisit: '3 hari lalu' },
  { name: 'Ahmad Wijaya', orders: 12, totalSpent: 720000, lastVisit: '5 hari lalu' },
  { name: 'Eko Prasetyo', orders: 11, totalSpent: 650000, lastVisit: '1 minggu lalu' },
];

const monthlyNewCustomers = [
  { label: 'Sep', value: 18 },
  { label: 'Okt', value: 22 },
  { label: 'Nov', value: 25 },
  { label: 'Des', value: 32 },
  { label: 'Jan', value: 24 },
  { label: 'Feb', value: 28 },
];

const retentionData = [
  { label: '1x Order', percentage: 40, count: 137 },
  { label: '2-5x Order', percentage: 35, count: 120 },
  { label: '6-10x Order', percentage: 15, count: 51 },
  { label: '>10x Order', percentage: 10, count: 34 },
];

export default function LaporanPelangganScreen() {
  const router = useRouter();
  const maxNew = Math.max(...monthlyNewCustomers.map(d => d.value));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Laporan Pelanggan</Text>
            <TouchableOpacity style={styles.backBtn}>
              <Download size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCardWide}>
            <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
              <Users size={20} color={colors.info} />
            </View>
            <View>
              <Text style={styles.statValue}>{customerStats.total}</Text>
              <Text style={styles.statLabel}>Total Pelanggan</Text>
            </View>
          </View>
          <View style={styles.statCardWide}>
            <View style={[styles.statIcon, { backgroundColor: colors.primaryBg }]}>
              <TrendingUp size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>{customerStats.newThisMonth}</Text>
              <Text style={styles.statLabel}>Baru Bulan Ini</Text>
            </View>
          </View>
          <View style={styles.statCardWide}>
            <View style={[styles.statIcon, { backgroundColor: colors.warningBg }]}>
              <Star size={20} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.statValue}>{customerStats.returning}%</Text>
              <Text style={styles.statLabel}>Pelanggan Setia</Text>
            </View>
          </View>
          <View style={styles.statCardWide}>
            <View style={[styles.statIcon, { backgroundColor: '#F5F3FF' }]}>
              <Crown size={20} color="#8B5CF6" />
            </View>
            <View>
              <Text style={styles.statValue}>{formatFullCurrency(customerStats.avgOrderValue)}</Text>
              <Text style={styles.statLabel}>Rata² Order</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Pelanggan Baru per Bulan</Text>
        <View style={styles.chartContainer}>
          <View style={styles.barChart}>
            {monthlyNewCustomers.map((item, index) => {
              const barHeight = maxNew > 0 ? (item.value / maxNew) * 100 : 0;
              return (
                <View key={index} style={styles.barGroup}>
                  <Text style={styles.barValue}>{item.value}</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height: barHeight, backgroundColor: '#8B5CF6' }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Retensi Pelanggan</Text>
        {retentionData.map((item, index) => (
          <View key={index} style={styles.retentionRow}>
            <Text style={styles.retentionLabel}>{item.label}</Text>
            <View style={styles.retentionBarOuter}>
              <View style={[styles.retentionBarInner, { width: `${item.percentage}%` }]} />
            </View>
            <Text style={styles.retentionCount}>{item.count}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Top Pelanggan</Text>
        {topCustomers.map((cust, index) => (
          <View key={index} style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerAvatarText}>{cust.name.charAt(0)}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{cust.name}</Text>
              <Text style={styles.customerMeta}>{cust.orders} order · {cust.lastVisit}</Text>
            </View>
            <Text style={styles.customerSpent}>{formatFullCurrency(cust.totalSpent)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.white },
  content: { padding: 16, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statCardWide: { width: '48%' as any, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  statIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 12 },
  chartContainer: { backgroundColor: colors.white, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 140 },
  barGroup: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 10, color: colors.textSecondary, marginBottom: 4 },
  barWrapper: { width: 24, justifyContent: 'flex-end', height: 100 },
  bar: { width: 24, borderRadius: 5 },
  barLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
  retentionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  retentionLabel: { width: 90, fontSize: 12, color: colors.textSecondary },
  retentionBarOuter: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.surfaceSecondary },
  retentionBarInner: { height: 10, borderRadius: 5, backgroundColor: '#8B5CF6' },
  retentionCount: { width: 36, fontSize: 13, fontWeight: '600' as const, color: colors.text, textAlign: 'right' as const },
  customerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  customerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  customerAvatarText: { fontSize: 16, fontWeight: '700' as const, color: colors.primary },
  customerInfo: { flex: 1, gap: 2 },
  customerName: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  customerMeta: { fontSize: 12, color: colors.textSecondary },
  customerSpent: { fontSize: 14, fontWeight: '600' as const, color: colors.primary },
});
