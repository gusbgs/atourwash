import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, Building2, Wallet, Package, FileText, Settings, HelpCircle, Bell, Shield, Truck, Tag, UserCog, Printer, MessageSquare } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface MenuItem {
  icon: typeof Users;
  label: string;
  color: string;
  bgColor: string;
  route?: string;
}

const menuGroups: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Manajemen',
    items: [
      { icon: Users, label: 'Pelanggan', color: '#3B82F6', bgColor: '#EFF6FF', route: '/pelanggan' },
      { icon: Building2, label: 'Cabang', color: '#8B5CF6', bgColor: '#F5F3FF', route: '/cabang' },
      { icon: UserCog, label: 'Karyawan', color: '#EC4899', bgColor: '#FDF2F8' },
      { icon: Truck, label: 'Kurir', color: '#F97316', bgColor: '#FFF7ED' },
    ],
  },
  {
    title: 'Keuangan & Laporan',
    items: [
      { icon: Wallet, label: 'Keuangan', color: '#23A174', bgColor: '#ECFDF5', route: '/keuangan' },
      { icon: FileText, label: 'Laporan', color: '#EC4899', bgColor: '#FDF2F8', route: '/laporan' },
      { icon: Tag, label: 'Promo', color: '#F59E0B', bgColor: '#FFFBEB' },
    ],
  },
  {
    title: 'Operasional',
    items: [
      { icon: Package, label: 'Inventaris', color: '#F59E0B', bgColor: '#FFFBEB', route: '/inventaris' },
      { icon: Printer, label: 'Cetak Struk', color: '#64748B', bgColor: '#F1F5F9' },
      { icon: MessageSquare, label: 'Feedback', color: '#06B6D4', bgColor: '#ECFEFF' },
    ],
  },
  {
    title: 'Pengaturan',
    items: [
      { icon: Settings, label: 'Pengaturan', color: '#64748B', bgColor: '#F1F5F9' },
      { icon: Bell, label: 'Notifikasi', color: '#3B82F6', bgColor: '#EFF6FF' },
      { icon: Shield, label: 'Keamanan', color: '#EF4444', bgColor: '#FEF2F2' },
      { icon: HelpCircle, label: 'Bantuan', color: '#8B5CF6', bgColor: '#F5F3FF' },
    ],
  },
];

export default function LainnyaScreen() {
  const router = useRouter();

  const handlePress = (item: MenuItem) => {
    if (item.route) {
      router.push(item.route as any);
    } else {
      console.log('Menu pressed:', item.label);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Semua Menu</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {menuGroups.map(group => (
          <View key={group.title} style={styles.groupSection}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              <View style={styles.menuGrid}>
                {group.items.map(item => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.menuItem}
                    onPress={() => handlePress(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: item.bgColor }]}>
                      <item.icon size={22} color={item.color} />
                    </View>
                    <Text style={styles.menuLabel} numberOfLines={1}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.white },
  content: { padding: 16, paddingBottom: 40 },
  groupSection: { marginBottom: 20 },
  groupTitle: { fontSize: 14, fontWeight: '600' as const, color: colors.textSecondary, marginBottom: 8, marginLeft: 4 },
  groupCard: { backgroundColor: colors.white, borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  menuItem: { width: '25%', paddingVertical: 10, alignItems: 'center' },
  menuIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  menuLabel: { fontSize: 11, fontWeight: '500' as const, color: colors.text, textAlign: 'center' as const },
});
