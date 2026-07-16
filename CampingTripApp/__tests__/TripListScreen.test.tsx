/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import TripListScreen from '../screens/trip/TripListScreen';
import { useTrips } from '../hooks/useTrips';
import { useJoinTrip } from '../hooks/useJoinTrip';
import { Trip } from '../types/models';

jest.mock('../hooks/useTrips', () => ({
  useTrips: jest.fn(),
}));

jest.mock('../hooks/useJoinTrip', () => ({
  useJoinTrip: jest.fn(),
}));

const mockUseTrips = useTrips as jest.MockedFunction<typeof useTrips>;
const mockUseJoinTrip = useJoinTrip as jest.MockedFunction<typeof useJoinTrip>;

const route = { params: { familyId: 'family-1' } };

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

async function pressJoin(root: ReactTestRenderer.ReactTestInstance) {
  const [joinButton] = root.findAll(
    node => typeof node.props.onPress === 'function',
  );
  await ReactTestRenderer.act(async () => {
    await joinButton.props.onPress();
  });
}

describe('TripListScreen', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('shows a loading state while trips are fetching', () => {
    mockUseTrips.mockReturnValue({ trips: [], loading: true, refresh: jest.fn() });
    mockUseJoinTrip.mockReturnValue({
      joinTrip: jest.fn(),
      joining: false,
      error: null,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <TripListScreen route={route} navigation={{ navigate: jest.fn() }} />,
      );
    });

    expect(renderedText(renderer!.root)).toContain('Loading trips…');
  });

  test('shows an empty state when the family has no trips', () => {
    mockUseTrips.mockReturnValue({ trips: [], loading: false, refresh: jest.fn() });
    mockUseJoinTrip.mockReturnValue({
      joinTrip: jest.fn(),
      joining: false,
      error: null,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <TripListScreen route={route} navigation={{ navigate: jest.fn() }} />,
      );
    });

    expect(renderedText(renderer!.root)).toContain(
      'No trips yet — join one below.',
    );
  });

  test('renders trips and navigates to TripHome on press', () => {
    mockUseTrips.mockReturnValue({
      trips: [trip],
      loading: false,
      refresh: jest.fn(),
    });
    mockUseJoinTrip.mockReturnValue({
      joinTrip: jest.fn(),
      joining: false,
      error: null,
    });
    const navigate = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <TripListScreen route={route} navigation={{ navigate }} />,
      );
    });

    expect(renderedText(renderer!.root)).toContain('Drakensberg Long Weekend');

    const [row] = renderer!.root.findAll(
      node => typeof node.props.onPress === 'function',
    );
    ReactTestRenderer.act(() => {
      row.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('TripHome', { tripId: 'trip-1' });
  });

  test('joining with an invite code navigates to the joined trip', async () => {
    mockUseTrips.mockReturnValue({
      trips: [],
      loading: false,
      refresh: jest.fn(),
    });
    const joinTrip = jest.fn().mockResolvedValue(trip);
    mockUseJoinTrip.mockReturnValue({ joinTrip, joining: false, error: null });
    const navigate = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <TripListScreen route={route} navigation={{ navigate }} />,
      );
    });

    const input = renderer!.root.findByType(TextInput);
    ReactTestRenderer.act(() => {
      input.props.onChangeText('abc123');
    });

    await pressJoin(renderer!.root);

    expect(joinTrip).toHaveBeenCalledWith('abc123', 'family-1');
    expect(navigate).toHaveBeenCalledWith('TripHome', { tripId: 'trip-1' });
  });

  test('shows an error message when joining fails', () => {
    mockUseTrips.mockReturnValue({
      trips: [],
      loading: false,
      refresh: jest.fn(),
    });
    mockUseJoinTrip.mockReturnValue({
      joinTrip: jest.fn(),
      joining: false,
      error: 'No trip found for that invite code.',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <TripListScreen route={route} navigation={{ navigate: jest.fn() }} />,
      );
    });

    expect(renderedText(renderer!.root)).toContain(
      'No trip found for that invite code.',
    );
  });
});
