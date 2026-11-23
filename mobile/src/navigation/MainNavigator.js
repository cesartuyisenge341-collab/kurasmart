/**
 * MainNavigator — 5-tab navigation bar for KuraSmart.
 *
 * Uses useSafeAreaInsets() to push the tab bar above the phone's
 * gesture navigation bar / home indicator on every device.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLang } from '../i18n/LanguageContext';
import { colors, radius, typography } from '../theme/colors';

import HomeScreen     from '../screens/HomeScreen';
import LearningScreen from '../screens/LearningScreen';
import MonitorScreen  from '../screens/MonitorScreen';
import ReportScreen   from '../screens/ReportScreen';
import ProfileScreen  from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home',     icon: '🏠', label: 'Home',    Screen: HomeScreen },
  { name: 'Learning', icon: '📖', label: 'Learning', Screen: LearningScreen },
  { name: 'Monitor',  icon: '📡', label: 'Monitor',  Screen: MonitorScreen },
  { name: 'Report',   icon: '📋', label: 'Report',   Screen: ReportScreen },
  { name: 'Profile',  icon: '👤', label: 'Profile',  Screen: ProfileScreen },
];

function TabIcon({ icon, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={styles.iconText}>{icon}</Text>
    </View>
  );
}

export default function MainNavigator({ user }) {
  const { lang } = useLang();
  const insets = useSafeAreaInsets();

  // The tab bar sits above the system navigation area.
  // bottomInset is the safe-area inset reported by the OS
  // (home indicator on iPhone, gesture bar on Android).
  const bottomInset = insets.bottom;          // e.g. 34 on iPhone, 24 on Android gestures
  const TAB_CONTENT = 54;                     // icon + label row height
  const tabBarHeight = TAB_CONTENT + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          // Height = icon+label zone + system inset
          height: tabBarHeight,
          // Pad the bottom so labels sit above the system bar
          paddingBottom: bottomInset > 0 ? bottomInset : 8,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOpacity: 0.07,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -2 },
          elevation: 12,
        },
      }}
    >
      {TABS.map(({ name, icon, label, Screen }) => (
        <Tab.Screen
          key={name}
          name={name}
          options={{
            tabBarLabel: label,
            tabBarIcon: ({ focused }) => <TabIcon icon={icon} focused={focused} />,
          }}
        >
          {() => <Screen user={user} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  iconWrap: {
    width: 36,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  iconWrapActive: {
    backgroundColor: colors.primaryLight,
  },
  iconText: {
    fontSize: 20,
  },
});
