import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
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

function InviteSection({ trip }: { trip: Trip }) {
  const [copied, setCopied] = useState(false);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
    };
  }, []);

  const handleCopy = () => {
    Clipboard.setString(trip.invite_code);
    setCopied(true);
    copiedTimeout.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    Share.share({
      message: `Join our camping trip "${trip.name}" — use invite code ${trip.invite_code} in the app.`,
    });
  };

  return (
    <View style={styles.inviteSection}>
      <Text style={styles.inviteLabel}>Invite code</Text>
      <Text style={styles.inviteCode}>{trip.invite_code}</Text>
      <View style={styles.inviteActions}>
        <Pressable style={styles.inviteButton} onPress={handleCopy}>
          <Text style={styles.inviteButtonText}>
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </Pressable>
        <Pressable style={styles.inviteButton} onPress={handleShare}>
          <Text style={styles.inviteButtonText}>Share</Text>
        </Pressable>
      </View>
    </View>
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

      <InviteSection trip={trip} />

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
  inviteSection: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  inviteLabel: { fontSize: 12, fontWeight: '600', color: '#666' },
  inviteCode: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  inviteActions: { flexDirection: 'row', marginTop: 12 },
  inviteButton: {
    backgroundColor: '#0a7',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  inviteButtonText: { color: '#fff', fontWeight: '600' },
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
