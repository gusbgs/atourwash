import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, Star, TrendingUp } from '@/utils/icons';
import { colors } from '@/constants/colors';

interface Employee {
  name: string;
  role: string;
  ordersHandled: number;
  rating: number;
  attendance: number;
  lateCount: number;
}

const employees: Employee[] = [
  { name: 'Rina Wati', role: 'Operator Cuci', ordersHandled: 145, rating: 4.9, attendance: 98, lateCount: 1 },
  { name: 'Joko Susilo', role: 'Operator Setrika', ordersHandled: 132, rating: 4.7, attendance: 95, lateCount: 2 },
  { name: 'Sari Dewi', role: 'Kasir', ordersHandled: 210, rating: 4.8, attendance: 100, lateCount: 0 },
  { name: 'Agus Setiawan', role: 'Operator Cuci', ordersHandled: 128, rating: 4.5, attendance: 90, lateCount: 4 },
  { name: 'Lina Marlina', role: 'Operator Dry Clean', ordersHandled: 95, rating: 4.6, attendance: 96, lateCount: 2 },
];

const performanceMetrics = [
  { label: 'Total Karyawan', value: '5', color: colors.info, bg: '#EFF6FF' },
  { label: 'Rata-rata Rating', value: '4.7', color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Kehadiran', value: '96%', color: colors.success, bg: colors.successBg },
  { label: 'Order/Karyawan', value: '142', color: '#8B5CF6', bg: '#F5F3FF' },
];

const attendanceWeekly = [
  { label: 'Sen', present: 5, late: 0 },
  { label: 'Sel', present: 5, late: 1 },
  { label: 'Rab', present: 4, late: 0 },
  { label: 'Kam', present: 5, late: 0 },
  { label: 'Jum', present: 5, late: 1 },
  { label: 'Sab', present: 5, late: 0 },
];

export default function LaporanKaryawanScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Laporan Karyawan</Text>
            <TouchableOpacity style={styles.backBtn}>
              <Download size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          {performanceMetrics.map((m, i) => (
            <View key={i} style={[styles.metricCard, { backgroundColor: m.bg }]}>
              <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Kehadiran Minggu Ini</Text>
        <View style={styles.attendanceContainer}>
          {attendanceWeekly.map((day, index) => (
            <View key={index} style={styles.attendanceDay}>
              <View style={styles.attendanceBar}>
                <View style={[styles.attendancePresent, { height: (day.present / 5) * 60 }]} />
                {day.late > 0 && (
                  <View style={[styles.attendanceLate, { height: (day.late / 5) * 60 }]} />
                )}
              </View>
              <Text style={styles.attendanceLabel}>{day.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={styles.legendText}>Hadir</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.legendText}>Terlambat</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Performa Karyawan</Text>
        {employees.map((emp, index) => (
          <View key={index} style={styles.employeeCard}>
            <View style={styles.employeeHeader}>
              <View style={styles.employeeAvatar}>
                <Text style={styles.avatarText}>{emp.name.charAt(0)}</Text>
              </View>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{emp.name}</Text>
                <Text style={styles.employeeRole}>{emp.role}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Star size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{emp.rating}</Text>
              </View>
            </View>
            <View style={styles.employeeStats}>
              <View style={styles.empStatItem}>
                <Text style={styles.empStatValue}>{emp.ordersHandled}</Text>
                <Text style={styles.empStatLabel}>Order</Text>
              </View>
              <View style={styles.empStatDivider} />
              <View style={styles.empStatItem}>
                <Text style={styles.empStatValue}>{emp.attendance}%</Text>
                <Text style={styles.empStatLabel}>Kehadiran</Text>
              </View>
              <View style={styles.empStatDivider} />
              <View style={styles.empStatItem}>
                <Text style={[styles.empStatValue, emp.lateCount > 2 && { color: colors.error }]}>{emp.lateCount}</Text>
                <Text style={styles.empStatLabel}>Terlambat</Text>
              </View>
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
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  metricCard: { width: '48%' as any, borderRadius: 14, padding: 16, alignItems: 'center' },
  metricValue: { fontSize: 24, fontWeight: '700' as const },
  metricLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 12 },
  attendanceContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.white, borderRadius: 14, padding: 16, paddingBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  attendanceDay: { alignItems: 'center' },
  attendanceBar: { height: 60, width: 20, justifyContent: 'flex-end', gap: 2 },
  attendancePresent: { width: 20, borderRadius: 4, backgroundColor: colors.success },
  attendanceLate: { width: 20, borderRadius: 4, backgroundColor: colors.warning },
  attendanceLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: colors.textSecondary },
  employeeCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  employeeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  employeeAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700' as const, color: colors.primary },
  employeeInfo: { flex: 1, gap: 2 },
  employeeName: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
  employeeRole: { fontSize: 12, color: colors.textSecondary },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 13, fontWeight: '600' as const, color: '#F59E0B' },
  employeeStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, borderRadius: 10, padding: 12 },
  empStatItem: { flex: 1, alignItems: 'center' },
  empStatValue: { fontSize: 16, fontWeight: '700' as const, color: colors.text },
  empStatLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  empStatDivider: { width: 1, height: 30, backgroundColor: colors.border },
});
