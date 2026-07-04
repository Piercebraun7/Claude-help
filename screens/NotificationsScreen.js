import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getNotificationSettings, listNotificationActivity } from '../lib/queries';
import Card from '../components/Card';
import { LoadingState, ErrorState } from '../components/ScreenState';
import { colors, spacing } from '../lib/theme';

const EVENT_LABELS = {
  flag_alert: 'Flag alert',
  schedule_reminder: 'Schedule reminder',
  service_request_submitted: 'Service request update',
};

const SETTINGS_COPY = [
  { key: 'flag_alerts_enabled', label: 'Flag alerts', hint: 'Loose trash and other issues at your door' },
  { key: 'schedule_reminders_enabled', label: 'Schedule reminders', hint: 'Upcoming pickup days' },
  { key: 'ad_hoc_updates_enabled', label: 'Ad hoc updates', hint: 'One off announcements from your property' },
  { key: 'email_enabled', label: 'Email', hint: 'Send the above by email as well as push' },
];

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function NotificationsScreen() {
  const { profile } = useAuth();
  const [activity, setActivity] = useState(null);
  const [settings, setSettings] = useState(null);
  const [localSettings, setLocalSettings] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([listNotificationActivity(profile.user_id), getNotificationSettings(profile.user_id)])
      .then(([activityRows, settingsRow]) => {
        setActivity(activityRows);
        setSettings(settingsRow);
        setLocalSettings(settingsRow);
      })
      .catch((e) => setError(e.message));
  }, [profile.user_id]);

  if (error) return <ErrorState message={error} />;
  if (!activity || settings === undefined) return <LoadingState label="Loading notifications..." />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={activity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <Text style={styles.title}>Alerts</Text>

            <Card style={styles.settingsCard}>
              <Text style={styles.settingsTitle}>Preferences</Text>
              <Text style={styles.settingsHint}>Design preview: toggles here don't save yet.</Text>
              {SETTINGS_COPY.map(({ key, label, hint }) => (
                <View key={key} style={styles.settingRow}>
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>{label}</Text>
                    <Text style={styles.settingSub}>{hint}</Text>
                  </View>
                  <Switch
                    value={!!localSettings?.[key]}
                    onValueChange={(value) => setLocalSettings((s) => ({ ...s, [key]: value }))}
                    trackColor={{ true: colors.primary }}
                  />
                </View>
              ))}
            </Card>

            <Text style={styles.sectionLabel}>Recent activity</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications sent yet.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.activityCard}>
            <Text style={styles.activityTitle}>{EVENT_LABELS[item.event_type] ?? item.activity_type}</Text>
            <Text style={styles.activityMeta}>
              {item.channel} · {item.status} · {formatDateTime(item.created_at)}
            </Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  headerArea: { gap: spacing.md, marginBottom: spacing.sm },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  settingsCard: { gap: spacing.sm },
  settingsTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  settingsHint: { fontSize: 12, color: colors.textMuted, marginTop: -spacing.xs },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 14, color: colors.text, fontWeight: '500' },
  settingSub: { fontSize: 12, color: colors.textMuted },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  activityCard: { gap: 4 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  activityMeta: { fontSize: 12, color: colors.textMuted, textTransform: 'capitalize' },
  emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.lg },
});
