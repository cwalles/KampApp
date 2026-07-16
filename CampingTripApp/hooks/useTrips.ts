import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trip } from '../types/models';

interface UseTripsResult {
  trips: Trip[];
  loading: boolean;
  refresh: () => void;
}

export function useTrips(familyId: string): UseTripsResult {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trip_members')
      .select('trip:trips(*)')
      .eq('family_id', familyId);

    if (error) {
      console.error('Failed to load trips', error);
    } else {
      const rows = (data ?? []) as unknown as { trip: Trip }[];
      setTrips(rows.map(row => row.trip));
    }
    setLoading(false);
  }, [familyId]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return { trips, loading, refresh: fetchTrips };
}
