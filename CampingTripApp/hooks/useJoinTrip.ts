import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trip } from '../types/models';

interface UseJoinTripResult {
  joinTrip: (inviteCode: string, familyId: string) => Promise<Trip | null>;
  joining: boolean;
  error: string | null;
}

export function useJoinTrip(): UseJoinTripResult {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinTrip = useCallback(
    async (inviteCode: string, familyId: string) => {
      setJoining(true);
      setError(null);

      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (tripError || !trip) {
        setError('No trip found for that invite code.');
        setJoining(false);
        return null;
      }

      const { error: memberError } = await supabase
        .from('trip_members')
        .upsert(
          { trip_id: trip.id, family_id: familyId },
          { onConflict: 'trip_id,family_id' },
        );

      if (memberError) {
        setError(memberError.message);
        setJoining(false);
        return null;
      }

      setJoining(false);
      return trip;
    },
    [],
  );

  return { joinTrip, joining, error };
}
