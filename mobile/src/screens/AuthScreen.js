import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getAuthErrorMessage,
  registerParent,
  requestPasswordReset,
} from '../services/authService';
import {
  getCaregiverErrorMessage,
  registerCaregiver,
  signInUser,
} from '../services/caregiverService';
import { useLang } from '../i18n/LanguageContext';
import { colors, radius, spacing, typography } from '../theme/colors';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BabyIllustration from '../components/ui/BabyIllustration';

const LANGUAGES = [
  { code: 'en', label: 'English',     flag: '🇬🇧' },
  { code: 'fr', label: 'Français',    flag: '🇫🇷' },
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
];

// ── Language bottom-sheet ─────────────────────────────────
function LanguageSheet({ visible, onClose, lang, setLang }) {
  const { t } = useLang();
  const slide = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: visible ? 0 : 300,
      useNativeDriver: true,
      tension: 70,
      friction: 10,
    }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={s.sheetOverlay}>
        <Pressable style={s.sheetBackdrop} onPress={onClose} />
        <Animated.View style={[s.sheet, { transform: [{ translateY: slide }] }]}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>{t('chooseLanguage')}</Text>
          {LANGUAGES.map((l) => (
            <Pressable
              key={l.code}
              onPress={() => { setLang(l.code); onClose(); }}
              style={[s.langRow, lang === l.code && s.langRowActive]}
            >
              <Text style={s.langFlag}>{l.flag}</Text>
              <Text style={[s.langLabel, lang === l.code && s.langLabelActive]}>{l.label}</Text>
              {lang === l.code && <Text style={s.langCheck}>✓</Text>}
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Auth flow:
 *   welcome → welcome_actions → selection (create) | login (sign in)
 *   selection → register_parent | register_caregiver
 *   login     → (form) or reset
 */
export default function AuthScreen({ onAuthenticated }) {
  const { lang, setLang, t } = useLang();

  const [screen, setScreen]         = useState('welcome');
  const [showLang, setShowLang]     = useState(false);
  const [fullName, setFullName]     = useState('');
  const [institution, setInstitution] = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [errors, setErrors]         = useState({});
  const [busy, setBusy]             = useState(false);

  // "Get Started" button animation
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  function go(next) {
    setFullName(''); setInstitution(''); setEmail('');
    setPassword(''); setConfirmPw(''); setErrors({});
    setScreen(next);
  }

  function validate() {
    const e = {};
    const isReg = screen === 'register_parent' || screen === 'register_caregiver';
    if (!email.trim())  e.email    = t('errorEmailRequired');
    if (screen !== 'reset') {
      if (!password)    e.password = t('errorPasswordRequired');
      else if (isReg && password.length < 8) e.password = t('errorPasswordShort');
    }
    if (isReg) {
      if (!fullName.trim()) e.fullName = t('errorNameRequired');
      if (screen === 'register_caregiver' && !institution.trim())
        e.institution = t('institutionRequired');
      if (password && password !== confirmPw) e.confirmPw = t('errorPasswordMatch');
    }
    return e;
  }

  async function submit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setBusy(true);
    try {
      if (screen === 'reset') {
        await requestPasswordReset(email);
        Alert.alert(t('emailSent'), t('emailSentBody'));
        go('login'); return;
      }
      let user;
      if (screen === 'register_parent') {
        user = await registerParent({ fullName, email, password });
      } else if (screen === 'register_caregiver') {
        user = await registerCaregiver({ fullName, email, password, institution });
      } else {
        user = await signInUser({ email, password });
      }
      onAuthenticated(user);
    } catch (err) {
      const msg = screen === 'register_caregiver'
        ? getCaregiverErrorMessage(err)
        : getAuthErrorMessage(err);
      Alert.alert(t('couldNotContinue'), msg);
    } finally {
      setBusy(false);
    }
  }

  // ── WELCOME ──────────────────────────────────────────────
  if (screen === 'welcome') {
    return (
      <ImageBackground
        source={require('../../assets/image2.jpg')}
        style={s.bg}
        resizeMode="cover"
      >
        <View style={s.overlay} />
        <SafeAreaView style={s.flex}>
          <View style={s.welcomePage}>
            {/* Language button */}
            <View style={s.topBar}>
              <Pressable onPress={() => setShowLang(true)} style={s.globeBtn}>
                <Text style={s.globeIcon}>🌐</Text>
              </Pressable>
            </View>

            {/* Hero */}
            <View style={s.hero}>
              <Text style={s.appName}>{t('appName')}</Text>
              <Text style={s.tagline}>{t('tagline')}</Text>
            </View>

            {/* Get Started */}
            <Animated.View style={{ transform: [{ scale: Animated.multiply(scale, pulse) }] }}>
              <Pressable
                onPressIn={() => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(scale, { toValue: 1,    useNativeDriver: true }).start()}
                onPress={() => go('welcome_actions')}
                style={s.getStartedBtn}
              >
                <Text style={s.getStartedText}>Get Started</Text>
              </Pressable>
            </Animated.View>
          </View>
        </SafeAreaView>

        <LanguageSheet
          visible={showLang}
          onClose={() => setShowLang(false)}
          lang={lang}
          setLang={setLang}
        />
      </ImageBackground>
    );
  }

  // ── WELCOME ACTIONS (Create / Login buttons) ──────────────
  if (screen === 'welcome_actions') {
    return (
      <ImageBackground
        source={require('../../assets/image2.jpg')}
        style={s.bg}
        resizeMode="cover"
      >
        <View style={s.overlay} />
        <SafeAreaView style={s.flex}>
          <View style={s.welcomePage}>
            <View style={s.topBar}>
              <Pressable onPress={() => setShowLang(true)} style={s.globeBtn}>
                <Text style={s.globeIcon}>🌐</Text>
              </Pressable>
            </View>

            <View style={s.hero}>
              <Text style={s.appName}>{t('appName')}</Text>
              <Text style={s.tagline}>{t('tagline')}</Text>
            </View>

            <View style={s.actionRow}>
              <Pressable onPress={() => go('selection')} style={s.actionBtn}>
                <Text style={s.actionBtnText}>Create Account</Text>
              </Pressable>
              <Pressable onPress={() => go('login')} style={[s.actionBtn, s.actionBtnOutline]}>
                <Text style={s.actionBtnOutlineText}>Login</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => go('welcome')} style={s.backLink}>
              <Text style={s.backLinkText}>← Back</Text>
            </Pressable>
          </View>
        </SafeAreaView>

        <LanguageSheet
          visible={showLang}
          onClose={() => setShowLang(false)}
          lang={lang}
          setLang={setLang}
        />
      </ImageBackground>
    );
  }

  // ── ACCOUNT SELECTION (Parent / Caregiver) ────────────────
  if (screen === 'selection') {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.formScroll} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => go('welcome_actions')} style={s.backBtn}>
            <Text style={s.backText}>{t('back')}</Text>
          </Pressable>

          <View style={s.formBrand}>
            <BabyIllustration size={80} />
          </View>
          <Text style={s.formTitle}>{t('accountTypeTitle')}</Text>
          <Text style={s.formSubtitle}>{t('accountTypeSubtitle')}</Text>

          <Pressable onPress={() => go('register_parent')} style={s.roleCard}>
            <Text style={s.roleIcon}>👨‍👩‍👧</Text>
            <View style={s.roleInfo}>
              <Text style={s.roleTitle}>{t('iAmParent')}</Text>
              <Text style={s.roleDesc}>{t('registerSubtitle')}</Text>
            </View>
            <Text style={s.roleArrow}>›</Text>
          </Pressable>

          <Pressable onPress={() => go('register_caregiver')} style={[s.roleCard, s.roleCardGreen]}>
            <Text style={s.roleIcon}>👩‍🏫</Text>
            <View style={s.roleInfo}>
              <Text style={s.roleTitle}>{t('iAmCaregiver')}</Text>
              <Text style={s.roleDesc}>{t('caregiverRegSubtitle')}</Text>
            </View>
            <Text style={s.roleArrow}>›</Text>
          </Pressable>

          <Text style={s.switchText}>
            {t('alreadyHaveAccount')}
            <Text style={s.switchLink} onPress={() => go('login')}>{t('signIn')}</Text>
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── FORM SCREENS (login / register_parent / register_caregiver / reset) ──
  const isReg       = screen === 'register_parent' || screen === 'register_caregiver';
  const isCaregiver = screen === 'register_caregiver';

  const TITLES = {
    login:               t('signInTitle'),
    register_parent:     t('registerTitle'),
    register_caregiver:  t('caregiverRegTitle'),
    reset:               t('resetTitle'),
  };
  const SUBS = {
    login:               t('signInSubtitle'),
    register_parent:     t('registerSubtitle'),
    register_caregiver:  t('caregiverRegSubtitle'),
    reset:               t('resetSubtitle'),
  };
  const BTNS = {
    login:               t('signIn'),
    register_parent:     t('createAccount'),
    register_caregiver:  t('createAccount'),
    reset:               t('sendResetLink'),
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => go(isReg ? 'selection' : 'welcome_actions')}
            style={s.backBtn}
          >
            <Text style={s.backText}>{t('back')}</Text>
          </Pressable>

          <View style={s.formBrand}>
            <BabyIllustration size={72} />
            {isCaregiver && (
              <View style={s.caregiverBadge}>
                <Text style={s.caregiverBadgeText}>👩‍🏫 {t('caregiverRole')}</Text>
              </View>
            )}
          </View>

          <Text style={s.formTitle}>{TITLES[screen]}</Text>
          <Text style={s.formSubtitle}>{SUBS[screen]}</Text>

          <View style={s.formCard}>
            {isReg && (
              <Input
                label={t('fullName')}
                value={fullName}
                onChangeText={setFullName}
                autoComplete="name"
                placeholder={t('fullNamePlaceholder')}
                returnKeyType="next"
                error={errors.fullName}
              />
            )}
            {isCaregiver && (
              <Input
                label={t('institution')}
                value={institution}
                onChangeText={setInstitution}
                placeholder={t('institutionPlaceholder')}
                returnKeyType="next"
                error={errors.institution}
              />
            )}
            <Input
              label={t('emailAddress')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t('emailPlaceholder')}
              returnKeyType="next"
              error={errors.email}
            />
            {screen !== 'reset' && (
              <Input
                label={t('password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                returnKeyType={isReg ? 'next' : 'go'}
                error={errors.password}
              />
            )}
            {isReg && (
              <Input
                label={t('confirmPassword')}
                value={confirmPw}
                onChangeText={setConfirmPw}
                secureTextEntry
                placeholder="••••••••"
                returnKeyType="go"
                error={errors.confirmPw}
              />
            )}
            {screen === 'login' && (
              <Pressable onPress={() => go('reset')} style={s.forgotBtn}>
                <Text style={s.forgotText}>{t('forgotPassword')}</Text>
              </Pressable>
            )}
            <Button label={BTNS[screen]} onPress={submit} loading={busy} style={s.submitBtn} />
          </View>

          {screen === 'login' && (
            <Text style={s.switchText}>
              {t('needAccount')}
              <Text style={s.switchLink} onPress={() => go('selection')}>{t('createOne')}</Text>
            </Text>
          )}
          {isReg && (
            <Text style={s.switchText}>
              {t('alreadyHaveAccount')}
              <Text style={s.switchLink} onPress={() => go('login')}>{t('signIn')}</Text>
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex:    { flex: 1 },
  safe:    { flex: 1, backgroundColor: colors.background },

  // ── Welcome / image screens ──────────────────────────
  bg:      { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)' },

  welcomePage: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },

  topBar:    { alignItems: 'flex-end' },
  globeBtn:  {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  globeIcon: { fontSize: 22 },

  hero:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  appName: {
    fontSize: 44,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 300,
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  getStartedBtn: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: radius.full,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },

  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.65)',
  },
  actionBtnText:        { ...typography.body, color: colors.primary,  fontWeight: '700', fontSize: 16 },
  actionBtnOutlineText: { ...typography.body, color: '#fff',          fontWeight: '700', fontSize: 16 },

  backLink:     { alignSelf: 'center', paddingVertical: 14 },
  backLinkText: { ...typography.body, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },

  // ── Language sheet ───────────────────────────────────
  sheetOverlay:  { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 12, marginBottom: 8,
  },
  sheetTitle: { ...typography.h3, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  langRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: spacing.md,
    borderRadius: radius.lg, marginBottom: 6,
    backgroundColor: colors.background,
  },
  langRowActive:   { backgroundColor: colors.primaryLight },
  langFlag:        { fontSize: 24 },
  langLabel:       { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  langLabelActive: { color: colors.primaryDark, fontWeight: '700' },
  langCheck:       { fontSize: 18, color: colors.primary, fontWeight: '800' },

  // ── Selection / form screens ─────────────────────────
  formScroll: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },

  backBtn:  { marginBottom: spacing.md, paddingVertical: 4, alignSelf: 'flex-start' },
  backText: { ...typography.body, color: colors.primary, fontWeight: '700' },

  formBrand:   { alignItems: 'center', marginBottom: spacing.lg },
  formTitle:   { ...typography.h2, color: colors.text, textAlign: 'center' },
  formSubtitle: {
    ...typography.body, color: colors.muted,
    textAlign: 'center', marginTop: 6, marginBottom: spacing.lg,
  },

  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5, borderColor: colors.primaryMuted,
    shadowColor: '#17324D', shadowOpacity: 0.06,
    shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  roleCardGreen: { borderColor: '#A8DFC4', backgroundColor: '#F0FFF8' },
  roleIcon:  { fontSize: 40 },
  roleInfo:  { flex: 1 },
  roleTitle: { ...typography.h4, color: colors.text },
  roleDesc:  { ...typography.bodySmall, color: colors.muted, marginTop: 3, lineHeight: 18 },
  roleArrow: { color: colors.mutedLight, fontSize: 26, fontWeight: '300' },

  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#17324D', shadowOpacity: 0.07,
    shadowRadius: 14, shadowOffset: { width: 0, height: 4 },
    elevation: 2, marginBottom: spacing.lg,
  },
  forgotBtn:  { alignSelf: 'flex-end', marginTop: -4, marginBottom: 12 },
  forgotText: { ...typography.bodySmall, color: colors.primary, fontWeight: '700' },
  submitBtn:  { marginTop: 4 },

  switchText: { ...typography.body, color: colors.muted, textAlign: 'center' },
  switchLink: { color: colors.primaryDark, fontWeight: '700' },

  caregiverBadge: {
    marginTop: 8, backgroundColor: '#E8FFF0',
    borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 5,
  },
  caregiverBadgeText: { ...typography.bodySmall, color: colors.success, fontWeight: '700' },
});
