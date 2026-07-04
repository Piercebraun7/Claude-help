import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { listResidentServiceRequests } from '../lib/queries';
import Card from '../components/Card';
import StatusPill from '../components/StatusPill';
import { LoadingState, ErrorState, EmptyState } from '../components/ScreenState';
import { colors, radius, spacing } from '../lib/theme';

const STATUS_TONE = {
  draft: 'neutral',
  submitted: 'warning',
  in_progress: 'warning',
  completed: 'positive',
  cancelled: 'danger',
};

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function RequestsScreen({ navigation }) {
  const { profile } = useAuth();
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    listResidentServiceRequests(profile.user_id).then(setRequests).catch((e) => setError(e.message));
  };

  useEffect(load, [profile.user_id]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Service requests</Text>
          <Text style={styles.subtitle}>Things you've asked us to handle</Text>
        </View>
        <Pressable style={styles.newButton} onPress={() => navigation.navigate('NewRequest')}>
          <Text style={styles.newButtonLabel}>New</Text>
        </Pressable>
      </View>

      {error ? (
        <ErrorState message={error} />
      ) : !requests ? (
        <LoadingState label="Loading requests..." />
      ) : requests.length === 0 ? (
        <EmptyState title="No requests yet" subtitle="Tap New to see how submitting one would look." />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.request_type}</Text>
                <StatusPill label={item.status.replace('_', ' ')} tone={STATUS_TONE[item.status] ?? 'neutral'} />
              </View>
              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              <Text style={styles.date}>
                {item.preferred_service_date
                  ? `Preferred: ${formatDate(item.preferred_service_date)}`
                  : `Submitted ${formatDate(item.created_at)}`}
              </Text>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted },
  newButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  newButtonLabel: { color: colors.surface, fontWeight: '600', fontSize: 13 },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  card: { gap: spacing.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text, textTransform: 'capitalize', flexShrink: 1 },
  description: { fontSize: 13, color: colors.textMuted },
  date: { fontSize: 12, color: colors.textMuted },
});
