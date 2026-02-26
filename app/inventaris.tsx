import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Package, AlertCircle, Plus, X, Minus, ArrowUpRight, ArrowDownLeft } from '@/utils/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';
import { InventoryItem, StockMovement } from '@/types';
import { mockInventoryItems, mockStockMovements } from '@/mocks/data';

const STORAGE_KEY = 'inventaris_data';
const MOVEMENTS_KEY = 'stock_movements_data';
const CATEGORIES = ['Bahan Cuci', 'Pewangi', 'Packing', 'Lainnya'];

type TabType = 'barang' | 'riwayat';
type HistoryFilter = 'semua' | 'masuk' | 'keluar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const tabs: { key: TabType; label: string; icon: React.FC<{ size?: number; color?: string }> }[] = [
  { key: 'barang', label: 'Daftar Barang', icon: Package },
  { key: 'riwayat', label: 'Riwayat Stok', icon: ArrowUpRight },
];

const historyFilters: { key: HistoryFilter; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'masuk', label: 'Masuk' },
  { key: 'keluar', label: 'Keluar' },
];

export default function InventarisScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [movements, setMovements] = useState<StockMovement[]>(mockStockMovements);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('semua');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
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

  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const storedItems = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedItems) setItems(JSON.parse(storedItems));
        const storedMovements = await AsyncStorage.getItem(MOVEMENTS_KEY);
        if (storedMovements) setMovements(JSON.parse(storedMovements));
      } catch (e) {
        console.log('Failed to load inventaris', e);
      }
    };
    load();
  }, []);

  const animateIndicator = useCallback((index: number) => {
    Animated.spring(indicatorAnim, {
      toValue: index,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [indicatorAnim]);

  const persistItems = useCallback(async (data: InventoryItem[]) => {
    setItems(data);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.log('Failed to save inventaris', e);
    }
  }, []);

  const persistMovements = useCallback(async (data: StockMovement[]) => {
    setMovements(data);
    try {
      await AsyncStorage.setItem(MOVEMENTS_KEY, JSON.stringify(data));
    } catch (e) {
      console.log('Failed to save movements', e);
    }
  }, []);

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setFormName('');
    setFormStock('');
    setFormUnit('');
    setFormMinStock('');
    setFormCategory('Bahan Cuci');
    setFormPrice('');
    setFormSupplier('');
    setFormLocation('');
    setModalVisible(true);
  }, []);

  const openStockAdjust = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setStockAdjust('');
    setStockNote('');
    setStockModalVisible(true);
  }, []);

  const handleStockAdjust = useCallback((type: 'masuk' | 'keluar') => {
    if (!selectedItem) return;
    const amount = parseFloat(stockAdjust) || 0;
    if (amount <= 0) {
      Alert.alert('Error', 'Jumlah harus lebih dari 0');
      return;
    }
    const balanceBefore = selectedItem.stock;
    const balanceAfter = type === 'masuk' ? balanceBefore + amount : Math.max(0, balanceBefore - amount);

    const newMovement: StockMovement = {
      id: `sm-${Date.now()}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type,
      quantity: amount,
      unit: selectedItem.unit,
      note: stockNote.trim() || (type === 'masuk' ? 'Stok masuk' : 'Stok keluar'),
      date: new Date().toISOString(),
      balanceBefore,
      balanceAfter,
    };

    const updatedItems = items.map(i => i.id === selectedItem.id ? { ...i, stock: balanceAfter } : i);
    persistItems(updatedItems);
    persistMovements([newMovement, ...movements]);
    setStockModalVisible(false);
  }, [selectedItem, stockAdjust, stockNote, items, movements, persistItems, persistMovements]);

  const handleSave = useCallback(() => {
    if (!formName.trim() || !formUnit.trim()) {
      Alert.alert('Error', 'Nama dan satuan wajib diisi');
      return;
    }
    const stock = parseFloat(formStock) || 0;
    const minStock = parseFloat(formMinStock) || 0;
    const price = parseFloat(formPrice) || 0;
    if (editingItem) {
      const updated = items.map(i =>
        i.id === editingItem.id ? {
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
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: formName.trim(),
        stock,
        unit: formUnit.trim(),
        minStock,
        category: formCategory,
        price,
        supplier: formSupplier.trim(),
        location: formLocation.trim(),
        createdAt: new Date().toISOString(),
      };
      persistItems([newItem, ...items]);
    }
    setModalVisible(false);
  }, [formName, formStock, formUnit, formMinStock, formCategory, formPrice, formSupplier, formLocation, editingItem, items, persistItems]);

  const handleDelete = useCallback((item: InventoryItem) => {
    Alert.alert('Hapus Item', `Yakin ingin menghapus ${item.name}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => { persistItems(items.filter(x => x.id !== item.id)); } },
    ]);
  }, [items, persistItems]);

  const filtered = useMemo(() =>
    items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  const filteredMovements = useMemo(() => {
    let result = movements;
    if (historyFilter !== 'semua') {
      result = result.filter(m => m.type === historyFilter);
    }
    if (search.trim()) {
      result = result.filter(m => m.itemName.toLowerCase().includes(search.toLowerCase()));
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movements, historyFilter, search]);

  const lowStock = useMemo(() => items.filter(i => i.stock <= i.minStock).length, [items]);

  const formatDate = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }, []);

  const formatTime = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const handleTabPress = useCallback((index: number) => {
    setActiveTabIndex(index);
    animateIndicator(index);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  }, [animateIndicator]);

  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== activeTabIndex && index >= 0 && index < tabs.length) {
      setActiveTabIndex(index);
      animateIndicator(index);
    }
  }, [activeTabIndex, animateIndicator]);

  const tabWidth = SCREEN_WIDTH / tabs.length;
  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: tabs.map((_, i) => i),
    outputRange: tabs.map((_, i) => i * tabWidth),
  });

  const getTabCount = useCallback((key: TabType) => {
    if (key === 'barang') return items.length;
    return movements.length;
  }, [items.length, movements.length]);

  const renderItemCard = useCallback((item: InventoryItem) => {
    const isLow = item.stock <= item.minStock;
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/inventaris-detail?id=${item.id}` as any)}
      >
        <View style={[styles.iconBox, { backgroundColor: isLow ? '#FEF2F2' : colors.primaryBg }]}>
          {isLow ? <AlertCircle size={20} color="#EF4444" /> : <Package size={20} color={colors.primary} />}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
        </View>
        <View style={styles.stockInfo}>
          <Text style={[styles.stockValue, isLow && { color: '#EF4444' }]}>{item.stock}</Text>
          <Text style={styles.stockUnit}>{item.unit}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [router]);

  const renderMovementCard = useCallback((item: StockMovement) => {
    const isMasuk = item.type === 'masuk';
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.movementCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/inventaris-detail?id=${item.itemId}` as any)}
      >
        <View style={[styles.movementIcon, { backgroundColor: isMasuk ? '#ECFDF5' : '#FEF2F2' }]}>
          {isMasuk ? <ArrowDownLeft size={18} color={colors.primary} /> : <ArrowUpRight size={18} color="#EF4444" />}
        </View>
        <View style={styles.movementContent}>
          <View style={styles.movementHeader}>
            <Text style={styles.movementItemName} numberOfLines={1}>{item.itemName}</Text>
            <Text style={[styles.movementQty, { color: isMasuk ? colors.primary : '#EF4444' }]}>
              {isMasuk ? '+' : '-'}{item.quantity} {item.unit}
            </Text>
          </View>
          <Text style={styles.movementNote} numberOfLines={1}>{item.note}</Text>
          <View style={styles.movementFooter}>
            <Text style={styles.movementDate}>{formatDate(item.date)}</Text>
            <Text style={styles.movementTime}>{formatTime(item.date)}</Text>
            <View style={[styles.movementBadge, { backgroundColor: isMasuk ? '#ECFDF5' : '#FEF2F2' }]}>
              <Text style={[styles.movementBadgeText, { color: isMasuk ? colors.primary : '#EF4444' }]}>
                {isMasuk ? 'Masuk' : 'Keluar'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [formatDate, formatTime, router]);

  return (
    <View style={styles.container}>
      {/* 1. Green Appbar */}
      <View style={styles.appbarBg}>
        <SafeAreaView edges={['top']} style={styles.appbarSafe}>
          <View style={styles.appbar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.appbarTitle}>Inventaris</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.7}>
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {lowStock > 0 && (
            <View style={styles.alertBanner}>
              <AlertCircle size={14} color="#FBBF24" />
              <Text style={styles.alertText}>{lowStock} item stok rendah / habis</Text>
            </View>
          )}
        </SafeAreaView>
      </View>

      {/* 2. Tab Swipable */}
      <View style={styles.tabRow}>
        {tabs.map((tab, index) => {
          const count = getTabCount(tab.key);
          const isActive = activeTabIndex === index;
          const IconComp = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <IconComp size={16} color={isActive ? colors.primary : colors.textSecondary} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              width: tabWidth - 24,
              transform: [{ translateX: Animated.add(indicatorTranslateX, 12) }],
            },
          ]}
        />
      </View>

      {/* 3. Search bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTabIndex === 0 ? 'Cari barang...' : 'Cari riwayat stok...'}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <X size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 4. List barang (swipable content) */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.pagerContainer}
      >
        <View style={styles.page}>
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Package size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>Tidak ada barang ditemukan</Text>
                <Text style={styles.emptyText}>Tambah barang baru untuk memulai</Text>
              </View>
            ) : (
              filtered.map(item => renderItemCard(item))
            )}
          </ScrollView>
        </View>

        <View style={styles.page}>
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTabIndex === 1 && (
              <View style={styles.filterRow}>
                {historyFilters.map(f => (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.filterChip, historyFilter === f.key && styles.filterChipActive]}
                    onPress={() => setHistoryFilter(f.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, historyFilter === f.key && styles.filterChipTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {filteredMovements.length === 0 ? (
              <View style={styles.empty}>
                <ArrowUpRight size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>Belum ada riwayat stok</Text>
                <Text style={styles.emptyText}>Riwayat akan muncul setelah ada perubahan stok</Text>
              </View>
            ) : (
              filteredMovements.map(item => renderMovementCard(item))
            )}
          </ScrollView>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem ? 'Edit Barang' : 'Tambah Barang'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
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
                  <Text style={styles.label}>Stok Awal</Text>
                  <TextInput style={styles.input} value={formStock} onChangeText={setFormStock} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Satuan *</Text>
                  <TextInput style={styles.input} value={formUnit} onChangeText={setFormUnit} placeholder="kg / liter" placeholderTextColor={colors.textTertiary} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Stok Minimum</Text>
                  <TextInput style={styles.input} value={formMinStock} onChangeText={setFormMinStock} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Harga / Unit</Text>
                  <TextInput style={styles.input} value={formPrice} onChangeText={setFormPrice} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
                </View>
              </View>

              <Text style={styles.label}>Supplier</Text>
              <TextInput style={styles.input} value={formSupplier} onChangeText={setFormSupplier} placeholder="Nama supplier" placeholderTextColor={colors.textTertiary} />

              <Text style={styles.label}>Lokasi Penyimpanan</Text>
              <TextInput style={styles.input} value={formLocation} onChangeText={setFormLocation} placeholder="Rak / Gudang" placeholderTextColor={colors.textTertiary} />

              <View style={{ height: 20 }} />
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>{editingItem ? 'Simpan Perubahan' : 'Tambah Barang'}</Text>
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
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appbarBg: {
    backgroundColor: colors.primary,
  },
  appbarSafe: {
    backgroundColor: colors.primary,
  },
  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appbarTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '700' as const,
    color: colors.white,
    marginLeft: 12,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.white,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: 'relative' as const,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  tabBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: colors.primaryBg,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: colors.primary,
  },
  tabIndicator: {
    position: 'absolute' as const,
    bottom: 0,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  searchWrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 10,
    fontSize: 14,
    color: colors.text,
  },
  pagerContainer: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  cardCategory: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  stockInfo: {
    alignItems: 'center',
  },
  stockValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  stockUnit: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  movementCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  movementIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  movementContent: {
    flex: 1,
  },
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movementItemName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    flex: 1,
  },
  movementQty: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  movementNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  movementFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  movementDate: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  movementTime: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  movementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  movementBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
  },
  stockOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    width: '85%',
    maxWidth: 400,
  },
  stockBody: {
    padding: 20,
    alignItems: 'center',
  },
  stockItemName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  stockCurrent: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  stockInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    width: '100%',
    marginBottom: 12,
  },
  stockActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  stockSubtractBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.error,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockAddBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockActionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.white,
  },
});
