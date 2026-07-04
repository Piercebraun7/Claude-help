import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../lib/theme';

const REQUEST_TYPES = ['Bulk item pickup', 'Missed service', 'Bin repair', 'Other'];

export default function NewRequestScreen({ navigation }) {
  const [type, setType] = useState(REQUEST_TYPES[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // Design preview only, intentionally not wired to Supabase.
    // This app never writes data. See CLAUDE.md.
    Alert.alert(
      'Design preview',
      'This screen shows the intended flow. Submitting isn’t wired up in this prototype.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Request type</Text>
        <View style={styles.typeRow}>
          {REQUEST_TYPES.map((option) => (
            <Pressable
              key={option}
              style={[styles.typeChip, option === type && styles.typeChipActive]}
              onPress={() => setType(option)}
            >
              <Text style={[styles.typeChipLabel, option === type && styles.typeChipLabelActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Details</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Tell us what's going on"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
        />

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitLabel}>Submit request</Text>
        </Pressable>
        <Text style={styles.disclaimer}>Design preview: submitting does not save anything.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginTop: spacing.sm },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipLabel: { fontSize: 13, color: colors.text },
  typeChipLabelActive: { color: colors.surface, fontWeight: '600' },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitLabel: { color: colors.surface, fontWeight: '700', fontSize: 15 },
  disclaimer: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
});
