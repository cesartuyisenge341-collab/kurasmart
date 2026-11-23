import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CARE_LOG_TYPES,
  DIAPER_VALUES,
  FEEDING_VALUES,
  MOOD_VALUES,
  addCareLog,
  getCareLogErrorMessage,
  listCareLogs,
} from '../services/careLogService';
import { listChildren } from '../services/childService';
import { useLang } from '../i18n/LanguageContext';
import { colors, radius, spacing, typography } from '../theme/colors';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';

// ─── helpers ────────────────────────────────────────────
function isToday(ts) {
  if (!ts) return false;
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

function formatTime(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

const TYPE_ICONS = {
  feeding: '🍼',
  sleep_start: '😴',
  sleep_end: '☀️',
  diaper: '👶',
  mood: '💛',
  note: '📝',
};

const TYPE_COLORS = {
  feeding: '#E8F5FD',
  sleep_start: '#EDE9FF',
  sleep_end: '#FEF3E8',
  diaper: '#E6F9EE',
  mood: '#FEF7E0',
  note: '#F7FAFC',
};

// ─── Chip Selector ──────────────────────────────────────
function ChipSelector({ options, selected, onSelect }) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onSelect(opt.value)}
          style={[styles.chip, selected === opt.value && styles.chipActive]}
        >
          {opt.icon ? <Text style={styles.chipIcon}>{opt.icon}</Text> : null}
          <Text style={[styles.chipLabel, selected === opt.value && styles.chipLabelActive]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Log Form ───────────────────────────────────────────
function LogForm({ children, userId, onSaved, onCancel, t }) {
  const [childId, setChildId] = useState(children[0]?.id ?? '');
  const [type, setType] = useState('feeding');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const typeOptions = CARE_LOG_TYPES.map((tp) => ({
    value: tp,
    label: t(`type_${tp}`),
    icon: TYPE_ICONS[tp],
  }));

  function getValueOptions() {
    if (type === 'feeding') return FEEDING_VALUES.map((v) => ({ value: v, label: t(`feed_${v}`) }));
    if (type === 'diaper')  return DIAPER_VALUES.map((v) => ({ value: v, label: t(`diaper_${v}`) }));
    if (type === 'mood')    return MOOD_VALUES.map((v) => ({ value: v, label: t(`mood_${v}`) }));
    return [];
  }

  const valueOptions = getValueOptions();
  const needsValuePicker = ['feeding', 'diaper', 'mood'].includes(type);

  async function handleSave() {
    setError('');
    if (!childId) { setError('Select a child.'); return; }
    setSaving(true);
    try {
      await addCareLog({ childId, userId, type, value, note });
      onSaved();
    } catch (err) {
      setError(getCareLogErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card style={styles.form}>
      <Text style={styles.formTitle}>{t('logActivity')}</Text>

      {/* Child selector */}
      {children.length > 1 && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('selectChild')}</Text>
          <ChipSelector
            options={children.map((c) => ({ value: c.id, label: c.name }))}
            selected={childId}
            onSelect={setChildId}
          />
        </View>
      )}

      {/* Type */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>{t('logType')}</Text>
        <ChipSelector options={typeOptions} selected={type} onSelect={(v) => { setType(v); setValue(''); }} />
      </View>

      {/* Value picker */}
      {needsValuePicker && valueOptions.length > 0 && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{t('logValue')}</Text>
          <ChipSelector options={valueOptions} selected={value} onSelect={setValue} />
        </View>
      )}

      {/* Note */}
      <Input
        label={t('logNote')}
        value={note}
        onChangeText={setNote}
        placeholder={t('logNotePlaceholder')}
        multiline
        numberOfLines={2}
        inputStyle={styles.noteInput}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.formActions}>
        <Button label={t('cancel')} variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
        <Button label={t('saveLog')} onPress={handleSave} loading={saving} style={{ flex: 2 }} />
      </View>
    </Card>
  );
}

// ─── Log Entry Row ───────────────────────────────────────
function LogRow({ log, t }) {
  const icon = TYPE_ICONS[log.type] ?? '📋';
  const bgColor = TYPE_COLORS[log.type] ?? colors.surfaceAlt;
  const typeLabel = t(`type_${log.type}`);

  let detail = log.value
    ? (log.type === 'feeding'  ? t(`feed_${log.value}`)
     : log.type === 'diaper'   ? t(`diaper_${log.value}`)
     : log.type === 'mood'     ? t(`mood_${log.value}`)
     : log.value)
    : '';

  return (
    <View style={[styles.logRow, { backgroundColor: bgColor }]}>
      <Text style={styles.logIcon}>{icon}</Text>
      <View style={styles.logContent}>
        <Text style={styles.logType}>{typeLabel}</Text>
        {detail ? <Text style={styles.logDetail}>{detail}</Text> : null}
        {log.note ? <Text style={styles.logNote}>{log.note}</Text> : null}
      </View>
      <Text style={styles.logTime}>{formatTime(log.loggedAt)}</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────
export default function CareLogScreen({ user }) {
  const { t } = useLang();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  async function loadChildren() {
    setLoadingChildren(true);
    try {
      const list = await listChildren(user.uid);
      setChildren(list);
      if (list.length > 0 && !selectedChild) setSelectedChild(list[0]);
    } catch {}
    finally { setLoadingChildren(false); }
  }

  async function loadLogs(childId, isRefresh = false) {
    if (!childId) return;
    if (isRefresh) setRefreshing(true); else setLoadingLogs(true);
    setError('');
    try {
      const list = await listCareLogs(childId, 60);
      setLogs(list);
    } catch (err) {
      setError(getCareLogErrorMessage(err));
    } finally {
      setLoadingLogs(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadChildren(); }, [user.uid]);
  useEffect(() => { if (selectedChild) loadLogs(selectedChild.id); }, [selectedChild]);

  function handleSaved() {
    setShowForm(false);
    if (selectedChild) loadLogs(selectedChild.id, true);
  }

  const todayLogs    = logs.filter((l) => isToday(l.loggedAt));
  const earlierLogs  = logs.filter((l) => !isToday(l.loggedAt));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => selectedChild && loadLogs(selectedChild.id, true)}
              tintColor={colors.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.screenTitle}>{t('careLogTitle')}</Text>
              <Text style={styles.screenSubtitle}>{t('careLogSubtitle')}</Text>
            </View>
          </View>

          {loadingChildren ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : children.length === 0 ? (
            <EmptyState
              emoji="👶"
              title={t('noChildrenTitle')}
              description={t('noChildrenDesc')}
            />
          ) : (
            <>
              {/* Child tabs */}
              {children.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childTabs}>
                  {children.map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => { setSelectedChild(c); setShowForm(false); }}
                      style={[styles.childTab, selectedChild?.id === c.id && styles.childTabActive]}
                    >
                      <Text style={[styles.childTabText, selectedChild?.id === c.id && styles.childTabTextActive]}>
                        {c.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              {/* Log form or add button */}
              {showForm ? (
                <LogForm
                  children={children}
                  userId={user.uid}
                  onSaved={handleSaved}
                  onCancel={() => setShowForm(false)}
                  t={t}
                />
              ) : (
                <Button
                  label={`+ ${t('logActivity')}`}
                  onPress={() => setShowForm(true)}
                  style={styles.addBtn}
                />
              )}

              {/* Error */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Logs */}
              {loadingLogs ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
              ) : logs.length === 0 && !error ? (
                <EmptyState
                  emoji="🍼"
                  title={t('noLogsYet')}
                  description={t('noLogsDesc')}
                />
              ) : (
                <>
                  {todayLogs.length > 0 && (
                    <View style={styles.logSection}>
                      <Text style={styles.logSectionTitle}>{t('todayLogs')}</Text>
                      {todayLogs.map((l) => <LogRow key={l.id} log={l} t={t} />)}
                    </View>
                  )}
                  {earlierLogs.length > 0 && (
                    <View style={styles.logSection}>
                      <Text style={styles.logSectionTitle}>{t('earlierLogs')}</Text>
                      {earlierLogs.map((l) => (
                        <View key={l.id}>
                          <Text style={styles.logDateLabel}>{formatDate(l.loggedAt)}</Text>
                          <LogRow log={l} t={t} />
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },

  header: { marginBottom: spacing.lg },
  screenTitle: { ...typography.h1, color: colors.text },
  screenSubtitle: { ...typography.body, color: colors.muted, marginTop: 4 },

  childTabs: { marginBottom: spacing.md },
  childTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
  },
  childTabActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  childTabText: { ...typography.bodySmall, color: colors.muted, fontWeight: '600' },
  childTabTextActive: { color: colors.primaryDark },

  addBtn: { marginBottom: spacing.lg },

  form: { marginBottom: spacing.lg },
  formTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  fieldGroup: { marginBottom: spacing.md },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipIcon: { fontSize: 15 },
  chipLabel: { ...typography.bodySmall, color: colors.muted, fontWeight: '600' },
  chipLabelActive: { color: colors.primaryDark },

  noteInput: { minHeight: 60, textAlignVertical: 'top', paddingTop: 10 },
  formActions: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  errorText: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.sm },

  logSection: { marginBottom: spacing.lg },
  logSectionTitle: { ...typography.h4, color: colors.text, marginBottom: 10 },
  logDateLabel: { ...typography.caption, color: colors.muted, marginBottom: 4, marginTop: 8 },

  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: 8,
    gap: 12,
  },
  logIcon: { fontSize: 24, marginTop: 2 },
  logContent: { flex: 1 },
  logType: { ...typography.h4, color: colors.text },
  logDetail: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  logNote: { ...typography.bodySmall, color: colors.muted, fontStyle: 'italic', marginTop: 2 },
  logTime: { ...typography.caption, color: colors.muted, marginTop: 3 },
});
