import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Plus, Pencil, Trash2, CreditCard, Check, X } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { BankAccount } from '@/types';

const BANK_ICONS = ['🏦', '🏛️', '🏢', '🏗️', '💳', '📱', '💰', '🪙'];

export default function KelolaRekeningScreen() {
  const router = useRouter();
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, toggleBankAccountActive } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formBankName, setFormBankName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formAccountHolder, setFormAccountHolder] = useState('');
  const [formIcon, setFormIcon] = useState('🏦');

  const resetForm = useCallback(() => {
    setFormBankName('');
    setFormAccountNumber('');
    setFormAccountHolder('');
    setFormIcon('🏦');
    setEditingAccount(null);
  }, []);

  const openAddForm = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  const openEditForm = useCallback((account: BankAccount) => {
    setEditingAccount(account);
    setFormBankName(account.bankName);
    setFormAccountNumber(account.accountNumber);
    setFormAccountHolder(account.accountHolder);
    setFormIcon(account.icon);
    setShowForm(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formBankName.trim() || !formAccountNumber.trim() || !formAccountHolder.trim()) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }

    if (editingAccount) {
      updateBankAccount(editingAccount.id, {
        bankName: formBankName.trim(),
        accountNumber: formAccountNumber.trim(),
        accountHolder: formAccountHolder.trim(),
        icon: formIcon,
      });
    } else {
      const newAccount: BankAccount = {
        id: `ba-${Date.now()}`,
        bankName: formBankName.trim(),
        accountNumber: formAccountNumber.trim(),
        accountHolder: formAccountHolder.trim(),
        isActive: true,
        icon: formIcon,
      };
      addBankAccount(newAccount);
    }

    setShowForm(false);
    resetForm();
  }, [formBankName, formAccountNumber, formAccountHolder, formIcon, editingAccount, addBankAccount, updateBankAccount, resetForm]);

  const handleDelete = useCallback((account: BankAccount) => {
    Alert.alert(
      'Hapus Rekening',
      `Yakin ingin menghapus rekening ${account.bankName} (${account.accountNumber})?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => deleteBankAccount(account.id) },
      ]
    );
  }, [deleteBankAccount]);

  const activeAccounts = bankAccounts.filter(a => a.isActive);
  const inactiveAccounts = bankAccounts.filter(a => !a.isActive);

  const canSave = formBankName.trim().length > 0 && formAccountNumber.trim().length > 0 && formAccountHolder.trim().length > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerBg}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Kelola Rekening</Text>
              <Text style={styles.headerSubtitle}>{bankAccounts.length} rekening terdaftar</Text>
            </View>
            <TouchableOpacity style={styles.addHeaderBtn} onPress={openAddForm}>
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeAccounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aktif ({activeAccounts.length})</Text>
            {activeAccounts.map(account => (
              <View key={account.id} style={styles.accountCard}>
                <View style={styles.accountIconBox}>
                  <Text style={styles.accountIconText}>{account.icon}</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountBankName}>{account.bankName}</Text>
                  <Text style={styles.accountNumber}>{account.accountNumber}</Text>
                  <Text style={styles.accountHolder}>{account.accountHolder}</Text>
                </View>
                <View style={styles.accountActions}>
                  <Switch
                    value={account.isActive}
                    onValueChange={() => toggleBankAccountActive(account.id)}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={account.isActive ? colors.primary : colors.textTertiary}
                  />
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => openEditForm(account)}
                      activeOpacity={0.7}
                    >
                      <Pencil size={16} color={colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDelete(account)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {inactiveAccounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nonaktif ({inactiveAccounts.length})</Text>
            {inactiveAccounts.map(account => (
              <View key={account.id} style={[styles.accountCard, styles.accountCardInactive]}>
                <View style={[styles.accountIconBox, styles.accountIconBoxInactive]}>
                  <Text style={styles.accountIconText}>{account.icon}</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={[styles.accountBankName, styles.textInactive]}>{account.bankName}</Text>
                  <Text style={[styles.accountNumber, styles.textInactive]}>{account.accountNumber}</Text>
                  <Text style={[styles.accountHolder, styles.textInactive]}>{account.accountHolder}</Text>
                </View>
                <View style={styles.accountActions}>
                  <Switch
                    value={account.isActive}
                    onValueChange={() => toggleBankAccountActive(account.id)}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={account.isActive ? colors.primary : colors.textTertiary}
                  />
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => openEditForm(account)}
                      activeOpacity={0.7}
                    >
                      <Pencil size={16} color={colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDelete(account)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {bankAccounts.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <CreditCard size={48} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Rekening</Text>
            <Text style={styles.emptyMessage}>Tambahkan rekening bank untuk menerima pembayaran transfer dari pelanggan.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openAddForm} activeOpacity={0.8}>
              <Plus size={18} color={colors.white} />
              <Text style={styles.emptyBtnText}>Tambah Rekening</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CreditCard size={22} color={colors.primary} />
              <Text style={styles.modalTitle}>
                {editingAccount ? 'Edit Rekening' : 'Tambah Rekening'}
              </Text>
              <TouchableOpacity onPress={() => { setShowForm(false); resetForm(); }}>
                <X size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Ikon</Text>
              <View style={styles.iconGrid}>
                {BANK_ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.iconOption, formIcon === icon && styles.iconOptionSelected]}
                    onPress={() => setFormIcon(icon)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.iconOptionText}>{icon}</Text>
                    {formIcon === icon && (
                      <View style={styles.iconCheck}>
                        <Check size={10} color={colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Nama Bank / E-Wallet</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Contoh: BCA, BNI, Dana, GoPay"
                placeholderTextColor={colors.textTertiary}
                value={formBankName}
                onChangeText={setFormBankName}
              />

              <Text style={styles.formLabel}>Nomor Rekening / ID</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Contoh: 1234567890"
                placeholderTextColor={colors.textTertiary}
                value={formAccountNumber}
                onChangeText={setFormAccountNumber}
                keyboardType="number-pad"
              />

              <Text style={styles.formLabel}>Nama Pemilik Rekening</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Contoh: AtourWash"
                placeholderTextColor={colors.textTertiary}
                value={formAccountHolder}
                onChangeText={setFormAccountHolder}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowForm(false); resetForm(); }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!canSave}
                activeOpacity={0.8}
              >
                <Check size={18} color={colors.white} />
                <Text style={styles.saveBtnText}>
                  {editingAccount ? 'Simpan' : 'Tambah'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBg: {
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
  },
  addHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 10,
    marginLeft: 4,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  accountCardInactive: {
    opacity: 0.65,
    backgroundColor: colors.surfaceSecondary,
  },
  accountIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  accountIconBoxInactive: {
    backgroundColor: colors.surfaceSecondary,
  },
  accountIconText: {
    fontSize: 24,
  },
  accountInfo: {
    flex: 1,
  },
  accountBankName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  accountNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    fontVariant: ['tabular-nums'] as any,
  },
  accountHolder: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  textInactive: {
    color: colors.textTertiary,
  },
  accountActions: {
    alignItems: 'center',
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 21,
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyBtnText: {
    fontSize: 15,
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
    maxHeight: '85%',
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
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  modalScroll: {
    paddingHorizontal: 24,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  formInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  iconOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  iconOptionText: {
    fontSize: 22,
  },
  iconCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  cancelBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  saveBtnDisabled: {
    backgroundColor: colors.border,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
});
