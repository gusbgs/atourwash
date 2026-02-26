import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, TrendingUp, ClipboardList } from '@/utils/icons';
import { colors } from '@/constants/colors';

type Period = 'mingguan' | 'bulanan' | 'tahunan';

interface ServiceStat {
  name: string;
  count: number;
  percentage: number;
  color: string;
  revenue: number;
}

const serviceStats: ServiceStat[] = [
  { name: 'Cuci Reguler', count: 245, percentage: 45, color: '#23A174', revenue: 1715000 },
  { name: 'Cuci Express', count: 136, percentage: 25, color: '#3B82F6', revenue: 1632000 },
  { name: 'Dry Clean', count: 82, percentage: 15, color: '#F59E0B', revenue: 2050000 },
  { name: 'Setrika Saja', count: 55, percentage: 10, color: '#8B5CF6', revenue: 275000 },
  { name: 'Lainnya', count: 27, percentage: 5, color: '#94A3B8', revenue: 405000 },
];

const orderStatusBreakdown = [
  { status: 'Selesai', count: 412, color: colors.success, bg: colors.successBg },
  { status: 'Dalam Proses', count: 58, color: colors.warning, bg: colors.warningBg },
  { status: 'Siap Diambil', count: 23, color: colors.info, bg: colors.infoBg },
  { status: 'Terlambat', count: 8, color: colors.error, bg: colors.errorBg },
];

const weeklyOrders = [
  { label: 'Sen', value: 32 },
  { label: 'Sel', value: 28 },
  { label: 'Rab', value: 35 },
  { label: 'Kam', value: 22 },
  { label: 'Jum', value: 38 },
  { label: 'Sab', value: 45 },
  { label: 'Min', value: 18 },
];

const totalOrders = serviceStats.reduce((sum, s) => sum + s.count, 0);

export default function LaporanOrderScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('mingguan');

  const maxOrders = Math.max(...weeklyOrders.map(d => d.value));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Laporan Order</Text>
            <TouchableOpacity style={styles.backBtn}>
              <Download size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.primaryBg }]}>
              <ClipboardList size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Total Order</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.successBg }]}>
              <TrendingUp size={20} color={colors.success} />
            </View>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Tingkat Selesai</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.warningBg }]}>
              <ClipboardList size={20} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>3.2 kg</Text>
            <Text style={styles.statLabel}>Rata² Berat</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Status Order</Text>
        <View style={styles.statusGrid}>
          {orderStatusBreakdown.map((item, index) => (
            <View key={index} style={[styles.statusCard, { backgroundColor: item.bg }]}>
              <Text style={[styles.statusCount, { color: item.color }]}>{item.count}</Text>
              <Text style={styles.statusLabel}>{item.status}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Order per Hari</Text>
        <View style={styles.chartContainer}>
          <View style={styles.barChart}>
            {weeklyOrders.map((item, index) => {
              const barHeight = maxOrders > 0 ? (item.value / maxOrders) * 120 : 0;
              return (
                <View key={index} style={styles.barGroup}>
                  <Text style={styles.barValue}>{item.value}</Text>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height: barHeight, backgroundColor: colors.info }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Layanan Populer</Text>
        {serviceStats.map((service, index) => (
          <View key={index} style={styles.serviceRow}>
            <View style={styles.serviceRank}>
              <Text style={styles.serviceRankText}>#{index + 1}</Text>
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <View style={styles.serviceBarOuter}>
                <View style={[styles.serviceBarInner, { width: `${service.percentage}%`, backgroundColor: service.color }]} />
              </View>
            </View>
            <View style={styles.serviceStats}>
              <Text style={styles.serviceCount}>{service.count}</Text>
              <Text style={styles.servicePercent}>{service.percentage}%</Text>
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
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: 'center' as const },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 12 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statusCard: { width: '48%' as any, borderRadius: 12, padding: 14, alignItems: 'center' },
  statusCount: { fontSize: 24, fontWeight: '700' as const },
  statusLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  chartContainer: { backgroundColor: colors.white, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160 },
  barGroup: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 10, color: colors.textSecondary, marginBottom: 4 },
  barWrapper: { width: 22, justifyContent: 'flex-end', height: 120 },
  bar: { width: 22, borderRadius: 5 },
  barLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  serviceRank: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  serviceRankText: { fontSize: 12, fontWeight: '700' as const, color: colors.textSecondary },
  serviceInfo: { flex: 1, gap: 6 },
  serviceName: { fontSize: 14, fontWeight: '500' as const, color: colors.text },
  serviceBarOuter: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceSecondary },
  serviceBarInner: { height: 6, borderRadius: 3 },
  serviceStats: { alignItems: 'flex-end', marginLeft: 12 },
  serviceCount: { fontSize: 16, fontWeight: '700' as const, color: colors.text },
  servicePercent: { fontSize: 11, color: colors.textSecondary },
});
