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
import { getAgeInMonths } from '../utils/childAge';
import { colors, radius, spacing, typography } from '../theme/colors';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

// ── Sensor definitions ────────────────────────────────────
const SENSORS = [
  { key: 'heartRate',    icon: '❤️',  label: 'Heart Rate',     unit: 'bpm',  normalMin: 80, normalMax: 160 },
  { key: 'temperature',  icon: '🌡️',  label: 'Body Temp',      unit: '°C',   normalMin: 36.1, normalMax: 37.5 },
  { key: 'spo2',         icon: '💧',  label: 'SpO₂',           unit: '%',    normalMin: 95, normalMax: 100 },
  { key: 'respiration',  icon: '🫁',  label: 'Respiration',    unit: '/min', normalMin: 20, normalMax: 60 },
  { key: 'motion',       icon: '🏃',  label: 'Motion',         unit: '',     normalMin: null, normalMax: null },
  { key: 'location',     icon: '📍',  label: 'GPS Location',   unit: '',     normalMin: null, normalMax: null },
];

function getStatus(key, value, sensor) {
  if (value === null || value === undefined) return 'offline';
  if (sensor.normalMin === null) return 'normal';
  if (value < sensor.normalMin || value > sensor.normalMax) return 'warning';
  return 'normal';
}

const STATUS_BADGE = {
  normal:  { label: 'Normal',  variant: 'success' },
  warning: { label: 'Alert',   variant: 'warning' },
  offline: { label: 'Offline', variant: 'neutral' },
};

// ── Sensor tile ───────────────────────────────────────────
function SensorTile({ sensor, readings }) {
  const raw    = readings?.[sensor.key];
  const status = getStatus(sensor.key, raw, sensor);
  const badge  = STATUS_BADGE[status];

  const displayValue = raw !== null && raw !== undefined
    ? (typeof raw === 'boolean' ? (raw ? 'Detected' : 'None') : String(raw))
    : '—';

  const tileBg = status === 'warning' ? colors.warningLight
    : status === 'normal'  ? colors.surface
    : colors.surfaceAlt;

  return (
    <Card style={[styles.sensorTile, { backgroundColor: tileBg }]}>
      <Text style={styles.sensorIcon}>{sensor.icon}</Text>
      <Text style={styles.sensorValue}>
        {displayValue}{raw !== null && raw !== undefined && sensor.unit ? ` ${sensor.unit}` : ''}
      </Text>
      <Text style={styles.sensorLabel}>{sensor.label}</Text>
      <Badge label={badge.label} variant={badge.variant} style={styles.sensorBadge} />
    </Card>
  );
}

// ── Device status card ────────────────────────────────────
function DeviceCard({ paired, deviceName, lastSeen, onPair }) {
  return (
    <Card style={styles.deviceCard}>
      <View style={styles.deviceRow}>
        <View style={[styles.deviceDot, { backgroundColor: paired ? colors.success : colors.muted }]} />
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{paired ? deviceName : 'No device paired'}</Text>
          <Text style={styles.deviceSub}>
            {paired ? `Last update: ${lastSeen}` : 'Pair an ESP32 wearable to start monitoring'}
          </Text>
        </View>
        <Badge label={paired ? 'Online' : 'Offline'} variant={paired ? 'success' : 'neutral'} />
      </View>
      {!paired && (
        <Pressable onPress={onPair} style={({ pressed }) => [styles.pairBtn, { opacity: pressed ? 0.8 : 1 }]}>
          <Text style={styles.pairBtnText}>📡  Pair Device</Text>
        </Pressable>
      )}
    </Card>
  );
}

export default function MonitorScreen({ user }) {
  const { t } = useLang();
  const [children, setChildren]       = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading]         = useState(true);

  // All readings are null until a device is paired
  const readings = {};

  useEffect(() => {
    listChildren(user.uid).then(setChildren).catch(() => {}).finally(() => setLoading(false));
  }, [user.uid]);

  const selected = children[selectedIdx] ?? null;
  const ageM     = selected ? (getAgeInMonths(selected.dateOfBirth) ?? 0) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Monitor</Text>
          <Text style={styles.screenSub}>Wearable device & GPS tracking</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : children.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📡</Text>
            <Text style={styles.emptyTitle}>No children added</Text>
            <Text style={styles.emptyText}>Add a child in Profile to start monitoring.</Text>
          </View>
        ) : (
          <>
            {/* Child tabs */}
            {children.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
                {children.map((c, i) => (
                  <Pressable key={c.id} onPress={() => setSelectedIdx(i)}
                    style={[styles.childTab, i === selectedIdx && styles.childTabActive]}>
                    <Text style={[styles.childTabText, i === selectedIdx && styles.childTabTextActive]}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* Device status */}
            <DeviceCard
              paired={false}
              deviceName="KuraSmart v1"
              lastSeen="—"
              onPair={() => {}}
            />

            {/* Info banner */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerIcon}>ℹ️</Text>
              <Text style={styles.infoBannerText}>
                Pair an ESP32 wearable to see live biometric readings for {selected?.name ?? 'your child'}.
              </Text>
            </View>

            {/* Sensor grid 2×3 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sensor readings</Text>
              <View style={styles.sensorGrid}>
                {SENSORS.map((s) => (
                  <View key={s.key} style={styles.sensorCell}>
                    <SensorTile sensor={s} readings={readings} />
                  </View>
                ))}
              </View>
            </View>

            {/* Normal ranges reference */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Normal ranges · {ageM < 12 ? 'Infant' : ageM < 36 ? 'Toddler' : 'Child'}</Text>
              {[
                { label: 'Heart rate', range: ageM < 3 ? '100–160 bpm' : ageM < 12 ? '80–140 bpm' : '70–120 bpm' },
                { label: 'Temperature', range: '36.1–37.5 °C' },
                { label: 'SpO₂',       range: '≥ 95%' },
                { label: 'Respiration',range: ageM < 12 ? '30–60 /min' : '20–40 /min' },
              ].map((r) => (
                <View key={r.label} style={styles.rangeRow}>
                  <Text style={styles.rangeLabel}>{r.label}</Text>
                  <Text style={styles.rangeValue}>{r.range}</Text>
                </View>
              ))}
            </View>

            {/* GPS placeholder */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GPS safe zones</Text>
              <Card variant="flat" style={styles.mapPlaceholder}>
                <Text style={styles.mapEmoji}>🗺️</Text>
                <Text style={styles.mapTitle}>Map will appear here</Text>
                <Text style={styles.mapText}>
                  Connect a GPS-enabled device to track location and define safe zones.
                </Text>
              </Card>
            </View>
          </>
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

  tabScroll:         { marginBottom: spacing.md, marginHorizontal: -spacing.lg },
  tabRow:            { paddingHorizontal: spacing.lg, gap: spacing.sm },
  childTab:          { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  childTabActive:    { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  childTabText:      { ...typography.bodySmall, color: colors.muted, fontWeight: '700' },
  childTabTextActive:{ color: colors.primaryDark },

  deviceCard:  { marginBottom: spacing.md },
  deviceRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deviceDot:   { width: 12, height: 12, borderRadius: 6 },
  deviceInfo:  { flex: 1 },
  deviceName:  { ...typography.h4, color: colors.text },
  deviceSub:   { ...typography.bodySmall, color: colors.muted, marginTop: 2 },
  pairBtn:     { marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  pairBtnText: { ...typography.h4, color: '#fff' },

  infoBanner:     { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.infoLight, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.lg },
  infoBannerIcon: { fontSize: 16 },
  infoBannerText: { ...typography.bodySmall, color: colors.info, flex: 1, lineHeight: 19 },

  section:      { marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: 12 },

  sensorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sensorCell: { width: '48%' },
  sensorTile: { alignItems: 'center', paddingVertical: spacing.md, gap: 4 },
  sensorIcon:  { fontSize: 26 },
  sensorValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  sensorLabel: { ...typography.caption, color: colors.muted, textAlign: 'center' },
  sensorBadge: { marginTop: 4 },

  rangeRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  rangeLabel: { ...typography.body, color: colors.text },
  rangeValue: { ...typography.body, color: colors.muted, fontWeight: '600' },

  mapPlaceholder: { alignItems: 'center', paddingVertical: spacing.xl },
  mapEmoji:  { fontSize: 44, marginBottom: 10 },
  mapTitle:  { ...typography.h4, color: colors.text, marginBottom: 6 },
  mapText:   { ...typography.bodySmall, color: colors.muted, textAlign: 'center', lineHeight: 19 },

  empty:      { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: 6 },
  emptyText:  { ...typography.body, color: colors.muted, textAlign: 'center' },
});
