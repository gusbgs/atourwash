import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Package, AlertCircle, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
  category: string;
}

const mockInventory: InventoryItem[] = [
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

  const filtered = mockInventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = mockInventory.filter(i => i.stock <= i.minStock).length;

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const isLow = item.stock <= item.minStock;
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={[styles.iconBox, { backgroundColor: isLow ? '#FEF2F2' : '#ECFDF5' }]}>
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
            <TouchableOpacity style={styles.addBtn}>
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
      />
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
});
