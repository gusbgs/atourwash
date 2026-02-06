import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Users, Phone, MapPin, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
}

const mockCustomers: Customer[] = [
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

  const filtered = mockCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
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
            <TouchableOpacity style={styles.addBtn}>
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
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '700' as const, color: colors.primary },
  cardContent: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardSub: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  orderBadge: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  orderBadgeText: { fontSize: 16, fontWeight: '700' as const, color: colors.primary },
  orderBadgeLabel: { fontSize: 10, color: colors.primary },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
});
