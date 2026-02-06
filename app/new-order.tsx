import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, User, Scale, Check } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { mockServices } from '@/mocks/data';
import { formatFullCurrency } from '@/utils/format';
import { Order, Service } from '@/types';

export default function NewOrderScreen() {
  const router = useRouter();
  const { addOrder, orders } = useApp();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [weight, setWeight] = useState('');

  const totalPrice = useMemo(() => {
    if (!selectedService || !weight) return 0;
    const w = parseFloat(weight) || 0;
    return selectedService.pricePerUnit * w;
  }, [selectedService, weight]);

  const canSubmit = customerName.trim() && selectedService && parseFloat(weight) > 0;

  const handleSubmit = () => {
    if (!canSubmit || !selectedService) return;

    const estimatedDays = selectedService.name.includes('Express') ? 1 : selectedService.name.includes('Dry') ? 5 : 3;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: Math.ceil(parseFloat(weight)),
      weight: parseFloat(weight),
      pickupTime: '17:00',
      status: 'dalam_proses',
      serviceType: selectedService.name,
      totalPrice,
      paidAmount: 0,
      paymentStatus: 'belum_bayar',
      createdAt: new Date().toISOString(),
      productionStatus: 'antrian',
      itemDetails: `${Math.ceil(parseFloat(weight))} item`,
      estimatedDate: estimatedDate.toISOString().split('T')[0],
    };

    addOrder(newOrder);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
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
              <User size={18} color={colors.textSecondary} />
              <Text style={styles.sectionTitle}>Pelanggan</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama</Text>
              <TextInput
                style={styles.input}
                placeholder="Nama pelanggan"
                placeholderTextColor={colors.textTertiary}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>No. Telepon</Text>
              <TextInput
                style={styles.input}
                placeholder="08xxxxxxxxxx"
                placeholderTextColor={colors.textTertiary}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pilih Layanan</Text>
            <View style={styles.servicesGrid}>
              {mockServices.map(service => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                    onPress={() => setSelectedService(service)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.serviceHeader}>
                      <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>
                        {service.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkIcon}>
                          <Check size={14} color={colors.white} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.serviceDuration}>{service.duration}</Text>
                    <Text style={[styles.servicePrice, isSelected && styles.servicePriceSelected]}>
                      {formatFullCurrency(service.pricePerUnit)}/{service.unit}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Scale size={18} color={colors.textSecondary} />
              <Text style={styles.sectionTitle}>Berat</Text>
            </View>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.weightInput}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>
          </View>
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
          >
            <Text style={styles.submitButtonText}>+ Buat Order</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 8,
  },
  section: {
    marginBottom: 28,
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
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
  },
  serviceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  serviceNameSelected: {
    color: colors.primaryDark,
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceDuration: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  servicePriceSelected: {
    color: colors.primaryDark,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  weightInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  weightUnit: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500' as const,
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
    marginBottom: 16,
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
