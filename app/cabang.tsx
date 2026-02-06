import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, MapPin, Phone, Clock, Plus } from 'lucide-react-native';
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

const mockBranches: Branch[] = [
  { id: '1', name: 'AtourWash Pusat', address: 'Jl. Merdeka No. 10, Jakarta Pusat', phone: '021-12345678', hours: '07:00 - 22:00', isActive: true, totalMachines: 12 },
  { id: '2', name: 'AtourWash Cabang Selatan', address: 'Jl. Sudirman No. 25, Jakarta Selatan', phone: '021-23456789', hours: '08:00 - 21:00', isActive: true, totalMachines: 8 },
  { id: '3', name: 'AtourWash Cabang Utara', address: 'Jl. Pluit Raya No. 5, Jakarta Utara', phone: '021-34567890', hours: '07:00 - 22:00', isActive: false, totalMachines: 6 },
];

export default function CabangScreen() {
  const router = useRouter();

  const renderBranch = ({ item }: { item: Branch }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: item.isActive ? '#ECFDF5' : '#FEF2F2' }]}>
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
            <TouchableOpacity style={styles.addBtn}>
              <Plus size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={mockBranches}
        keyExtractor={item => item.id}
        renderItem={renderBranch}
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
});
