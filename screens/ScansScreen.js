import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { listUnitScans } from '../lib/queries';
import Card from '../components/Card';
import StatusPill from '../components/StatusPill';
import { LoadingState, ErrorState, EmptyState } from '../components/ScreenState';
import { colors, spacing } from '../lib/theme';

function scanStatus(scan) {
  if (scan.violation) return { label: 'Flagged', tone: 'danger' };
  if (scan.was_serviced === false) return { label: 'Not serviced', tone: 'warning' };
  if (scan.loose_trash || scan.cardboard || scan.unserviceable) return { label: 'Noted', tone: 'warning' };
  return { label: 'All clear', tone: 'positive' };
}

function formatScanDate(value) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scanDay = new Date(value + 'T00:00:00');
  const dayDiff = Math.round((today - scanDay) / (1000 * 60 * 60 * 24));
  if (dayDiff === 0) return 'Last night';
  if (dayDiff === 1) return 'Two nights ago';
  return scanDay.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function ScansScreen() {
  const { profile } = useAuth();
  const [scans, setScans] = useState(null);
  const [error, setError] = useState(null);
  const unitNumber = profile.units?.unit_number;

  useEffect(() => {
    if (!unitNumber) {
      setError('No unit number on file for this account.');
      return;
    }
    listUnitScans(profile.property_id, unitNumber).then(setScans).catch((e) => setError(e.message));
  }, [profile.property_id, unitNumber]);

  if (error) return <ErrorState message={error} />;
  if (!scans) return <LoadingState label="Loading your photos..." />;
  if (scans.length === 0) {
    return <EmptyState title="No photos yet" subtitle="Nothing has been scanned at your door yet." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your door, every night</Text>
        <Text style={styles.subtitle}>A photo from your runner every time we stop by</Text>
      </View>
      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const { label, tone } = scanStatus(item);
          return (
            <Card style={styles.card}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.photo} resizeMode="cover" />
              ) : null}
              <View style={styles.cardBody}>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{formatScanDate(item.scan_date)}</Text>
                  <StatusPill label={label} tone={tone} />
                </View>
                {item.ai_description ? <Text style={styles.description}>{item.ai_description}</Text> : null}
                {item.trash_bag_count > 0 ? (
                  <Text style={styles.meta}>
                    {item.trash_bag_count} {item.trash_bag_count === 1 ? 'bag' : 'bags'} picked up
                  </Text>
                ) : null}
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, gap: spacing.xs },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  card: { padding: 0, overflow: 'hidden' },
  photo: { width: '100%', height: 200, backgroundColor: colors.border },
  cardBody: { padding: spacing.md, gap: spacing.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, flexShrink: 1 },
  description: { fontSize: 13, color: colors.textMuted },
  meta: { fontSize: 12, color: colors.text, fontWeight: '600' },
});
