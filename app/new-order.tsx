import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, User, Minus, Plus, Check, Weight, ShoppingBag, Search, X, FileText, Printer, ChevronLeft, CheckCircle2 } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { mockKiloanServices, mockSatuanItems, mockFragrances } from '@/mocks/data';
import { formatFullCurrency } from '@/utils/format';
import { Order } from '@/types';

interface CustomerSuggestion {
  name: string;
  phone: string;
}



interface KiloanEntry {
  serviceId: string;
  weight: string;
}

interface SatuanEntry {
  id: string;
  name: string;
  price: number;
  icon: string;
  qty: number;
}

const parseDecimal = (val: string): number => {
  const normalized = val.replace(',', '.');
  return parseFloat(normalized) || 0;
};

export default function NewOrderScreen() {
  const router = useRouter();
  const { addOrder, orders } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  const successScaleAnim = useRef(new Animated.Value(0)).current;
  const successOpacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const existingCustomers = useMemo(() => {
    const map = new Map<string, CustomerSuggestion>();
    orders.forEach(o => {
      const key = `${o.customerName}-${o.customerPhone}`;
      if (!map.has(key)) {
        map.set(key, { name: o.customerName, phone: o.customerPhone || '' });
      }
    });
    return Array.from(map.values());
  }, [orders]);

  const nameSuggestions = useMemo(() => {
    if (!customerName.trim()) return existingCustomers;
    const q = customerName.toLowerCase();
    return existingCustomers.filter(c => c.name.toLowerCase().includes(q));
  }, [customerName, existingCustomers]);

  const phoneSuggestions = useMemo(() => {
    if (!customerPhone.trim()) return existingCustomers;
    return existingCustomers.filter(c => c.phone.includes(customerPhone));
  }, [customerPhone, existingCustomers]);

  const selectCustomer = useCallback((c: CustomerSuggestion) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setShowNameSuggestions(false);
    setShowPhoneSuggestions(false);
  }, []);

  const [selectedFragrance, setSelectedFragrance] = useState('f1');

  const [showKiloan, setShowKiloan] = useState(true);
  const [showSatuan, setShowSatuan] = useState(false);

  const [kiloanEntries, setKiloanEntries] = useState<KiloanEntry[]>([]);
  const [satuanItems, setSatuanItems] = useState<SatuanEntry[]>(
    mockSatuanItems.map(i => ({ ...i, qty: 0 }))
  );

  const addKiloanEntry = useCallback((serviceId: string) => {
    setKiloanEntries(prev => {
      const exists = prev.find(e => e.serviceId === serviceId);
      if (exists) {
        return prev.filter(e => e.serviceId !== serviceId);
      }
      return [...prev, { serviceId, weight: '' }];
    });
  }, []);

  const updateKiloanWeight = useCallback((serviceId: string, weight: string) => {
    setKiloanEntries(prev =>
      prev.map(e => e.serviceId === serviceId ? { ...e, weight } : e)
    );
  }, []);

  const incrementKiloanWeight = useCallback((serviceId: string) => {
    setKiloanEntries(prev =>
      prev.map(e => {
        if (e.serviceId !== serviceId) return e;
        const v = parseDecimal(e.weight);
        return { ...e, weight: String(Math.round((v + 0.5) * 10) / 10) };
      })
    );
  }, []);

  const decrementKiloanWeight = useCallback((serviceId: string) => {
    setKiloanEntries(prev =>
      prev.map(e => {
        if (e.serviceId !== serviceId) return e;
        const v = parseDecimal(e.weight);
        const next = Math.max(0, Math.round((v - 0.5) * 10) / 10);
        return { ...e, weight: next === 0 ? '' : String(next) };
      })
    );
  }, []);

  const updateSatuanQty = useCallback((id: string, delta: number) => {
    setSatuanItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
      )
    );
  }, []);

  const kiloanTotals = useMemo(() => {
    return kiloanEntries.map(entry => {
      const svc = mockKiloanServices.find(s => s.id === entry.serviceId);
      if (!svc) return { ...entry, subtotal: 0, serviceName: '', pricePerUnit: 0 };
      const w = parseDecimal(entry.weight);
      return { ...entry, subtotal: Math.round(svc.pricePerUnit * w), serviceName: svc.name, pricePerUnit: svc.pricePerUnit };
    });
  }, [kiloanEntries]);

  const kiloanTotal = useMemo(() => kiloanTotals.reduce((s, e) => s + e.subtotal, 0), [kiloanTotals]);

  const satuanTotal = useMemo(
    () => satuanItems.reduce((sum, i) => sum + i.price * i.qty, 0),
    [satuanItems]
  );

  const totalPrice = useMemo(() => kiloanTotal + satuanTotal, [kiloanTotal, satuanTotal]);

  const activeSatuanCount = useMemo(
    () => satuanItems.reduce((s, i) => s + i.qty, 0),
    [satuanItems]
  );

  const activeKiloanEntries = useMemo(
    () => kiloanEntries.filter(e => parseDecimal(e.weight) > 0),
    [kiloanEntries]
  );

  const canSubmit = useMemo(() => {
    const hasCustomer = customerName.trim().length > 0;
    return hasCustomer && (activeKiloanEntries.length > 0 || activeSatuanCount > 0);
  }, [customerName, activeKiloanEntries, activeSatuanCount]);



  const allConfirmationItems = useMemo(() => {
    const items: { label: string; qty: string; subtotal: number }[] = [];
    kiloanTotals.forEach(e => {
      if (e.subtotal > 0) {
        items.push({ label: e.serviceName, qty: `${e.weight} kg`, subtotal: e.subtotal });
      }
    });
    satuanItems.filter(i => i.qty > 0).forEach(i => {
      items.push({ label: i.name, qty: `${i.qty} item`, subtotal: i.price * i.qty });
    });
    return items;
  }, [kiloanTotals, satuanItems]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setShowConfirmation(true);
  };

  const animateSuccess = useCallback(() => {
    successScaleAnim.setValue(0);
    successOpacityAnim.setValue(0);
    checkmarkAnim.setValue(0);
    confettiAnim.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(successScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [successScaleAnim, successOpacityAnim, checkmarkAnim, confettiAnim]);

  const handleConfirmOrder = () => {
    const parts: string[] = [];
    let totalW = 0;
    let totalItems = 0;
    let svcName = '';

    activeKiloanEntries.forEach(entry => {
      const svc = mockKiloanServices.find(s => s.id === entry.serviceId);
      if (svc) {
        const w = parseDecimal(entry.weight);
        totalW += w;
        parts.push(`${entry.weight} kg ${svc.name}`);
        if (!svcName) svcName = svc.name;
        else svcName += ` + ${svc.name}`;
      }
    });

    const activeItems = satuanItems.filter(i => i.qty > 0);
    activeItems.forEach(i => {
      totalItems += i.qty;
      parts.push(`${i.qty}x ${i.name}`);
    });
    if (activeItems.length > 0) {
      svcName = svcName ? svcName + ' + Satuan' : 'Laundry Satuan';
    }

    const estimatedDays = svcName.includes('Express') ? 1 : 3;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

    const finalTotal = kiloanTotal + satuanTotal;

    const chosenFrag = mockFragrances.find(f => f.id === selectedFragrance);

    const orderId = `ORD-${String(orders.length + 1).padStart(3, '0')}`;

    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: totalItems || Math.ceil(totalW),
      weight: totalW,
      pickupTime: '17:00',
      status: 'dalam_proses',
      serviceType: svcName,
      totalPrice: finalTotal,
      paidAmount: 0,
      paymentStatus: 'belum_bayar',
      createdAt: new Date().toISOString(),
      productionStatus: 'antrian',
      itemDetails: parts.join(', '),
      estimatedDate: estimatedDate.toISOString().split('T')[0],
      fragrance: chosenFrag?.name,
    };

    addOrder(newOrder);
    setConfirmedOrderId(orderId);
    setShowConfirmation(false);
    setShowSuccess(true);
    setTimeout(() => animateSuccess(), 100);
  };

  const handleSuccessDone = useCallback(() => {
    setShowSuccess(false);
    router.back();
  }, [router]);



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
            <Text style={styles.title}>Buat Pesanan</Text>
            <Text style={styles.subtitle}>Buat pesanan baru</Text>
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
              <View style={styles.searchInputRow}>
                <Search size={16} color={colors.textTertiary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari / ketik nama pelanggan"
                  placeholderTextColor={colors.textTertiary}
                  value={customerName}
                  onChangeText={(t) => { setCustomerName(t); setShowNameSuggestions(true); setShowPhoneSuggestions(false); }}
                  onFocus={() => { setShowNameSuggestions(true); setShowPhoneSuggestions(false); }}
                />
                {customerName.length > 0 && (
                  <TouchableOpacity onPress={() => { setCustomerName(''); setCustomerPhone(''); setShowNameSuggestions(false); }}>
                    <X size={16} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
              {showNameSuggestions && nameSuggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {nameSuggestions.slice(0, 5).map((c, i) => (
                    <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectCustomer(c)}>
                      <Text style={styles.suggestionName}>{c.name}</Text>
                      {c.phone ? <Text style={styles.suggestionPhone}>{c.phone}</Text> : null}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.searchInputRow}>
                <Search size={16} color={colors.textTertiary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari / ketik no. telepon"
                  placeholderTextColor={colors.textTertiary}
                  value={customerPhone}
                  onChangeText={(t) => { setCustomerPhone(t); setShowPhoneSuggestions(true); setShowNameSuggestions(false); }}
                  onFocus={() => { setShowPhoneSuggestions(true); setShowNameSuggestions(false); }}
                  keyboardType="phone-pad"
                />
                {customerPhone.length > 0 && (
                  <TouchableOpacity onPress={() => { setCustomerPhone(''); setShowPhoneSuggestions(false); }}>
                    <X size={16} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
              {showPhoneSuggestions && phoneSuggestions.length > 0 && (
                <View style={styles.suggestionsBox}>
                  {phoneSuggestions.slice(0, 5).map((c, i) => (
                    <TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => selectCustomer(c)}>
                      <Text style={styles.suggestionName}>{c.name}</Text>
                      {c.phone ? <Text style={styles.suggestionPhone}>{c.phone}</Text> : null}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipe Laundry</Text>
            <Text style={styles.sectionHint}>Aktifkan tipe yang dibutuhkan</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeChip, showKiloan && styles.modeChipActive]}
                onPress={() => setShowKiloan(prev => !prev)}
                activeOpacity={0.7}
              >
                <Weight size={16} color={showKiloan ? colors.white : colors.textSecondary} />
                <Text style={[styles.modeChipText, showKiloan && styles.modeChipTextActive]}>Kiloan</Text>
                {showKiloan && <Check size={14} color={colors.white} />}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeChip, showSatuan && styles.modeChipActive]}
                onPress={() => setShowSatuan(prev => !prev)}
                activeOpacity={0.7}
              >
                <ShoppingBag size={16} color={showSatuan ? colors.white : colors.textSecondary} />
                <Text style={[styles.modeChipText, showSatuan && styles.modeChipTextActive]}>Satuan</Text>
                {showSatuan && <Check size={14} color={colors.white} />}
              </TouchableOpacity>
            </View>
          </View>

          {showKiloan && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Layanan Kiloan</Text>
              <Text style={styles.sectionHint}>Pilih satu atau lebih layanan</Text>
              <View style={styles.servicesGrid}>
                {mockKiloanServices.map(svc => {
                  const entry = kiloanEntries.find(e => e.serviceId === svc.id);
                  const sel = !!entry;
                  return (
                    <View key={svc.id}>
                      <TouchableOpacity
                        style={[styles.serviceCard, sel && styles.serviceCardSel]}
                        onPress={() => addKiloanEntry(svc.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.serviceRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.serviceName, sel && styles.serviceNameSel]}>{svc.name}</Text>
                            <Text style={styles.serviceDur}>{svc.duration}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' as const }}>
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

                      {sel && entry && (
                        <View style={styles.weightSection}>
                          <Text style={styles.weightLabel}>Berat (kg)</Text>
                          <View style={styles.stepperRow}>
                            <TouchableOpacity
                              style={[styles.stepperBtn, parseDecimal(entry.weight) <= 0 && styles.stepperBtnDisabled]}
                              onPress={() => decrementKiloanWeight(svc.id)}
                              activeOpacity={0.6}
                            >
                              <Minus size={20} color={parseDecimal(entry.weight) > 0 ? colors.primary : colors.textTertiary} />
                            </TouchableOpacity>
                            <TextInput
                              style={styles.weightInput}
                              value={entry.weight}
                              onChangeText={(t) => updateKiloanWeight(svc.id, t)}
                              keyboardType="decimal-pad"
                              placeholder="0"
                              placeholderTextColor={colors.textTertiary}
                              textAlign="center"
                            />
                            <TouchableOpacity style={styles.stepperBtn} onPress={() => incrementKiloanWeight(svc.id)} activeOpacity={0.6}>
                              <Plus size={20} color={colors.primary} />
                            </TouchableOpacity>
                          </View>
                          {(() => {
                            const w = parseDecimal(entry.weight);
                            const sub = Math.round(svc.pricePerUnit * w);
                            console.log(`[weight-calc] ${svc.name}: ${entry.weight} -> ${w} * ${svc.pricePerUnit} = ${sub}`);
                            return sub > 0 ? (
                              <Text style={styles.subtotalText}>Subtotal: {formatFullCurrency(sub)}</Text>
                            ) : null;
                          })()}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {kiloanTotal > 0 && (
                <View style={styles.kiloanTotalRow}>
                  <Text style={styles.kiloanTotalLabel}>Total Kiloan</Text>
                  <Text style={styles.kiloanTotalValue}>{formatFullCurrency(kiloanTotal)}</Text>
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

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={{ fontSize: 18 }}>🧴</Text>
              <Text style={styles.sectionTitle}>Pengharum</Text>
            </View>
            <View style={styles.fragranceGrid}>
              {mockFragrances.map(frag => {
                const selected = selectedFragrance === frag.id;
                return (
                  <TouchableOpacity
                    key={frag.id}
                    style={[
                      styles.fragranceChip,
                      selected && { borderColor: frag.color, backgroundColor: frag.color + '15' },
                    ]}
                    onPress={() => setSelectedFragrance(frag.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.fragranceIcon}>{frag.icon}</Text>
                    <Text style={[
                      styles.fragranceName,
                      selected && { color: colors.text, fontWeight: '600' as const },
                    ]}>{frag.name}</Text>
                    {selected && (
                      <View style={[styles.fragranceCheck, { backgroundColor: frag.color }]}>
                        <Check size={10} color={colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

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
            <Text style={styles.submitButtonText}>Lanjutkan</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showSuccess}
        animationType="fade"
        transparent={true}
        onRequestClose={handleSuccessDone}
      >
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successContent,
              {
                opacity: successOpacityAnim,
                transform: [{ scale: successScaleAnim }],
              },
            ]}
          >
            <View style={styles.successIllustrationWrap}>
              <View style={styles.successCircleOuter}>
                <View style={styles.successCircleMiddle}>
                  <Animated.View
                    style={[
                      styles.successCircleInner,
                      { transform: [{ scale: checkmarkAnim }] },
                    ]}
                  >
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=200&h=200&fit=crop&crop=center' }}
                      style={styles.successIllustrationImage}
                    />
                    <View style={styles.successCheckOverlay}>
                      <CheckCircle2 size={48} color={colors.white} />
                    </View>
                  </Animated.View>
                </View>
              </View>

              <Animated.View style={[
                styles.confettiDot,
                styles.confettiDot1,
                { opacity: confettiAnim, transform: [{ scale: confettiAnim }, { translateY: Animated.multiply(confettiAnim, -20) }] },
              ]}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              </Animated.View>
              <Animated.View style={[
                styles.confettiDot,
                styles.confettiDot2,
                { opacity: confettiAnim, transform: [{ scale: confettiAnim }, { translateX: Animated.multiply(confettiAnim, 15) }] },
              ]}>
                <View style={[styles.dot, { backgroundColor: colors.warning }]} />
              </Animated.View>
              <Animated.View style={[
                styles.confettiDot,
                styles.confettiDot3,
                { opacity: confettiAnim, transform: [{ scale: confettiAnim }, { translateX: Animated.multiply(confettiAnim, -15) }] },
              ]}>
                <View style={[styles.dot, { backgroundColor: colors.info }]} />
              </Animated.View>
              <Animated.View style={[
                styles.confettiDot,
                styles.confettiDot4,
                { opacity: confettiAnim, transform: [{ scale: confettiAnim }, { translateY: Animated.multiply(confettiAnim, 15) }] },
              ]}>
                <View style={[styles.dot, { backgroundColor: colors.primaryLight }]} />
              </Animated.View>
            </View>

            <Text style={styles.successTitle}>Pesanan Berhasil Dibuat! 🎉</Text>
            <Text style={styles.successMessage}>
              Pesanan untuk <Text style={styles.successBold}>{customerName}</Text> telah berhasil disimpan dan siap diproses.
            </Text>

            <View style={styles.successOrderIdBox}>
              <Text style={styles.successOrderIdLabel}>No. Pesanan</Text>
              <Text style={styles.successOrderIdValue}>{confirmedOrderId}</Text>
            </View>

            <View style={styles.successInfoRow}>
              <View style={styles.successInfoItem}>
                <Text style={styles.successInfoLabel}>Total</Text>
                <Text style={styles.successInfoValue}>{formatFullCurrency(totalPrice)}</Text>
              </View>
              <View style={styles.successInfoDivider} />
              <View style={styles.successInfoItem}>
                <Text style={styles.successInfoLabel}>Status</Text>
                <View style={styles.successStatusBadge}>
                  <Text style={styles.successStatusText}>Dalam Proses</Text>
                </View>
              </View>
            </View>

            <View style={styles.successActions}>
              <TouchableOpacity
                style={styles.successPrimaryBtn}
                onPress={handleSuccessDone}
                activeOpacity={0.8}
              >
                <Text style={styles.successPrimaryBtnText}>Kembali ke Beranda</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.successSecondaryBtn}
                onPress={handleSuccessDone}
                activeOpacity={0.7}
              >
                <Printer size={18} color={colors.primary} />
                <Text style={styles.successSecondaryBtnText}>Cetak Struk</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        visible={showConfirmation}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <FileText size={22} color={colors.primary} />
              <Text style={styles.modalTitle}>Konfirmasi Pesanan</Text>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.confirmSection}>
                <Text style={styles.confirmLabel}>Pelanggan</Text>
                <Text style={styles.confirmValue}>{customerName}</Text>
                {customerPhone.trim().length > 0 && (
                  <Text style={styles.confirmSubvalue}>{customerPhone}</Text>
                )}
              </View>

              <View style={styles.confirmDivider} />

              <View style={styles.confirmSection}>
                <Text style={styles.confirmLabel}>Detail Pesanan</Text>
                {allConfirmationItems.map((item, idx) => (
                  <View key={idx} style={styles.confirmItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.confirmItemName}>{item.label}</Text>
                      <Text style={styles.confirmItemQty}>{item.qty}</Text>
                    </View>
                    <Text style={styles.confirmItemPrice}>{formatFullCurrency(item.subtotal)}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.confirmDivider} />

              <View style={styles.confirmSection}>
                <Text style={styles.confirmLabel}>Pengharum</Text>
                <Text style={styles.confirmValue}>
                  {mockFragrances.find(f => f.id === selectedFragrance)?.icon}{' '}
                  {mockFragrances.find(f => f.id === selectedFragrance)?.name}
                </Text>
              </View>

              <View style={styles.confirmDivider} />

              <View style={styles.confirmTotalRow}>
                <Text style={styles.confirmTotalLabel}>Total</Text>
                <Text style={styles.confirmTotalValue}>{formatFullCurrency(kiloanTotal + satuanTotal)}</Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBackBtn}
                onPress={() => setShowConfirmation(false)}
                activeOpacity={0.7}
              >
                <ChevronLeft size={18} color={colors.textSecondary} />
                <Text style={styles.modalBackText}>Kembali</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmOrder}
                activeOpacity={0.8}
              >
                <Printer size={18} color={colors.white} />
                <Text style={styles.modalConfirmText}>Simpan & Cetak</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -8,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
  },
  suggestionsBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  suggestionPhone: {
    fontSize: 13,
    color: colors.textSecondary,
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
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + '30',
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
    textAlign: 'right' as const,
  },
  kiloanTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: colors.primaryBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  kiloanTotalLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primaryDark,
  },
  kiloanTotalValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.primaryDark,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalScroll: {
    paddingHorizontal: 24,
  },
  confirmSection: {
    paddingVertical: 16,
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  confirmValue: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
  },
  confirmSubvalue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  confirmDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  confirmItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  confirmItemName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  confirmItemQty: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  confirmItemPrice: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  confirmTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  confirmTotalLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  confirmTotalValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  modalBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBackText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  modalConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
  fragranceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fragranceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  fragranceIcon: {
    fontSize: 16,
  },
  fragranceName: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  fragranceCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successContent: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  successIllustrationWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircleMiddle: {
    width: 115,
    height: 115,
    borderRadius: 58,
    backgroundColor: colors.success + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircleInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  successIllustrationImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    position: 'absolute',
    opacity: 0.25,
  },
  successCheckOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiDot: {
    position: 'absolute',
  },
  confettiDot1: {
    top: 5,
    left: 75,
  },
  confettiDot2: {
    top: 75,
    right: 5,
  },
  confettiDot3: {
    top: 75,
    left: 5,
  },
  confettiDot4: {
    bottom: 5,
    left: 75,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  successBold: {
    fontWeight: '600' as const,
    color: colors.text,
  },
  successOrderIdBox: {
    backgroundColor: colors.primaryBg,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '20',
    borderStyle: 'dashed' as const,
    width: '100%',
    marginBottom: 20,
  },
  successOrderIdLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  successOrderIdValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.primaryDark,
    letterSpacing: 1,
  },
  successInfoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  successInfoItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  successInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  successInfoValue: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
  },
  successInfoDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  successStatusBadge: {
    backgroundColor: colors.warningBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  successStatusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.warning,
  },
  successActions: {
    width: '100%',
    gap: 10,
  },
  successPrimaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  successPrimaryBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
  successSecondaryBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: colors.primaryBg,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.primary + '25',
  },
  successSecondaryBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
});
