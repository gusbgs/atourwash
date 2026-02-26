import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Droplets, Zap, Plus, CheckCircle2, Clock, AlertCircle, Calendar, X, Pencil } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { mockOperationalBills } from '@/mocks/data';
import { formatCurrency } from '@/utils/format';
import type { OperationalBill, BillCategory, BillStatus } from '@/types';

type FilterTab = 'semua' | 'air' | 'listrik';

export default function TagihanOperasionalScreen() {
  const router = useRouter();
  const [bills, setBills] = useState<OperationalBill[]>(mockOperationalBills);
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<OperationalBill | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const [newCategory, setNewCategory] = useState<BillCategory>('listrik');
  const [newMonth, setNewMonth] = useState('');
  const [newYear, setNewYear] = useState('2026');
  const [newAmount, setNewAmount] = useState('');
  const [newUsage, setNewUsage] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredBills = useMemo(() => {
    if (activeTab === 'semua') return bills;
    return bills.filter(b => b.category === activeTab);
  }, [bills, activeTab]);

  const unpaidBills = useMemo(() => bills.filter(b => b.status !== 'lunas'), [bills]);

  const totalUnpaid = useMemo(
    () => unpaidBills.reduce((sum, b) => sum + b.amount, 0),
    [unpaidBills]
  );

  const monthlyStats = useMemo(() => {
    const currentMonth = bills.filter(b => b.month === 'Februari' && b.year === 2026);
    const waterBill = currentMonth.find(b => b.category === 'air');
    const electricBill = currentMonth.find(b => b.category === 'listrik');
    return { waterBill, electricBill };
  }, [bills]);

  const usageHistory = useMemo(() => {
    const waterHistory = bills
      .filter(b => b.category === 'air')
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return getMonthIndex(b.month) - getMonthIndex(a.month);
      })
      .slice(0, 6);
    const electricHistory = bills
      .filter(b => b.category === 'listrik')
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return getMonthIndex(b.month) - getMonthIndex(a.month);
      })
      .slice(0, 6);
    return { waterHistory, electricHistory };
  }, [bills]);

  const handleOpenDetail = useCallback((bill: OperationalBill) => {
    setSelectedBill(bill);
    setShowDetailModal(true);
  }, []);

  const handlePayBill = useCallback((bill: OperationalBill) => {
    setSelectedBill(bill);
    setShowPayModal(true);
  }, []);

  const confirmPayBill = useCallback(() => {
    if (!selectedBill) return;
    setBills(prev =>
      prev.map(b =>
        b.id === selectedBill.id
          ? { ...b, status: 'lunas' as BillStatus, paidDate: new Date().toISOString().split('T')[0] }
          : b
      )
    );
    setShowPayModal(false);
    setSelectedBill(null);
    Alert.alert('Berhasil', 'Tagihan telah ditandai lunas.');
  }, [selectedBill]);

  const handleAddBill = useCallback(() => {
    if (!newMonth || !newAmount || !newUsage || !newDueDate) {
      Alert.alert('Error', 'Mohon lengkapi semua field.');
      return;
    }
    const newBill: OperationalBill = {
      id: `bill${Date.now()}`,
      category: newCategory,
      month: newMonth,
      year: parseInt(newYear, 10),
      amount: parseInt(newAmount, 10),
      usage: parseFloat(newUsage),
      unit: newCategory === 'listrik' ? 'kWh' : 'm³',
      dueDate: newDueDate,
      status: 'belum_bayar',
      provider: newCategory === 'listrik' ? 'PLN' : 'PDAM',
      accountNumber: newCategory === 'listrik' ? '5412 3456 7890' : '0012 4567 890',
      notes: newNotes || undefined,
    };
    setBills(prev => [newBill, ...prev]);
    resetForm();
    setShowAddModal(false);
    Alert.alert('Berhasil', 'Tagihan berhasil ditambahkan.');
  }, [newCategory, newMonth, newYear, newAmount, newUsage, newDueDate, newNotes]);

  const resetForm = () => {
    setNewCategory('listrik');
    setNewMonth('');
    setNewYear('2026');
    setNewAmount('');
    setNewUsage('');
    setNewDueDate('');
    setNewNotes('');
  };

  const getStatusConfig = (status: BillStatus) => {
    switch (status) {
      case 'lunas':
        return { label: 'Lunas', color: colors.success, bg: colors.successBg, icon: CheckCircle2 };
      case 'belum_bayar':
        return { label: 'Belum Bayar', color: colors.error, bg: colors.errorBg, icon: AlertCircle };
      case 'jatuh_tempo':
        return { label: 'Jatuh Tempo', color: colors.warning, bg: colors.warningBg, icon: Clock };
      default:
        return { label: status, color: colors.textSecondary, bg: colors.surfaceSecondary, icon: Clock };
    }
  };

  const maxUsageWater = useMemo(() => {
    const vals = usageHistory.waterHistory.map(b => b.usage);
    return Math.max(...vals, 1);
  }, [usageHistory.waterHistory]);

  const maxUsageElectric = useMemo(() => {
    const vals = usageHistory.electricHistory.map(b => b.usage);
    return Math.max(...vals, 1);
  }, [usageHistory.electricHistory]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tagihan Operasional</Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {unpaidBills.length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <AlertCircle size={20} color={colors.error} />
              <Text style={styles.alertTitle}>Tagihan Belum Lunas</Text>
            </View>
            <Text style={styles.alertAmount}>{formatCurrency(totalUnpaid)}</Text>
            <Text style={styles.alertSub}>{unpaidBills.length} tagihan menunggu pembayaran</Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderLeftColor: '#F59E0B' }]}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Zap size={22} color="#F59E0B" />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Listrik Bulan Ini</Text>
              <Text style={styles.summaryValue}>
                {monthlyStats.electricBill ? formatCurrency(monthlyStats.electricBill.amount) : '-'}
              </Text>
              <Text style={styles.summaryUsage}>
                {monthlyStats.electricBill ? `${monthlyStats.electricBill.usage} kWh` : '-'}
              </Text>
            </View>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#3B82F6' }]}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#DBEAFE' }]}>
              <Droplets size={22} color="#3B82F6" />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Air Bulan Ini</Text>
              <Text style={styles.summaryValue}>
                {monthlyStats.waterBill ? formatCurrency(monthlyStats.waterBill.amount) : '-'}
              </Text>
              <Text style={styles.summaryUsage}>
                {monthlyStats.waterBill ? `${monthlyStats.waterBill.usage} m³` : '-'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.usageSection}>
          <Text style={styles.sectionTitle}>Riwayat Pemakaian Listrik</Text>
          <View style={styles.usageChart}>
            {usageHistory.electricHistory.reverse().map((bill, idx) => (
              <View key={bill.id} style={styles.usageBarContainer}>
                <Text style={styles.usageBarValue}>{bill.usage}</Text>
                <View style={styles.usageBarTrack}>
                  <View
                    style={[
                      styles.usageBar,
                      {
                        height: `${(bill.usage / maxUsageElectric) * 100}%`,
                        backgroundColor: '#F59E0B',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.usageBarLabel}>{bill.month.slice(0, 3)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.usageSection}>
          <Text style={styles.sectionTitle}>Riwayat Pemakaian Air</Text>
          <View style={styles.usageChart}>
            {usageHistory.waterHistory.reverse().map((bill, idx) => (
              <View key={bill.id} style={styles.usageBarContainer}>
                <Text style={styles.usageBarValue}>{bill.usage}</Text>
                <View style={styles.usageBarTrack}>
                  <View
                    style={[
                      styles.usageBar,
                      {
                        height: `${(bill.usage / maxUsageWater) * 100}%`,
                        backgroundColor: '#3B82F6',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.usageBarLabel}>{bill.month.slice(0, 3)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tabRow}>
          {(['semua', 'listrik', 'air'] as FilterTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              {tab === 'listrik' && <Zap size={14} color={activeTab === tab ? colors.white : colors.textSecondary} />}
              {tab === 'air' && <Droplets size={14} color={activeTab === tab ? colors.white : colors.textSecondary} />}
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'semua' ? 'Semua' : tab === 'listrik' ? 'Listrik' : 'Air'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Riwayat Tagihan</Text>
        {filteredBills.map(bill => {
          const statusCfg = getStatusConfig(bill.status);
          const StatusIcon = statusCfg.icon;
          return (
            <TouchableOpacity
              key={bill.id}
              style={styles.billCard}
              onPress={() => handleOpenDetail(bill)}
              activeOpacity={0.7}
            >
              <View style={styles.billCardTop}>
                <View style={styles.billCardLeft}>
                  <View
                    style={[
                      styles.billCategoryIcon,
                      {
                        backgroundColor: bill.category === 'listrik' ? '#FEF3C7' : '#DBEAFE',
                      },
                    ]}
                  >
                    {bill.category === 'listrik' ? (
                      <Zap size={20} color="#F59E0B" />
                    ) : (
                      <Droplets size={20} color="#3B82F6" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.billTitle}>
                      {bill.category === 'listrik' ? 'Listrik' : 'Air'} - {bill.provider}
                    </Text>
                    <Text style={styles.billPeriod}>
                      {bill.month} {bill.year}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                  <StatusIcon size={12} color={statusCfg.color} />
                  <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                </View>
              </View>

              <View style={styles.billCardBottom}>
                <View style={styles.billInfo}>
                  <Text style={styles.billInfoLabel}>Pemakaian</Text>
                  <Text style={styles.billInfoValue}>
                    {bill.usage} {bill.unit}
                  </Text>
                </View>
                <View style={styles.billInfoDivider} />
                <View style={styles.billInfo}>
                  <Text style={styles.billInfoLabel}>Tagihan</Text>
                  <Text style={[styles.billInfoValue, { color: bill.status !== 'lunas' ? colors.error : colors.text }]}>
                    {formatCurrency(bill.amount)}
                  </Text>
                </View>
                <View style={styles.billInfoDivider} />
                <View style={styles.billInfo}>
                  <Text style={styles.billInfoLabel}>Jatuh Tempo</Text>
                  <Text style={styles.billInfoValue}>{formatDate(bill.dueDate)}</Text>
                </View>
              </View>

              {bill.status !== 'lunas' && (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handlePayBill(bill)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.payButtonText}>Bayar Sekarang</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}

        {filteredBills.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Belum ada tagihan</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            {selectedBill && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detail Tagihan</Text>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <X size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailIconRow}>
                  <View
                    style={[
                      styles.detailIconBox,
                      {
                        backgroundColor: selectedBill.category === 'listrik' ? '#FEF3C7' : '#DBEAFE',
                      },
                    ]}
                  >
                    {selectedBill.category === 'listrik' ? (
                      <Zap size={28} color="#F59E0B" />
                    ) : (
                      <Droplets size={28} color="#3B82F6" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.detailTitle}>
                      {selectedBill.category === 'listrik' ? 'Tagihan Listrik' : 'Tagihan Air'}
                    </Text>
                    <Text style={styles.detailPeriod}>
                      {selectedBill.month} {selectedBill.year}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailAmountBox}>
                  <Text style={styles.detailAmountLabel}>Total Tagihan</Text>
                  <Text style={styles.detailAmountValue}>{formatCurrency(selectedBill.amount)}</Text>
                </View>

                <View style={styles.detailGrid}>
                  <DetailRow label="Provider" value={selectedBill.provider} />
                  <DetailRow label="No. Pelanggan" value={selectedBill.accountNumber} />
                  <DetailRow label="Pemakaian" value={`${selectedBill.usage} ${selectedBill.unit}`} />
                  <DetailRow label="Jatuh Tempo" value={formatDate(selectedBill.dueDate)} />
                  <DetailRow
                    label="Status"
                    value={getStatusConfig(selectedBill.status).label}
                    valueColor={getStatusConfig(selectedBill.status).color}
                  />
                  {selectedBill.paidDate && (
                    <DetailRow label="Tanggal Bayar" value={formatDate(selectedBill.paidDate)} />
                  )}
                  {selectedBill.notes && <DetailRow label="Catatan" value={selectedBill.notes} />}
                </View>

                {selectedBill.status !== 'lunas' && (
                  <TouchableOpacity
                    style={styles.modalPayBtn}
                    onPress={() => {
                      setShowDetailModal(false);
                      handlePayBill(selectedBill);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalPayBtnText}>Bayar Tagihan</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showPayModal} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <View style={[styles.confirmIconBox, { backgroundColor: colors.successBg }]}>
              <CheckCircle2 size={32} color={colors.success} />
            </View>
            <Text style={styles.confirmTitle}>Konfirmasi Pembayaran</Text>
            {selectedBill && (
              <Text style={styles.confirmDesc}>
                Tandai tagihan {selectedBill.category === 'listrik' ? 'Listrik' : 'Air'}{' '}
                {selectedBill.month} {selectedBill.year} sebesar{' '}
                <Text style={{ fontWeight: '700' as const }}>{formatCurrency(selectedBill.amount)}</Text> sebagai lunas?
              </Text>
            )}
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setShowPayModal(false)}
              >
                <Text style={styles.confirmCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmPayBtn} onPress={confirmPayBill}>
                <Text style={styles.confirmPayText}>Ya, Lunas</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Tagihan</Text>
              <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Kategori</Text>
              <View style={styles.categoryRow}>
                <TouchableOpacity
                  style={[
                    styles.categoryBtn,
                    newCategory === 'listrik' && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
                  ]}
                  onPress={() => setNewCategory('listrik')}
                >
                  <Zap size={20} color="#F59E0B" />
                  <Text style={[styles.categoryBtnText, newCategory === 'listrik' && { color: '#F59E0B' }]}>
                    Listrik
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.categoryBtn,
                    newCategory === 'air' && { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
                  ]}
                  onPress={() => setNewCategory('air')}
                >
                  <Droplets size={20} color="#3B82F6" />
                  <Text style={[styles.categoryBtnText, newCategory === 'air' && { color: '#3B82F6' }]}>
                    Air
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Bulan</Text>
              <TextInput
                style={styles.formInput}
                value={newMonth}
                onChangeText={setNewMonth}
                placeholder="cth: Maret"
                placeholderTextColor={colors.textTertiary}
              />

              <Text style={styles.formLabel}>Tahun</Text>
              <TextInput
                style={styles.formInput}
                value={newYear}
                onChangeText={setNewYear}
                placeholder="cth: 2026"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
              />

              <Text style={styles.formLabel}>Jumlah Tagihan (Rp)</Text>
              <TextInput
                style={styles.formInput}
                value={newAmount}
                onChangeText={setNewAmount}
                placeholder="cth: 1500000"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
              />

              <Text style={styles.formLabel}>
                Pemakaian ({newCategory === 'listrik' ? 'kWh' : 'm³'})
              </Text>
              <TextInput
                style={styles.formInput}
                value={newUsage}
                onChangeText={setNewUsage}
                placeholder={newCategory === 'listrik' ? 'cth: 1500' : 'cth: 85'}
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
              />

              <Text style={styles.formLabel}>Jatuh Tempo (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.formInput}
                value={newDueDate}
                onChangeText={setNewDueDate}
                placeholder="cth: 2026-04-10"
                placeholderTextColor={colors.textTertiary}
              />

              <Text style={styles.formLabel}>Catatan (opsional)</Text>
              <TextInput
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                value={newNotes}
                onChangeText={setNewNotes}
                placeholder="Catatan tambahan..."
                placeholderTextColor={colors.textTertiary}
                multiline
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddBill} activeOpacity={0.8}>
                <Text style={styles.submitBtnText}>Tambah Tagihan</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowLabel}>{label}</Text>
      <Text style={[styles.detailRowValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
    </View>
  );
}

function getMonthIndex(month: string): number {
  const months: Record<string, number> = {
    Januari: 0, Februari: 1, Maret: 2, April: 3, Mei: 4, Juni: 5,
    Juli: 6, Agustus: 7, September: 8, Oktober: 9, November: 10, Desember: 11,
  };
  return months[month] ?? 0;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.white },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 16 },

  alertCard: {
    backgroundColor: colors.errorBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.error + '20',
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  alertTitle: { fontSize: 14, fontWeight: '600' as const, color: colors.error },
  alertAmount: { fontSize: 24, fontWeight: '800' as const, color: colors.error, marginBottom: 2 },
  alertSub: { fontSize: 12, color: colors.error + 'AA' },

  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryInfo: {},
  summaryLabel: { fontSize: 11, fontWeight: '500' as const, color: colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700' as const, color: colors.text, marginBottom: 2 },
  summaryUsage: { fontSize: 12, color: colors.textTertiary },

  usageSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700' as const, color: colors.text, marginBottom: 14 },
  usageChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    gap: 4,
  },
  usageBarContainer: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  usageBarValue: { fontSize: 9, fontWeight: '600' as const, color: colors.textSecondary, marginBottom: 4 },
  usageBarTrack: {
    width: '70%',
    flex: 1,
    borderRadius: 6,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  usageBar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 8,
  },
  usageBarLabel: { fontSize: 10, fontWeight: '500' as const, color: colors.textTertiary, marginTop: 4 },

  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginTop: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary },
  tabTextActive: { color: colors.white },

  billCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  billCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  billCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  billCategoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billTitle: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
  billPeriod: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '600' as const },
  billCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  billInfo: { flex: 1, alignItems: 'center' },
  billInfoLabel: { fontSize: 10, color: colors.textTertiary, marginBottom: 2 },
  billInfoValue: { fontSize: 12, fontWeight: '600' as const, color: colors.text },
  billInfoDivider: { width: 1, height: 28, backgroundColor: colors.border },
  payButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  payButtonText: { fontSize: 14, fontWeight: '600' as const, color: colors.white },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: colors.textTertiary },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.text },

  detailIconRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  detailIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTitle: { fontSize: 17, fontWeight: '700' as const, color: colors.text },
  detailPeriod: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  detailAmountBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  detailAmountLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  detailAmountValue: { fontSize: 26, fontWeight: '800' as const, color: colors.text },
  detailGrid: { gap: 0, marginBottom: 20 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailRowLabel: { fontSize: 13, color: colors.textSecondary },
  detailRowValue: { fontSize: 13, fontWeight: '600' as const, color: colors.text },
  modalPayBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalPayBtnText: { fontSize: 16, fontWeight: '600' as const, color: colors.white },

  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  confirmBox: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  confirmIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.text, marginBottom: 8 },
  confirmDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  confirmActions: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmCancelText: { fontSize: 14, fontWeight: '600' as const, color: colors.textSecondary },
  confirmPayBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmPayText: { fontSize: 14, fontWeight: '600' as const, color: colors.white },

  formLabel: { fontSize: 13, fontWeight: '600' as const, color: colors.text, marginBottom: 6, marginTop: 14 },
  formInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryRow: { flexDirection: 'row', gap: 12 },
  categoryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  categoryBtnText: { fontSize: 14, fontWeight: '600' as const, color: colors.textSecondary },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: { fontSize: 16, fontWeight: '600' as const, color: colors.white },
});
