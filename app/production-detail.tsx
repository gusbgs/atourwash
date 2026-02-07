import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  User, 
  Package,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronRight
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { ProductionStatus } from '@/types';

interface TimelineStep {
  id: ProductionStatus;
  label: string;
  description: string;
}

const timelineSteps: TimelineStep[] = [
  { id: 'antrian', label: 'Antrian', description: 'Cucian masuk antrian' },
  { id: 'diproses', label: 'Diproses', description: 'Sedang dicuci & disetrika' },
  { id: 'siap_diambil', label: 'Siap Diambil', description: 'Siap diambil pelanggan' },
  { id: 'selesai', label: 'Selesai', description: 'Pesanan selesai' },
];

const getStepIndex = (status: ProductionStatus): number => {
  return timelineSteps.findIndex(step => step.id === status);
};

export default function ProductionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, updateProductionStatus, updateOrderStatus } = useApp();
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

  const currentStepIndex = getStepIndex(order.productionStatus);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const getNextAction = () => {
    switch (order.productionStatus) {
      case 'antrian':
        return { label: 'Mulai Proses', nextStatus: 'diproses' as ProductionStatus };
      case 'diproses':
        return { label: 'Siap Diambil', nextStatus: 'siap_diambil' as ProductionStatus };
      case 'siap_diambil':
        return { label: 'Selesai', nextStatus: 'selesai' as ProductionStatus };
      default:
        return null;
    }
  };

  const handleNextStep = () => {
    const action = getNextAction();
    if (action) {
      updateProductionStatus(order.id, action.nextStatus);
      if (action.nextStatus === 'selesai') {
        updateOrderStatus(order.id, 'siap_diambil');
      }
    }
  };

  const nextAction = getNextAction();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Produksi ${order.id}`,
        }} 
      />
      <View style={styles.container}>
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.orderInfoCard}>
            <View style={styles.orderInfoHeader}>
              <View style={styles.orderIdContainer}>
                <Text style={styles.orderIdLabel}>Order ID</Text>
                <Text style={styles.orderId}>{order.id}</Text>
              </View>
              {order.status === 'terlambat' && (
                <View style={styles.lateBadge}>
                  <AlertCircle size={14} color={colors.error} />
                  <Text style={styles.lateBadgeText}>Terlambat</Text>
                </View>
              )}
            </View>
            
            <View style={styles.orderInfoDivider} />
            
            <View style={styles.orderInfoRow}>
              <View style={styles.orderInfoIcon}>
                <User size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.orderInfoText}>{order.customerName}</Text>
            </View>
            
            <View style={styles.orderInfoRow}>
              <View style={styles.orderInfoIcon}>
                <Package size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.orderInfoText}>{order.itemDetails || `${order.items} item • ${order.weight} kg`}</Text>
            </View>
            
            <View style={styles.orderInfoRow}>
              <View style={styles.orderInfoIcon}>
                <Clock size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.orderInfoText}>Ambil: {order.pickupTime}</Text>
            </View>
          </View>

          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>Timeline Produksi</Text>
            
            <View style={styles.timeline}>
              {timelineSteps.map((step, index) => {
                const status = getStepStatus(index);
                const isLast = index === timelineSteps.length - 1;
                
                return (
                  <View key={step.id} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineNode,
                        status === 'completed' && styles.timelineNodeCompleted,
                        status === 'current' && styles.timelineNodeCurrent,
                        status === 'pending' && styles.timelineNodePending,
                      ]}>
                        {status === 'completed' ? (
                          <CheckCircle2 size={24} color={colors.white} />
                        ) : status === 'current' ? (
                          <View style={styles.currentDot} />
                        ) : (
                          <Circle size={24} color={colors.border} />
                        )}
                      </View>
                      {!isLast && (
                        <View style={[
                          styles.timelineLine,
                          status === 'completed' && styles.timelineLineCompleted,
                        ]} />
                      )}
                    </View>
                    
                    <View style={[
                      styles.timelineContent,
                      status === 'current' && styles.timelineContentCurrent,
                    ]}>
                      <Text style={[
                        styles.timelineLabel,
                        status === 'completed' && styles.timelineLabelCompleted,
                        status === 'current' && styles.timelineLabelCurrent,
                        status === 'pending' && styles.timelineLabelPending,
                      ]}>
                        {step.label}
                      </Text>
                      <Text style={[
                        styles.timelineDescription,
                        status === 'current' && styles.timelineDescriptionCurrent,
                      ]}>
                        {step.description}
                      </Text>
                      {status === 'current' && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Sedang Berlangsung</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {order.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Catatan</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {nextAction && (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <TouchableOpacity style={styles.actionButton} onPress={handleNextStep}>
              <Text style={styles.actionButtonText}>{nextAction.label}</Text>
              <ChevronRight size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}

        {order.productionStatus === 'selesai' && (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.completedBanner}>
              <CheckCircle2 size={24} color={colors.success} />
              <Text style={styles.completedText}>Produksi Selesai</Text>
            </View>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  orderInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdContainer: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  lateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  lateBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.error,
  },
  orderInfoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderInfoIcon: {
    width: 24,
    marginRight: 8,
  },
  orderInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  timelineSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeline: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 40,
  },
  timelineNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNodeCompleted: {
    backgroundColor: colors.success,
  },
  timelineNodeCurrent: {
    backgroundColor: colors.primaryBg,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  timelineNodePending: {
    backgroundColor: colors.surfaceSecondary,
  },
  currentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  timelineLine: {
    width: 3,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
    minHeight: 40,
  },
  timelineLineCompleted: {
    backgroundColor: colors.success,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 24,
  },
  timelineContentCurrent: {
    backgroundColor: colors.primaryBg,
    marginLeft: 12,
    marginRight: -4,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  timelineLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  timelineLabelCompleted: {
    color: colors.success,
  },
  timelineLabelCurrent: {
    color: colors.primary,
  },
  timelineLabelPending: {
    color: colors.textTertiary,
  },
  timelineDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  timelineDescriptionCurrent: {
    color: colors.primaryDark,
  },
  currentBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.white,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesCard: {
    backgroundColor: colors.warningBg,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic' as const,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successBg,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.success,
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
