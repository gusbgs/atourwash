import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Search, Users, Check, Mail, X, CheckCircle2, Info } from '@/utils/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';
import { BroadcastTemplate, BroadcastHistory } from '@/types';
import { mockBroadcastTemplates, mockBroadcastHistory } from '@/mocks/data';

const TEMPLATES_KEY = 'broadcast_templates';
const HISTORY_KEY = 'broadcast_history';
const PELANGGAN_KEY = 'pelanggan_data';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
}

const fallbackCustomers: Customer[] = [
  { id: '1', name: 'Andi Pratama', phone: '081234567890', address: 'Jl. Merdeka No. 10, Jakarta', totalOrders: 12 },
  { id: '2', name: 'Siti Nurhaliza', phone: '082345678901', address: 'Jl. Sudirman No. 5, Bandung', totalOrders: 8 },
  { id: '3', name: 'Budi Santoso', phone: '083456789012', address: 'Jl. Gatot Subroto No. 15, Surabaya', totalOrders: 5 },
  { id: '4', name: 'Dewi Lestari', phone: '084567890123', address: 'Jl. Diponegoro No. 20, Yogyakarta', totalOrders: 15 },
  { id: '5', name: 'Rizky Hidayat', phone: '085678901234', address: 'Jl. Ahmad Yani No. 8, Semarang', totalOrders: 3 },
  { id: '6', name: 'Fitri Handayani', phone: '086789012345', address: 'Jl. Pahlawan No. 12, Malang', totalOrders: 7 },
];

export default function BroadcastSendScreen() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const [template, setTemplate] = useState<BroadcastTemplate | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const storedT = await AsyncStorage.getItem(TEMPLATES_KEY);
        const allTemplates: BroadcastTemplate[] = storedT ? JSON.parse(storedT) : mockBroadcastTemplates;
        const found = allTemplates.find(t => t.id === templateId);
        if (found) setTemplate(found);

        const storedC = await AsyncStorage.getItem(PELANGGAN_KEY);
        const allCustomers: Customer[] = storedC ? JSON.parse(storedC) : fallbackCustomers;
        setCustomers(allCustomers);
      } catch (e) {
        console.log('Failed to load data', e);
        setCustomers(fallbackCustomers);
      }
    };
    load();
  }, [templateId]);

  const toggleCustomer = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    }
  }, [selectedIds, customers, search]);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, search]);

  const handleSend = useCallback(async () => {
    if (selectedIds.size === 0) {
      Alert.alert('Pilih Penerima', 'Pilih minimal 1 pelanggan sebagai penerima broadcast');
      return;
    }
    if (!template) return;

    Alert.alert(
      'Kirim Broadcast',
      `Kirim pesan "${template.name}" ke ${selectedIds.size} pelanggan?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kirim',
          onPress: async () => {
            setSending(true);
            await new Promise(resolve => setTimeout(resolve, 2000));

            const newHistory: BroadcastHistory = {
              id: `bh_${Date.now()}`,
              templateId: template.id,
              templateName: template.name,
              recipientCount: selectedIds.size,
              sentAt: new Date().toISOString(),
              status: 'terkirim',
            };

            try {
              const storedH = await AsyncStorage.getItem(HISTORY_KEY);
              const allHistory: BroadcastHistory[] = storedH ? JSON.parse(storedH) : mockBroadcastHistory;
              await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([newHistory, ...allHistory]));
            } catch (e) {
              console.log('Failed to save history', e);
            }

            setSending(false);
            setSent(true);
          },
        },
      ]
    );
  }, [selectedIds, template]);

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerInner}>
              <View style={{ width: 36 }} />
              <Text style={styles.headerTitle}>Broadcast Terkirim</Text>
              <View style={{ width: 36 }} />
            </View>
          </SafeAreaView>
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <CheckCircle2 size={56} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Broadcast Berhasil!</Text>
          <Text style={styles.successSubtitle}>
            Pesan "{template?.name}" telah dikirim ke {selectedIds.size} pelanggan
          </Text>
          <View style={styles.successStats}>
            <View style={styles.successStat}>
              <Text style={styles.successStatValue}>{selectedIds.size}</Text>
              <Text style={styles.successStatLabel}>Penerima</Text>
            </View>
            <View style={[styles.successStat, styles.successStatBorder]}>
              <Text style={[styles.successStatValue, { color: colors.success }]}>{selectedIds.size}</Text>
              <Text style={styles.successStatLabel}>Terkirim</Text>
            </View>
            <View style={styles.successStat}>
              <Text style={[styles.successStatValue, { color: colors.error }]}>0</Text>
              <Text style={styles.successStatLabel}>Gagal</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Kembali ke Broadcast</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderCustomer = ({ item }: { item: Customer }) => {
    const isSelected = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.customerCard, isSelected && styles.customerCardSelected]}
        activeOpacity={0.7}
        onPress={() => toggleCustomer(item.id)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Check size={14} color={colors.white} />}
        </View>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          <Text style={styles.customerPhone}>{item.phone}</Text>
        </View>
        <View style={styles.ordersBadge}>
          <Text style={styles.ordersBadgeText}>{item.totalOrders}</Text>
          <Text style={styles.ordersBadgeLabel}>order</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Kirim Broadcast</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </View>

      {template && (
        <View style={styles.templatePreview}>
          <View style={styles.templatePreviewIcon}>
            <Mail size={20} color={colors.primary} />
          </View>
          <View style={styles.templatePreviewContent}>
            <Text style={styles.templatePreviewName}>{template.name}</Text>
            <Text style={styles.templatePreviewMsg} numberOfLines={2}>{template.message}</Text>
          </View>
        </View>
      )}

      <View style={styles.selectionBar}>
        <TouchableOpacity onPress={selectAll} style={styles.selectAllBtn}>
          <View style={[styles.checkboxSmall, selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0 && styles.checkboxSmallSelected]}>
            {selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0 && <Check size={10} color={colors.white} />}
          </View>
          <Text style={styles.selectAllText}>Pilih Semua</Text>
        </TouchableOpacity>
        <Text style={styles.selectedCount}>{selectedIds.size} dipilih</Text>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari pelanggan..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={item => item.id}
        renderItem={renderCustomer}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Users size={48} color={colors.border} />
            <Text style={styles.emptyText}>Tidak ada pelanggan ditemukan</Text>
          </View>
        }
      />

      <View style={styles.bottomBar}>
        <SafeAreaView edges={['bottom']}>
          <TouchableOpacity
            style={[styles.broadcastBtn, selectedIds.size === 0 && styles.broadcastBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={sending || selectedIds.size === 0}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Mail size={18} color={colors.white} />
                <Text style={styles.broadcastBtnText}>
                  Kirim ke {selectedIds.size} Pelanggan
                </Text>
              </>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.white },
  templatePreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryBg, margin: 16, marginBottom: 0, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: colors.primary + '30' },
  templatePreviewIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' },
  templatePreviewContent: { flex: 1, gap: 3 },
  templatePreviewName: { fontSize: 14, fontWeight: '600' as const, color: colors.primary },
  templatePreviewMsg: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  selectionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  selectAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkboxSmall: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  checkboxSmallSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectAllText: { fontSize: 13, fontWeight: '600' as const, color: colors.text },
  selectedCount: { fontSize: 13, color: colors.primary, fontWeight: '600' as const },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: 16, marginTop: 10, marginBottom: 4, borderRadius: 12, paddingHorizontal: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: colors.text },
  list: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 8 },
  customerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  customerCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryBg + '40' },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  customerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  customerAvatarText: { fontSize: 16, fontWeight: '700' as const, color: colors.primary },
  customerInfo: { flex: 1, gap: 2 },
  customerName: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
  customerPhone: { fontSize: 12, color: colors.textSecondary },
  ordersBadge: { alignItems: 'center', backgroundColor: colors.surfaceSecondary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  ordersBadgeText: { fontSize: 14, fontWeight: '700' as const, color: colors.textSecondary },
  ordersBadgeLabel: { fontSize: 9, color: colors.textTertiary },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 12 },
  broadcastBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15 },
  broadcastBtnDisabled: { backgroundColor: colors.textTertiary },
  broadcastBtnText: { fontSize: 15, fontWeight: '700' as const, color: colors.white },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.successBg, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 22, fontWeight: '700' as const, color: colors.text, marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' as const, lineHeight: 20 },
  successStats: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 16, marginTop: 28, paddingVertical: 18, paddingHorizontal: 8, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  successStat: { flex: 1, alignItems: 'center', gap: 4 },
  successStatBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  successStatValue: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  successStatLabel: { fontSize: 12, color: colors.textSecondary },
  doneBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 40, marginTop: 28, alignItems: 'center' },
  doneBtnText: { fontSize: 15, fontWeight: '700' as const, color: colors.white },
});
