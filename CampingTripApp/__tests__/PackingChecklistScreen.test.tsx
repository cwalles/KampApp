/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import PackingChecklistScreen from '../screens/packing/PackingChecklistScreen';
import { useChecklist } from '../hooks/useChecklist';
import { ChecklistItem } from '../types/models';

jest.mock('../hooks/useChecklist', () => ({
  useChecklist: jest.fn(),
}));

const mockUseChecklist = useChecklist as jest.MockedFunction<typeof useChecklist>;

const route = { params: { tripId: 'trip-1' } };

function renderedText(root: ReactTestRenderer.ReactTestInstance): string {
  return root
    .findAllByType(Text)
    .map(node => node.props.children)
    .join(' | ');
}

describe('PackingChecklistScreen', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('shows a loading state while the checklist is fetching', () => {
    mockUseChecklist.mockReturnValue({
      items: [],
      loading: true,
      setItemState: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <PackingChecklistScreen route={route} />,
      );
    });

    expect(renderedText(renderer!.root)).toContain('Loading checklist…');
  });

  test('renders checklist items with communal and consumable badges', () => {
    const items: ChecklistItem[] = [
      {
        id: '1',
        trip_id: 'trip-1',
        gear_item_id: null,
        family_id: null,
        name: 'Gas bottle',
        category: 'Braai/Potjie',
        is_communal: true,
        owner_family_id: 'family-1',
        is_consumable: true,
        state: 'not_packed',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ];
    mockUseChecklist.mockReturnValue({
      items,
      loading: false,
      setItemState: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <PackingChecklistScreen route={route} />,
      );
    });

    const text = renderedText(renderer!.root);
    expect(text).toContain('Gas bottle');
    expect(text).toContain('Braai/Potjie');
    expect(text).toContain('Communal — owner assigned');
    expect(text).toContain('Check level before trip');
    expect(text).toContain('Not packed');
  });

  test('tapping a row advances it to the next checklist state', () => {
    const setItemState = jest.fn();
    const items: ChecklistItem[] = [
      {
        id: '1',
        trip_id: 'trip-1',
        gear_item_id: null,
        family_id: 'family-1',
        name: 'Tent',
        category: 'Shelter',
        is_communal: false,
        owner_family_id: null,
        is_consumable: false,
        state: 'packed',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ];
    mockUseChecklist.mockReturnValue({ items, loading: false, setItemState });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <PackingChecklistScreen route={route} />,
      );
    });

    const row = renderer!.root.findAll(
      node => typeof node.props.onPress === 'function',
    )[0];

    ReactTestRenderer.act(() => {
      row.props.onPress();
    });

    expect(setItemState).toHaveBeenCalledWith('1', 'at_camp');
  });
});
