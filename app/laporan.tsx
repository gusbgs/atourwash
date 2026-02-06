import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, BarChart3, PieChart, Download, Calendar, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface ReportItem {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  iconColor: string;
  iconBg: string;
}

const reports: ReportItem[] = [
  { id: '1', title: 'Laporan Pendapatan', description: 'Ringkasan pendapatan harian, mingguan, dan bulanan', icon: BarChart3, iconColor: '#22C55E', iconBg: '#ECFDF5' },
  { id: '2', title: 'Laporan Pengeluaran', description: 'Detail pengeluaran operasional', icon: PieChart, iconColor: '#EF4444', iconBg: '#FEF2F2' },
  { id: '3', title: 'Laporan Order', description: 'Statistik order dan layanan populer', icon: FileText, iconColor: '#3B82F6', iconBg: '#EFF6FF' },
  { id: '4', title: 'Laporan Pelanggan', description: 'Analisis pelanggan dan retensi', icon: BarChart3, iconColor: '#8B5CF6', iconBg: '#F5F3FF' },
  { id: '5', title: 'Laporan Inventaris', description: 'Penggunaan bahan dan stok', icon: PieChart, iconColor: '#F59E0B', iconBg: '#FFFBEB' },
  { id: '6', title: 'Laporan Karyawan', description: 'Performa dan kehadiran karyawan', icon: BarChart3, iconColor: '#EC4899', iconBg: '#FDF2F8' },
];

const quickStats = [
  { label: 'Total Order', value: '1,245', change: '+12%' },
  { label: 'Pelanggan Baru', value: '89', change: '+8%' },
  { label: 'Rating', value: '4.8', change: '+0.2' },
];

export default function LaporanScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Laporan</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.periodSelector}>
          <Calendar size={16} color={colors.primary} />
          <Text style={styles.periodText}>Februari 2026</Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </View>

        <View style={styles.quickStatsRow}>
          {quickStats.map(s => (
            <View key={s.label} style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{s.value}</Text>
              <Text style={styles.quickStatLabel}>{s.label}</Text>
              <Text style={styles.quickStatChange}>{s.change}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Semua Laporan</Text>
        {reports.map(r => (
          <TouchableOpacity key={r.id} style={styles.reportCard} activeOpacity={0.7}>
            <View style={[styles.reportIcon, { backgroundColor: r.iconBg }]}>
              <r.icon size={22} color={r.iconColor} />
            </View>
            <View style={styles.reportContent}>
              <Text style={styles.reportTitle}>{r.title}</Text>
              <Text style={styles.reportDesc}>{r.description}</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
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
  periodSelector: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  periodText: { flex: 1, fontSize: 14, fontWeight: '600' as const, color: colors.text },
  quickStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  quickStatCard: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  quickStatValue: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  quickStatLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  quickStatChange: { fontSize: 11, fontWeight: '600' as const, color: colors.primary, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 12 },
  reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  reportIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  reportContent: { flex: 1, gap: 2 },
  reportTitle: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  reportDesc: { fontSize: 12, color: colors.textSecondary },
});
