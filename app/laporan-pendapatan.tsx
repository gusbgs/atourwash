import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, ChevronRight, TrendingUp, TrendingDown, Download } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { formatFullCurrency } from '@/utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Period = 'mingguan' | 'bulanan' | 'tahunan';

const weeklyData = [
  { label: 'W1', value: 2400000 },
  { label: 'W2', value: 3100000 },
  { label: 'W3', value: 2800000 },
  { label: 'W4', value: 3500000 },
];

const monthlyData = [
  { label: 'Jan', value: 9500000 },
  { label: 'Feb', value: 11200000 },
  { label: 'Mar', value: 10800000 },
  { label: 'Apr', value: 12500000 },
  { label: 'Mei', value: 13100000 },
  { label: 'Jun', value: 11800000 },
];

const yearlyData = [
  { label: '2024', value: 120000000 },
  { label: '2025', value: 145000000 },
  { label: '2026', value: 38000000 },
];

const dailyBreakdown = [
  { date: 'Sen, 24 Feb', income: 1250000, orders: 18 },
  { date: 'Min, 23 Feb', income: 980000, orders: 14 },
  { date: 'Sab, 22 Feb', income: 1450000, orders: 22 },
  { date: 'Jum, 21 Feb', income: 1100000, orders: 16 },
  { date: 'Kam, 20 Feb', income: 870000, orders: 12 },
  { date: 'Rab, 19 Feb', income: 1320000, orders: 19 },
  { date: 'Sel, 18 Feb', income: 1050000, orders: 15 },
];

export default function LaporanPendapatanScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('mingguan');

  const getData = () => {
    switch (period) {
      case 'mingguan': return weeklyData;
      case 'bulanan': return monthlyData;
      case 'tahunan': return yearlyData;
    }
  };

  const data = getData();
  const maxValue = Math.max(...data.map(d => d.value));
  const totalRevenue = data.reduce((sum, d) => sum + d.value, 0);
  const avgRevenue = Math.round(totalRevenue / data.length);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Laporan Pendapatan</Text>
            <TouchableOpacity style={styles.backBtn}>
              <Download size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Pendapatan</Text>
            <Text style={styles.summaryValue}>{formatFullCurrency(totalRevenue)}</Text>
            <View style={styles.changeRow}>
              <TrendingUp size={14} color={colors.success} />
              <Text style={styles.changeText}>+12% dari periode lalu</Text>
            </View>
          </View>
          <View style={styles.summaryCardSmall}>
            <Text style={styles.summaryLabel}>Rata-rata</Text>
            <Text style={styles.summaryValueSmall}>{formatFullCurrency(avgRevenue)}</Text>
          </View>
        </View>

        <View style={styles.periodTabs}>
          {(['mingguan', 'bulanan', 'tahunan'] as Period[]).map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodTab, period === p && styles.periodTabActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodTabText, period === p && styles.periodTabTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Trend Pendapatan</Text>
          <View style={styles.barChart}>
            {data.map((item, index) => {
              const barHeight = maxValue > 0 ? (item.value / maxValue) * 140 : 0;
              return (
                <View key={index} style={styles.barGroup}>
                  <Text style={styles.barValue}>{formatFullCurrency(item.value)}</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height: barHeight, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Rincian Harian</Text>
        {dailyBreakdown.map((day, index) => (
          <View key={index} style={styles.dayRow}>
            <View style={styles.dayInfo}>
              <Text style={styles.dayDate}>{day.date}</Text>
              <Text style={styles.dayOrders}>{day.orders} order</Text>
            </View>
            <View style={styles.dayAmountCol}>
              <Text style={styles.dayAmount}>{formatFullCurrency(day.income)}</Text>
              {index > 0 && (
                <View style={styles.dayChangeRow}>
                  {day.income >= dailyBreakdown[index - 1].income ? (
                    <TrendingUp size={12} color={colors.success} />
                  ) : (
                    <TrendingDown size={12} color={colors.error} />
                  )}
                </View>
              )}
            </View>
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
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 2, backgroundColor: colors.white, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  summaryCardSmall: { flex: 1, backgroundColor: colors.primaryBg, borderRadius: 14, padding: 16, justifyContent: 'center' },
  summaryLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  summaryValueSmall: { fontSize: 16, fontWeight: '700' as const, color: colors.primary },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  changeText: { fontSize: 12, color: colors.success, fontWeight: '500' as const },
  periodTabs: { flexDirection: 'row', backgroundColor: colors.surfaceSecondary, borderRadius: 10, padding: 3, marginBottom: 16 },
  periodTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  periodTabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  periodTabText: { fontSize: 13, fontWeight: '500' as const, color: colors.textSecondary },
  periodTabTextActive: { color: colors.primary, fontWeight: '600' as const },
  chartContainer: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  chartTitle: { fontSize: 14, fontWeight: '600' as const, color: colors.text, marginBottom: 16 },
  barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 200 },
  barGroup: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 9, color: colors.textSecondary, marginBottom: 4 },
  barWrapper: { width: 28, justifyContent: 'flex-end', height: 140 },
  bar: { width: 28, borderRadius: 6 },
  barLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 12 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  dayInfo: { gap: 2 },
  dayDate: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  dayOrders: { fontSize: 12, color: colors.textSecondary },
  dayAmountCol: { alignItems: 'flex-end', gap: 2 },
  dayAmount: { fontSize: 14, fontWeight: '600' as const, color: colors.primary },
  dayChangeRow: { flexDirection: 'row', alignItems: 'center' },
});
