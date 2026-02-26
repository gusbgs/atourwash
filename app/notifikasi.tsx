import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Check, Package, Wallet, Loader, Tag, Settings, AlertCircle, Trash2 } from '@/utils/icons';
import type { HugeIcon } from '@/utils/icons';
import { colors } from '@/constants/colors';
import { mockNotifications } from '@/mocks/data';
import type { Notification, NotificationType } from '@/types';

function getNotifIcon(type: NotificationType): { Icon: HugeIcon; color: string; bg: string } {
  switch (type) {
    case 'order':
      return { Icon: Package, color: colors.info, bg: colors.infoBg };
    case 'payment':
      return { Icon: Wallet, color: colors.success, bg: colors.successBg };
    case 'production':
      return { Icon: Loader, color: colors.warning, bg: colors.warningBg };
    case 'promo':
      return { Icon: Tag, color: '#8B5CF6', bg: '#EDE9FE' };
    case 'system':
      return { Icon: Settings, color: colors.textSecondary, bg: colors.surfaceSecondary };
    default:
      return { Icon: Bell, color: colors.primary, bg: colors.primaryBg };
  }
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

type FilterType = 'semua' | NotificationType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'order', label: 'Pesanan' },
  { key: 'payment', label: 'Bayar' },
  { key: 'production', label: 'Produksi' },
  { key: 'promo', label: 'Promo' },
  { key: 'system', label: 'Sistem' },
];

interface NotifItemProps {
  item: Notification;
  onPress: (item: Notification) => void;
  onDelete: (id: string) => void;
}

const NotifItem = React.memo(({ item, onPress, onDelete }: NotifItemProps) => {
  const { Icon, color, bg } = getNotifIcon(item.type);

  return (
    <TouchableOpacity
      style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}
      onPress={() => onPress(item)}
      onLongPress={() => onDelete(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.notifIconBox, { backgroundColor: bg }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default function NotifikasiScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterType>('semua');

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'semua') return notifications;
    return notifications.filter(n => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const handlePress = useCallback((item: Notification) => {
    setNotifications(prev =>
      prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
    );
    if (item.orderId) {
      router.push({ pathname: '/order-detail', params: { id: item.orderId } } as any);
    }
  }, [router]);

  const handleDelete = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const renderItem = useCallback(({ item }: { item: Notification }) => (
    <NotifItem item={item} onPress={handlePress} onDelete={handleDelete} />
  ), [handlePress, handleDelete]);

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <Bell size={40} color={colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>Tidak ada notifikasi</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'semua'
          ? 'Belum ada notifikasi saat ini'
          : `Tidak ada notifikasi untuk kategori ini`}
      </Text>
    </View>
  ), [activeFilter]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Notifikasi</Text>
              {unreadCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            {unreadCount > 0 ? (
              <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
                <Check size={18} color={colors.white} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={f => f.key}
          renderItem={({ item: f }) => {
            const isActive = activeFilter === f.key;
            const count = f.key === 'semua'
              ? notifications.length
              : notifications.filter(n => n.type === f.key).length;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
                <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.white,
  },
  headerBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.white,
  },
  markAllBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
  },
  filterChipActive: {
    backgroundColor: colors.primaryBg,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  filterCount: {
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    minWidth: 20,
    height: 18,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: colors.primary,
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: colors.textTertiary,
  },
  filterCountTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingBottom: 40,
  },
  notifItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    gap: 12,
  },
  notifItemUnread: {
    backgroundColor: '#F0FDF9',
  },
  notifIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
    flex: 1,
  },
  notifTitleUnread: {
    fontWeight: '700' as const,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notifMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500' as const,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 70,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 18,
  },
});
