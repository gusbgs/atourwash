import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  User, 
  Phone, 
  Package, 
  Scale, 
  Clock, 
  Calendar,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { PaymentBadge } from '@/components/PaymentBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { formatFullCurrency } from '@/utils/format';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={styles.errorText}>Pesanan tidak ditemukan</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${order.customerPhone}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(`https://wa.me/${order.customerPhone.replace(/^0/, '62')}`);
  };

  const remainingAmount = order.totalPrice - order.paidAmount;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `${order.id} — ${order.serviceType}`,
        }} 
      />
      <View style={styles.container}>
        <View style={styles.statusBar}>
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.paymentStatus} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informasi Pelanggan</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <User size={18} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nama</Text>
                  <Text style={styles.infoValue}>{order.customerName}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Phone size={18} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>No. Telepon</Text>
                  <Text style={styles.infoValue}>{order.customerPhone}</Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity style={styles.contactButton} onPress={handleCallCustomer}>
                    <Phone size={16} color={colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.contactButton, styles.whatsappButton]} onPress={handleWhatsApp}>
                    <Text style={styles.waText}>WA</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detail Pesanan</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Package size={18} color={colors.info} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Jumlah Item</Text>
                  <Text style={styles.infoValue}>{order.items} item</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Scale size={18} color={colors.info} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Berat</Text>
                  <Text style={styles.infoValue}>{order.weight} kg</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <FileText size={18} color={colors.info} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Rincian</Text>
                  <Text style={styles.infoValue}>{order.itemDetails || '-'}</Text>
                </View>
              </View>
              {order.notes && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Catatan:</Text>
                    <Text style={styles.notesText}>{order.notes}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jadwal</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Calendar size={18} color={colors.warning} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tanggal Order</Text>
                  <Text style={styles.infoValue}>
                    {new Date(order.createdAt).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Clock size={18} color={colors.warning} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Estimasi Selesai</Text>
                  <Text style={styles.infoValue}>
                    {new Date(order.estimatedDate).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })} • {order.pickupTime}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pembayaran</Text>
            <View style={styles.card}>
              <View style={styles.paymentHeader}>
                <PaymentBadge status={order.paymentStatus} />
              </View>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Total Tagihan</Text>
                <Text style={styles.paymentTotal}>{formatFullCurrency(order.totalPrice)}</Text>
              </View>
              
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Sudah Dibayar</Text>
                <Text style={styles.paymentPaid}>{formatFullCurrency(order.paidAmount)}</Text>
              </View>
              
              {remainingAmount > 0 && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Sisa Tagihan</Text>
                  <Text style={styles.paymentRemaining}>{formatFullCurrency(remainingAmount)}</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {order.paymentStatus !== 'lunas' && (
            <TouchableOpacity style={styles.payButton}>
              <CreditCard size={20} color={colors.white} />
              <Text style={styles.payButtonText}>Bayar Sekarang</Text>
            </TouchableOpacity>
          )}
          {order.paymentStatus === 'lunas' && order.status === 'siap_diambil' && (
            <TouchableOpacity style={[styles.payButton, styles.completeButton]}>
              <CheckCircle2 size={20} color={colors.white} />
              <Text style={styles.payButtonText}>Selesaikan Pesanan</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  waText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.white,
  },
  notesContainer: {
    paddingVertical: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic' as const,
  },
  paymentHeader: {
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paymentTotal: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  paymentPaid: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.success,
  },
  paymentRemaining: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.error,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  completeButton: {
    backgroundColor: colors.success,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.white,
  },
});
