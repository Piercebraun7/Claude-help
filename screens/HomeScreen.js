import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getResidentContext } from '../lib/queries';
import { MOCK_ISSUES } from '../lib/mockIssues';
import Card from '../components/Card';
import StatusPill from '../components/StatusPill';
import { LoadingState, ErrorState } from '../components/ScreenState';
import { colors, spacing } from '../lib/theme';

function nextServiceDay(schedule) {
  if (!schedule || typeof schedule !== 'object') return null;
  const days = Object.keys(schedule).filter((day) => schedule[day]);
  return days.length ? days.join(', ') : null;
}

export default function HomeScreen() {
  const { profile, signOut } = useAuth();
  const [state, setState] = useState({ loading: true, error: null, property: null, unit: null });

  const load = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    getResidentContext(profile.property_id, profile.unit_id)
      .then(({ property, unit }) => setState({ loading: false, error: null, property, unit }))
      .catch((e) => setState((s) => ({ ...s, loading: false, error: e.message })));
  };

  useEffect(load, [profile.unit_id, profile.property_id]);

  if (state.loading) return <LoadingState label="Loading your home..." />;
  if (state.error) return <ErrorState message={state.error} />;

  // Sample data, see lib/mockIssues.js: residents can't yet read the real `issues`
  // table (no RLS policy grants it), so this count is illustrative, not live.
  const openIssueCount = MOCK_ISSUES.filter((i) => i.status !== 'other').length;
  const serviceDays = nextServiceDay(state.property.service_schedule);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.primary} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Unit {state.unit.unit_number}</Text>
            <Text style={styles.address}>{state.property.name}</Text>
          </View>
          <StatusPill
            label={state.unit.status}
            tone={state.unit.status === 'active' ? 'positive' : 'neutral'}
          />
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Next scheduled pickup</Text>
          <Text style={styles.cardValue}>{serviceDays ?? 'Not set for this property'}</Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>Flags on your unit</Text>
            <StatusPill
              label={openIssueCount === 0 ? 'All clear' : `${openIssueCount} recent`}
              tone={openIssueCount === 0 ? 'positive' : 'warning'}
            />
          </View>
          <Text style={styles.cardHint}>
            {openIssueCount === 0
              ? 'No documented issues at your door recently.'
              : 'See the Issues tab for photos and details.'}
          </Text>
          <Text style={styles.previewNote}>Sample data for this design preview, see Issues tab.</Text>
        </Card>

        {state.unit.strike_count > 0 ? (
          <Card style={[styles.card, styles.warningCard]}>
            <Text style={[styles.cardLabel, { color: colors.warning }]}>
              Strike count: {state.unit.strike_count}
            </Text>
            <Text style={styles.cardHint}>Repeated documented issues can lead to fees, check your lease terms.</Text>
          </Card>
        ) : null}

        <Text style={styles.switchLink} onPress={signOut}>
          Sign out
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 24, fontWeight: '700', color: colors.text },
  address: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  card: { gap: spacing.xs },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  cardValue: { fontSize: 18, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  cardHint: { fontSize: 13, color: colors.textMuted },
  previewNote: { fontSize: 11, color: colors.warning },
  warningCard: { backgroundColor: colors.warningSoft, borderColor: colors.warningSoft },
  switchLink: { textAlign: 'center', color: colors.primary, fontSize: 13, marginTop: spacing.md },
});
