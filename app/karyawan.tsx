import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, UserCog, Phone, Mail, Plus, X, Trash2, Pencil, Briefcase, Shield } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';

type EmployeeRole = 'kasir' | 'operator' | 'admin' | 'kurir';

interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: EmployeeRole;
  branch: string;
  joinDate: string;
  isActive: boolean;
}

const STORAGE_KEY = 'karyawan_data';

const ROLE_LABELS: Record<EmployeeRole, string> = {
  kasir: 'Kasir',
  operator: 'Operator',
  admin: 'Admin',
  kurir: 'Kurir',
};

const ROLE_COLORS: Record<EmployeeRole, { text: string; bg: string }> = {
  kasir: { text: colors.info, bg: colors.infoBg },
  operator: { text: colors.warning, bg: colors.warningBg },
  admin: { text: colors.primary, bg: colors.primaryBg },
  kurir: { text: '#8B5CF6', bg: '#EDE9FE' },
};

const ROLES: EmployeeRole[] = ['kasir', 'operator', 'admin', 'kurir'];

const initialEmployees: Employee[] = [
  { id: '1', name: 'Rina Wulandari', phone: '081234567890', email: 'rina@laundry.com', role: 'kasir', branch: 'Cabang Utama', joinDate: '2023-06-15', isActive: true },
  { id: '2', name: 'Dedi Kurniawan', phone: '082345678901', email: 'dedi@laundry.com', role: 'operator', branch: 'Cabang Utama', joinDate: '2023-08-01', isActive: true },
  { id: '3', name: 'Sri Mulyani', phone: '083456789012', email: 'sri@laundry.com', role: 'admin', branch: 'Cabang Selatan', joinDate: '2023-03-10', isActive: true },
  { id: '4', name: 'Agus Setiawan', phone: '084567890123', email: 'agus@laundry.com', role: 'kurir', branch: 'Cabang Utama', joinDate: '2024-01-05', isActive: true },
  { id: '5', name: 'Lina Marlina', phone: '085678901234', email: 'lina@laundry.com', role: 'kasir', branch: 'Cabang Selatan', joinDate: '2023-11-20', isActive: false },
  { id: '6', name: 'Hendra Wijaya', phone: '086789012345', email: 'hendra@laundry.com', role: 'operator', branch: 'Cabang Timur', joinDate: '2024-02-12', isActive: true },
];

export default function KaryawanScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<EmployeeRole>('kasir');
  const [formBranch, setFormBranch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setEmployees(JSON.parse(stored));
      } catch (e) {
        console.log('Failed to load karyawan', e);
      }
    };
    load();
  }, []);

  const persist = useCallback(async (data: Employee[]) => {
    setEmployees(data);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.log('Failed to save karyawan', e);
    }
  }, []);

  const openAdd = useCallback(() => {
    setEditingEmployee(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormRole('kasir');
    setFormBranch('');
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((emp: Employee) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormPhone(emp.phone);
    setFormEmail(emp.email);
    setFormRole(emp.role);
    setFormBranch(emp.branch);
    setDetailVisible(false);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formName.trim() || !formPhone.trim()) {
      Alert.alert('Error', 'Nama dan nomor telepon wajib diisi');
      return;
    }
    if (editingEmployee) {
      const updated = employees.map(e =>
        e.id === editingEmployee.id
          ? { ...e, name: formName.trim(), phone: formPhone.trim(), email: formEmail.trim(), role: formRole, branch: formBranch.trim() }
          : e
      );
      persist(updated);
    } else {
      const newEmp: Employee = {
        id: Date.now().toString(),
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        role: formRole,
        branch: formBranch.trim(),
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true,
      };
      persist([newEmp, ...employees]);
    }
    setModalVisible(false);
  }, [formName, formPhone, formEmail, formRole, formBranch, editingEmployee, employees, persist]);

  const handleDelete = useCallback((emp: Employee) => {
    Alert.alert('Hapus Karyawan', `Yakin ingin menghapus ${emp.name}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: () => {
          persist(employees.filter(x => x.id !== emp.id));
          setDetailVisible(false);
        }
      },
    ]);
  }, [employees, persist]);

  const toggleActive = useCallback((emp: Employee) => {
    const updated = employees.map(e =>
      e.id === emp.id ? { ...e, isActive: !e.isActive } : e
    );
    persist(updated);
    if (selectedEmployee?.id === emp.id) {
      setSelectedEmployee({ ...emp, isActive: !emp.isActive });
    }
  }, [employees, persist, selectedEmployee]);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.phone.includes(search) ||
    ROLE_LABELS[e.role].toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const renderEmployee = ({ item }: { item: Employee }) => {
    const roleColor = ROLE_COLORS[item.role];
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => { setSelectedEmployee(item); setDetailVisible(true); }}>
        <View style={[styles.avatar, !item.isActive && styles.avatarInactive]}>
          <Text style={[styles.avatarText, !item.isActive && styles.avatarTextInactive]}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={[styles.cardName, !item.isActive && styles.nameInactive]}>{item.name}</Text>
            {!item.isActive && <View style={styles.inactiveDot} />}
          </View>
          <View style={styles.cardRow}>
            <Phone size={12} color={colors.textSecondary} />
            <Text style={styles.cardSub}>{item.phone}</Text>
          </View>
          <View style={styles.cardRow}>
            <Briefcase size={12} color={colors.textSecondary} />
            <Text style={styles.cardSub}>{item.branch}</Text>
          </View>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: roleColor.bg }]}>
          <Text style={[styles.roleBadgeText, { color: roleColor.text }]}>{ROLE_LABELS[item.role]}</Text>
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
            <Text style={styles.headerTitle}>Karyawan</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
              <Plus size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{employees.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.success }]}>{employees.filter(e => e.isActive).length}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.error }]}>{employees.filter(e => !e.isActive).length}</Text>
          <Text style={styles.statLabel}>Nonaktif</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari karyawan..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderEmployee}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <UserCog size={48} color={colors.border} />
            <Text style={styles.emptyText}>Tidak ada karyawan ditemukan</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nama *</Text>
              <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="Nama karyawan" placeholderTextColor={colors.textTertiary} />
              <Text style={styles.label}>No. Telepon *</Text>
              <TextInput style={styles.input} value={formPhone} onChangeText={setFormPhone} placeholder="081234567890" placeholderTextColor={colors.textTertiary} keyboardType="phone-pad" />
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={formEmail} onChangeText={setFormEmail} placeholder="email@laundry.com" placeholderTextColor={colors.textTertiary} keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.label}>Jabatan *</Text>
              <View style={styles.roleSelector}>
                {ROLES.map(r => {
                  const rc = ROLE_COLORS[r];
                  const selected = formRole === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleChip, selected && { backgroundColor: rc.bg, borderColor: rc.text }]}
                      onPress={() => setFormRole(r)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.roleChipText, selected && { color: rc.text, fontWeight: '700' as const }]}>{ROLE_LABELS[r]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.label}>Cabang</Text>
              <TextInput style={styles.input} value={formBranch} onChangeText={setFormBranch} placeholder="Cabang Utama" placeholderTextColor={colors.textTertiary} />
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>{editingEmployee ? 'Simpan Perubahan' : 'Tambah Karyawan'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={detailVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedEmployee && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detail Karyawan</Text>
                  <TouchableOpacity onPress={() => setDetailVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
                </View>
                <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.detailBody}>
                    <View style={[styles.detailAvatar, !selectedEmployee.isActive && styles.avatarInactive]}>
                      <Text style={[styles.detailAvatarText, !selectedEmployee.isActive && styles.avatarTextInactive]}>{selectedEmployee.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.detailName}>{selectedEmployee.name}</Text>
                    <View style={[styles.roleBadgeLg, { backgroundColor: ROLE_COLORS[selectedEmployee.role].bg }]}>
                      <Shield size={14} color={ROLE_COLORS[selectedEmployee.role].text} />
                      <Text style={[styles.roleBadgeLgText, { color: ROLE_COLORS[selectedEmployee.role].text }]}>{ROLE_LABELS[selectedEmployee.role]}</Text>
                    </View>

                    <View style={styles.detailInfoCard}>
                      <View style={styles.detailRow}>
                        <Phone size={16} color={colors.textSecondary} />
                        <Text style={styles.detailLabel}>Telepon</Text>
                        <Text style={styles.detailValue}>{selectedEmployee.phone}</Text>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailRow}>
                        <Mail size={16} color={colors.textSecondary} />
                        <Text style={styles.detailLabel}>Email</Text>
                        <Text style={styles.detailValue}>{selectedEmployee.email || '-'}</Text>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailRow}>
                        <Briefcase size={16} color={colors.textSecondary} />
                        <Text style={styles.detailLabel}>Cabang</Text>
                        <Text style={styles.detailValue}>{selectedEmployee.branch || '-'}</Text>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailRow}>
                        <UserCog size={16} color={colors.textSecondary} />
                        <Text style={styles.detailLabel}>Bergabung</Text>
                        <Text style={styles.detailValue}>{formatDate(selectedEmployee.joinDate)}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.statusToggle, selectedEmployee.isActive ? styles.statusActive : styles.statusInactive]}
                      onPress={() => toggleActive(selectedEmployee)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.statusDot, { backgroundColor: selectedEmployee.isActive ? colors.success : colors.error }]} />
                      <Text style={[styles.statusToggleText, { color: selectedEmployee.isActive ? colors.success : colors.error }]}>
                        {selectedEmployee.isActive ? 'Aktif' : 'Nonaktif'}
                      </Text>
                      <Text style={styles.statusToggleHint}>Ketuk untuk {selectedEmployee.isActive ? 'nonaktifkan' : 'aktifkan'}</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(selectedEmployee)} activeOpacity={0.8}>
                    <Pencil size={16} color={colors.white} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(selectedEmployee)} activeOpacity={0.8}>
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
  statsRow: { flexDirection: 'row', backgroundColor: colors.white, marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800' as const, color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: 16, marginTop: 12, borderRadius: 12, paddingHorizontal: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.text },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarInactive: { backgroundColor: colors.surfaceSecondary },
  avatarText: { fontSize: 18, fontWeight: '700' as const, color: colors.primary },
  avatarTextInactive: { color: colors.textTertiary },
  cardContent: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardName: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  nameInactive: { color: colors.textTertiary },
  inactiveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.error },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardSub: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  roleBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  roleBadgeText: { fontSize: 11, fontWeight: '700' as const },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '700' as const, color: colors.text },
  modalBody: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  roleSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  roleChipText: { fontSize: 13, fontWeight: '500' as const, color: colors.textSecondary },
  saveBtn: { backgroundColor: colors.primary, marginHorizontal: 20, marginVertical: 16, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700' as const, color: colors.white },
  detailScroll: { maxHeight: 420 },
  detailBody: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  detailAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  detailAvatarText: { fontSize: 28, fontWeight: '700' as const, color: colors.primary },
  detailName: { fontSize: 20, fontWeight: '700' as const, color: colors.text, marginBottom: 8 },
  roleBadgeLg: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, marginBottom: 20 },
  roleBadgeLgText: { fontSize: 13, fontWeight: '700' as const },
  detailInfoCard: { width: '100%', backgroundColor: colors.background, borderRadius: 14, padding: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { fontSize: 13, color: colors.textSecondary, width: 70 },
  detailValue: { fontSize: 14, color: colors.text, flex: 1, textAlign: 'right' as const },
  detailDivider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  statusToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, width: '100%' },
  statusActive: { backgroundColor: colors.successBg },
  statusInactive: { backgroundColor: colors.errorBg },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusToggleText: { fontSize: 14, fontWeight: '700' as const },
  statusToggleHint: { fontSize: 11, color: colors.textTertiary, marginLeft: 'auto' },
  detailActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16 },
  editBtn: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  editBtnText: { fontSize: 15, fontWeight: '600' as const, color: colors.white },
  deleteBtn: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: colors.error, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { fontSize: 15, fontWeight: '600' as const, color: colors.white },
});
