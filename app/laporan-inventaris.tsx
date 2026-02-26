import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, AlertCircle, Package } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { formatFullCurrency } from '@/utils/format';

interface InventoryItem {
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  usagePerMonth: number;
  costPerUnit: number;
  status: 'aman' | 'hampir_habis' | 'kritis';
}

const inventoryItems: InventoryItem[] = [
  { name: 'Deterjen Cair', stock: 45, unit: 'liter', minStock: 20, usagePerMonth: 80, costPerUnit: 15000, status: 'aman' },
  { name: 'Softener', stock: 12, unit: 'liter', minStock: 15, usagePerMonth: 40, costPerUnit: 12000, status: 'hampir_habis' },
  { name: 'Pemutih', stock: 5, unit: 'liter', minStock: 10, usagePerMonth: 25, costPerUnit: 8000, status: 'kritis' },
  { name: 'Pewangi Lavender', stock: 20, unit: 'liter', minStock: 10, usagePerMonth: 30, costPerUnit: 18000, status: 'aman' },
  { name: 'Pewangi Ocean', stock: 8, unit: 'liter', minStock: 10, usagePerMonth: 25, costPerUnit: 18000, status: 'hampir_habis' },
  { name: 'Plastik Packaging (L)', stock: 250, unit: 'lembar', minStock: 100, usagePerMonth: 500, costPerUnit: 500, status: 'aman' },
  { name: 'Plastik Packaging (S)', stock: 80, unit: 'lembar', minStock: 100, usagePerMonth: 400, costPerUnit: 300, status: 'hampir_habis' },
  { name: 'Hanger', stock: 150, unit: 'pcs', minStock: 50, usagePerMonth: 100, costPerUnit: 2000, status: 'aman' },
];

const monthlyUsage = [
  { label: 'Sep', value: 3200000 },
  { label: 'Okt', value: 3500000 },
  { label: 'Nov', value: 2900000 },
  { label: 'Des', value: 3800000 },
  { label: 'Jan', value: 3100000 },
  { label: 'Feb', value: 2800000 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aman': return colors.success;
    case 'hampir_habis': return colors.warning;
    case 'kritis': return colors.error;
    default: return colors.textSecondary;
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'aman': return colors.successBg;
    case 'hampir_habis': return colors.warningBg;
    case 'kritis': return colors.errorBg;
    default: return colors.surfaceSecondary;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'aman': return 'Aman';
    case 'hampir_habis': return 'Hampir Habis';
    case 'kritis': return 'Kritis';
    default: return status;
  }
};

export default function LaporanInventarisScreen() {
  const router = useRouter();
  const maxUsage = Math.max(...monthlyUsage.map(d => d.value));

  const kritisCount = inventoryItems.filter(i => i.status === 'kritis').length;
  const hampirHabisCount = inventoryItems.filter(i => i.status === 'hampir_habis').length;
  const totalCost = monthlyUsage.reduce((sum, m) => sum + m.value, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Laporan Inventaris</Text>
            <TouchableOpacity style={styles.backBtn}>
              <Download size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.alertRow}>
          {kritisCount > 0 && (
            <View style={[styles.alertCard, { backgroundColor: colors.errorBg, borderColor: '#FECACA' }]}>
              <AlertCircle size={18} color={colors.error} />
              <Text style={[styles.alertText, { color: colors.error }]}>{kritisCount} item kritis</Text>
            </View>
          )}
          {hampirHabisCount > 0 && (
            <View style={[styles.alertCard, { backgroundColor: colors.warningBg, borderColor: '#FDE68A' }]}>
              <AlertCircle size={18} color={colors.warning} />
              <Text style={[styles.alertText, { color: colors.warning }]}>{hampirHabisCount} hampir habis</Text>
            </View>
          )}
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Item</Text>
            <Text style={styles.summaryValue}>{inventoryItems.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Biaya Bahan/Bulan</Text>
            <Text style={styles.summaryValue}>{formatFullCurrency(Math.round(totalCost / 6))}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Biaya Bahan Bulanan</Text>
        <View style={styles.chartContainer}>
          <View style={styles.barChart}>
            {monthlyUsage.map((item, index) => {
              const barHeight = maxUsage > 0 ? (item.value / maxUsage) * 100 : 0;
              return (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height: barHeight, backgroundColor: '#F59E0B' }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Daftar Inventaris</Text>
        {inventoryItems.map((item, index) => {
          const stockPercent = Math.min(100, (item.stock / (item.minStock * 3)) * 100);
          return (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemHeader}>
                <View style={styles.itemLeft}>
                  <View style={[styles.itemIconBox, { backgroundColor: getStatusBg(item.status) }]}>
                    <Package size={16} color={getStatusColor(item.status)} />
                  </View>
                  <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemUsage}>Pakai: {item.usagePerMonth} {item.unit}/bln</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
                </View>
              </View>
              <View style={styles.stockRow}>
                <View style={styles.stockBarOuter}>
                  <View style={[styles.stockBarInner, { width: `${stockPercent}%`, backgroundColor: getStatusColor(item.status) }]} />
                </View>
                <Text style={styles.stockText}>{item.stock} {item.unit}</Text>
              </View>
            </View>
          );
        })}
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
  alertRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  alertCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, padding: 12, borderWidth: 1 },
  alertText: { fontSize: 13, fontWeight: '600' as const },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  summaryLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 12 },
  chartContainer: { backgroundColor: colors.white, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 130 },
  barGroup: { alignItems: 'center', flex: 1 },
  barWrapper: { width: 24, justifyContent: 'flex-end', height: 100 },
  bar: { width: 24, borderRadius: 5 },
  barLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
  itemRow: { backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemIconBox: { width: 34, height: 34, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  itemUsage: { fontSize: 11, color: colors.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600' as const },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stockBarOuter: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.surfaceSecondary },
  stockBarInner: { height: 6, borderRadius: 3 },
  stockText: { fontSize: 12, fontWeight: '600' as const, color: colors.textSecondary, width: 70, textAlign: 'right' as const },
});
