import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTrips } from '../../hooks/useTrips';
import { useJoinTrip } from '../../hooks/useJoinTrip';
import { signOut } from '../../lib/auth';
import { Trip } from '../../types/models';

export default function TripListScreen({ route, navigation }: any) {
  const { familyId } = route.params;
  const { trips, loading, refresh } = useTrips(familyId);
  const { joinTrip, joining, error } = useJoinTrip();
  const [inviteCode, setInviteCode] = useState('');

  const handleJoin = async () => {
    const code = inviteCode.trim();
    if (!code) return;

    const trip = await joinTrip(code, familyId);
    if (trip) {
      setInviteCode('');
      refresh();
      navigation.navigate('TripHome', { tripId: trip.id });
    }
  };

  const renderItem = ({ item }: { item: Trip }) => (
    <Pressable
      style={styles.row}
      onPress={() => navigation.navigate('TripHome', { tripId: item.id })}
    >
      <Text style={styles.name}>{item.name}</Text>
      {item.destination && (
        <Text style={styles.destination}>{item.destination}</Text>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <Text>Loading trips…</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No trips yet — join one below.</Text>
          }
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.joinSection}>
        <Text style={styles.joinLabel}>Join a trip</Text>
        <TextInput
          style={styles.input}
          placeholder="Invite code"
          autoCapitalize="none"
          value={inviteCode}
          onChangeText={setInviteCode}
        />
        <Pressable
          style={styles.joinButton}
          onPress={handleJoin}
          disabled={joining}
        >
          {joining ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.joinButtonText}>Join</Text>
          )}
        </Pressable>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <Pressable style={styles.signOutRow} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, flexGrow: 1 },
  empty: { textAlign: 'center', color: '#666', marginTop: 24 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  name: { fontSize: 16, fontWeight: '600' },
  destination: { fontSize: 12, color: '#666', marginTop: 2 },
  joinSection: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  joinLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  joinButton: {
    backgroundColor: '#0a7',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  joinButtonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#c00', marginTop: 8, fontSize: 12 },
  signOutRow: { padding: 16, alignItems: 'center' },
  signOutText: { color: '#999', fontSize: 13 },
});
