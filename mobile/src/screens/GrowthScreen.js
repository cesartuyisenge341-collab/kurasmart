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
import { listChildren } from '../services/childService';
import { addGrowthRecord, getGrowthErrorMessage, listGrowthRecords } from '../services/growthService';
import { formatChildAge } from '../utils/childAge';
import { useLang } from '../i18n/LanguageContext';
import { colors, radius, spacing, typography } from '../theme/colors';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

const MILESTONE_KEYS = [
  { ageKey: 'months2',  milestoneKey: 'milestone2' },
  { ageKey: 'months4',  milestoneKey: 'milestone4' },
  { ageKey: 'months6',  milestoneKey: 'milestone6' },
  { ageKey: 'months9',  milestoneKey: 'milestone9' },
  { ageKey: 'months12', milestoneKey: 'milestone12' },
  { ageKey: 'months18', milestoneKey: 'milestone18' },
  { ageKey: 'months24', milestoneKey: 'milestone24' },
  { ageKey: 'months36', milestoneKey: 'milestone36' },
];

function MilestoneRow({ ageLabel, milestone }) {
  return (
    <View style={styles.milestoneRow}>
      <View style={styles.milestoneDot} />
      <View style={styles.milestoneContent}>
        <Text style={styles.milestoneAge}>{ageLabel}</Text>
        <Text style={styles.milestoneText}>{milestone}</Text>
      </View>
    </View>
  );
}

// ─── Growth Record Form ───────────────────────────────────
function GrowthForm({ childId, userId, onSaved, onCancel, t }) {
  const [measuredOn, setMeasuredOn] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleSave() {
    const e = {};
    if (!measuredOn) e.measuredOn = t('dobRequired').replace('YYYY-MM-DD', '');
    if (!weight && !height && !head) e.weight = t('atLeastOne');
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      await addGrowthRecord({ childId, userId, measuredOn, weight, height, headCircumference: head, note });
      onSaved();
    } catch (err) {
      setErrors({ general: getGrowthErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card style={styles.form}>
      <Text style={styles.formTitle}>{t('addGrowthRecord')}</Text>
      <Input
        label={t('measuredOn')}
        value={measuredOn}
        onChangeText={setMeasuredOn}
        placeholder="YYYY-MM-DD"
        keyboardType="numeric"
        maxLength={10}
        error={errors.measuredOn}
      />
      <View style={styles.measureRow}>
        <Input
          label={t('weightKg')}
          value={weight}
          onChangeText={setWeight}
          placeholder={t('weightPlaceholder')}
          keyboardType="decimal-pad"
          style={{ flex: 1 }}
          error={errors.weight}
        />
        <View style={styles.measureGap} />
        <Input
          label={t('heightCm')}
          value={height}
          onChangeText={setHeight}
          placeholder={t('heightPlaceholder')}
          keyboardType="decimal-pad"
          style={{ flex: 1 }}
        />
      </View>
      <Input
        label={t('headCm')}
        value={head}
        onChangeText={setHead}
        placeholder={t('headPlaceholder')}
        keyboardType="decimal-pad"
      />
      <Input
        label={t('recordNote')}
        value={note}
        onChangeText={setNote}
        placeholder={t('logNotePlaceholder')}
        multiline
        numberOfLines={2}
        inputStyle={{ minHeight: 56, textAlignVertical: 'top', paddingTop: 10 }}
      />
      {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}
      <View style={styles.formActions}>
        <Button label={t('cancel')} variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
        <Button label={t('saveRecord')} onPress={handleSave} loading={saving} style={{ flex: 2 }} />
      </View>
    </Card>
  );
}

// ─── Growth Record Row ────────────────────────────────────
function RecordRow({ record, t }) {
  return (
    <View style={styles.recordRow}>
      <View style={styles.recordDateWrap}>
        <Text style={styles.recordDate}>{record.measuredOn}</Text>
      </View>
      <View style={styles.recordMetrics}>
        {record.weight != null && (
          <Badge label={`⚖️ ${record.weight} ${t('kg')}`} variant="info" style={styles.metricBadge} />
        )}
        {record.height != null && (
          <Badge label={`📏 ${record.height} ${t('cm')}`} variant="success" style={styles.metricBadge} />
        )}
        {record.headCircumference != null && (
          <Badge label={`👶 ${record.headCircumference} ${t('cm')}`} variant="primary" style={styles.metricBadge} />
        )}
      </View>
      {record.note ? <Text style={styles.recordNote}>{record.note}</Text> : null}
    </View>
  );
}

// ─── Child Growth Section ─────────────────────────────────
function ChildGrowthSection({ child, userId, t }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const list = await listGrowthRecords(child.id);
      setRecords(list);
    } catch (err) {
      setError(getGrowthErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, [child.id]);

  return (
    <Card style={styles.childCard}>
      {/* Child header */}
      <View style={styles.childRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{child.name.trim().charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childAge}>{formatChildAge(child.dateOfBirth)}</Text>
        </View>
      </View>

      {/* Add form or button */}
      {showForm ? (
        <GrowthForm
          childId={child.id}
          userId={userId}
          onSaved={() => { setShowForm(false); load(true); }}
          onCancel={() => setShowForm(false)}
          t={t}
        />
      ) : (
        <Button
          label={`+ ${t('addGrowthRecord')}`}
          variant="secondary"
          size="sm"
          onPress={() => setShowForm(true)}
          style={styles.addRecordBtn}
        />
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Records history */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
      ) : records.length === 0 && !error ? (
        <View style={styles.noRecords}>
          <Text style={styles.noRecordsTitle}>{t('noGrowthRecords')}</Text>
          <Text style={styles.noRecordsDesc}>{t('noGrowthDesc')}</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.subsectionTitle}>{t('growthHistory')}</Text>
          {records.map((r) => <RecordRow key={r.id} record={r} t={t} />)}
        </View>
      )}

      {/* Dev milestones */}
      <Text style={[styles.subsectionTitle, { marginTop: spacing.lg }]}>
        {t('developmentMilestones')}
      </Text>
      {MILESTONE_KEYS.map(({ ageKey, milestoneKey }) => (
        <MilestoneRow key={ageKey} ageLabel={t(ageKey)} milestone={t(milestoneKey)} />
      ))}
    </Card>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function GrowthScreen({ user }) {
  const { t } = useLang();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listChildren(user.uid).then(setChildren).catch(() => {}).finally(() => setLoading(false));
  }, [user.uid]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.screenTitle}>{t('growthTitle')}</Text>
            <Text style={styles.screenSubtitle}>{t('growthSubtitle')}</Text>
          </View>
          {loading
            ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            : children.length === 0
              ? <EmptyState emoji="📏" title={t('noChildrenAdded')} description={t('addChildFirst')} />
              : children.map((c) => (
                  <ChildGrowthSection key={c.id} child={c} userId={user.uid} t={t} />
                ))
          }
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

  childCard: { marginBottom: spacing.md },
  childRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.md },
  avatar: {
    width: 46, height: 46, borderRadius: radius.md,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.primaryDark },
  childName: { ...typography.h4, color: colors.text },
  childAge: { ...typography.bodySmall, color: colors.muted },

  addRecordBtn: { marginBottom: spacing.md },

  form: { marginBottom: spacing.md, padding: spacing.md },
  formTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.md },
  measureRow: { flexDirection: 'row', alignItems: 'flex-start' },
  measureGap: { width: spacing.sm },
  formActions: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  errorText: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.sm },

  subsectionTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.sm },
  noRecords: { alignItems: 'center', paddingVertical: spacing.lg },
  noRecordsTitle: { ...typography.body, color: colors.muted, fontWeight: '700' },
  noRecordsDesc: { ...typography.bodySmall, color: colors.mutedLight, textAlign: 'center', marginTop: 4 },

  recordRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 8,
  },
  recordDateWrap: { marginBottom: 6 },
  recordDate: { ...typography.label, color: colors.textSecondary, fontWeight: '700' },
  recordMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  metricBadge: {},
  recordNote: { ...typography.bodySmall, color: colors.muted, fontStyle: 'italic', marginTop: 4 },

  milestoneRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  milestoneDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border, marginTop: 5 },
  milestoneContent: { flex: 1 },
  milestoneAge: { ...typography.caption, color: colors.muted, textTransform: 'uppercase', marginBottom: 1 },
  milestoneText: { ...typography.body, color: colors.text },
});
