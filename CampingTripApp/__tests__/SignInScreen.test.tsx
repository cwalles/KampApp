/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import SignInScreen from '../screens/auth/SignInScreen';
import { signIn } from '../lib/auth';

jest.mock('../lib/auth', () => ({
  signIn: jest.fn(),
}));

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

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

function findPressableContaining(
  root: ReactTestRenderer.ReactTestInstance,
  text: string,
) {
  return root
    .findAll(node => typeof node.props.onPress === 'function')
    .find(node =>
      node.findAllByType(Text).some(t => t.props.children === text),
    )!;
}

describe('SignInScreen', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('submits trimmed email and password to signIn', async () => {
    mockSignIn.mockResolvedValue(null);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SignInScreen navigation={{ navigate: jest.fn() }} />,
      );
    });

    const [emailInput, passwordInput] = renderer!.root.findAllByType(
      TextInput,
    );
    ReactTestRenderer.act(() => {
      emailInput.props.onChangeText(' person@example.com ');
      passwordInput.props.onChangeText('hunter2');
    });

    await pressSubmit(renderer!.root);

    expect(mockSignIn).toHaveBeenCalledWith('person@example.com', 'hunter2');
  });

  test('shows an error message when sign-in fails', async () => {
    mockSignIn.mockResolvedValue('Invalid login credentials');

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SignInScreen navigation={{ navigate: jest.fn() }} />,
      );
    });

    await pressSubmit(renderer!.root);

    expect(renderedText(renderer!.root)).toContain(
      'Invalid login credentials',
    );
  });

  test('tapping the link navigates to sign up', () => {
    const navigate = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <SignInScreen navigation={{ navigate }} />,
      );
    });

    const link = findPressableContaining(
      renderer!.root,
      'Need an account? Sign up',
    );
    ReactTestRenderer.act(() => {
      link.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('SignUp');
  });
});
