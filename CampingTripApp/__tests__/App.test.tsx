/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import App from '../App';
import { useSession } from '../hooks/useSession';
import { useFamily } from '../hooks/useFamily';

jest.mock('../hooks/useChecklist', () => ({
  useChecklist: () => ({
    items: [],
    loading: false,
    setItemState: jest.fn(),
  }),
}));

jest.mock('../hooks/useTrips', () => ({
  useTrips: () => ({
    trips: [],
    loading: false,
    refresh: jest.fn(),
  }),
}));

jest.mock('../hooks/useJoinTrip', () => ({
  useJoinTrip: () => ({
    joinTrip: jest.fn(),
    joining: false,
    error: null,
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

jest.mock('../lib/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('../hooks/useSession', () => ({
  useSession: jest.fn(),
}));

jest.mock('../hooks/useFamily', () => ({
  useFamily: jest.fn(),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseFamily = useFamily as jest.MockedFunction<typeof useFamily>;

function renderedText(root: ReactTestRenderer.ReactTestInstance): string {
  return root
    .findAllByType(Text)
    .map(node => node.props.children)
    .join(' | ');
}

describe('App', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('shows the trip list once signed in with a family', async () => {
    mockUseSession.mockReturnValue({
      // @ts-expect-error partial Session for testing
      session: { user: { id: 'user-1' } },
      loading: false,
    });
    mockUseFamily.mockReturnValue({
      family: {
        id: 'family-1',
        name: 'Demo Family',
        created_by: 'user-1',
        created_at: '2026-01-01T00:00:00.000Z',
      },
      loading: false,
      createFamily: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });

    expect(renderedText(renderer!.root)).toContain(
      'No trips yet — join one below.',
    );
  });

  test('shows the sign-in screen when there is no session', async () => {
    mockUseSession.mockReturnValue({ session: null, loading: false });
    mockUseFamily.mockReturnValue({
      family: null,
      loading: false,
      createFamily: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });

    expect(renderedText(renderer!.root)).toContain('Sign in');
  });

  test('shows the create-family screen for a signed-in user with no family', async () => {
    mockUseSession.mockReturnValue({
      // @ts-expect-error partial Session for testing
      session: { user: { id: 'user-1' } },
      loading: false,
    });
    mockUseFamily.mockReturnValue({
      family: null,
      loading: false,
      createFamily: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });

    expect(renderedText(renderer!.root)).toContain('Set up your family');
  });
});
