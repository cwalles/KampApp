import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTrip } from '../../hooks/useTrip';
import type { Trip } from '../../types/models';

const STATUS_LABEL: Record<Trip['status'], string> = {
  active: 'Active',
  settled: 'Settled',
  archived: 'Archived',
};

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function ModuleLink({
  label,
  onPress,
  comingSoon,
}: {
  label: string;
  onPress?: () => void;
  comingSoon?: boolean;
}) {
  return (
    <Pressable
      style={styles.moduleRow}
      onPress={onPress}
      disabled={comingSoon}
    >
      <Text style={styles.moduleLabel}>{label}</Text>
      {comingSoon && <Text style={styles.comingSoon}>Coming soon</Text>}
    </Pressable>
  );
}

export default function TripHomeScreen({ route, navigation }: any) {
  const { tripId } = route.params;
  const { trip, loading } = useTrip(tripId);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading trip…</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text>Trip not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{trip.name}</Text>
      {trip.destination && (
        <Text style={styles.destination}>{trip.destination}</Text>
      )}
      <Text style={styles.dates}>
        {formatDateRange(trip.start_date, trip.end_date)}
      </Text>
      <Text style={styles.status}>{STATUS_LABEL[trip.status]}</Text>

      <View style={styles.modules}>
        <ModuleLink
          label="Packing Checklist"
          onPress={() =>
            navigation.navigate('PackingChecklist', { tripId })
          }
        />
        <ModuleLink label="Meal Planner" comingSoon />
        <ModuleLink label="Ledger" comingSoon />
        <ModuleLink label="Route Planner" comingSoon />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 24, fontWeight: '700' },
  destination: { fontSize: 16, color: '#666', marginTop: 4 },
  dates: { fontSize: 14, color: '#666', marginTop: 4 },
  status: { fontSize: 12, fontWeight: '600', color: '#0a7', marginTop: 8 },
  modules: { marginTop: 24 },
  moduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  moduleLabel: { fontSize: 16, fontWeight: '600' },
  comingSoon: { fontSize: 12, color: '#999' },
});
