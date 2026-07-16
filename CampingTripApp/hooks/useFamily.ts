import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Family } from '../types/models';

interface UseFamilyResult {
  family: Family | null;
  loading: boolean;
  createFamily: (name: string, displayName: string) => Promise<Family | null>;
}

export function useFamily(userId: string): UseFamilyResult {
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFamily = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('family_members')
      .select('family:families(*)')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Failed to load family', error);
      setFamily(null);
    } else {
      const rows = (data ?? []) as unknown as { family: Family }[];
      setFamily(rows[0]?.family ?? null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  const createFamily = useCallback(
    async (name: string, displayName: string) => {
      const { data: newFamily, error: familyError } = await supabase
        .from('families')
        .insert({ name, created_by: userId })
        .select()
        .single();

      if (familyError || !newFamily) {
        console.error('Failed to create family', familyError);
        return null;
      }

      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: newFamily.id,
          user_id: userId,
          role: 'adult',
          display_name: displayName,
        });

      if (memberError) {
        console.error('Failed to add family member', memberError);
        return null;
      }

      setFamily(newFamily);
      return newFamily;
    },
    [userId],
  );

  return { family, loading, createFamily };
}
