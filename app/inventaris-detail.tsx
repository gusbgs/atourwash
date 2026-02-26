import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Package, AlertCircle, Plus, X, Trash2, Pencil, Minus, ArrowUpRight, ArrowDownLeft, MapPin, Store, Calendar } from '@/utils/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';
import { InventoryItem, StockMovement } from '@/types';
import { mockInventoryItems, mockStockMovements } from '@/mocks/data';

const STORAGE_KEY = 'inventaris_data';
const MOVEMENTS_KEY = 'stock_movements_data';
const CATEGORIES = ['Bahan Cuci', 'Pewangi', 'Packing', 'Lainnya'];

type DetailTab = 'info' | 'masuk' | 'keluar' | 'kartu';

export default function InventarisDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [allItems, setAllItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [movements, setMovements] = useState<StockMovement[]>(mockStockMovements);
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [stockAdjust, setStockAdjust] = useState('');
  const [stockNote, setStockNote] = useState('');

  const [formName, setFormName] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formMinStock, setFormMinStock] = useState('');
  const [formCategory, setFormCategory] = useState('Bahan Cuci');
  const [formPrice, setFormPrice] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formLocation, setFormLocation] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
        const itemsList: InventoryItem[] = storedItems ? JSON.parse(storedItems) : mockInventoryItems;
        setAllItems(itemsList);
        const found = itemsList.find(i => i.id === id);
        if (found) setItem(found);

        const storedMovements = await AsyncStorage.getItem(MOVEMENTS_KEY);
        if (storedMovements) setMovements(JSON.parse(storedMovements));
      } catch (e) {
        console.log('Failed to load data', e);
      }
    };
    load();
  }, [id]);

  const persistItems = useCallback(async (data: InventoryItem[]) => {
    setAllItems(data);
    const found = data.find(i => i.id === id);
    if (found) setItem(found);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.log('Failed to save inventaris', e);
    }
  }, [id]);

  const persistMovements = useCallback(async (data: StockMovement[]) => {
    setMovements(data);
    try {
      await AsyncStorage.setItem(MOVEMENTS_KEY, JSON.stringify(data));
    } catch (e) {
      console.log('Failed to save movements', e);
    }
  }, []);

  const itemMovements = useMemo(() =>
    movements.filter(m => m.itemId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [movements, id]
  );

  const masukMovements = useMemo(() => itemMovements.filter(m => m.type === 'masuk'), [itemMovements]);
  const keluarMovements = useMemo(() => itemMovements.filter(m => m.type === 'keluar'), [itemMovements]);

  const stockCard = useMemo(() => {
    return [...itemMovements].reverse();
  }, [itemMovements]);

  const totalMasuk = useMemo(() => masukMovements.reduce((sum, m) => sum + m.quantity, 0), [masukMovements]);
  const totalKeluar = useMemo(() => keluarMovements.reduce((sum, m) => sum + m.quantity, 0), [keluarMovements]);

  const formatDate = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }, []);

  const formatTime = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const formatCurrency = useCallback((n: number) => {
    return 'Rp ' + n.toLocaleString('id-ID');
  }, []);

  const openEdit = useCallback(() => {
    if (!item) return;
    setFormName(item.name);
    setFormStock(item.stock.toString());
    setFormUnit(item.unit);
    setFormMinStock(item.minStock.toString());
    setFormCategory(item.category);
    setFormPrice(item.price?.toString() || '');
    setFormSupplier(item.supplier || '');
    setFormLocation(item.location || '');
    setEditModalVisible(true);
  }, [item]);

  const openStockAdjust = useCallback(() => {
    setStockAdjust('');
    setStockNote('');
    setStockModalVisible(true);
  }, []);

  const handleStockAdjust = useCallback((type: 'masuk' | 'keluar') => {
    if (!item) return;
    const amount = parseFloat(stockAdjust) || 0;
    if (amount <= 0) {
      Alert.alert('Error', 'Jumlah harus lebih dari 0');
      return;
    }
    const balanceBefore = item.stock;
    const balanceAfter = type === 'masuk' ? balanceBefore + amount : Math.max(0, balanceBefore - amount);

    const newMovement: StockMovement = {
      id: `sm-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      type,
      quantity: amount,
      unit: item.unit,
      note: stockNote.trim() || (type === 'masuk' ? 'Stok masuk' : 'Stok keluar'),
      date: new Date().toISOString(),
      balanceBefore,
      balanceAfter,
    };

    const updatedItems = allItems.map(i => i.id === item.id ? { ...i, stock: balanceAfter } : i);
    persistItems(updatedItems);
    persistMovements([newMovement, ...movements]);
    setStockModalVisible(false);
  }, [item, stockAdjust, stockNote, allItems, movements, persistItems, persistMovements]);

  const handleSave = useCallback(() => {
    if (!item) return;
    if (!formName.trim() || !formUnit.trim()) {
      Alert.alert('Error', 'Nama dan satuan wajib diisi');
      return;
    }
    const stock = parseFloat(formStock) || 0;
    const minStock = parseFloat(formMinStock) || 0;
    const price = parseFloat(formPrice) || 0;
    const updated = allItems.map(i =>
      i.id === item.id ? {
        ...i,
        name: formName.trim(),
        stock,
        unit: formUnit.trim(),
        minStock,
        category: formCategory,
        price,
        supplier: formSupplier.trim(),
        location: formLocation.trim(),
      } : i
    );
    persistItems(updated);
    setEditModalVisible(false);
  }, [item, formName, formStock, formUnit, formMinStock, formCategory, formPrice, formSupplier, formLocation, allItems, persistItems]);

  const handleDelete = useCallback(() => {
    if (!item) return;
    Alert.alert('Hapus Barang', `Yakin ingin menghapus ${item.name}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          await persistItems(allItems.filter(x => x.id !== item.id));
          router.back();
        }
      },
    ]);
  }, [item, allItems, persistItems, router]);

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerInner}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={22} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detail Barang</Text>
              <View style={{ width: 36 }} />
            </View>
          </SafeAreaView>
        </View>
        <View style={styles.emptyState}>
          <Package size={48} color={colors.border} />
          <Text style={styles.emptyText}>Barang tidak ditemukan</Text>
        </View>
      </View>
    );
  }

  const isLow = item.stock <= item.minStock;

  const tabs: { key: DetailTab; label: string }[] = [
    { key: 'info', label: 'Info' },
    { key: 'masuk', label: 'Stok Masuk' },
    { key: 'keluar', label: 'Stok Keluar' },
    { key: 'kartu', label: 'Kartu Stok' },
  ];

  const renderMovementItem = (m: StockMovement) => {
    const isMasuk = m.type === 'masuk';
    return (
      <View key={m.id} style={styles.historyCard}>
        <View style={[styles.historyDot, { backgroundColor: isMasuk ? colors.primary : colors.error }]} />
        <View style={styles.historyContent}>
          <View style={styles.historyTop}>
            <Text style={styles.historyNote}>{m.note}</Text>
            <Text style={[styles.historyQty, { color: isMasuk ? colors.primary : colors.error }]}>
              {isMasuk ? '+' : '-'}{m.quantity} {m.unit}
            </Text>
          </View>
          <View style={styles.historyBottom}>
            <Text style={styles.historyDate}>{formatDate(m.date)} {formatTime(m.date)}</Text>
            <Text style={styles.historyBalance}>Saldo: {m.balanceAfter} {m.unit}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStockCard = () => (
    <View style={styles.stockCardContainer}>
      <View style={styles.stockCardHeader}>
        <Text style={[styles.stockCardHeaderText, { flex: 2 }]}>Tanggal</Text>
        <Text style={[styles.stockCardHeaderText, { flex: 2 }]}>Keterangan</Text>
        <Text style={[styles.stockCardHeaderText, { flex: 1, textAlign: 'center' }]}>Masuk</Text>
        <Text style={[styles.stockCardHeaderText, { flex: 1, textAlign: 'center' }]}>Keluar</Text>
        <Text style={[styles.stockCardHeaderText, { flex: 1, textAlign: 'center' }]}>Saldo</Text>
      </View>
      {stockCard.length === 0 ? (
        <View style={styles.stockCardEmpty}>
          <Text style={styles.emptyText}>Belum ada data kartu stok</Text>
        </View>
      ) : (
        stockCard.map((m, idx) => {
          const isMasuk = m.type === 'masuk';
          return (
            <View key={m.id} style={[styles.stockCardRow, idx % 2 === 0 && styles.stockCardRowAlt]}>
              <View style={{ flex: 2 }}>
                <Text style={styles.stockCardDate}>{formatDate(m.date)}</Text>
                <Text style={styles.stockCardTime}>{formatTime(m.date)}</Text>
              </View>
              <Text style={[styles.stockCardText, { flex: 2 }]} numberOfLines={1}>{m.note}</Text>
              <Text style={[styles.stockCardNum, { flex: 1, textAlign: 'center', color: isMasuk ? colors.primary : colors.textTertiary }]}>
                {isMasuk ? m.quantity : '-'}
              </Text>
              <Text style={[styles.stockCardNum, { flex: 1, textAlign: 'center', color: !isMasuk ? colors.error : colors.textTertiary }]}>
                {!isMasuk ? m.quantity : '-'}
              </Text>
              <Text style={[styles.stockCardNum, { flex: 1, textAlign: 'center', fontWeight: '700' as const }]}>
                {m.balanceAfter}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detail Barang</Text>
            <TouchableOpacity style={styles.backBtn} onPress={openEdit}>
              <Pencil size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: isLow ? '#FEF2F2' : colors.primaryBg }]}>
            {isLow ? <AlertCircle size={32} color="#EF4444" /> : <Package size={32} color={colors.primary} />}
          </View>
          <Text style={styles.heroName}>{item.name}</Text>
          <View style={styles.heroCatBadge}>
            <Text style={styles.heroCatText}>{item.category}</Text>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={[styles.heroStatNum, isLow && { color: colors.error }]}>{item.stock}</Text>
              <Text style={styles.heroStatLabel}>Stok ({item.unit})</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatNum}>{item.minStock}</Text>
              <Text style={styles.heroStatLabel}>Min. Stok</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={[styles.heroStatNum, { color: colors.primary }]}>{totalMasuk}</Text>
              <Text style={styles.heroStatLabel}>Total Masuk</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={[styles.heroStatNum, { color: colors.error }]}>{totalKeluar}</Text>
              <Text style={styles.heroStatLabel}>Total Keluar</Text>
            </View>
          </View>

          {isLow && (
            <View style={styles.alertBanner}>
              <AlertCircle size={14} color={colors.error} />
              <Text style={styles.alertText}>Stok rendah, segera restock!</Text>
            </View>
          )}

          <TouchableOpacity style={styles.adjustBtn} onPress={openStockAdjust} activeOpacity={0.8}>
            <Package size={16} color={colors.white} />
            <Text style={styles.adjustBtnText}>Atur Stok</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
          {tabs.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.detailTab, activeTab === t.key && styles.detailTabActive]}
              onPress={() => setActiveTab(t.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.detailTabText, activeTab === t.key && styles.detailTabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.tabContent}>
          {activeTab === 'info' && (
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Text style={styles.infoSectionTitle}>Informasi Barang</Text>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconWrap}>
                    <Package size={16} color={colors.primary} />
                  </View>
                  <View style={styles.infoTextWrap}>
                    <Text style={styles.infoLabel}>Nama Barang</Text>
                    <Text style={styles.infoValue}>{item.name}</Text>
                  </View>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIconWrap}>
                    <Store size={16} color={colors.info} />
                  </View>
                  <View style={styles.infoTextWrap}>
                    <Text style={styles.infoLabel}>Kategori</Text>
                    <Text style={styles.infoValue}>{item.category}</Text>
                  </View>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIconWrap}>
                    <Package size={16} color={colors.warning} />
                  </View>
                  <View style={styles.infoTextWrap}>
                    <Text style={styles.infoLabel}>Satuan</Text>
                    <Text style={styles.infoValue}>{item.unit}</Text>
                  </View>
                </View>
                {item.price ? (
                  <>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconWrap}>
                        <ArrowUpRight size={16} color={colors.primary} />
                      </View>
                      <View style={styles.infoTextWrap}>
                        <Text style={styles.infoLabel}>Harga / Unit</Text>
                        <Text style={styles.infoValue}>{formatCurrency(item.price)}</Text>
                      </View>
                    </View>
                  </>
                ) : null}
                {item.supplier ? (
                  <>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconWrap}>
                        <Store size={16} color={colors.primary} />
                      </View>
                      <View style={styles.infoTextWrap}>
                        <Text style={styles.infoLabel}>Supplier</Text>
                        <Text style={styles.infoValue}>{item.supplier}</Text>
                      </View>
                    </View>
                  </>
                ) : null}
                {item.location ? (
                  <>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconWrap}>
                        <MapPin size={16} color={colors.error} />
                      </View>
                      <View style={styles.infoTextWrap}>
                        <Text style={styles.infoLabel}>Lokasi Penyimpanan</Text>
                        <Text style={styles.infoValue}>{item.location}</Text>
                      </View>
                    </View>
                  </>
                ) : null}
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIconWrap}>
                    <Calendar size={16} color={colors.textSecondary} />
                  </View>
                  <View style={styles.infoTextWrap}>
                    <Text style={styles.infoLabel}>Ditambahkan</Text>
                    <Text style={styles.infoValue}>{formatDate(item.createdAt)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editActionBtn} onPress={openEdit} activeOpacity={0.8}>
                  <Pencil size={16} color={colors.white} />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteActionBtn} onPress={handleDelete} activeOpacity={0.8}>
                  <Trash2 size={16} color={colors.white} />
                  <Text style={styles.actionBtnText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'masuk' && (
            <View>
              <View style={styles.historyHeader}>
                <View style={[styles.historyHeaderIcon, { backgroundColor: '#ECFDF5' }]}>
                  <ArrowDownLeft size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.historyHeaderTitle}>Riwayat Stok Masuk</Text>
                  <Text style={styles.historyHeaderSub}>{masukMovements.length} transaksi | Total: {totalMasuk} {item.unit}</Text>
                </View>
              </View>
              {masukMovements.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <ArrowDownLeft size={36} color={colors.border} />
                  <Text style={styles.emptyText}>Belum ada riwayat stok masuk</Text>
                </View>
              ) : (
                masukMovements.map(renderMovementItem)
              )}
            </View>
          )}

          {activeTab === 'keluar' && (
            <View>
              <View style={styles.historyHeader}>
                <View style={[styles.historyHeaderIcon, { backgroundColor: '#FEF2F2' }]}>
                  <ArrowUpRight size={16} color={colors.error} />
                </View>
                <View>
                  <Text style={styles.historyHeaderTitle}>Riwayat Stok Keluar</Text>
                  <Text style={styles.historyHeaderSub}>{keluarMovements.length} transaksi | Total: {totalKeluar} {item.unit}</Text>
                </View>
              </View>
              {keluarMovements.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <ArrowUpRight size={36} color={colors.border} />
                  <Text style={styles.emptyText}>Belum ada riwayat stok keluar</Text>
                </View>
              ) : (
                keluarMovements.map(renderMovementItem)
              )}
            </View>
          )}

          {activeTab === 'kartu' && (
            <View>
              <View style={styles.historyHeader}>
                <View style={[styles.historyHeaderIcon, { backgroundColor: colors.infoBg }]}>
                  <Package size={16} color={colors.info} />
                </View>
                <View>
                  <Text style={styles.historyHeaderTitle}>Kartu Stok</Text>
                  <Text style={styles.historyHeaderSub}>Seluruh mutasi stok barang</Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={{ minWidth: 500 }}>
                  {renderStockCard()}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Barang</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nama Barang *</Text>
              <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="Nama barang" placeholderTextColor={colors.textTertiary} />

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
                  <Text style={styles.label}>Stok Minimum</Text>
                  <TextInput style={styles.input} value={formMinStock} onChangeText={setFormMinStock} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Satuan *</Text>
                  <TextInput style={styles.input} value={formUnit} onChangeText={setFormUnit} placeholder="kg / liter" placeholderTextColor={colors.textTertiary} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Harga / Unit</Text>
                  <TextInput style={styles.input} value={formPrice} onChangeText={setFormPrice} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Supplier</Text>
                  <TextInput style={styles.input} value={formSupplier} onChangeText={setFormSupplier} placeholder="Supplier" placeholderTextColor={colors.textTertiary} />
                </View>
              </View>

              <Text style={styles.label}>Lokasi Penyimpanan</Text>
              <TextInput style={styles.input} value={formLocation} onChangeText={setFormLocation} placeholder="Rak / Gudang" placeholderTextColor={colors.textTertiary} />

              <View style={{ height: 20 }} />
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={stockModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView style={styles.stockOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.stockContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Atur Stok</Text>
              <TouchableOpacity onPress={() => setStockModalVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <View style={styles.stockBody}>
              <Text style={styles.stockItemName}>{item.name}</Text>
              <Text style={styles.stockCurrent}>Stok saat ini: <Text style={{ fontWeight: '700' as const }}>{item.stock} {item.unit}</Text></Text>
              <TextInput
                style={styles.stockInput}
                value={stockAdjust}
                onChangeText={setStockAdjust}
                placeholder="Jumlah"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, { marginBottom: 16, width: '100%' }]}
                value={stockNote}
                onChangeText={setStockNote}
                placeholder="Catatan (opsional)"
                placeholderTextColor={colors.textTertiary}
              />
              <View style={styles.stockActions}>
                <TouchableOpacity style={styles.stockSubtractBtn} onPress={() => handleStockAdjust('keluar')} activeOpacity={0.8}>
                  <Minus size={18} color={colors.white} />
                  <Text style={styles.stockActionText}>Keluar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.stockAddBtn} onPress={() => handleStockAdjust('masuk')} activeOpacity={0.8}>
                  <Plus size={18} color={colors.white} />
                  <Text style={styles.stockActionText}>Masuk</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.white },

  heroSection: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, backgroundColor: colors.white, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  heroIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroName: { fontSize: 22, fontWeight: '800' as const, color: colors.text, textAlign: 'center' },
  heroCatBadge: { backgroundColor: colors.surfaceSecondary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 8 },
  heroCatText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' as const },
  heroStatsRow: { flexDirection: 'row', gap: 8, marginTop: 20, width: '100%' },
  heroStatCard: { flex: 1, alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 4 },
  heroStatNum: { fontSize: 20, fontWeight: '800' as const, color: colors.text },
  heroStatLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  alertText: { fontSize: 13, color: colors.error, fontWeight: '500' as const },
  adjustBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.info, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 24, marginTop: 16 },
  adjustBtnText: { fontSize: 14, fontWeight: '600' as const, color: colors.white },

  tabScrollContainer: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  detailTab: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  detailTabActive: { backgroundColor: colors.primaryBg, borderColor: colors.primary },
  detailTabText: { fontSize: 13, fontWeight: '500' as const, color: colors.textSecondary },
  detailTabTextActive: { color: colors.primary, fontWeight: '600' as const },

  tabContent: { paddingHorizontal: 16, paddingTop: 16 },

  infoSection: {},
  infoCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  infoSectionTitle: { fontSize: 15, fontWeight: '700' as const, color: colors.text, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  infoIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 11, color: colors.textTertiary, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
  infoDivider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 2 },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  editActionBtn: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  deleteActionBtn: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: colors.error, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { fontSize: 15, fontWeight: '600' as const, color: colors.white },

  historyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  historyHeaderIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  historyHeaderTitle: { fontSize: 15, fontWeight: '700' as const, color: colors.text },
  historyHeaderSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  historyCard: { flexDirection: 'row', marginBottom: 10, backgroundColor: colors.white, borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 },
  historyDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 12 },
  historyContent: { flex: 1 },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyNote: { fontSize: 13, fontWeight: '600' as const, color: colors.text, flex: 1, marginRight: 8 },
  historyQty: { fontSize: 15, fontWeight: '700' as const },
  historyBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  historyDate: { fontSize: 11, color: colors.textTertiary },
  historyBalance: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' as const },

  emptyHistory: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: colors.textSecondary },

  stockCardContainer: { backgroundColor: colors.white, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  stockCardHeader: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 12 },
  stockCardHeaderText: { fontSize: 11, fontWeight: '700' as const, color: colors.white },
  stockCardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  stockCardRowAlt: { backgroundColor: '#F8FAFC' },
  stockCardDate: { fontSize: 11, fontWeight: '500' as const, color: colors.text },
  stockCardTime: { fontSize: 10, color: colors.textTertiary },
  stockCardText: { fontSize: 11, color: colors.textSecondary },
  stockCardNum: { fontSize: 12, fontWeight: '600' as const, color: colors.text },
  stockCardEmpty: { padding: 30, alignItems: 'center' },

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
  stockOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  stockContent: { backgroundColor: colors.white, borderRadius: 24, width: '85%', maxWidth: 400 },
  stockBody: { padding: 20, alignItems: 'center' },
  stockItemName: { fontSize: 17, fontWeight: '700' as const, color: colors.text, marginBottom: 4 },
  stockCurrent: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  stockInput: { backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 20, fontWeight: '700' as const, color: colors.text, borderWidth: 1, borderColor: colors.border, textAlign: 'center', width: '100%', marginBottom: 12 },
  stockActions: { flexDirection: 'row', gap: 12, width: '100%' },
  stockSubtractBtn: { flex: 1, flexDirection: 'row', gap: 6, backgroundColor: colors.error, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  stockAddBtn: { flex: 1, flexDirection: 'row', gap: 6, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
  stockActionText: { fontSize: 15, fontWeight: '600' as const, color: colors.white },
});
