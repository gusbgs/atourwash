import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, Building2, Wallet, Package, FileText, Settings, HelpCircle, Bell, Shield, Truck, Tag, UserCog, Printer, MessageSquare, Mail, Factory, CreditCard } from '@/utils/icons';
import type { HugeIcon } from '@/utils/icons';
import { colors } from '@/constants/colors';

const MENU_COLOR = colors.primary;
const MENU_BG = colors.primaryBg;

interface MenuItem {
  icon: HugeIcon;
  label: string;
  color: string;
  bgColor: string;
  route?: string;
}

const menuGroups: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Manajemen',
    items: [
      { icon: Users, label: 'Pelanggan', color: MENU_COLOR, bgColor: MENU_BG, route: '/pelanggan' },
      { icon: Building2, label: 'Cabang', color: MENU_COLOR, bgColor: MENU_BG, route: '/cabang' },
      { icon: UserCog, label: 'Karyawan', color: MENU_COLOR, bgColor: MENU_BG, route: '/karyawan' },
      { icon: Truck, label: 'Kurir', color: MENU_COLOR, bgColor: MENU_BG },
    ],
  },
  {
    title: 'Keuangan & Laporan',
    items: [
      { icon: Wallet, label: 'Keuangan', color: MENU_COLOR, bgColor: MENU_BG, route: '/keuangan' },
      { icon: CreditCard, label: 'Kelola Rekening', color: MENU_COLOR, bgColor: MENU_BG, route: '/kelola-rekening' },
      { icon: FileText, label: 'Laporan', color: MENU_COLOR, bgColor: MENU_BG, route: '/laporan' },
      { icon: Tag, label: 'Promo', color: MENU_COLOR, bgColor: MENU_BG },
    ],
  },
  {
    title: 'Operasional',
    items: [
      { icon: Factory, label: 'Produksi', color: MENU_COLOR, bgColor: MENU_BG, route: '/(tabs)/production' },
      { icon: Package, label: 'Inventaris', color: MENU_COLOR, bgColor: MENU_BG, route: '/inventaris' },
      { icon: Mail, label: 'Broadcast', color: MENU_COLOR, bgColor: MENU_BG, route: '/broadcast' },
      { icon: Printer, label: 'Cetak Struk', color: MENU_COLOR, bgColor: MENU_BG },
      { icon: MessageSquare, label: 'Feedback', color: MENU_COLOR, bgColor: MENU_BG },
    ],
  },
  {
    title: 'Pengaturan',
    items: [
      { icon: Settings, label: 'Pengaturan', color: MENU_COLOR, bgColor: MENU_BG },
      { icon: Bell, label: 'Notifikasi', color: MENU_COLOR, bgColor: MENU_BG, route: '/notifikasi' },
      { icon: Shield, label: 'Keamanan', color: MENU_COLOR, bgColor: MENU_BG },
      { icon: HelpCircle, label: 'Bantuan', color: MENU_COLOR, bgColor: MENU_BG },
    ],
  },
];

export default function LainnyaTabScreen() {
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
            <Text style={styles.headerTitle}>Semua Menu</Text>
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
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
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
