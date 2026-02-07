import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, User, Minus, Plus, Check, Weight, ShoppingBag, Layers } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { mockKiloanServices, mockSatuanItems } from '@/mocks/data';
import { formatFullCurrency } from '@/utils/format';
import { Order } from '@/types';

type LaundryMode = 'kiloan' | 'satuan' | 'kombinasi';

interface SatuanEntry {
  id: string;
  name: string;
  price: number;
  icon: string;
  qty: number;
}

export default function NewOrderScreen() {
  const router = useRouter();
  const { addOrder, orders } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [mode, setMode] = useState<LaundryMode>('kiloan');
  const [selectedKiloanId, setSelectedKiloanId] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [satuanItems, setSatuanItems] = useState<SatuanEntry[]>(
    mockSatuanItems.map(i => ({ ...i, qty: 0 }))
  );

  const selectedKiloan = useMemo(
    () => mockKiloanServices.find(s => s.id === selectedKiloanId) ?? null,
    [selectedKiloanId]
  );

  const incrementWeight = useCallback(() => {
    setWeight(prev => {
      const v = parseFloat(prev) || 0;
      return String(Math.round((v + 0.5) * 10) / 10);
    });
  }, []);

  const decrementWeight = useCallback(() => {
    setWeight(prev => {
      const v = parseFloat(prev) || 0;
      const next = Math.max(0, Math.round((v - 0.5) * 10) / 10);
      return next === 0 ? '' : String(next);
    });
  }, []);

  const updateSatuanQty = useCallback((id: string, delta: number) => {
    setSatuanItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
      )
    );
  }, []);

  const kiloanTotal = useMemo(() => {
    if (!selectedKiloan || !weight) return 0;
    return selectedKiloan.pricePerUnit * (parseFloat(weight) || 0);
  }, [selectedKiloan, weight]);

  const satuanTotal = useMemo(
    () => satuanItems.reduce((sum, i) => sum + i.price * i.qty, 0),
    [satuanItems]
  );

  const totalPrice = useMemo(() => {
    if (mode === 'kiloan') return kiloanTotal;
    if (mode === 'satuan') return satuanTotal;
    return kiloanTotal + satuanTotal;
  }, [mode, kiloanTotal, satuanTotal]);

  const activeSatuanCount = useMemo(
    () => satuanItems.reduce((s, i) => s + i.qty, 0),
    [satuanItems]
  );

  const canSubmit = useMemo(() => {
    const hasCustomer = customerName.trim().length > 0;
    if (mode === 'kiloan') return hasCustomer && !!selectedKiloan && parseFloat(weight) > 0;
    if (mode === 'satuan') return hasCustomer && activeSatuanCount > 0;
    return hasCustomer && ((!!selectedKiloan && parseFloat(weight) > 0) || activeSatuanCount > 0);
  }, [customerName, mode, selectedKiloan, weight, activeSatuanCount]);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const parts: string[] = [];
    let totalW = 0;
    let totalItems = 0;
    let svcName = '';

    if ((mode === 'kiloan' || mode === 'kombinasi') && selectedKiloan && parseFloat(weight) > 0) {
      totalW = parseFloat(weight);
      svcName = selectedKiloan.name;
      parts.push(`${weight} kg ${selectedKiloan.name}`);
    }

    if (mode === 'satuan' || mode === 'kombinasi') {
      const activeItems = satuanItems.filter(i => i.qty > 0);
      activeItems.forEach(i => {
        totalItems += i.qty;
        parts.push(`${i.qty}x ${i.name}`);
      });
      if (!svcName && activeItems.length > 0) svcName = 'Laundry Satuan';
      if (mode === 'kombinasi' && svcName && activeItems.length > 0) svcName += ' + Satuan';
    }

    const estimatedDays = svcName.includes('Express') ? 1 : 3;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: totalItems || Math.ceil(totalW),
      weight: totalW,
      pickupTime: '17:00',
      status: 'dalam_proses',
      serviceType: svcName,
      totalPrice,
      paidAmount: 0,
      paymentStatus: 'belum_bayar',
      createdAt: new Date().toISOString(),
      productionStatus: 'antrian',
      itemDetails: parts.join(', '),
      estimatedDate: estimatedDate.toISOString().split('T')[0],
    };

    addOrder(newOrder);
    router.back();
  };

  const modeOptions: { key: LaundryMode; label: string; icon: React.ReactNode }[] = [
    { key: 'kiloan', label: 'Kiloan', icon: <Weight size={16} color={mode === 'kiloan' ? colors.white : colors.textSecondary} /> },
    { key: 'satuan', label: 'Satuan', icon: <ShoppingBag size={16} color={mode === 'satuan' ? colors.white : colors.textSecondary} /> },
    { key: 'kombinasi', label: 'Kombinasi', icon: <Layers size={16} color={mode === 'kombinasi' ? colors.white : colors.textSecondary} /> },
  ];

  const showKiloan = mode === 'kiloan' || mode === 'kombinasi';
  const showSatuan = mode === 'satuan' || mode === 'kombinasi';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Order Baru</Text>
            <Text style={styles.subtitle}>Buat transaksi baru</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Pelanggan</Text>
            </View>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Nama pelanggan"
                placeholderTextColor={colors.textTertiary}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="No. Telepon (opsional)"
                placeholderTextColor={colors.textTertiary}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipe Laundry</Text>
            <View style={styles.modeRow}>
              {modeOptions.map(opt => {
                const active = mode === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.modeChip, active && styles.modeChipActive]}
                    onPress={() => setMode(opt.key)}
                    activeOpacity={0.7}
                  >
                    {opt.icon}
                    <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {showKiloan && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Layanan Kiloan</Text>
              <View style={styles.servicesGrid}>
                {mockKiloanServices.map(svc => {
                  const sel = selectedKiloanId === svc.id;
                  return (
                    <TouchableOpacity
                      key={svc.id}
                      style={[styles.serviceCard, sel && styles.serviceCardSel]}
                      onPress={() => setSelectedKiloanId(svc.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.serviceRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.serviceName, sel && styles.serviceNameSel]}>{svc.name}</Text>
                          <Text style={styles.serviceDur}>{svc.duration}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={[styles.servicePrice, sel && styles.servicePriceSel]}>
                            {formatFullCurrency(svc.pricePerUnit)}
                          </Text>
                          <Text style={styles.serviceUnit}>/{svc.unit}</Text>
                        </View>
                        {sel && (
                          <View style={styles.checkBadge}>
                            <Check size={12} color={colors.white} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedKiloan && (
                <View style={styles.weightSection}>
                  <Text style={styles.weightLabel}>Berat (kg)</Text>
                  <View style={styles.stepperRow}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, parseFloat(weight) <= 0 && styles.stepperBtnDisabled]}
                      onPress={decrementWeight}
                      activeOpacity={0.6}
                    >
                      <Minus size={20} color={parseFloat(weight) > 0 ? colors.primary : colors.textTertiary} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.weightInput}
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textTertiary}
                      textAlign="center"
                    />
                    <TouchableOpacity style={styles.stepperBtn} onPress={incrementWeight} activeOpacity={0.6}>
                      <Plus size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  {kiloanTotal > 0 && (
                    <Text style={styles.subtotalText}>Subtotal: {formatFullCurrency(kiloanTotal)}</Text>
                  )}
                </View>
              )}
            </View>
          )}

          {showSatuan && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ShoppingBag size={16} color={colors.primary} />
                <Text style={styles.sectionTitle}>Item Satuan</Text>
                {activeSatuanCount > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{activeSatuanCount}</Text>
                  </View>
                )}
              </View>

              {satuanItems.map(item => (
                <View key={item.id} style={[styles.satuanRow, item.qty > 0 && styles.satuanRowActive]}>
                  <Text style={styles.satuanIcon}>{item.icon}</Text>
                  <View style={styles.satuanInfo}>
                    <Text style={styles.satuanName}>{item.name}</Text>
                    <Text style={styles.satuanPrice}>{formatFullCurrency(item.price)}</Text>
                  </View>
                  <View style={styles.satuanStepper}>
                    {item.qty > 0 ? (
                      <>
                        <TouchableOpacity
                          style={styles.satuanBtn}
                          onPress={() => updateSatuanQty(item.id, -1)}
                          activeOpacity={0.6}
                        >
                          <Minus size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.satuanQty}>{item.qty}</Text>
                        <TouchableOpacity
                          style={styles.satuanBtn}
                          onPress={() => updateSatuanQty(item.id, 1)}
                          activeOpacity={0.6}
                        >
                          <Plus size={16} color={colors.primary} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.addItemBtn}
                        onPress={() => updateSatuanQty(item.id, 1)}
                        activeOpacity={0.7}
                      >
                        <Plus size={16} color={colors.white} />
                        <Text style={styles.addItemText}>Tambah</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

              {satuanTotal > 0 && (
                <Text style={styles.subtotalText}>Subtotal satuan: {formatFullCurrency(satuanTotal)}</Text>
              )}
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatFullCurrency(totalPrice)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Buat Order</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
    backgroundColor: colors.primary,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  modeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  modeChipTextActive: {
    color: colors.white,
  },
  servicesGrid: {
    gap: 10,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
  },
  serviceCardSel: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  serviceNameSel: {
    color: colors.primaryDark,
  },
  serviceDur: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  servicePriceSel: {
    color: colors.primaryDark,
  },
  serviceUnit: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  weightSection: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weightLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  stepperBtnDisabled: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
  },
  weightInput: {
    width: 80,
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    paddingVertical: 4,
  },
  subtotalText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
    textAlign: 'right',
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.white,
  },
  satuanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  satuanRowActive: {
    borderColor: colors.primary + '40',
    backgroundColor: colors.primaryBg,
  },
  satuanIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  satuanInfo: {
    flex: 1,
  },
  satuanName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  satuanPrice: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  satuanStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  satuanBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  satuanQty: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    minWidth: 24,
    textAlign: 'center' as const,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addItemText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.white,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
});
