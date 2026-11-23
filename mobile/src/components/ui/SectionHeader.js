import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../theme/colors';

export default function SectionHeader({ title, subtitle, action, onAction }) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.actionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  left: { flex: 1 },
  title: { ...typography.h3, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.muted, marginTop: 2 },
  action: { paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { ...typography.bodySmall, color: colors.primary, fontWeight: '700' },
});
