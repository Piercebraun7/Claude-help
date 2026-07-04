import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { listFaqs } from '../lib/queries';
import Card from '../components/Card';
import { LoadingState, ErrorState, EmptyState } from '../components/ScreenState';
import { colors, spacing } from '../lib/theme';

export default function HelpScreen() {
  const { profile } = useAuth();
  const [faqs, setFaqs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listFaqs(profile.property_id).then(setFaqs).catch((e) => setError(e.message));
  }, [profile.property_id]);

  if (error) return <ErrorState message={error} />;
  if (!faqs) return <LoadingState label="Loading help articles..." />;
  if (faqs.length === 0) {
    return <EmptyState title="No FAQs yet" subtitle="Nothing has been published for your property." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Help</Text>
      <FlatList
        data={faqs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, padding: spacing.md, paddingBottom: 0 },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { gap: spacing.xs },
  question: { fontSize: 15, fontWeight: '600', color: colors.text },
  answer: { fontSize: 13, color: colors.textMuted },
});
