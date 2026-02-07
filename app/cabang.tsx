import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, MapPin, Phone, Clock, Plus, X, Trash2, Pencil } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  isActive: boolean;
  totalMachines: number;
}

const STORAGE_KEY = 'cabang_data';

const initialBranches: Branch[] = [
  { id: '1', name: 'AtourWash Pusat', address: 'Jl. Merdeka No. 10, Jakarta Pusat', phone: '021-12345678', hours: '07:00 - 22:00', isActive: true, totalMachines: 12 },
  { id: '2', name: 'AtourWash Cabang Selatan', address: 'Jl. Sudirman No. 25, Jakarta Selatan', phone: '021-23456789', hours: '08:00 - 21:00', isActive: true, totalMachines: 8 },
  { id: '3', name: 'AtourWash Cabang Utara', address: 'Jl. Pluit Raya No. 5, Jakarta Utara', phone: '021-34567890', hours: '07:00 - 22:00', isActive: false, totalMachines: 6 },
];

export default function CabangScreen() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formMachines, setFormMachines] = useState('');
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setBranches(JSON.parse(stored));
      } catch (e) {
        console.log('Failed to load cabang', e);
      }
    };
    load();
  }, []);

  const persist = useCallback(async (data: Branch[]) => {
    setBranches(data);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.log('Failed to save cabang', e);
    }
  }, []);

  const openAdd = useCallback(() => {
    setEditingBranch(null);
    setFormName('');
    setFormAddress('');
    setFormPhone('');
    setFormHours('07:00 - 22:00');
    setFormMachines('');
    setFormActive(true);
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((b: Branch) => {
    setEditingBranch(b);
    setFormName(b.name);
    setFormAddress(b.address);
    setFormPhone(b.phone);
    setFormHours(b.hours);
    setFormMachines(b.totalMachines.toString());
    setFormActive(b.isActive);
    setDetailVisible(false);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formName.trim() || !formAddress.trim()) {
      Alert.alert('Error', 'Nama dan alamat cabang wajib diisi');
      return;
    }
    const machines = parseInt(formMachines, 10) || 0;
    if (editingBranch) {
      const updated = branches.map(b =>
        b.id === editingBranch.id ? { ...b, name: formName.trim(), address: formAddress.trim(), phone: formPhone.trim(), hours: formHours.trim(), totalMachines: machines, isActive: formActive } : b
      );
      persist(updated);
    } else {
      const newB: Branch = {
        id: Date.now().toString(),
        name: formName.trim(),
        address: formAddress.trim(),
        phone: formPhone.trim(),
        hours: formHours.trim(),
        totalMachines: machines,
        isActive: formActive,
      };
      persist([newB, ...branches]);
    }
    setModalVisible(false);
  }, [formName, formAddress, formPhone, formHours, formMachines, formActive, editingBranch, branches, persist]);

  const handleDelete = useCallback((b: Branch) => {
    Alert.alert('Hapus Cabang', `Yakin ingin menghapus ${b.name}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => { persist(branches.filter(x => x.id !== b.id)); setDetailVisible(false); } },
    ]);
  }, [branches, persist]);

  const renderBranch = ({ item }: { item: Branch }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => { setSelectedBranch(item); setDetailVisible(true); }}>
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: item.isActive ? colors.primaryBg : '#FEF2F2' }]}>
          <Building2 size={22} color={item.isActive ? colors.primary : colors.error} />
        </View>
        <View style={[styles.statusDot, { backgroundColor: item.isActive ? '#22C55E' : '#EF4444' }]} />
      </View>
      <Text style={styles.cardName}>{item.name}</Text>
      <View style={styles.infoRow}>
        <MapPin size={13} color={colors.textSecondary} />
        <Text style={styles.infoText} numberOfLines={2}>{item.address}</Text>
      </View>
      <View style={styles.infoRow}>
        <Phone size={13} color={colors.textSecondary} />
        <Text style={styles.infoText}>{item.phone}</Text>
      </View>
      <View style={styles.infoRow}>
        <Clock size={13} color={colors.textSecondary} />
        <Text style={styles.infoText}>{item.hours}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.machineText}>{item.totalMachines} mesin</Text>
        <Text style={[styles.statusText, { color: item.isActive ? colors.primary : colors.error }]}>
          {item.isActive ? 'Aktif' : 'Tutup'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cabang</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
              <Plus size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={branches}
        keyExtractor={item => item.id}
        renderItem={renderBranch}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Building2 size={48} color={colors.border} />
            <Text style={styles.emptyText}>Belum ada cabang</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingBranch ? 'Edit Cabang' : 'Tambah Cabang'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nama Cabang *</Text>
              <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="Nama cabang" placeholderTextColor={colors.textTertiary} />
              <Text style={styles.label}>Alamat *</Text>
              <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} value={formAddress} onChangeText={setFormAddress} placeholder="Alamat lengkap" placeholderTextColor={colors.textTertiary} multiline />
              <Text style={styles.label}>Telepon</Text>
              <TextInput style={styles.input} value={formPhone} onChangeText={setFormPhone} placeholder="021-12345678" placeholderTextColor={colors.textTertiary} keyboardType="phone-pad" />
              <Text style={styles.label}>Jam Operasional</Text>
              <TextInput style={styles.input} value={formHours} onChangeText={setFormHours} placeholder="07:00 - 22:00" placeholderTextColor={colors.textTertiary} />
              <Text style={styles.label}>Jumlah Mesin</Text>
              <TextInput style={styles.input} value={formMachines} onChangeText={setFormMachines} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="number-pad" />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Status Aktif</Text>
                <Switch value={formActive} onValueChange={setFormActive} trackColor={{ false: colors.border, true: colors.primaryLight }} thumbColor={colors.white} />
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>{editingBranch ? 'Simpan Perubahan' : 'Tambah Cabang'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={detailVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedBranch && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detail Cabang</Text>
                  <TouchableOpacity onPress={() => setDetailVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
                </View>
                <View style={styles.detailBody}>
                  <View style={[styles.detailIcon, { backgroundColor: selectedBranch.isActive ? colors.primaryBg : '#FEF2F2' }]}>
                    <Building2 size={32} color={selectedBranch.isActive ? colors.primary : colors.error} />
                  </View>
                  <Text style={styles.detailName}>{selectedBranch.name}</Text>
                  <View style={[styles.detailStatusBadge, { backgroundColor: selectedBranch.isActive ? colors.primaryBg : '#FEF2F2' }]}>
                    <Text style={[styles.detailStatusText, { color: selectedBranch.isActive ? colors.primary : colors.error }]}>{selectedBranch.isActive ? 'Aktif' : 'Tutup'}</Text>
                  </View>
                  <View style={styles.detailInfoSection}>
                    <View style={styles.detailRow}><MapPin size={16} color={colors.textSecondary} /><Text style={styles.detailValue}>{selectedBranch.address}</Text></View>
                    <View style={styles.detailRow}><Phone size={16} color={colors.textSecondary} /><Text style={styles.detailValue}>{selectedBranch.phone}</Text></View>
                    <View style={styles.detailRow}><Clock size={16} color={colors.textSecondary} /><Text style={styles.detailValue}>{selectedBranch.hours}</Text></View>
                  </View>
                  <View style={styles.detailStat}>
                    <Text style={styles.detailStatNum}>{selectedBranch.totalMachines}</Text>
                    <Text style={styles.detailStatLabel}>Mesin</Text>
                  </View>
                </View>
                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(selectedBranch)} activeOpacity={0.8}>
                    <Pencil size={16} color={colors.white} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(selectedBranch)} activeOpacity={0.8}>
                    <Trash2 size={16} color={colors.white} />
                    <Text style={styles.deleteBtnText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.white },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardName: { fontSize: 16, fontWeight: '700' as const, color: colors.text, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  infoText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  machineText: { fontSize: 13, fontWeight: '600' as const, color: colors.text },
  statusText: { fontSize: 13, fontWeight: '600' as const },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '700' as const, color: colors.text },
  modalBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingVertical: 4 },
  switchLabel: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  saveBtn: { backgroundColor: colors.primary, marginHorizontal: 20, marginVertical: 16, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700' as const, color: colors.white },
  detailBody: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  detailIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  detailName: { fontSize: 20, fontWeight: '700' as const, color: colors.text, marginBottom: 8 },
  detailStatusBadge: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 20 },
  detailStatusText: { fontSize: 13, fontWeight: '600' as const },
  detailInfoSection: { width: '100%', gap: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10 },
  detailValue: { fontSize: 14, color: colors.text, flex: 1 },
  detailStat: { alignItems: 'center', marginTop: 20, backgroundColor: colors.primaryBg, borderRadius: 14, paddingHorizontal: 30, paddingVertical: 14 },
  detailStatNum: { fontSize: 28, fontWeight: '800' as const, color: colors.primary },
  detailStatLabel: { fontSize: 12, color: colors.primary, marginTop: 2 },
  detailActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16 },
  editBtn: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  editBtnText: { fontSize: 15, fontWeight: '600' as const, color: colors.white },
  deleteBtn: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: colors.error, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { fontSize: 15, fontWeight: '600' as const, color: colors.white },
});
