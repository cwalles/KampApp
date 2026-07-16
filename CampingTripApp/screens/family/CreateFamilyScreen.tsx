import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Family } from '../../types/models';

interface CreateFamilyScreenProps {
  createFamily: (name: string, displayName: string) => Promise<Family | null>;
}

export default function CreateFamilyScreen({
  createFamily,
}: CreateFamilyScreenProps) {
  const [familyName, setFamilyName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!familyName.trim() || !displayName.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const family = await createFamily(familyName.trim(), displayName.trim());
    setSubmitting(false);
    if (!family) {
      setError('Could not create your family. Please try again.');
    }
    // On success the parent's family state updates and swaps this screen
    // out for the trip list — no navigation call needed here.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set up your family</Text>
      <Text style={styles.subtitle}>
        Your family is the unit trips, packing, and the shared ledger are
        organised around.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Family name (e.g. The Van der Merwes)"
        value={familyName}
        onChangeText={setFamilyName}
      />
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <Pressable
        style={styles.button}
        onPress={handleCreate}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create family</Text>
        )}
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0a7',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#c00', marginTop: 12, fontSize: 12 },
});
