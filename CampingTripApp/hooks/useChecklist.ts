import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChecklistItem, ChecklistState } from '../types/models';

interface UseChecklistResult {
  items: ChecklistItem[];
  loading: boolean;
  setItemState: (id: string, state: ChecklistState) => Promise<void>;
}

export function useChecklist(tripId: string): UseChecklistResult {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchItems() {
      setLoading(true);
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (!isMounted) return;
      if (error) {
        console.error('Failed to load checklist items', error);
      } else {
        setItems(data ?? []);
      }
      setLoading(false);
    }

    fetchItems();

    // Keep the checklist in sync as other trip members (families) tick items.
    const channel = supabase
      .channel(`checklist_items:trip_id=eq.${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checklist_items',
          filter: `trip_id=eq.${tripId}`,
        },
        payload => {
          if (!isMounted) return;
          setItems(current => {
            if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as Partial<ChecklistItem>).id;
              return current.filter(item => item.id !== deletedId);
            }
            const updated = payload.new as ChecklistItem;
            const exists = current.some(item => item.id === updated.id);
            return exists
              ? current.map(item => (item.id === updated.id ? updated : item))
              : [...current, updated];
          });
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  const setItemState = useCallback(async (id: string, state: ChecklistState) => {
    setItems(current =>
      current.map(item => (item.id === id ? { ...item, state } : item)),
    );

    const { error } = await supabase
      .from('checklist_items')
      .update({ state })
      .eq('id', id);

    if (error) {
      console.error('Failed to update checklist item state', error);
    }
  }, []);

  return { items, loading, setItemState };
}
