/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import SignUpScreen from '../screens/auth/SignUpScreen';
import { signUp } from '../lib/auth';

jest.mock('../lib/auth', () => ({
  signUp: jest.fn(),
}));

const mockSignUp = signUp as jest.MockedFunction<typeof signUp>;

function renderedText(root: ReactTestRenderer.ReactTestInstance): string {
  return root
    .findAllByType(Text)
    .map(node => node.props.children)
    .join(' | ');
}

async function pressSubmit(root: ReactTestRenderer.ReactTestInstance) {
  const [button] = root.findAll(
    node => typeof node.props.onPress === 'function',
  );
  await ReactTestRenderer.act(async () => {
    await button.props.onPress();
  });
}

describe('SignUpScreen', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('submits trimmed email and password to signUp', async () => {
    mockSignUp.mockResolvedValue(null);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SignUpScreen navigation={{ navigate: jest.fn() }} />,
      );
    });

    const [emailInput, passwordInput] = renderer!.root.findAllByType(
      TextInput,
    );
    ReactTestRenderer.act(() => {
      emailInput.props.onChangeText(' new@example.com ');
      passwordInput.props.onChangeText('hunter2');
    });

    await pressSubmit(renderer!.root);

    expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'hunter2');
  });

  test('shows a confirmation message after a successful sign-up', async () => {
    mockSignUp.mockResolvedValue(null);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SignUpScreen navigation={{ navigate: jest.fn() }} />,
      );
    });

    const [emailInput] = renderer!.root.findAllByType(TextInput);
    ReactTestRenderer.act(() => {
      emailInput.props.onChangeText('new@example.com');
    });

    await pressSubmit(renderer!.root);

    expect(renderedText(renderer!.root)).toContain('Check your email');
  });

  test('shows an error message when sign-up fails', async () => {
    mockSignUp.mockResolvedValue('User already registered');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SignUpScreen navigation={{ navigate: jest.fn() }} />,
      );
    });

    await pressSubmit(renderer!.root);

    expect(renderedText(renderer!.root)).toContain('User already registered');
  });
});
