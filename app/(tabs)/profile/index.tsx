import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Clock, LogOut, Bell, Settings, HelpCircle, ChevronRight, Shield, CreditCard, MessageCircle, Star, FileText, Info, Crown, Store, Calendar, ArrowUpCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/format';
import { ProfileSkeletonLoader } from '@/components/Skeleton';

export default function ProfileScreen() {
  const { user, shiftInfo, toggleShift } = useApp();
  const { logout, user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar dari aplikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  const accountMenuItems = [
    { icon: User, label: 'Edit Profil', description: 'Ubah nama dan foto profil' },
    { icon: Shield, label: 'Keamanan', description: 'Password dan autentikasi' },
    { icon: CreditCard, label: 'Metode Pembayaran', description: 'Kelola kartu dan rekening' },
  ];

  const preferencesMenuItems = [
    { icon: Bell, label: 'Notifikasi', badge: 3 },
    { icon: Settings, label: 'Pengaturan Aplikasi' },
  ];

  const supportMenuItems = [
    { icon: HelpCircle, label: 'Pusat Bantuan' },
    { icon: MessageCircle, label: 'Hubungi Kami' },
    { icon: Star, label: 'Beri Rating' },
    { icon: FileText, label: 'Syarat & Ketentuan' },
    { icon: Info, label: 'Tentang Aplikasi' },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProfileSkeletonLoader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={36} color={colors.white} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Text style={styles.editAvatarText}>Ubah</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{authUser?.name || user.name}</Text>
            <Text style={styles.profileEmail}>{authUser?.email || authUser?.phone || user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          </View>
        </View>

        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View style={styles.subscriptionTitleRow}>
              <Crown size={20} color={colors.primary} />
              <Text style={styles.subscriptionName}>Paket Starter</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Aktif</Text>
            </View>
          </View>
          <View style={styles.subscriptionDivider} />
          <View style={styles.subscriptionDetail}>
            <View style={styles.subscriptionRow}>
              <Store size={16} color={colors.textSecondary} />
              <Text style={styles.subscriptionLabel}>Penggunaan Cabang</Text>
              <Text style={styles.subscriptionValue}>1/1</Text>
            </View>
            <View style={styles.usageBarBg}>
              <View style={[styles.usageBarFill, { width: '100%' }]} />
            </View>
          </View>
          <View style={styles.subscriptionFooter}>
            <View style={styles.subscriptionDateRow}>
              <Calendar size={14} color={colors.textTertiary} />
              <Text style={styles.subscriptionDate}>Berlaku hingga 15 Mar 2026</Text>
            </View>
            <TouchableOpacity style={styles.upgradeButton}>
              <ArrowUpCircle size={16} color={colors.white} />
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.shiftSectionHeader}>
            <Clock size={18} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Status Shift</Text>
          </View>

          <View style={[styles.shiftBanner, !shiftInfo.isActive && styles.shiftBannerInactive]}>
            <View style={styles.shiftLeft}>
              <View style={[styles.shiftIcon, !shiftInfo.isActive && styles.shiftIconInactive]}>
                <Clock size={20} color={shiftInfo.isActive ? colors.primary : colors.textSecondary} />
              </View>
              <View>
                <Text style={[styles.shiftTitle, !shiftInfo.isActive && styles.shiftTitleInactive]}>
                  {shiftInfo.isActive ? 'Shift Aktif' : 'Shift Tidak Aktif'}
                </Text>
                <Text style={styles.shiftTime}>
                  {shiftInfo.isActive ? `Mulai ${shiftInfo.startTime}` : 'Klik untuk mulai'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.shiftButton, !shiftInfo.isActive && styles.shiftButtonStart]}
              onPress={toggleShift}
            >
              <LogOut size={16} color={shiftInfo.isActive ? colors.textSecondary : colors.white} />
              <Text style={[styles.shiftButtonText, !shiftInfo.isActive && styles.shiftButtonTextStart]}>
                {shiftInfo.isActive ? 'Tutup' : 'Mulai'}
              </Text>
            </TouchableOpacity>
          </View>

          {shiftInfo.isActive && (
            <View style={styles.shiftSummary}>
              <Text style={styles.summaryTitle}>Ringkasan Shift Ini</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{formatCurrency(shiftInfo.totalRevenue)}</Text>
                  <Text style={styles.summaryLabel}>Total Omzet</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{shiftInfo.totalOrders}</Text>
                  <Text style={styles.summaryLabel}>Total Order</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    {shiftInfo.completedOrders}
                  </Text>
                  <Text style={styles.summaryLabel}>Selesai</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.error }]}>
                    {shiftInfo.overdueOrders}
                  </Text>
                  <Text style={styles.summaryLabel}>Terlambat</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Akun</Text>
        </View>
        <View style={styles.menuCard}>
          {accountMenuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.label}
              style={[styles.menuItem, index < accountMenuItems.length - 1 && styles.menuItemBorder]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <item.icon size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Preferensi</Text>
        </View>
        <View style={styles.menuCard}>
          {preferencesMenuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.label}
              style={[styles.menuItem, index < preferencesMenuItems.length - 1 && styles.menuItemBorder]}
            >
              <View style={styles.menuLeft}>
                <item.icon size={20} color={colors.textSecondary} />
                <Text style={styles.menuLabelSimple}>{item.label}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.badge && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                )}
                <ChevronRight size={20} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Bantuan & Dukungan</Text>
        </View>
        <View style={styles.menuCard}>
          {supportMenuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.label}
              style={[styles.menuItem, index < supportMenuItems.length - 1 && styles.menuItemBorder]}
            >
              <View style={styles.menuLeft}>
                <item.icon size={20} color={colors.textSecondary} />
                <Text style={styles.menuLabelSimple}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={18} color={colors.error} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>AtourWash v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 28,
    paddingVertical: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  editAvatarButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editAvatarText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.primary,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  shiftSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  shiftBanner: {
    backgroundColor: colors.primaryBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shiftBannerInactive: {
    backgroundColor: colors.surfaceSecondary,
  },
  shiftLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shiftIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftIconInactive: {
    backgroundColor: colors.white,
  },
  shiftTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  shiftTitleInactive: {
    color: colors.textSecondary,
  },
  shiftTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  shiftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  shiftButtonStart: {
    backgroundColor: colors.primary,
  },
  shiftButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  shiftButtonTextStart: {
    color: colors.white,
  },
  shiftSummary: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '50%',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  menuLabelSimple: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  menuDescription: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  menuBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.error,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.error,
  },
  subscriptionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.primaryBg,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscriptionName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
  },
  activeBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.success,
  },
  subscriptionDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: 12,
  },
  subscriptionDetail: {
    marginBottom: 14,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  subscriptionLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  subscriptionValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
  },
  usageBarBg: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden' as const,
  },
  usageBarFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  subscriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subscriptionDate: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.white,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 20,
  },
});
