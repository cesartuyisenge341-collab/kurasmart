import { useEffect, useState } from 'react';
import {
  Alert,
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
import { signOut } from 'firebase/auth';
import { auth } from '../config/auth';
import { useLang } from '../i18n/LanguageContext';
import { createChildProfile, getChildErrorMessage, listChildren } from '../services/childService';
import { formatChildAge } from '../utils/childAge';
import { colors, radius, spacing, typography } from '../theme/colors';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const LANGUAGES = [
  { code: 'en', label: 'English',     flag: '🇬🇧' },
  { code: 'fr', label: 'Français',    flag: '🇫🇷' },
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
];

// ── Setting row ───────────────────────────────────────────
function SettingRow({ icon, label, value, onPress, danger, last }) {
  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.settingRow, pressed && { backgroundColor: colors.surfaceAlt }]}
      >
        <View style={styles.settingIconWrap}>
          <Text style={styles.settingIcon}>{icon}</Text>
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingLabel, danger && { color: colors.danger }]}>{label}</Text>
          {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        </View>
        {onPress && <Text style={styles.settingChevron}>›</Text>}
      </Pressable>
      {!last && <View style={styles.rowDivider} />}
    </>
  );
}

function SectionCard({ title, children: ch }) {
  return (
    <View style={styles.sectionGroup}>
      {title ? <Text style={styles.sectionLabel}>{title}</Text> : null}
      <Card style={styles.sectionCard}>{ch}</Card>
    </View>
  );
}

// ── Add child form ────────────────────────────────────────
function AddChildForm({ parentUid, onSaved, onCancel }) {
  const [name, setName]       = useState('');
  const [dob,  setDob]        = useState('');
  const [nameErr, setNameErr] = useState('');
  const [dobErr,  setDobErr]  = useState('');
  const [saving, setSaving]   = useState(false);

  async function save() {
    let ok = true;
    if (!name.trim()) { setNameErr("Child's name is required."); ok = false; } else setNameErr('');
    if (!dob.trim())  { setDobErr('Date required (YYYY-MM-DD).'); ok = false; } else setDobErr('');
    if (!ok) return;
    setSaving(true);
    try {
      await createChildProfile({ parentUid, name, dateOfBirth: dob });
      onSaved();
    } catch (err) {
      const msg = getChildErrorMessage(err);
      if (msg.toLowerCase().includes('name')) setNameErr(msg); else setDobErr(msg);
    } finally { setSaving(false); }
  }

  return (
    <Card style={styles.formCard}>
      <Text style={styles.formTitle}>New child profile</Text>
      <Input
        label="Child's full name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        placeholder="e.g. Amara"
        error={nameErr}
      />
      <Input
        label="Date of birth"
        value={dob}
        onChangeText={setDob}
        placeholder="YYYY-MM-DD"
        keyboardType="numeric"
        maxLength={10}
        hint="For children under 6 years old."
        error={dobErr}
      />
      <View style={styles.formActions}>
        <Button label="Cancel" variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
        <Button label="Save child" onPress={save} loading={saving} style={{ flex: 2 }} />
      </View>
    </Card>
  );
}

// ── Child list item ───────────────────────────────────────
function ChildItem({ child, last }) {
  const initial = child.name.trim().charAt(0).toUpperCase();
  return (
    <>
      <View style={styles.childItem}>
        <View style={styles.childAvatar}>
          <Text style={styles.childAvatarText}>{initial}</Text>
        </View>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childAge}>{formatChildAge(child.dateOfBirth)}</Text>
          <Text style={styles.childDob}>Born {child.dateOfBirth}</Text>
        </View>
        <Badge label="Active" variant="success" />
      </View>
      {!last && <View style={styles.rowDivider} />}
    </>
  );
}

export default function ProfileScreen({ user }) {
  const { lang, setLang, t } = useLang();
  const [children, setChildren]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm]     = useState(false);

  const displayName = user?.displayName || 'Parent';
  const email       = user?.email || '';
  const initials    = displayName.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  async function loadChildren(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try { setChildren(await listChildren(user.uid)); } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { loadChildren(); }, [user.uid]);

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive',
        onPress: async () => { try { await signOut(auth); } catch {} },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadChildren(true)} tintColor={colors.primary} />}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Profile header ── */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            <Badge label="Parent account" variant="primary" style={{ marginTop: 8 }} />
          </View>

          {/* ── Children ── */}
          <View style={styles.sectionGroup}>
            <View style={styles.sectionLabelRow}>
              <Text style={styles.sectionLabel}>Children</Text>
              {!loading && children.length > 0 && (
                <Text style={styles.sectionCount}>{children.length}</Text>
              )}
            </View>

            {showForm ? (
              <AddChildForm
                parentUid={user.uid}
                onSaved={() => { setShowForm(false); loadChildren(true); }}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <Button
                label="+ Add child"
                onPress={() => setShowForm(true)}
                style={styles.addChildBtn}
              />
            )}

            {!loading && children.length > 0 && (
              <Card style={styles.sectionCard}>
                {children.map((c, i) => (
                  <ChildItem key={c.id} child={c} last={i === children.length - 1} />
                ))}
              </Card>
            )}
          </View>

          {/* ── Language ── */}
          <View style={styles.sectionGroup}>
            <Text style={styles.sectionLabel}>Language</Text>
            <Card style={styles.sectionCard}>
              {LANGUAGES.map((l, i) => (
                <View key={l.code}>
                  <Pressable
                    onPress={() => setLang(l.code)}
                    style={({ pressed }) => [styles.langRow, pressed && { backgroundColor: colors.surfaceAlt }]}
                  >
                    <Text style={styles.langFlag}>{l.flag}</Text>
                    <Text style={[styles.langLabel, lang === l.code && styles.langLabelActive]}>{l.label}</Text>
                    {lang === l.code && (
                      <View style={styles.langCheck}><Text style={styles.langCheckText}>✓</Text></View>
                    )}
                  </Pressable>
                  {i < LANGUAGES.length - 1 && <View style={styles.rowDivider} />}
                </View>
              ))}
            </Card>
          </View>

          {/* ── Account ── */}
          <SectionCard title="Account">
            <SettingRow icon="👤" label="Full name"       value={displayName} />
            <SettingRow icon="✉️" label="Email"           value={email} />
            <SettingRow icon="🔑" label="Change password" onPress={() => {}} last />
          </SectionCard>

          {/* ── Preferences ── */}
          <SectionCard title="Preferences">
            <SettingRow icon="🔔" label="Notifications"  value="Enabled"         onPress={() => {}} />
            <SettingRow icon="📐" label="Units"           value="Metric (kg, cm)" onPress={() => {}} last />
          </SectionCard>

          {/* ── About ── */}
          <SectionCard title="About">
            <SettingRow icon="ℹ️" label="App version" value="1.0.0" />
            <SettingRow icon="🛡️" label="Privacy policy" onPress={() => {}} />
            <SettingRow icon="📄" label="Terms of service" onPress={() => {}} last />
          </SectionCard>

          {/* Sign out */}
          <Button label="Sign out" variant="danger" onPress={handleSignOut} style={styles.signOutBtn} />

          <Text style={styles.disclaimer}>
            KuraSmart supports, but never replaces, adult supervision of children.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },

  profileHeader: { alignItems: 'center', marginBottom: spacing.xl },
  avatarWrap:    { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  avatarText:    { color: '#fff', fontSize: 28, fontWeight: '800' },
  profileName:   { ...typography.h2, color: colors.text },
  profileEmail:  { ...typography.body, color: colors.muted, marginTop: 4 },

  sectionGroup:    { marginBottom: spacing.lg },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionLabel:    { ...typography.label, color: colors.muted, textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 },
  sectionCount:    { ...typography.caption, color: colors.muted, backgroundColor: colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  sectionCard:     { padding: 0, overflow: 'hidden' },

  addChildBtn: { marginBottom: spacing.sm },

  formCard:    { marginBottom: spacing.sm },
  formTitle:   { ...typography.h4, color: colors.text, marginBottom: spacing.md },
  formActions: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },

  childItem:       { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 12 },
  childAvatar:     { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  childAvatarText: { fontSize: 17, fontWeight: '800', color: colors.primaryDark },
  childInfo:       { flex: 1 },
  childName:       { ...typography.h4, color: colors.text },
  childAge:        { ...typography.bodySmall, color: colors.muted, marginTop: 1 },
  childDob:        { ...typography.caption, color: colors.mutedLight, marginTop: 1 },

  langRow:         { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 12 },
  langFlag:        { fontSize: 22 },
  langLabel:       { ...typography.body, color: colors.muted, flex: 1, fontWeight: '600' },
  langLabelActive: { color: colors.text },
  langCheck:       { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  langCheckText:   { color: '#fff', fontSize: 13, fontWeight: '800' },

  settingRow:      { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 12 },
  settingIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  settingIcon:     { fontSize: 17 },
  settingContent:  { flex: 1 },
  settingLabel:    { ...typography.body, color: colors.text, fontWeight: '600' },
  settingValue:    { ...typography.bodySmall, color: colors.muted, marginTop: 1 },
  settingChevron:  { color: colors.mutedLight, fontSize: 22 },

  rowDivider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 56 },

  signOutBtn:  { marginBottom: spacing.lg },
  disclaimer:  { ...typography.caption, color: colors.mutedLight, textAlign: 'center', lineHeight: 17 },
});
