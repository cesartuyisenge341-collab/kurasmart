import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/colors';
import Button from './Button';

export default function EmptyState({ emoji, title, description, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emoji: { fontSize: 48, marginBottom: spacing.md },
  title: { ...typography.h3, color: colors.text, textAlign: 'center', marginBottom: 8 },
  description: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  button: { marginTop: spacing.sm },
});
