import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLang } from '../i18n/LanguageContext';
import { listChildren } from '../services/childService';
import { listCareLogs } from '../services/careLogService';
import { listGrowthRecords } from '../services/growthService';
import { getAgeInMonths } from '../utils/childAge';
import { colors, radius, spacing, typography } from '../theme/colors';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const PERIODS = [
  { key: 'daily',   label: 'Daily',   days: 1 },
  { key: 'weekly',  label: 'Weekly',  days: 7 },
  { key: 'monthly', label: 'Monthly', days: 30 },
];

function withinDays(ts, days) {
  if (!ts) return false;
  const d   = ts?.toDate ? ts.toDate() : new Date(ts);
  const cut = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d >= cut;
}

// ── Horizontal bar ────────────────────────────────────────
function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.min(value / max, 1) * 100 : 0;
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

// ── Summary metric row ────────────────────────────────────
function MetricRow({ icon, label, value, max, color }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <View style={styles.metricInfo}>
        <View style={styles.metricTop}>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={[styles.metricValue, { color }]}>{value}</Text>
        </View>
        <Bar value={typeof value === 'number' ? value : 0} max={max} color={color} />
      </View>
    </View>
  );
}

// ── Growth record row ─────────────────────────────────────
function GrowthRow({ record }) {
  return (
    <View style={styles.growthRow}>
      <Text style={styles.growthDate}>{record.measuredOn}</Text>
      <View style={styles.growthMetrics}>
        {record.weight != null           && <Badge label={`⚖️ ${record.weight} kg`}  variant="info" />}
        {record.height != null           && <Badge label={`📏 ${record.height} cm`}  variant="success" />}
        {record.headCircumference != null && <Badge label={`👶 ${record.headCircumference} cm`} variant="primary" />}
      </View>
    </View>
  );
}

// ── Per-child report card ─────────────────────────────────
function ChildReport({ child, days }) {
  const [logs, setLogs]       = useState([]);
  const [growth, setGrowth]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      listCareLogs(child.id, 200).catch(() => []),
      listGrowthRecords(child.id).catch(() => []),
    ]).then(([l, g]) => {
      setLogs(l.filter((x) => withinDays(x.loggedAt, days)));
      setGrowth(g.slice(0, 5));
    }).finally(() => setLoading(false));
  }, [child.id, days]);

  const ageM    = getAgeInMonths(child.dateOfBirth) ?? 0;
  const initial = child.name.trim().charAt(0).toUpperCase();

  const feeding  = logs.filter((l) => l.type === 'feeding').length;
  const sleep    = logs.filter((l) => l.type === 'sleep_start').length;
  const diaper   = logs.filter((l) => l.type === 'diaper').length;
  const mood     = logs.filter((l) => l.type === 'mood').length;
  const total    = logs.length;
  const maxBar   = Math.max(feeding, sleep, diaper, mood, 1);

  return (
    <Card style={styles.reportCard}>
      {/* Child header */}
      <View style={styles.reportHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childAge}>{ageM} months old</Text>
        </View>
        <Badge label={`${total} logs`} variant={total > 0 ? 'success' : 'neutral'} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
      ) : (
        <>
          {/* Activity summary */}
          <Text style={styles.reportSection}>Activity summary</Text>
          <MetricRow icon="🍼" label="Feeding"  value={feeding} max={maxBar} color={colors.primary} />
          <MetricRow icon="😴" label="Sleep"    value={sleep}   max={maxBar} color={colors.info} />
          <MetricRow icon="👶" label="Diaper"   value={diaper}  max={maxBar} color={colors.success} />
          <MetricRow icon="💛" label="Mood"     value={mood}    max={maxBar} color={colors.warning} />

          {total === 0 && (
            <Text style={styles.noDataText}>No logs recorded in this period. Use the Home screen quick actions to log activities.</Text>
          )}

          {/* Growth records */}
          {growth.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.reportSection}>Growth measurements</Text>
              {growth.map((r) => <GrowthRow key={r.id} record={r} />)}
            </>
          )}

          {/* Alerts */}
          <View style={styles.divider} />
          <Text style={styles.reportSection}>Alerts</Text>
          <View style={styles.alertsBox}>
            <Text style={styles.alertsText}>✅  No alerts for this period.</Text>
          </View>
        </>
      )}
    </Card>
  );
}

export default function ReportScreen({ user }) {
  const { t } = useLang();
  const [children, setChildren] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [period, setPeriod]     = useState('daily');

  useEffect(() => {
    listChildren(user.uid).then(setChildren).catch(() => {}).finally(() => setLoading(false));
  }, [user.uid]);

  const days = PERIODS.find((p) => p.key === period)?.days ?? 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Reports</Text>
          <Text style={styles.screenSub}>Daily, weekly & monthly analytics</Text>
        </View>

        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <Pressable key={p.key} onPress={() => setPeriod(p.key)}
              style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}>
              <Text style={[styles.periodLabel, period === p.key && styles.periodLabelActive]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Reports */}
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : children.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No children added</Text>
            <Text style={styles.emptyText}>Add a child in Profile to generate reports.</Text>
          </View>
        ) : (
          children.map((c) => <ChildReport key={`${c.id}-${period}`} child={c} days={days} />)
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },

  header:     { marginBottom: spacing.lg },
  screenTitle:{ ...typography.h1, color: colors.text },
  screenSub:  { ...typography.body, color: colors.muted, marginTop: 4 },

  periodRow:        { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  periodBtn:        { flex: 1, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  periodBtnActive:  { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  periodLabel:      { ...typography.bodySmall, color: colors.muted, fontWeight: '700' },
  periodLabelActive:{ color: colors.primaryDark },

  reportCard:   { marginBottom: spacing.md },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.md },
  avatar:       { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 18, fontWeight: '800', color: colors.primaryDark },
  childName:    { ...typography.h4, color: colors.text },
  childAge:     { ...typography.bodySmall, color: colors.muted },

  reportSection: { ...typography.label, color: colors.muted, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },

  metricRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  metricIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  metricInfo: { flex: 1 },
  metricTop:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  metricLabel:{ ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  metricValue:{ ...typography.bodySmall, fontWeight: '800' },

  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 3 },

  noDataText: { ...typography.bodySmall, color: colors.muted, textAlign: 'center', marginTop: 4, lineHeight: 19 },

  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.sm },

  growthRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  growthDate:    { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  growthMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1, justifyContent: 'flex-end' },

  alertsBox:  { backgroundColor: colors.successLight, borderRadius: radius.md, padding: spacing.sm },
  alertsText: { ...typography.bodySmall, color: colors.success, fontWeight: '600' },

  empty:      { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: 6 },
  emptyText:  { ...typography.body, color: colors.muted, textAlign: 'center' },
});
