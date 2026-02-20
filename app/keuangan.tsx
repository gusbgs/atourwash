import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/format';

type Period = 'hari' | 'minggu' | 'bulan';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', description: 'Pembayaran Order #001', amount: 125000, type: 'income', date: '06 Feb 2026', category: 'Order' },
  { id: '2', description: 'Pembelian Deterjen', amount: 350000, type: 'expense', date: '06 Feb 2026', category: 'Bahan' },
  { id: '3', description: 'Pembayaran Order #002', amount: 85000, type: 'income', date: '05 Feb 2026', category: 'Order' },
  { id: '4', description: 'Listrik & Air', amount: 1200000, type: 'expense', date: '05 Feb 2026', category: 'Utilitas' },
  { id: '5', description: 'Pembayaran Order #003', amount: 210000, type: 'income', date: '04 Feb 2026', category: 'Order' },
  { id: '6', description: 'Gaji Karyawan', amount: 5000000, type: 'expense', date: '01 Feb 2026', category: 'Gaji' },
  { id: '7', description: 'Pembayaran Order #004', amount: 175000, type: 'income', date: '04 Feb 2026', category: 'Order' },
];

export default function KeuanganScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('minggu');

  const totalIncome = mockTransactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = mockTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Keuangan</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Saldo Bersih</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalIncome - totalExpense)}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIcon, { backgroundColor: 'rgba(34,197,94,0.2)' }]}>
                  <TrendingUp size={14} color="#22C55E" />
                </View>
                <View>
                  <Text style={styles.summaryItemLabel}>Pemasukan</Text>
                  <Text style={styles.summaryItemValue}>{formatCurrency(totalIncome)}</Text>
                </View>
              </View>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIcon, { backgroundColor: 'rgba(239,68,68,0.2)' }]}>
                  <TrendingDown size={14} color="#EF4444" />
                </View>
                <View>
                  <Text style={styles.summaryItemLabel}>Pengeluaran</Text>
                  <Text style={styles.summaryItemValue}>{formatCurrency(totalExpense)}</Text>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.periodRow}>
        {(['hari', 'minggu', 'bulan'] as Period[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Transaksi Terakhir</Text>
        {mockTransactions.map(tx => (
          <View key={tx.id} style={styles.txCard}>
            <View style={[styles.txIcon, { backgroundColor: tx.type === 'income' ? '#ECFDF5' : '#FEF2F2' }]}>
              {tx.type === 'income' ? <ArrowDownLeft size={18} color="#22C55E" /> : <ArrowUpRight size={18} color="#EF4444" />}
            </View>
            <View style={styles.txContent}>
              <Text style={styles.txDesc}>{tx.description}</Text>
              <Text style={styles.txDate}>{tx.date} · {tx.category}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.type === 'income' ? '#22C55E' : '#EF4444' }]}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
            </Text>
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
  summaryCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 18 },
  summaryLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  summaryValue: { fontSize: 26, fontWeight: '700' as const, color: colors.white, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 16 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  summaryItemLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  summaryItemValue: { fontSize: 14, fontWeight: '600' as const, color: colors.white },
  periodRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 8 },
  periodBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white },
  periodBtnActive: { backgroundColor: colors.primary },
  periodText: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary },
  periodTextActive: { color: colors.white },
  list: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 12, marginTop: 8 },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  txIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txContent: { flex: 1, gap: 2 },
  txDesc: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  txDate: { fontSize: 12, color: colors.textSecondary },
  txAmount: { fontSize: 14, fontWeight: '700' as const },
});
