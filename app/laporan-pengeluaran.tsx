import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, TrendingUp, TrendingDown } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { formatFullCurrency } from '@/utils/format';

type Period = 'mingguan' | 'bulanan' | 'tahunan';

interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

const expenseCategories: ExpenseCategory[] = [
  { name: 'Bahan Deterjen', amount: 2800000, percentage: 32, color: '#3B82F6' },
  { name: 'Gaji Karyawan', amount: 2500000, percentage: 28, color: '#EF4444' },
  { name: 'Listrik & Air', amount: 1200000, percentage: 14, color: '#F59E0B' },
  { name: 'Sewa Tempat', amount: 1000000, percentage: 11, color: '#8B5CF6' },
  { name: 'Perawatan Mesin', amount: 650000, percentage: 7, color: '#EC4899' },
  { name: 'Lain-lain', amount: 700000, percentage: 8, color: '#94A3B8' },
];

const monthlyExpenses = [
  { label: 'Jan', value: 8200000 },
  { label: 'Feb', value: 8850000 },
  { label: 'Mar', value: 7900000 },
  { label: 'Apr', value: 9100000 },
  { label: 'Mei', value: 8500000 },
  { label: 'Jun', value: 8850000 },
];

const recentExpenses = [
  { date: '24 Feb', desc: 'Pembelian Deterjen Bulk', amount: 850000, category: 'Bahan Deterjen' },
  { date: '22 Feb', desc: 'Tagihan Listrik Februari', amount: 1200000, category: 'Listrik & Air' },
  { date: '20 Feb', desc: 'Service Mesin Cuci #3', amount: 350000, category: 'Perawatan Mesin' },
  { date: '18 Feb', desc: 'Pembelian Softener', amount: 420000, category: 'Bahan Deterjen' },
  { date: '15 Feb', desc: 'Gaji Karyawan (Setengah)', amount: 1250000, category: 'Gaji Karyawan' },
  { date: '12 Feb', desc: 'Plastik Packaging', amount: 180000, category: 'Lain-lain' },
];

const totalExpense = expenseCategories.reduce((sum, c) => sum + c.amount, 0);

export default function LaporanPengeluaranScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('bulanan');

  const maxValue = Math.max(...monthlyExpenses.map(d => d.value));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Laporan Pengeluaran</Text>
            <TouchableOpacity style={styles.backBtn}>
              <Download size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Pengeluaran Bulan Ini</Text>
          <Text style={styles.totalValue}>{formatFullCurrency(totalExpense)}</Text>
          <View style={styles.changeRow}>
            <TrendingDown size={14} color={colors.error} />
            <Text style={styles.changeTextRed}>+5% dari bulan lalu</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Kategori Pengeluaran</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarRow}>
            {expenseCategories.map((cat, i) => (
              <View key={i} style={[styles.progressSegment, { flex: cat.percentage, backgroundColor: cat.color }]} />
            ))}
          </View>
        </View>

        {expenseCategories.map((cat, index) => (
          <View key={index} style={styles.categoryRow}>
            <View style={[styles.catDot, { backgroundColor: cat.color }]} />
            <View style={styles.catInfo}>
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catPercentage}>{cat.percentage}%</Text>
            </View>
            <Text style={styles.catAmount}>{formatFullCurrency(cat.amount)}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Trend Pengeluaran</Text>
        <View style={styles.chartContainer}>
          <View style={styles.barChart}>
            {monthlyExpenses.map((item, index) => {
              const barHeight = maxValue > 0 ? (item.value / maxValue) * 120 : 0;
              return (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height: barHeight, backgroundColor: colors.error }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Pengeluaran Terbaru</Text>
        {recentExpenses.map((exp, index) => (
          <View key={index} style={styles.expenseRow}>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseDesc}>{exp.desc}</Text>
              <Text style={styles.expenseMeta}>{exp.date} · {exp.category}</Text>
            </View>
            <Text style={styles.expenseAmount}>-{formatFullCurrency(exp.amount)}</Text>
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
  totalCard: { backgroundColor: '#FEF2F2', borderRadius: 14, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#FECACA' },
  totalLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  totalValue: { fontSize: 24, fontWeight: '700' as const, color: colors.error },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  changeTextRed: { fontSize: 12, color: colors.error, fontWeight: '500' as const },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 12 },
  progressBarContainer: { marginBottom: 14 },
  progressBarRow: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2 },
  progressSegment: { borderRadius: 5 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, padding: 12, marginBottom: 6 },
  catDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  catInfo: { flex: 1 },
  catName: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  catPercentage: { fontSize: 11, color: colors.textSecondary },
  catAmount: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
  chartContainer: { backgroundColor: colors.white, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160 },
  barGroup: { alignItems: 'center', flex: 1 },
  barWrapper: { width: 24, justifyContent: 'flex-end', height: 120 },
  bar: { width: 24, borderRadius: 5 },
  barLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
  expenseRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 6 },
  expenseInfo: { flex: 1, gap: 2 },
  expenseDesc: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  expenseMeta: { fontSize: 12, color: colors.textSecondary },
  expenseAmount: { fontSize: 14, fontWeight: '600' as const, color: colors.error },
});
