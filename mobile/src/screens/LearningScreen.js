/**
 * LearningScreen
 *
 * Layout (top → bottom):
 *   1. Header
 *   2. Child selector tabs
 *   3. Today's scheduled lesson (if any) — prominent card
 *   4. Domain filter chips
 *   5. Lesson catalogue (cards, tap to open detail modal)
 *
 * Detail modal (full-screen sheet):
 *   - Lesson title, domain badge, duration
 *   - Description in selected language
 *   - Step-by-step instructions
 *   - Materials needed
 *   - Schedule button → picks date + time → saves to Firestore
 *   - Send to Device button
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLang } from '../i18n/LanguageContext';
import { listChildren } from '../services/childService';
import { getAgeInMonths } from '../utils/childAge';
import {
  deleteSchedule,
  getTodaySchedules,
  getLearningErrorMessage,
  markDone,
  scheduleLesson,
  sendToDevice,
} from '../services/learningService';
import { DOMAIN_CONFIG, DOMAINS, getLessonsForChild } from '../data/lessonsData';
import { colors, radius, spacing, typography } from '../theme/colors';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

// ─── Utility ─────────────────────────────────────────────
function ageLabel(months) {
  if (months < 12) return `${months}mo`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y}y ${m}mo` : `${y}y`;
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ─── Domain chip ──────────────────────────────────────────
function DomainChip({ label, active, onPress }) {
  const cfg = DOMAIN_CONFIG[label];
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: cfg?.light ?? colors.primaryLight, borderColor: cfg?.color ?? colors.primary },
      ]}
    >
      {cfg && <Text style={styles.chipIcon}>{cfg.icon}</Text>}
      <Text style={[styles.chipLabel, active && { color: cfg?.color ?? colors.primaryDark }]}>{label}</Text>
    </Pressable>
  );
}

// ─── Today's lesson card ──────────────────────────────────
function TodayCard({ schedule, lang, onSend, onDone, onDelete }) {
  const cfg = DOMAIN_CONFIG[schedule.domain] ?? {};
  const statusColor =
    schedule.status === 'done'    ? colors.success :
    schedule.status === 'playing' ? colors.primary  : colors.warning;

  return (
    <Card style={[styles.todayCard, { borderLeftColor: cfg.color ?? colors.primary }]}>
      <View style={styles.todayHeader}>
        <Text style={styles.todayIcon}>{schedule.lessonIcon}</Text>
        <View style={styles.todayInfo}>
          <Text style={styles.todayLabel}>Today's lesson · {schedule.scheduledTime}</Text>
          <Text style={styles.todayTitle}>{schedule.lessonTitle}</Text>
          <Text style={styles.todayMeta}>{schedule.durationMin} min · {schedule.domain}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>
      <View style={styles.todayActions}>
        {schedule.status !== 'done' && !schedule.sentToDevice && (
          <Pressable onPress={() => onSend(schedule)} style={[styles.todayBtn, { backgroundColor: cfg.light ?? colors.primaryLight }]}>
            <Text style={[styles.todayBtnText, { color: cfg.color ?? colors.primaryDark }]}>📡 Send to device</Text>
          </Pressable>
        )}
        {schedule.sentToDevice && schedule.status !== 'done' && (
          <Pressable onPress={() => onDone(schedule)} style={[styles.todayBtn, { backgroundColor: colors.successLight }]}>
            <Text style={[styles.todayBtnText, { color: colors.success }]}>✓ Mark done</Text>
          </Pressable>
        )}
        <Pressable onPress={() => onDelete(schedule)} style={styles.todayBtnGhost}>
          <Text style={styles.todayBtnGhostText}>Remove</Text>
        </Pressable>
      </View>
    </Card>
  );
}

// ─── Lesson catalogue card ────────────────────────────────
function LessonCatalogCard({ lesson, lang, onPress }) {
  const cfg = DOMAIN_CONFIG[lesson.domain] ?? {};
  const title = lesson.title[lang] ?? lesson.title.en;
  return (
    <Pressable onPress={() => onPress(lesson)} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>
      <Card style={styles.catalogCard}>
        <View style={[styles.catalogIconWrap, { backgroundColor: cfg.light ?? colors.surfaceAlt }]}>
          <Text style={styles.catalogIcon}>{lesson.icon}</Text>
        </View>
        <View style={styles.catalogBody}>
          <Text style={styles.catalogTitle}>{title}</Text>
          <View style={styles.catalogMeta}>
            <Text style={styles.catalogDomain} numberOfLines={1}>{lesson.domain}</Text>
            <Text style={styles.catalogDot}>·</Text>
            <Text style={styles.catalogDuration}>{lesson.durationMin} min</Text>
          </View>
        </View>
        <View style={[styles.catalogAccent, { backgroundColor: cfg.color ?? colors.primary }]} />
      </Card>
    </Pressable>
  );
}

// ─── Lesson detail modal ──────────────────────────────────
function LessonModal({ lesson, lang, childId, childName, parentUid, visible, onClose, onScheduled }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab]           = useState('about'); // 'about' | 'steps' | 'schedule'
  const [schedDate, setDate]    = useState(todayStr());
  const [schedTime, setTime]    = useState(nowTimeStr());
  const [saving, setSaving]     = useState(false);
  const slideAnim               = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 600,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [visible]);

  if (!lesson) return null;

  const cfg   = DOMAIN_CONFIG[lesson.domain] ?? {};
  const title = lesson.title[lang] ?? lesson.title.en;
  const desc  = lesson.desc[lang]  ?? lesson.desc.en;
  const steps = lesson.steps[lang] ?? lesson.steps.en;
  const mats  = lesson.materials[lang] ?? lesson.materials.en;

  async function handleSchedule() {
    setSaving(true);
    try {
      await scheduleLesson({
        childId,
        parentUid,
        lessonId:    lesson.id,
        lessonTitle: title,
        lessonIcon:  lesson.icon,
        domain:      lesson.domain,
        scheduledDate: schedDate,
        scheduledTime: schedTime,
        durationMin:   lesson.durationMin,
        lang,
      });
      onScheduled();
      onClose();
      Alert.alert('✅ Scheduled!', `"${title}" is set for ${schedDate} at ${schedTime}.`);
    } catch (err) {
      Alert.alert('Error', getLearningErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <Animated.View
          style={[styles.modalSheet, { paddingBottom: insets.bottom + 16, transform: [{ translateY: slideAnim }] }]}
        >
          {/* Handle */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: cfg.light ?? colors.primaryLight }]}>
            <Text style={styles.modalHeaderIcon}>{lesson.icon}</Text>
            <View style={styles.modalHeaderInfo}>
              <Text style={styles.modalTitle}>{title}</Text>
              <View style={styles.modalMeta}>
                <View style={[styles.modalDomainDot, { backgroundColor: cfg.color ?? colors.primary }]} />
                <Text style={styles.modalMetaText}>{lesson.domain}  ·  {lesson.durationMin} min</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>

          {/* Tab bar */}
          <View style={styles.modalTabs}>
            {['about', 'steps', 'schedule'].map((t) => (
              <Pressable key={t} onPress={() => setTab(t)}
                style={[styles.modalTab, tab === t && styles.modalTabActive]}>
                <Text style={[styles.modalTabText, tab === t && { color: cfg.color ?? colors.primary }]}>
                  {t === 'about' ? '📄 About' : t === 'steps' ? '👣 Steps' : '📅 Schedule'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab content */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyInner}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {tab === 'about' && (
              <>
                <Text style={styles.modalSectionLabel}>Description</Text>
                <Text style={styles.modalDesc}>{desc}</Text>

                {mats.length > 0 && (
                  <>
                    <Text style={[styles.modalSectionLabel, { marginTop: spacing.md }]}>Materials needed</Text>
                    {mats.map((m, i) => (
                      <View key={i} style={styles.materialRow}>
                        <Text style={styles.materialDot}>•</Text>
                        <Text style={styles.materialText}>{m}</Text>
                      </View>
                    ))}
                  </>
                )}
                {mats.length === 0 && (
                  <View style={styles.noMaterials}>
                    <Text style={styles.noMaterialsText}>✅  No materials needed — just you and your child!</Text>
                  </View>
                )}
              </>
            )}

            {tab === 'steps' && (
              <>
                <Text style={styles.modalSectionLabel}>Step-by-step</Text>
                {steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={[styles.stepNum, { backgroundColor: cfg.color ?? colors.primary }]}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </>
            )}

            {tab === 'schedule' && (
              <>
                <Text style={styles.modalSectionLabel}>Choose date & time</Text>

                <View style={styles.scheduleField}>
                  <Text style={styles.scheduleLabel}>📅  Date</Text>
                  <TextInput
                    style={styles.scheduleInput}
                    value={schedDate}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={styles.scheduleField}>
                  <Text style={styles.scheduleLabel}>⏰  Time</Text>
                  <TextInput
                    style={styles.scheduleInput}
                    value={schedTime}
                    onChangeText={setTime}
                    placeholder="HH:MM"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={styles.scheduleFor}>
                  <Text style={styles.scheduleForText}>
                    Scheduling for: <Text style={{ color: cfg.color ?? colors.primary, fontWeight: '700' }}>{childName}</Text>
                  </Text>
                </View>

                <View style={styles.deviceNotice}>
                  <Text style={styles.deviceNoticeIcon}>📡</Text>
                  <Text style={styles.deviceNoticeText}>
                    After scheduling, tap "Send to device" on the today card to push this lesson to the wearable. The device will play it at the scheduled time.
                  </Text>
                </View>

                <Button
                  label="Schedule this lesson"
                  onPress={handleSchedule}
                  loading={saving}
                  style={{ marginTop: spacing.lg }}
                />
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────
export default function LearningScreen({ user }) {
  const { lang } = useLang();
  const insets   = useSafeAreaInsets();

  const [children, setChildren]       = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [domain, setDomain]           = useState('All');
  const [todayLessons, setTodayLessons] = useState([]);
  const [openLesson, setOpenLesson]   = useState(null);

  const child   = children[selectedIdx] ?? null;
  const ageM    = child ? (getAgeInMonths(child.dateOfBirth) ?? 0) : 0;
  const lessons = child ? getLessonsForChild(ageM, domain) : [];

  async function loadData() {
    setLoading(true);
    try {
      const kids = await listChildren(user.uid);
      setChildren(kids);
      if (kids.length > 0) {
        const today = await getTodaySchedules(kids[selectedIdx]?.id ?? kids[0].id).catch(() => []);
        setTodayLessons(today);
      }
    } catch {}
    finally { setLoading(false); }
  }

  async function reloadToday(childId) {
    const today = await getTodaySchedules(childId).catch(() => []);
    setTodayLessons(today);
  }

  useEffect(() => { loadData(); }, [user.uid]);

  async function handleSendToDevice(schedule) {
    try {
      await sendToDevice(schedule.id);
      await reloadToday(child.id);
      Alert.alert('📡 Sent!', 'The lesson has been pushed to the wearable device.');
    } catch (err) {
      Alert.alert('Error', getLearningErrorMessage(err));
    }
  }

  async function handleMarkDone(schedule) {
    await markDone(schedule.id).catch(() => {});
    await reloadToday(child.id);
  }

  async function handleDelete(schedule) {
    Alert.alert('Remove lesson', 'Remove this lesson from today\'s schedule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await deleteSchedule(schedule.id).catch(() => {});
          await reloadToday(child.id);
        },
      },
    ]);
  }

  async function handleChildChange(idx) {
    setSelectedIdx(idx);
    setDomain('All');
    if (children[idx]) {
      const today = await getTodaySchedules(children[idx].id).catch(() => []);
      setTodayLessons(today);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Learning</Text>
          <Text style={styles.screenSub}>Schedule & play lessons for your child</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 50 }} />
        ) : children.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎓</Text>
            <Text style={styles.emptyTitle}>No children added</Text>
            <Text style={styles.emptyText}>Go to Profile → Add child to see lessons.</Text>
          </View>
        ) : (
          <>
            {/* ── Child selector ── */}
            {children.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={styles.childTabScroll} contentContainerStyle={styles.childTabRow}>
                {children.map((c, i) => (
                  <Pressable key={c.id} onPress={() => handleChildChange(i)}
                    style={[styles.childTab, i === selectedIdx && styles.childTabActive]}>
                    <Text style={styles.childTabInitial}>{c.name[0].toUpperCase()}</Text>
                    <Text style={[styles.childTabName, i === selectedIdx && styles.childTabNameActive]}>
                      {c.name.split(' ')[0]}
                    </Text>
                    <Text style={styles.childTabAge}>{ageLabel(getAgeInMonths(c.dateOfBirth) ?? 0)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* Single child label */}
            {children.length === 1 && child && (
              <View style={styles.singleChild}>
                <View style={styles.singleChildAvatar}>
                  <Text style={styles.singleChildInitial}>{child.name[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.singleChildName}>{child.name}</Text>
                  <Text style={styles.singleChildAge}>{ageLabel(ageM)} · {lessons.length} lessons available</Text>
                </View>
              </View>
            )}

            {/* ── Today's scheduled lessons ── */}
            {todayLessons.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📅 Today's lessons</Text>
                {todayLessons.map((s) => (
                  <TodayCard
                    key={s.id}
                    schedule={s}
                    lang={lang}
                    onSend={handleSendToDevice}
                    onDone={handleMarkDone}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            )}

            {/* ── Domain filter chips ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
              {DOMAINS.map((d) => (
                <DomainChip key={d} label={d} active={domain === d} onPress={() => setDomain(d)} />
              ))}
            </ScrollView>

            {/* ── Lesson catalogue ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {domain === 'All' ? `All lessons` : `${domain} lessons`}
                <Text style={styles.sectionCount}>  {lessons.length}</Text>
              </Text>

              {lessons.length === 0 ? (
                <View style={styles.noLessons}>
                  <Text style={styles.noLessonsEmoji}>🔍</Text>
                  <Text style={styles.noLessonsText}>No {domain !== 'All' ? domain + ' ' : ''}lessons for {child?.name}'s age group.</Text>
                </View>
              ) : (
                lessons.map((l) => (
                  <LessonCatalogCard
                    key={l.id}
                    lesson={l}
                    lang={lang}
                    onPress={setOpenLesson}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Lesson detail modal ── */}
      <LessonModal
        lesson={openLesson}
        lang={lang}
        childId={child?.id ?? ''}
        childName={child?.name ?? ''}
        parentUid={user.uid}
        visible={openLesson !== null}
        onClose={() => setOpenLesson(null)}
        onScheduled={() => child && reloadToday(child.id)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },

  header:     { marginBottom: spacing.md },
  screenTitle:{ ...typography.h1, color: colors.text },
  screenSub:  { ...typography.body, color: colors.muted, marginTop: 4 },

  empty:      { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: 6 },
  emptyText:  { ...typography.body, color: colors.muted, textAlign: 'center' },

  // Child tabs
  childTabScroll: { marginBottom: spacing.lg, marginHorizontal: -spacing.lg },
  childTabRow:    { paddingHorizontal: spacing.lg, gap: 10, flexDirection: 'row' },
  childTab:       { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, minWidth: 70 },
  childTabActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  childTabInitial:{ fontSize: 20, fontWeight: '800', color: colors.text },
  childTabName:   { ...typography.caption, color: colors.muted, fontWeight: '700', marginTop: 2 },
  childTabNameActive: { color: colors.primaryDark },
  childTabAge:    { ...typography.caption, color: colors.mutedLight, marginTop: 1 },

  singleChild:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.lg },
  singleChildAvatar: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  singleChildInitial:{ fontSize: 20, fontWeight: '800', color: colors.primaryDark },
  singleChildName:   { ...typography.h4, color: colors.text },
  singleChildAge:    { ...typography.bodySmall, color: colors.muted },

  // Today card
  todayCard:    { borderLeftWidth: 4, marginBottom: spacing.sm },
  todayHeader:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  todayIcon:    { fontSize: 32, marginTop: 2 },
  todayInfo:    { flex: 1 },
  todayLabel:   { ...typography.caption, color: colors.muted, textTransform: 'uppercase', marginBottom: 3 },
  todayTitle:   { ...typography.h3, color: colors.text },
  todayMeta:    { ...typography.bodySmall, color: colors.muted, marginTop: 3 },
  statusDot:    { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  todayActions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  todayBtn:     { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.full },
  todayBtnText: { ...typography.bodySmall, fontWeight: '700' },
  todayBtnGhost:{ paddingVertical: 8, paddingHorizontal: 14 },
  todayBtnGhostText: { ...typography.bodySmall, color: colors.muted, fontWeight: '600' },

  // Domain chips
  chipScroll: { marginBottom: spacing.lg, marginHorizontal: -spacing.lg },
  chipRow:    { paddingHorizontal: spacing.lg, gap: 8, flexDirection: 'row' },
  chip:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 14, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  chipIcon:   { fontSize: 14 },
  chipLabel:  { ...typography.bodySmall, color: colors.muted, fontWeight: '700' },

  // Catalogue cards
  section:      { marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: 12 },
  sectionCount: { ...typography.h3, color: colors.muted, fontWeight: '400' },

  catalogCard:    { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12, paddingRight: 0, overflow: 'hidden' },
  catalogIconWrap:{ width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  catalogIcon:    { fontSize: 24 },
  catalogBody:    { flex: 1 },
  catalogTitle:   { ...typography.h4, color: colors.text },
  catalogMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  catalogDomain:  { ...typography.caption, color: colors.muted, fontWeight: '600' },
  catalogDot:     { ...typography.caption, color: colors.mutedLight },
  catalogDuration:{ ...typography.caption, color: colors.muted },
  catalogAccent:  { width: 4, alignSelf: 'stretch', borderRadius: 2 },

  noLessons:     { alignItems: 'center', paddingVertical: spacing.xl, backgroundColor: colors.surfaceAlt, borderRadius: radius.lg },
  noLessonsEmoji:{ fontSize: 36, marginBottom: 10 },
  noLessonsText: { ...typography.body, color: colors.muted, textAlign: 'center' },

  // Modal
  modalOverlay:  { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet:    { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', overflow: 'hidden' },
  modalHandle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 10, marginBottom: 4 },

  modalHeader:     { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.lg, gap: 14 },
  modalHeaderIcon: { fontSize: 36, marginTop: 2 },
  modalHeaderInfo: { flex: 1 },
  modalTitle:      { ...typography.h2, color: colors.text },
  modalMeta:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  modalDomainDot:  { width: 8, height: 8, borderRadius: 4 },
  modalMetaText:   { ...typography.bodySmall, color: colors.muted },
  modalClose:      { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.surfaceAlt },
  modalCloseText:  { color: colors.muted, fontSize: 14, fontWeight: '700' },

  modalTabs:      { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTab:       { flex: 1, paddingVertical: 12, alignItems: 'center' },
  modalTabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  modalTabText:   { ...typography.bodySmall, color: colors.muted, fontWeight: '700' },

  modalBody:      { flexShrink: 1 },
  modalBodyInner: { padding: spacing.lg, paddingBottom: spacing.xxl },
  modalSectionLabel: { ...typography.label, color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  modalDesc:      { ...typography.body, color: colors.text, lineHeight: 24 },

  materialRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  materialDot:    { color: colors.primary, fontSize: 16, lineHeight: 22 },
  materialText:   { ...typography.body, color: colors.text, flex: 1 },
  noMaterials:    { backgroundColor: colors.successLight, borderRadius: radius.md, padding: spacing.sm },
  noMaterialsText:{ ...typography.bodySmall, color: colors.success, fontWeight: '600' },

  stepRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  stepNum:    { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText:{ color: '#fff', fontSize: 12, fontWeight: '800' },
  stepText:   { ...typography.body, color: colors.text, flex: 1, lineHeight: 23 },

  scheduleField:   { marginBottom: spacing.md },
  scheduleLabel:   { ...typography.label, color: colors.muted, textTransform: 'uppercase', marginBottom: 6 },
  scheduleInput:   { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text, backgroundColor: colors.surface },
  scheduleFor:     { backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  scheduleForText: { ...typography.bodySmall, color: colors.textSecondary },
  deviceNotice:    { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.infoLight, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  deviceNoticeIcon:{ fontSize: 16 },
  deviceNoticeText:{ ...typography.bodySmall, color: colors.info, flex: 1, lineHeight: 19 },
});
