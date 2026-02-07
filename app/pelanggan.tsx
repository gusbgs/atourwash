import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Users, Phone, MapPin, Plus, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
}

const STORAGE_KEY = 'pelanggan_data';

const initialCustomers: Customer[] = [
  { id: '1', name: 'Andi Pratama', phone: '081234567890', address: 'Jl. Merdeka No. 10, Jakarta', totalOrders: 12 },
  { id: '2', name: 'Siti Nurhaliza', phone: '082345678901', address: 'Jl. Sudirman No. 5, Bandung', totalOrders: 8 },
  { id: '3', name: 'Budi Santoso', phone: '083456789012', address: 'Jl. Gatot Subroto No. 15, Surabaya', totalOrders: 5 },
  { id: '4', name: 'Dewi Lestari', phone: '084567890123', address: 'Jl. Diponegoro No. 20, Yogyakarta', totalOrders: 15 },
  { id: '5', name: 'Rizky Hidayat', phone: '085678901234', address: 'Jl. Ahmad Yani No. 8, Semarang', totalOrders: 3 },
  { id: '6', name: 'Fitri Handayani', phone: '086789012345', address: 'Jl. Pahlawan No. 12, Malang', totalOrders: 7 },
];

export default function PelangganScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');


  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setCustomers(JSON.parse(stored));
      } catch (e) {
        console.log('Failed to load pelanggan', e);
      }
    };
    load();
  }, []);

  const persist = useCallback(async (data: Customer[]) => {
    setCustomers(data);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.log('Failed to save pelanggan', e);
    }
  }, []);

  const openAdd = useCallback(() => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formName.trim() || !formPhone.trim()) {
      Alert.alert('Error', 'Nama dan nomor telepon wajib diisi');
      return;
    }
    if (editingCustomer) {
      const updated = customers.map(c =>
        c.id === editingCustomer.id ? { ...c, name: formName.trim(), phone: formPhone.trim(), address: formAddress.trim() } : c
      );
      persist(updated);
    } else {
      const newC: Customer = {
        id: Date.now().toString(),
        name: formName.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        totalOrders: 0,
      };
      persist([newC, ...customers]);
    }
    setModalVisible(false);
  }, [formName, formPhone, formAddress, editingCustomer, customers, persist]);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => router.push({ pathname: '/customer-detail', params: { id: item.id } })}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.cardRow}>
          <Phone size={13} color={colors.textSecondary} />
          <Text style={styles.cardSub}>{item.phone}</Text>
        </View>
        <View style={styles.cardRow}>
          <MapPin size={13} color={colors.textSecondary} />
          <Text style={styles.cardSub} numberOfLines={1}>{item.address}</Text>
        </View>
      </View>
      <View style={styles.orderBadge}>
        <Text style={styles.orderBadgeText}>{item.totalOrders}</Text>
        <Text style={styles.orderBadgeLabel}>order</Text>
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
            <Text style={styles.headerTitle}>Pelanggan</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
              <Plus size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
        data={filtered}
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

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nama *</Text>
              <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="Nama pelanggan" placeholderTextColor={colors.textTertiary} />
              <Text style={styles.label}>No. Telepon *</Text>
              <TextInput style={styles.input} value={formPhone} onChangeText={setFormPhone} placeholder="081234567890" placeholderTextColor={colors.textTertiary} keyboardType="phone-pad" />
              <Text style={styles.label}>Alamat</Text>
              <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]} value={formAddress} onChangeText={setFormAddress} placeholder="Alamat lengkap" placeholderTextColor={colors.textTertiary} multiline />
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>{editingCustomer ? 'Simpan Perubahan' : 'Tambah Pelanggan'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, margin: 16, borderRadius: 12, paddingHorizontal: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.text },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '700' as const, color: colors.primary },
  cardContent: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardSub: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  orderBadge: { alignItems: 'center', backgroundColor: colors.primaryBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  orderBadgeText: { fontSize: 16, fontWeight: '700' as const, color: colors.primary },
  orderBadgeLabel: { fontSize: 10, color: colors.primary },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '700' as const, color: colors.text },
  modalBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  saveBtn: { backgroundColor: colors.primary, marginHorizontal: 20, marginVertical: 16, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700' as const, color: colors.white },

});
