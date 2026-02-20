import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Package, AlertCircle, Plus, X, Trash2, Pencil, Minus } from '@/utils/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  category: string;
}

const STORAGE_KEY = 'inventaris_data';

const CATEGORIES = ['Bahan Cuci', 'Pewangi', 'Packing', 'Lainnya'];

const initialInventory: InventoryItem[] = [
  { id: '1', name: 'Deterjen Bubuk', stock: 25, unit: 'kg', minStock: 10, category: 'Bahan Cuci' },
  { id: '2', name: 'Pewangi Lavender', stock: 8, unit: 'liter', minStock: 5, category: 'Pewangi' },
  { id: '3', name: 'Pemutih', stock: 3, unit: 'liter', minStock: 5, category: 'Bahan Cuci' },
  { id: '4', name: 'Plastik Packing (Besar)', stock: 150, unit: 'lembar', minStock: 50, category: 'Packing' },
  { id: '5', name: 'Plastik Packing (Kecil)', stock: 40, unit: 'lembar', minStock: 50, category: 'Packing' },
  { id: '6', name: 'Pewangi Rose', stock: 12, unit: 'liter', minStock: 5, category: 'Pewangi' },
  { id: '7', name: 'Softener', stock: 6, unit: 'liter', minStock: 5, category: 'Bahan Cuci' },
];

export default function InventarisScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [stockAdjust, setStockAdjust] = useState('');

  const [formName, setFormName] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formMinStock, setFormMinStock] = useState('');
  const [formCategory, setFormCategory] = useState('Bahan Cuci');

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setItems(JSON.parse(stored));
      } catch (e) {
        console.log('Failed to load inventaris', e);
      }
    };
    load();
  }, []);

  const persist = useCallback(async (data: InventoryItem[]) => {
    setItems(data);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.log('Failed to save inventaris', e);
    }
  }, []);

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setFormName('');
    setFormStock('');
    setFormUnit('');
    setFormMinStock('');
    setFormCategory('Bahan Cuci');
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormStock(item.stock.toString());
    setFormUnit(item.unit);
    setFormMinStock(item.minStock.toString());
    setFormCategory(item.category);
    setDetailVisible(false);
    setModalVisible(true);
  }, []);

  const openStockAdjust = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setStockAdjust('');
    setDetailVisible(false);
    setStockModalVisible(true);
  }, []);

  const handleStockAdjust = useCallback((type: 'add' | 'subtract') => {
    if (!selectedItem) return;
    const amount = parseFloat(stockAdjust) || 0;
    if (amount <= 0) {
      Alert.alert('Error', 'Jumlah harus lebih dari 0');
      return;
    }
    const newStock = type === 'add' ? selectedItem.stock + amount : Math.max(0, selectedItem.stock - amount);
    const updated = items.map(i => i.id === selectedItem.id ? { ...i, stock: newStock } : i);
    persist(updated);
    setStockModalVisible(false);
  }, [selectedItem, stockAdjust, items, persist]);

  const handleSave = useCallback(() => {
    if (!formName.trim() || !formUnit.trim()) {
      Alert.alert('Error', 'Nama dan satuan wajib diisi');
      return;
    }
    const stock = parseFloat(formStock) || 0;
    const minStock = parseFloat(formMinStock) || 0;
    if (editingItem) {
      const updated = items.map(i =>
        i.id === editingItem.id ? { ...i, name: formName.trim(), stock, unit: formUnit.trim(), minStock, category: formCategory } : i
      );
      persist(updated);
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: formName.trim(),
        stock,
        unit: formUnit.trim(),
        minStock,
        category: formCategory,
      };
      persist([newItem, ...items]);
    }
    setModalVisible(false);
  }, [formName, formStock, formUnit, formMinStock, formCategory, editingItem, items, persist]);

  const handleDelete = useCallback((item: InventoryItem) => {
    Alert.alert('Hapus Item', `Yakin ingin menghapus ${item.name}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => { persist(items.filter(x => x.id !== item.id)); setDetailVisible(false); } },
    ]);
  }, [items, persist]);

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = items.filter(i => i.stock <= i.minStock).length;

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const isLow = item.stock <= item.minStock;
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => { setSelectedItem(item); setDetailVisible(true); }}>
        <View style={[styles.iconBox, { backgroundColor: isLow ? '#FEF2F2' : colors.primaryBg }]}>
          {isLow ? <AlertCircle size={20} color="#EF4444" /> : <Package size={20} color={colors.primary} />}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
        </View>
        <View style={styles.stockInfo}>
          <Text style={[styles.stockValue, isLow && { color: '#EF4444' }]}>{item.stock}</Text>
          <Text style={styles.stockUnit}>{item.unit}</Text>
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
            <Text style={styles.headerTitle}>Inventaris</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
              <Plus size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {lowStock > 0 && (
        <View style={styles.alertBanner}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.alertText}>{lowStock} item stok rendah / habis</Text>
        </View>
      )}

      <View style={styles.searchBox}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari item..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={48} color={colors.border} />
            <Text style={styles.emptyText}>Tidak ada item ditemukan</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem ? 'Edit Item' : 'Tambah Item'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nama Item *</Text>
              <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="Nama item" placeholderTextColor={colors.textTertiary} />

              <Text style={styles.label}>Kategori</Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryChip, formCategory === cat && styles.categoryChipActive]}
                    onPress={() => setFormCategory(cat)}
                  >
                    <Text style={[styles.categoryChipText, formCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Stok</Text>
                  <TextInput style={styles.input} value={formStock} onChangeText={setFormStock} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Satuan *</Text>
                  <TextInput style={styles.input} value={formUnit} onChangeText={setFormUnit} placeholder="kg / liter / lembar" placeholderTextColor={colors.textTertiary} />
                </View>
              </View>

              <Text style={styles.label}>Stok Minimum</Text>
              <TextInput style={styles.input} value={formMinStock} onChangeText={setFormMinStock} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>{editingItem ? 'Simpan Perubahan' : 'Tambah Item'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={detailVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detail Item</Text>
                  <TouchableOpacity onPress={() => setDetailVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
                </View>
                <View style={styles.detailBody}>
                  <View style={[styles.detailIcon, { backgroundColor: selectedItem.stock <= selectedItem.minStock ? '#FEF2F2' : colors.primaryBg }]}>
                    <Package size={32} color={selectedItem.stock <= selectedItem.minStock ? colors.error : colors.primary} />
                  </View>
                  <Text style={styles.detailName}>{selectedItem.name}</Text>
                  <View style={styles.detailCatBadge}>
                    <Text style={styles.detailCatText}>{selectedItem.category}</Text>
                  </View>
                  <View style={styles.detailStockRow}>
                    <View style={styles.detailStatBox}>
                      <Text style={[styles.detailStatNum, selectedItem.stock <= selectedItem.minStock && { color: colors.error }]}>{selectedItem.stock}</Text>
                      <Text style={styles.detailStatLabel}>Stok ({selectedItem.unit})</Text>
                    </View>
                    <View style={styles.detailStatBox}>
                      <Text style={styles.detailStatNum}>{selectedItem.minStock}</Text>
                      <Text style={styles.detailStatLabel}>Min. Stok</Text>
                    </View>
                  </View>
                  {selectedItem.stock <= selectedItem.minStock && (
                    <View style={styles.detailAlert}>
                      <AlertCircle size={14} color={colors.error} />
                      <Text style={styles.detailAlertText}>Stok rendah, segera restock!</Text>
                    </View>
                  )}
                </View>
                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.stockBtn} onPress={() => openStockAdjust(selectedItem)} activeOpacity={0.8}>
                    <Package size={16} color={colors.white} />
                    <Text style={styles.editBtnText}>Atur Stok</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.detailActions2}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(selectedItem)} activeOpacity={0.8}>
                    <Pencil size={16} color={colors.white} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(selectedItem)} activeOpacity={0.8}>
                    <Trash2 size={16} color={colors.white} />
                    <Text style={styles.deleteBtnText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={stockModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView style={styles.stockOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.stockContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Atur Stok</Text>
              <TouchableOpacity onPress={() => setStockModalVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
            </View>
            {selectedItem && (
              <View style={styles.stockBody}>
                <Text style={styles.stockItemName}>{selectedItem.name}</Text>
                <Text style={styles.stockCurrent}>Stok saat ini: <Text style={{ fontWeight: '700' as const }}>{selectedItem.stock} {selectedItem.unit}</Text></Text>
                <TextInput
                  style={styles.stockInput}
                  value={stockAdjust}
                  onChangeText={setStockAdjust}
                  placeholder="Jumlah"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                />
                <View style={styles.stockActions}>
                  <TouchableOpacity style={styles.stockSubtractBtn} onPress={() => handleStockAdjust('subtract')} activeOpacity={0.8}>
                    <Minus size={18} color={colors.white} />
                    <Text style={styles.stockActionText}>Kurangi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.stockAddBtn} onPress={() => handleStockAdjust('add')} activeOpacity={0.8}>
                    <Plus size={18} color={colors.white} />
                    <Text style={styles.stockActionText}>Tambah</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', marginHorizontal: 16, marginTop: 16, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  alertText: { fontSize: 13, fontWeight: '500' as const, color: '#EF4444' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, margin: 16, borderRadius: 12, paddingHorizontal: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.text },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardContent: { flex: 1, gap: 2 },
  cardName: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
  cardCategory: { fontSize: 12, color: colors.textSecondary },
  stockInfo: { alignItems: 'center' },
  stockValue: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  stockUnit: { fontSize: 11, color: colors.textSecondary },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '700' as const, color: colors.text },
  modalBody: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  categoryChipActive: { backgroundColor: colors.primaryBg, borderColor: colors.primary },
  categoryChipText: { fontSize: 13, color: colors.textSecondary },
  categoryChipTextActive: { color: colors.primary, fontWeight: '600' as const },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  saveBtn: { backgroundColor: colors.primary, marginHorizontal: 20, marginVertical: 16, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700' as const, color: colors.white },
  detailBody: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  detailIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  detailName: { fontSize: 20, fontWeight: '700' as const, color: colors.text, marginBottom: 8 },
  detailCatBadge: { backgroundColor: colors.surfaceSecondary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 20 },
  detailCatText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' as const },
  detailStockRow: { flexDirection: 'row', gap: 16 },
  detailStatBox: { alignItems: 'center', backgroundColor: colors.background, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  detailStatNum: { fontSize: 28, fontWeight: '800' as const, color: colors.primary },
  detailStatLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  detailAlert: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  detailAlertText: { fontSize: 13, color: colors.error, fontWeight: '500' as const },
  detailActions: { paddingHorizontal: 20, paddingTop: 12 },
  detailActions2: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16 },
  stockBtn: { flexDirection: 'row', gap: 8, backgroundColor: colors.info, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  editBtn: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  editBtnText: { fontSize: 15, fontWeight: '600' as const, color: colors.white },
  deleteBtn: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: colors.error, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { fontSize: 15, fontWeight: '600' as const, color: colors.white },
  stockOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  stockContent: { backgroundColor: colors.white, borderRadius: 24, width: '85%', maxWidth: 400 },
  stockBody: { padding: 20, alignItems: 'center' },
  stockItemName: { fontSize: 17, fontWeight: '700' as const, color: colors.text, marginBottom: 4 },
  stockCurrent: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  stockInput: { backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 20, fontWeight: '700' as const, color: colors.text, borderWidth: 1, borderColor: colors.border, textAlign: 'center', width: '100%', marginBottom: 16 },
  stockActions: { flexDirection: 'row', gap: 12, width: '100%' },
  stockSubtractBtn: { flex: 1, flexDirection: 'row', gap: 6, backgroundColor: colors.error, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  stockAddBtn: { flex: 1, flexDirection: 'row', gap: 6, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  stockActionText: { fontSize: 15, fontWeight: '600' as const, color: colors.white },
});
