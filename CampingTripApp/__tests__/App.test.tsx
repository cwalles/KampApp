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

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
