import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_ISSUES } from '../lib/mockIssues';
import Card from '../components/Card';
import StatusPill from '../components/StatusPill';
import { colors, radius, spacing } from '../lib/theme';

const ISSUE_LABELS = {
  hole_in_bag: 'Hole in bag',
  bag_overflowing: 'Bag overflowing',
  ancillary_items_in_can: 'Extra items in can',
  hazardous_material: 'Hazardous material',
  other: 'Other',
};

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function IssuesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Issues</Text>
        <Text style={styles.subtitle}>Documented at your door by your service runner</Text>
        <View style={styles.previewBanner}>
          <Text style={styles.previewBannerText}>
            Sample data for this design preview. Resident accounts can't yet view their own issue photos, this
            needs an RLS policy from Alexander before it can go live.
          </Text>
        </View>
      </View>
      <FlatList
        data={MOCK_ISSUES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.photo} resizeMode="cover" />
            ) : null}
            <View style={styles.cardBody}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <StatusPill label={ISSUE_LABELS[item.status] ?? item.status} tone="warning" />
              </View>
              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, gap: spacing.xs },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted },
  previewBanner: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  previewBannerText: { fontSize: 12, color: colors.warning },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  card: { padding: 0, overflow: 'hidden' },
  photo: { width: '100%', height: 180, backgroundColor: colors.border },
  cardBody: { padding: spacing.md, gap: spacing.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text, flexShrink: 1 },
  description: { fontSize: 13, color: colors.textMuted },
  date: { fontSize: 12, color: colors.textMuted },
});
