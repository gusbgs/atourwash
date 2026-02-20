import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Phone, MapPin, ShoppingBag, Calendar, TrendingUp, CreditCard } from '@/utils/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';
import { formatFullCurrency, getStatusLabel } from '@/utils/format';
import { Order } from '@/types';
import { mockOrders } from '@/mocks/data';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
}

const STORAGE_KEY = 'pelanggan_data';
const ORDERS_KEY = 'orders_data';

const statusColors: Record<string, { bg: string; text: string }> = {
  dalam_proses: { bg: colors.warningBg, text: colors.warning },
  siap_diambil: { bg: colors.successBg, text: colors.success },
  selesai: { bg: colors.infoBg, text: colors.info },
  terlambat: { bg: colors.errorBg, text: colors.error },
};

const paymentColors: Record<string, { bg: string; text: string }> = {
  belum_bayar: { bg: colors.errorBg, text: colors.error },
  dp: { bg: colors.warningBg, text: colors.warning },
  lunas: { bg: colors.successBg, text: colors.success },
};

const paymentLabels: Record<string, string> = {
  belum_bayar: 'Belum Bayar',
  dp: 'DP',
  lunas: 'Lunas',
};

export default function CustomerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'riwayat' | 'profil'>('profil');
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCustomers = await AsyncStorage.getItem(STORAGE_KEY);
        const customerList: Customer[] = storedCustomers ? JSON.parse(storedCustomers) : [];
        const found = customerList.find(c => c.id === id);
        if (found) {
          setCustomer(found);
        }

        const storedOrders = await AsyncStorage.getItem(ORDERS_KEY);
        let allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : mockOrders;
        if (found) {
          const customerOrders = allOrders.filter(
            o => o.customerPhone === found.phone || o.customerName.toLowerCase() === found.name.toLowerCase()
          );
          setOrders(customerOrders);
        }
      } catch (e) {
        console.log('Failed to load customer detail', e);
      }
    };
    loadData();
  }, [id]);

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const completedOrders = orders.filter(o => o.status === 'selesai').length;
    const activeOrders = orders.filter(o => o.status === 'dalam_proses' || o.status === 'siap_diambil').length;
    return { totalSpent, completedOrders, activeOrders };
  }, [orders]);

  if (!customer) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBg}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={22} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detail Pelanggan</Text>
              <View style={{ width: 36 }} />
            </View>
          </SafeAreaView>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Pelanggan tidak ditemukan</Text>
        </View>
      </View>
    );
  }

  const renderOrderItem = ({ item }: { item: Order }) => {
    const sc = statusColors[item.status] || statusColors.dalam_proses;
    const pc = paymentColors[item.paymentStatus] || paymentColors.belum_bayar;
    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/order-detail' as any, params: { id: item.id } })}
      >
        <View style={styles.orderTop}>
          <Text style={styles.orderId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
        <View style={styles.orderMid}>
          <View style={styles.orderInfoRow}>
            <ShoppingBag size={14} color={colors.textSecondary} />
            <Text style={styles.orderInfoText}>{item.serviceType}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={styles.orderInfoText}>{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>
        </View>
        <View style={styles.orderBottom}>
          <Text style={styles.orderPrice}>{formatFullCurrency(item.totalPrice)}</Text>
          <View style={[styles.payBadge, { backgroundColor: pc.bg }]}>
            <Text style={[styles.payText, { color: pc.text }]}>{paymentLabels[item.paymentStatus] ?? item.paymentStatus}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBg}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detail Pelanggan</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </View>

      <Animated.View style={[styles.profileCard, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>{customer.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.profileName}>{customer.name}</Text>
        <Text style={styles.profileSince}>Pelanggan #{customer.id}</Text>
      </Animated.View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: colors.primaryBg }]}>
            <ShoppingBag size={18} color={colors.primary} />
          </View>
          <Text style={styles.statNum}>{orders.length}</Text>
          <Text style={styles.statLabel}>Pesanan</Text>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: colors.successBg }]}>
            <TrendingUp size={18} color={colors.success} />
          </View>
          <Text style={styles.statNum}>{stats.completedOrders}</Text>
          <Text style={styles.statLabel}>Selesai</Text>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: colors.warningBg }]}>
            <CreditCard size={18} color={colors.warning} />
          </View>
          <Text style={styles.statNum}>{formatFullCurrency(stats.totalSpent)}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profil' && styles.tabActive]}
          onPress={() => setActiveTab('profil')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'profil' && styles.tabTextActive]}>Profil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'riwayat' && styles.tabActive]}
          onPress={() => setActiveTab('riwayat')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'riwayat' && styles.tabTextActive]}>Riwayat Pesanan</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'profil' ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Informasi Kontak</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: colors.primaryBg }]}>
                  <Phone size={16} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nomor Telepon</Text>
                  <Text style={styles.infoValue}>{customer.phone}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: colors.infoBg }]}>
                  <MapPin size={16} color={colors.info} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Alamat</Text>
                  <Text style={styles.infoValue}>{customer.address || '-'}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Ringkasan</Text>
            <View style={styles.infoCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Pesanan</Text>
                <Text style={styles.summaryValue}>{orders.length} pesanan</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pesanan Aktif</Text>
                <Text style={[styles.summaryValue, { color: colors.warning }]}>{stats.activeOrders}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pesanan Selesai</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>{stats.completedOrders}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Belanja</Text>
                <Text style={[styles.summaryValue, { color: colors.primary, fontWeight: '700' as const }]}>{formatFullCurrency(stats.totalSpent)}</Text>
              </View>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.orderList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ShoppingBag size={48} color={colors.border} />
              <Text style={styles.emptyText}>Belum ada riwayat pesanan</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBg: { backgroundColor: colors.primary },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.white },
  profileCard: { alignItems: 'center', backgroundColor: colors.primary, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarLargeText: { fontSize: 30, fontWeight: '800' as const, color: colors.white },
  profileName: { fontSize: 22, fontWeight: '700' as const, color: colors.white, marginBottom: 4 },
  profileSince: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: -1, backgroundColor: colors.white, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, marginBottom: 4 },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  statNum: { fontSize: 14, fontWeight: '700' as const, color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, backgroundColor: colors.surfaceSecondary, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '500' as const, color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontWeight: '600' as const },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 16, paddingTop: 20 },
  infoSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '600' as const, color: colors.text, marginBottom: 10, marginLeft: 4 },
  infoCard: { backgroundColor: colors.white, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '500' as const, color: colors.text },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  summaryLabel: { fontSize: 14, color: colors.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
  orderList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  orderCard: { backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 14, fontWeight: '700' as const, color: colors.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' as const },
  orderMid: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  orderInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  orderInfoText: { fontSize: 13, color: colors.textSecondary },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 10 },
  orderPrice: { fontSize: 15, fontWeight: '700' as const, color: colors.text },
  payBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  payText: { fontSize: 11, fontWeight: '600' as const },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
});
