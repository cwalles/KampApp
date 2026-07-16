/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import TripHomeScreen from '../screens/trip/TripHomeScreen';
import { useTrip } from '../hooks/useTrip';
import { Trip } from '../types/models';

jest.mock('../hooks/useTrip', () => ({
  useTrip: jest.fn(),
}));

const mockUseTrip = useTrip as jest.MockedFunction<typeof useTrip>;

const route = { params: { tripId: 'trip-1' } };

const trip: Trip = {
  id: 'trip-1',
  name: 'Drakensberg Long Weekend',
  destination: 'Royal Natal National Park',
  start_date: '2026-08-01',
  end_date: '2026-08-04',
  organiser_family_id: 'family-1',
  kids_weighting: 0.5,
  invite_code: 'abc123',
  status: 'active',
  created_at: '2026-01-01T00:00:00.000Z',
};

function renderedText(root: ReactTestRenderer.ReactTestInstance): string {
  return root
    .findAllByType(Text)
    .map(node => node.props.children)
    .join(' | ');
}

describe('TripHomeScreen', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('shows a loading state while the trip is fetching', () => {
    mockUseTrip.mockReturnValue({ trip: null, loading: true });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <TripHomeScreen route={route} navigation={{ navigate: jest.fn() }} />,
      );
    });

    expect(renderedText(renderer!.root)).toContain('Loading trip…');
  });

  test('shows a not-found state when the trip does not exist', () => {
    mockUseTrip.mockReturnValue({ trip: null, loading: false });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <TripHomeScreen route={route} navigation={{ navigate: jest.fn() }} />,
      );
    });

    expect(renderedText(renderer!.root)).toContain('Trip not found');
  });

  test('renders trip details and module links', () => {
    mockUseTrip.mockReturnValue({ trip, loading: false });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <TripHomeScreen route={route} navigation={{ navigate: jest.fn() }} />,
      );
    });

    const text = renderedText(renderer!.root);
    expect(text).toContain('Drakensberg Long Weekend');
    expect(text).toContain('Royal Natal National Park');
    expect(text).toContain('Active');
    expect(text).toContain('Packing Checklist');
    expect(text).toContain('Meal Planner');
    expect(text).toContain('Coming soon');
  });

  test('tapping Packing Checklist navigates with the tripId', () => {
    mockUseTrip.mockReturnValue({ trip, loading: false });
    const navigate = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <TripHomeScreen route={route} navigation={{ navigate }} />,
      );
    });

    const [packingRow] = renderer!.root.findAll(
      node => typeof node.props.onPress === 'function',
    );

    ReactTestRenderer.act(() => {
      packingRow.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('PackingChecklist', {
      tripId: 'trip-1',
    });
  });
});
