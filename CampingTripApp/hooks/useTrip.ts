import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trip } from '../types/models';

interface UseTripResult {
  trip: Trip | null;
  loading: boolean;
}

export function useTrip(tripId: string): UseTripResult {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchTrip() {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (!isMounted) return;
      if (error) {
        console.error('Failed to load trip', error);
      } else {
        setTrip(data);
      }
      setLoading(false);
    }

    fetchTrip();

    return () => {
      isMounted = false;
    };
  }, [tripId]);

  return { trip, loading };
}
