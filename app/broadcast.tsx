import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, X, Search, Pencil, Trash2, Mail, MessageSquare, ChevronRight, Tag, Info, Star, Clock } from '@/utils/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/constants/colors';
import { BroadcastTemplate, BroadcastHistory } from '@/types';
import { mockBroadcastTemplates, mockBroadcastHistory } from '@/mocks/data';

const TEMPLATES_KEY = 'broadcast_templates';
const HISTORY_KEY = 'broadcast_history';

type TabType = 'templates' | 'history';

const CATEGORIES: { key: BroadcastTemplate['category']; label: string; color: string; bg: string }[] = [
  { key: 'promo', label: 'Promo', color: '#F59E0B', bg: '#FEF3C7' },
  { key: 'info', label: 'Info', color: '#3B82F6', bg: '#DBEAFE' },
  { key: 'ucapan', label: 'Ucapan', color: '#EC4899', bg: '#FCE7F3' },
  { key: 'lainnya', label: 'Lainnya', color: '#6B7280', bg: '#F3F4F6' },
];

function getCategoryStyle(cat: BroadcastTemplate['category']) {
  return CATEGORIES.find(c => c.key === cat) ?? CATEGORIES[3];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}, ${hours}:${mins}`;
}

export default function BroadcastScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('templates');
  const [templates, setTemplates] = useState<BroadcastTemplate[]>(mockBroadcastTemplates);
  const [history, setHistory] = useState<BroadcastHistory[]>(mockBroadcastHistory);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BroadcastTemplate | null>(null);
  const [formName, setFormName] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formCategory, setFormCategory] = useState<BroadcastTemplate['category']>('promo');
  const [previewTemplate, setPreviewTemplate] = useState<BroadcastTemplate | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const storedT = await AsyncStorage.getItem(TEMPLATES_KEY);
        if (storedT) setTemplates(JSON.parse(storedT));
        const storedH = await AsyncStorage.getItem(HISTORY_KEY);
        if (storedH) setHistory(JSON.parse(storedH));
      } catch (e) {
        console.log('Failed to load broadcast data', e);
      }
    };
    load();
  }, []);

  const persistTemplates = useCallback(async (data: BroadcastTemplate[]) => {
    setTemplates(data);
    try {
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(data));
    } catch (e) {
      console.log('Failed to save templates', e);
    }
  }, []);

  const openAdd = useCallback(() => {
    setEditingTemplate(null);
    setFormName('');
    setFormMessage('');
    setFormCategory('promo');
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((t: BroadcastTemplate) => {
    setEditingTemplate(t);
    setFormName(t.name);
    setFormMessage(t.message);
    setFormCategory(t.category);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formName.trim() || !formMessage.trim()) {
      Alert.alert('Error', 'Nama dan isi pesan wajib diisi');
      return;
    }
    const now = new Date().toISOString();
    if (editingTemplate) {
      const updated = templates.map(t =>
        t.id === editingTemplate.id
          ? { ...t, name: formName.trim(), message: formMessage.trim(), category: formCategory, updatedAt: now }
          : t
      );
      persistTemplates(updated);
    } else {
      const newT: BroadcastTemplate = {
        id: `bt_${Date.now()}`,
        name: formName.trim(),
        message: formMessage.trim(),
        category: formCategory,
        createdAt: now,
        updatedAt: now,
      };
      persistTemplates([newT, ...templates]);
    }
    setModalVisible(false);
  }, [formName, formMessage, formCategory, editingTemplate, templates, persistTemplates]);

  const handleDelete = useCallback((t: BroadcastTemplate) => {
    Alert.alert('Hapus Template', `Yakin ingin menghapus "${t.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => persistTemplates(templates.filter(x => x.id !== t.id)) },
    ]);
  }, [templates, persistTemplates]);

  const handleSendBroadcast = useCallback((t: BroadcastTemplate) => {
    router.push({ pathname: '/broadcast-send' as any, params: { templateId: t.id } });
  }, [router]);

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.message.toLowerCase().includes(search.toLowerCase())
  );

  const renderTemplate = ({ item }: { item: BroadcastTemplate }) => {
    const catStyle = getCategoryStyle(item.category);
    return (
      <TouchableOpacity
        style={styles.templateCard}
        activeOpacity={0.7}
        onPress={() => setPreviewTemplate(item)}
      >
        <View style={styles.templateHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.categoryText, { color: catStyle.color }]}>{catStyle.label}</Text>
          </View>
          <View style={styles.templateActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
              <Pencil size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
              <Trash2 size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.templateName}>{item.name}</Text>
        <Text style={styles.templateMsg} numberOfLines={2}>{item.message}</Text>
        <View style={styles.templateFooter}>
          <View style={styles.dateRow}>
            <Clock size={12} color={colors.textTertiary} />
            <Text style={styles.dateText}>{formatDate(item.updatedAt)}</Text>
          </View>
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => handleSendBroadcast(item)}
            activeOpacity={0.7}
          >
            <Mail size={14} color={colors.white} />
            <Text style={styles.sendBtnText}>Kirim</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusStyle = (status: BroadcastHistory['status']) => {
    switch (status) {
      case 'terkirim': return { color: colors.success, bg: colors.successBg, label: 'Terkirim' };
      case 'gagal': return { color: colors.error, bg: colors.errorBg, label: 'Gagal' };
      case 'sebagian': return { color: colors.warning, bg: colors.warningBg, label: 'Sebagian' };
    }
  };

  const renderHistory = ({ item }: { item: BroadcastHistory }) => {
    const st = getStatusStyle(item.status);
    return (
      <View style={styles.historyCard}>
        <View style={styles.historyLeft}>
          <View style={[styles.historyIcon, { backgroundColor: colors.infoBg }]}>
            <Mail size={18} color={colors.info} />
          </View>
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyName}>{item.templateName}</Text>
          <Text style={styles.historyMeta}>{item.recipientCount} penerima</Text>
          <Text style={styles.historyDate}>{formatDateTime(item.sentAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
          <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={22} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Broadcast</Text>
            <TouchableOpacity style={styles.addBtnHeader} onPress={openAdd}>
              <Plus size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabItem, tab === 'templates' && styles.tabActive]}
          onPress={() => setTab('templates')}
        >
          <MessageSquare size={16} color={tab === 'templates' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, tab === 'templates' && styles.tabTextActive]}>Template</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, tab === 'history' && styles.tabActive]}
          onPress={() => setTab('history')}
        >
          <Clock size={16} color={tab === 'history' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>Riwayat</Text>
        </TouchableOpacity>
      </View>

      {tab === 'templates' && (
        <>
          <View style={styles.searchBox}>
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari template..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <FlatList
            data={filteredTemplates}
            keyExtractor={item => item.id}
            renderItem={renderTemplate}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MessageSquare size={48} color={colors.border} />
                <Text style={styles.emptyText}>Belum ada template</Text>
                <Text style={styles.emptySubText}>Buat template pesan pertamamu</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={openAdd}>
                  <Plus size={18} color={colors.white} />
                  <Text style={styles.emptyBtnText}>Buat Template</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}

      {tab === 'history' && (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={renderHistory}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Clock size={48} color={colors.border} />
              <Text style={styles.emptyText}>Belum ada riwayat broadcast</Text>
              <Text style={styles.emptySubText}>Kirim broadcast pertamamu ke pelanggan</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingTemplate ? 'Edit Template' : 'Buat Template Baru'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nama Template *</Text>
              <TextInput
                style={styles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="Contoh: Promo Akhir Pekan"
                placeholderTextColor={colors.textTertiary}
              />

              <Text style={styles.label}>Kategori</Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: formCategory === cat.key ? cat.bg : colors.surfaceSecondary, borderColor: formCategory === cat.key ? cat.color : 'transparent' },
                    ]}
                    onPress={() => setFormCategory(cat.key)}
                  >
                    <Text style={[styles.categoryChipText, { color: formCategory === cat.key ? cat.color : colors.textSecondary }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Isi Pesan *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formMessage}
                onChangeText={setFormMessage}
                placeholder="Tulis pesan broadcast..."
                placeholderTextColor={colors.textTertiary}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.hintBox}>
                <Info size={14} color={colors.info} />
                <Text style={styles.hintText}>Gunakan {'{nama}'} untuk nama pelanggan otomatis</Text>
              </View>
              <Text style={styles.charCount}>{formMessage.length} karakter</Text>
            </ScrollView>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>{editingTemplate ? 'Simpan Perubahan' : 'Buat Template'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={!!previewTemplate} animationType="fade" transparent>
        <View style={styles.previewOverlay}>
          <View style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Preview Pesan</Text>
              <TouchableOpacity onPress={() => setPreviewTemplate(null)}><X size={22} color={colors.text} /></TouchableOpacity>
            </View>
            {previewTemplate && (
              <>
                <View style={styles.previewCatRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryStyle(previewTemplate.category).bg }]}>
                    <Text style={[styles.categoryText, { color: getCategoryStyle(previewTemplate.category).color }]}>
                      {getCategoryStyle(previewTemplate.category).label}
                    </Text>
                  </View>
                  <Text style={styles.previewName}>{previewTemplate.name}</Text>
                </View>
                <View style={styles.phoneMockup}>
                  <View style={styles.chatBubble}>
                    <Text style={styles.chatBubbleText}>
                      {previewTemplate.message.replace('{nama}', 'Budi Santoso')}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.previewSendBtn}
                  onPress={() => {
                    setPreviewTemplate(null);
                    handleSendBroadcast(previewTemplate);
                  }}
                  activeOpacity={0.8}
                >
                  <Mail size={18} color={colors.white} />
                  <Text style={styles.previewSendText}>Kirim Broadcast</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  addBtnHeader: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: colors.white },
  tabRow: { flexDirection: 'row', backgroundColor: colors.white, paddingHorizontal: 16, paddingTop: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '500' as const, color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontWeight: '600' as const },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, margin: 16, marginBottom: 8, borderRadius: 12, paddingHorizontal: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.text },
  list: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },
  templateCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 11, fontWeight: '600' as const },
  templateActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
  templateName: { fontSize: 16, fontWeight: '600' as const, color: colors.text, marginBottom: 6 },
  templateMsg: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 12 },
  templateFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 11, color: colors.textTertiary },
  sendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  sendBtnText: { fontSize: 12, fontWeight: '600' as const, color: colors.white },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  historyLeft: { marginRight: 12 },
  historyIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  historyContent: { flex: 1, gap: 2 },
  historyName: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
  historyMeta: { fontSize: 12, color: colors.textSecondary },
  historyDate: { fontSize: 11, color: colors.textTertiary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' as const },
  empty: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  emptySubText: { fontSize: 13, color: colors.textSecondary },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { fontSize: 14, fontWeight: '600' as const, color: colors.white },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 17, fontWeight: '700' as const, color: colors.text },
  modalBody: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  textArea: { minHeight: 120, textAlignVertical: 'top' as const },
  categoryRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  categoryChipText: { fontSize: 13, fontWeight: '600' as const },
  hintBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: colors.infoBg, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  hintText: { fontSize: 12, color: colors.info, flex: 1 },
  charCount: { fontSize: 11, color: colors.textTertiary, textAlign: 'right' as const, marginTop: 4 },
  saveBtn: { backgroundColor: colors.primary, marginHorizontal: 20, marginVertical: 16, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700' as const, color: colors.white },
  previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  previewContent: { backgroundColor: colors.white, borderRadius: 24, width: '100%', maxHeight: '80%', overflow: 'hidden' },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  previewTitle: { fontSize: 17, fontWeight: '700' as const, color: colors.text },
  previewCatRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 16 },
  previewName: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  phoneMockup: { margin: 20, backgroundColor: '#F0F4F8', borderRadius: 18, padding: 16, minHeight: 120 },
  chatBubble: { backgroundColor: '#DCF8C6', borderRadius: 14, borderTopLeftRadius: 4, padding: 14, maxWidth: '90%' },
  chatBubbleText: { fontSize: 14, color: '#1A1A1A', lineHeight: 20 },
  previewSendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, marginHorizontal: 20, marginBottom: 20, borderRadius: 14, paddingVertical: 15 },
  previewSendText: { fontSize: 15, fontWeight: '700' as const, color: colors.white },
});
