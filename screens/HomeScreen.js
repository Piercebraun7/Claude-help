import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getResidentContext, listUnitScans } from '../lib/queries';
import Card from '../components/Card';
import { LoadingState, ErrorState } from '../components/ScreenState';
import { colors, radius, spacing, status as statusTheme } from '../lib/theme';

const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const RECENT_NIGHTS = 14;

function nextServiceDays(schedule) {
  if (!schedule || typeof schedule !== 'object') return null;
  const days = Object.keys(schedule)
    .filter((day) => schedule[day])
    .map((day) => DAY_LABELS[day.toLowerCase()] ?? day);
  return days.length ? days.join(', ') : null;
}

function relativeDay(value) {
  if (!value) return null;
  const then = new Date(value);
  const now = new Date();
  const startOfThen = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayDiff = Math.round((startOfNow - startOfThen) / (1000 * 60 * 60 * 24));
  const time = then.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (dayDiff <= 0) return `Today at ${time}`;
  if (dayDiff === 1) return `Yesterday at ${time}`;
  if (dayDiff < 7) return `${dayDiff} days ago`;
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function overallStatus(recentScans) {
  if (recentScans.some((s) => s.violation)) return 'action';
  if (recentScans.some((s) => s.was_serviced === false || s.loose_trash || s.cardboard || s.unserviceable)) {
    return 'heads_up';
  }
  return 'good';
}

export default function HomeScreen({ navigation }) {
  const { profile, signOut } = useAuth();
  const unitNumber = profile.units?.unit_number;
  const [state, setState] = useState({ loading: true, error: null, property: null, unit: null, scans: [] });

  const load = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.all([
      getResidentContext(profile.property_id, profile.unit_id),
      unitNumber ? listUnitScans(profile.property_id, unitNumber, RECENT_NIGHTS) : Promise.resolve([]),
    ])
      .then(([{ property, unit }, scans]) => setState({ loading: false, error: null, property, unit, scans }))
      .catch((e) => setState((s) => ({ ...s, loading: false, error: e.message })));
  };

  useEffect(load, [profile.unit_id, profile.property_id, unitNumber]);

  if (state.loading) return <LoadingState label="Loading your home..." />;
  if (state.error) return <ErrorState message={state.error} />;

  const key = overallStatus(state.scans);
  const theme = statusTheme[key];
  const serviceDays = nextServiceDays(state.property.service_schedule);
  const lastServiced = relativeDay(state.scans[0]?.start_time);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.primary} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>{state.property.name}</Text>
            <Text style={styles.greeting}>Unit {state.unit.unit_number}</Text>
          </View>
          <Pressable style={styles.signOutButton} onPress={signOut} hitSlop={12}>
            <Ionicons name="log-out-outline" size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.navigate('Scans')}>
          <View style={[styles.heroCard, { backgroundColor: theme.bg }]}>
            <Text style={styles.heroEmoji}>{theme.emoji}</Text>
            <Text style={[styles.heroLabel, { color: theme.fg }]}>{theme.label}</Text>
            <Text style={[styles.heroHint, { color: theme.fg }]}>
              {key === 'good' ? 'Nothing needs your attention right now.' : 'Tap to see your recent photos.'}
            </Text>
          </View>
        </Pressable>

        <View style={styles.row}>
          <Card style={[styles.card, styles.halfCard]}>
            <View style={styles.iconCircle}>
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.cardLabel}>Last serviced</Text>
            <Text style={styles.cardValue}>{lastServiced ?? 'No record yet'}</Text>
          </Card>

          <Card style={[styles.card, styles.halfCard]}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.cardLabel}>Next pickup</Text>
            <Text style={styles.cardValue}>{serviceDays ?? 'Not set'}</Text>
          </Card>
        </View>

        {state.unit.strike_count > 0 ? (
          <Card style={[styles.card, styles.warningCard]}>
            <View style={styles.rowBetween}>
              <View style={styles.iconCircleWarning}>
                <Ionicons name="warning-outline" size={20} color={colors.warning} />
              </View>
              <Text style={[styles.cardValue, { color: colors.warning }]}>
                {state.unit.strike_count} {state.unit.strike_count === 1 ? 'strike' : 'strikes'} on file
              </Text>
            </View>
            <Text style={styles.cardHint}>Repeated issues can lead to fees, check your lease for details.</Text>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  greeting: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 2 },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  heroEmoji: { fontSize: 44 },
  heroLabel: { fontSize: 22, fontWeight: '800' },
  heroHint: { fontSize: 14, textAlign: 'center' },
  row: { flexDirection: 'row', gap: spacing.sm },
  card: { gap: spacing.xs },
  halfCard: { flex: 1 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconCircleWarning: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.warningSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  cardValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardHint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  warningCard: { backgroundColor: colors.warningSoft },
});
