import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, typography } from '../../theme/colors';

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  style,
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        (pressed || isDisabled) && styles[`${variant}_pressed`],
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#fff' : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, styles[`label_${variant}`], styles[`label_${size}`]]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
  },

  // Variants
  primary: { backgroundColor: colors.primary },
  primary_pressed: { backgroundColor: colors.primaryDark, opacity: 0.9 },

  secondary: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  secondary_pressed: { opacity: 0.75 },

  ghost: { backgroundColor: 'transparent' },
  ghost_pressed: { backgroundColor: colors.surfaceAlt },

  danger: { backgroundColor: colors.danger },
  danger_pressed: { opacity: 0.85 },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  outline_pressed: { backgroundColor: colors.primaryLight },

  // Sizes
  size_sm: { minHeight: 36, paddingHorizontal: 14 },
  size_md: { minHeight: 48, paddingHorizontal: 20 },
  size_lg: { minHeight: 56, paddingHorizontal: 24 },

  // Labels
  label: { ...typography.h4 },
  label_primary: { color: '#fff' },
  label_secondary: { color: colors.primaryDark },
  label_ghost: { color: colors.primary },
  label_danger: { color: '#fff' },
  label_outline: { color: colors.primary },

  label_sm: { fontSize: 13, fontWeight: '600' },
  label_md: { fontSize: 15, fontWeight: '700' },
  label_lg: { fontSize: 16, fontWeight: '700' },
});
