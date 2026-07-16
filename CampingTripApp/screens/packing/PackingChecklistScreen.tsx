import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useChecklist } from '../../hooks/useChecklist';
import { ChecklistItem, ChecklistState } from '../../types/models';

const STATE_CYCLE: ChecklistState[] = ['not_packed', 'packed', 'at_camp', 'packed_home'];

const STATE_LABEL: Record<ChecklistState, string> = {
  not_packed: 'Not packed',
  packed: 'Packed',
  at_camp: 'At camp',
  packed_home: 'Packed home',
};

function nextState(current: ChecklistState): ChecklistState {
  const idx = STATE_CYCLE.indexOf(current);
  return STATE_CYCLE[(idx + 1) % STATE_CYCLE.length];
}

export default function PackingChecklistScreen({ route }: any) {
  const { tripId } = route.params;
  const { items, loading, setItemState } = useChecklist(tripId);

  const renderItem = ({ item }: { item: ChecklistItem }) => (
    <Pressable
      style={styles.row}
      onPress={() => setItemState(item.id, nextState(item.state))}
    >
      <View style={styles.rowText}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        {item.is_communal && (
          <Text style={styles.communal}>Communal — owner assigned</Text>
        )}
        {item.is_consumable && (
          <Text style={styles.consumable}>Check level before trip</Text>
        )}
      </View>
      <Text style={styles.state}>{STATE_LABEL[item.state]}</Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading checklist…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  rowText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  category: { fontSize: 12, color: '#666' },
  communal: { fontSize: 12, color: '#0a7' },
  consumable: { fontSize: 12, color: '#b8860b' },
  state: { fontSize: 14, fontWeight: '500', marginLeft: 12 },
});
