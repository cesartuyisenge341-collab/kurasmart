import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLang } from '../i18n/LanguageContext';
import { listChildren } from '../services/childService';
import { listCareLogs } from '../services/careLogService';
import { formatChildAge, getAgeInMonths } from '../utils/childAge';
import { colors, radius, spacing, typography } from '../theme/colors';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import BabyIllustration from '../components/ui/BabyIllustration';

const TIPS = [
  { emoji: '💬', title: 'Talk often',         body: 'Children 0–2 learn language best through direct conversation with caregivers.' },
  { emoji: '🏋️', title: 'Tummy time',         body: 'Give infants supervised tummy time daily to build neck and shoulder strength.' },
  { emoji: '🗓️', title: 'Consistent routine', body: 'Regular sleep and meal times help children feel secure and self-regulate.' },
  { emoji: '📚', title: 'Read every day',      body: 'Even 10 minutes of reading aloud daily builds vocabulary and listening skills.' },
  { emoji: '🎵', title: 'Sing together',       body: 'Singing simple songs helps babies learn rhythm, language and bonding.' },
];

function greeting(h) {
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function isToday(ts) {
  if (!ts) return false;
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

// ── Stat card ─────────────────────────────────────────────
function StatCard({ icon, label, value, bg, fg }) {
  return (
    <Card style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: fg }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: fg + 'CC' }]}>{label}</Text>
    </Card>
  );
}

// ── Child row ─────────────────────────────────────────────
function ChildRow({ child }) {
  const initial = child.name.trim().charAt(0).toUpperCase();
  const ageM    = getAgeInMonths(child.dateOfBirth);
  const ageStr  = ageM !== null
    ? ageM < 12 ? `${ageM} months old` : `${Math.floor(ageM / 12)}y ${ageM % 12}m old`
    : formatChildAge(child.dateOfBirth);

  return (
    <Card style={styles.childRow}>
      <View style={styles.childAvatar}>
        <Text style={styles.childAvatarText}>{initial}</Text>
      </View>
      <View style={styles.childInfo}>
        <Text style={styles.childName}>{child.name}</Text>
        <Text style={styles.childAge}>{ageStr}</Text>
      </View>
      <Badge label="Active" variant="success" />
    </Card>
  );
}

export default function HomeScreen({ user }) {
  const { t } = useLang();
  const [children, setChildren]     = useState([]);
  const [logsToday, setLogsToday]   = useState(0);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  const firstName = user?.displayName?.split(' ')[0] || 'Parent';
  const hour      = new Date().getHours();

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const kids = await listChildren(user.uid);
      setChildren(kids);
      if (kids.length > 0) {
        const logs = await listCareLogs(kids[0].id, 100).catch(() => []);
        setLogsToday(logs.filter((l) => isToday(l.loggedAt)).length);
      }
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { load(); }, [user.uid]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting(hour)},</Text>
            <Text style={styles.name}>{firstName} 👋</Text>
          </View>
          <BabyIllustration size={50} />
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <StatCard icon="👶" label="Children"    value={loading ? '—' : String(children.length)} bg={colors.primaryLight}  fg={colors.primaryDark} />
          <StatCard icon="🍼" label="Logs today"  value={loading ? '—' : String(logsToday)}        bg={colors.successLight} fg={colors.success} />
          <StatCard icon="⭐" label="Milestones"  value="—"                                         bg={colors.accentLight}  fg={colors.accentDark} />
        </View>

        {/* ── Children ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your children</Text>
            {!loading && children.length > 0 && (
              <Text style={styles.sectionCount}>{children.length}</Text>
            )}
          </View>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : children.length === 0 ? (
            <Card variant="flat" style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👶</Text>
              <Text style={styles.emptyTitle}>No children added yet</Text>
              <Text style={styles.emptyBody}>Go to Profile → Add child to get started.</Text>
            </Card>
          ) : (
            children.map((c) => <ChildRow key={c.id} child={c} />)
          )}
        </View>

        {/* ── Daily tip ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's tip</Text>
          <Card style={styles.tipCard}>
            <View style={styles.tipIconWrap}>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
            </View>
            <View style={styles.tipBody}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipText}>{tip.body}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },

  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  greeting: { ...typography.body, color: colors.muted },
  name:     { ...typography.h2, color: colors.text, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderRadius: radius.lg, shadowOpacity: 0 },
  statIcon:  { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', marginTop: 2, textAlign: 'center' },

  section:       { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle:  { ...typography.h3, color: colors.text },
  sectionCount:  { ...typography.label, color: colors.muted, backgroundColor: colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },

  quickRow:          { flexDirection: 'row', gap: spacing.sm },
  childRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
  childAvatar:     { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  childAvatarText: { fontSize: 18, fontWeight: '800', color: colors.primaryDark },
  childInfo:       { flex: 1 },
  childName:       { ...typography.h4, color: colors.text },
  childAge:        { ...typography.bodySmall, color: colors.muted, marginTop: 2 },

  emptyCard:  { alignItems: 'center', paddingVertical: spacing.xl },
  emptyEmoji: { fontSize: 38, marginBottom: 10 },
  emptyTitle: { ...typography.h4, color: colors.text, marginBottom: 4 },
  emptyBody:  { ...typography.bodySmall, color: colors.muted, textAlign: 'center' },

  tipCard:    { flexDirection: 'row', gap: 14, alignItems: 'flex-start', backgroundColor: colors.accentLight, shadowOpacity: 0 },
  tipIconWrap:{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.accent },
  tipEmoji:   { fontSize: 22 },
  tipBody:    { flex: 1 },
  tipTitle:   { ...typography.h4, color: colors.accentDark, marginBottom: 4 },
  tipText:    { ...typography.body, color: colors.textSecondary, lineHeight: 21 },
});
