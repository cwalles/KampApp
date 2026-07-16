/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../hooks/useChecklist', () => ({
  useChecklist: () => ({
    items: [],
    loading: false,
    setItemState: jest.fn(),
  }),
}));

jest.mock('../hooks/useTrip', () => ({
  useTrip: () => ({
    trip: {
      id: 'demo-trip',
      name: 'Demo Trip',
      destination: 'Drakensberg',
      start_date: '2026-01-01',
      end_date: '2026-01-05',
      organiser_family_id: 'family-1',
      kids_weighting: 0.5,
      invite_code: 'abc123',
      status: 'active',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    loading: false,
  }),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
