import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/auth';
import { isFirebaseConfigured } from './src/config/firebase';
import { LanguageProvider } from './src/i18n/LanguageContext';
import AuthScreen    from './src/screens/AuthScreen';
import MainNavigator from './src/navigation/MainNavigator';
import BabyIllustration from './src/components/ui/BabyIllustration';
import { colors, typography } from './src/theme/colors';

// Everything inside App() is wrapped by LanguageProvider,
// so every child component can safely call useLang().
function AppContent() {
  const [user, setUser]                   = useState(null);
  const [checking, setChecking]           = useState(true);

  useEffect(() => {
    if (!auth) { setChecking(false); return; }
    return onAuthStateChanged(auth,
      (u) => { setUser(u ?? null); setChecking(false); },
      ()  => { setUser(null);      setChecking(false); },
    );
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <View style={styles.center}>
        <BabyIllustration size={110} />
        <Text style={styles.title}>Firebase setup needed</Text>
        <Text style={styles.sub}>
          Add Firebase values to mobile/.env and restart Expo.
        </Text>
      </View>
    );
  }

  if (checking) {
    return (
      <View style={styles.splash}>
        <BabyIllustration size={130} />
        <Text style={styles.appName}>KuraSmart</Text>
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={user ? 'dark' : 'light'} />
      <NavigationContainer>
        {user
          ? <MainNavigator user={user} />
          : <AuthScreen onAuthenticated={(u) => setUser(u)} />
        }
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background, gap: 8,
  },
  appName: { ...typography.h2, color: colors.text, marginTop: 10 },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 28, backgroundColor: colors.background, gap: 12,
  },
  title: { ...typography.h2, color: colors.text, textAlign: 'center' },
  sub:   { ...typography.body, color: colors.muted, textAlign: 'center', lineHeight: 24 },
});
