import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../lib/theme';

export function LoadingState({ label = 'Loading...' }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>Couldn't load this</Text>
      <Text style={styles.muted}>{message}</Text>
    </View>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xs,
  },
  muted: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
});
