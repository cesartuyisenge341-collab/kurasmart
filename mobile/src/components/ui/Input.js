import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, typography } from '../../theme/colors';

export default function Input({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  ...props
}) {
  const hasError = Boolean(error);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, hasError && styles.inputRowError]}>
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
        <TextInput
          {...props}
          placeholderTextColor={colors.placeholder}
          style={[styles.input, leftIcon && styles.inputWithLeft, inputStyle]}
          autoCorrect={false}
        />
        {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  inputRowError: { borderColor: colors.danger },
  iconLeft: { paddingLeft: 14 },
  iconRight: { paddingRight: 14 },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  inputWithLeft: { paddingLeft: 8 },
  hint: { ...typography.bodySmall, color: colors.muted, marginTop: 5 },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: 5 },
});
