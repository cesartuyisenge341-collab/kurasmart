import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../theme/colors';

const VARIANTS = {
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: colors.warning },
  danger: { bg: colors.dangerLight, text: colors.danger },
  info: { bg: colors.infoLight, text: colors.info },
  primary: { bg: colors.primaryLight, text: colors.primaryDark },
  neutral: { bg: colors.surfaceAlt, text: colors.muted },
};

export default function Badge({ label, variant = 'primary', style }) {
  const { bg, text } = VARIANTS[variant] ?? VARIANTS.primary;
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: { ...typography.caption, fontWeight: '700' },
});
