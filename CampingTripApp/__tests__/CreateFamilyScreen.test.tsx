/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import CreateFamilyScreen from '../screens/family/CreateFamilyScreen';
import { Family } from '../types/models';

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

const family: Family = {
  id: 'family-1',
  name: 'The Van der Merwes',
  created_by: 'user-1',
  created_at: '2026-01-01T00:00:00.000Z',
};

describe('CreateFamilyScreen', () => {
  test('creates a family with the trimmed inputs', async () => {
    const createFamily = jest.fn().mockResolvedValue(family);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <CreateFamilyScreen createFamily={createFamily} />,
      );
    });

    const [familyNameInput, displayNameInput] = renderer!.root.findAllByType(
      TextInput,
    );
    ReactTestRenderer.act(() => {
      familyNameInput.props.onChangeText(' The Van der Merwes ');
      displayNameInput.props.onChangeText(' Clinton ');
    });

    await pressSubmit(renderer!.root);

    expect(createFamily).toHaveBeenCalledWith(
      'The Van der Merwes',
      'Clinton',
    );
  });

  test('shows a validation error when fields are empty', async () => {
    const createFamily = jest.fn();

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <CreateFamilyScreen createFamily={createFamily} />,
      );
    });

    await pressSubmit(renderer!.root);

    expect(createFamily).not.toHaveBeenCalled();
    expect(renderedText(renderer!.root)).toContain(
      'Please fill in both fields.',
    );
  });

  test('shows an error message when creation fails', async () => {
    const createFamily = jest.fn().mockResolvedValue(null);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <CreateFamilyScreen createFamily={createFamily} />,
      );
    });

    const [familyNameInput, displayNameInput] = renderer!.root.findAllByType(
      TextInput,
    );
    ReactTestRenderer.act(() => {
      familyNameInput.props.onChangeText('The Van der Merwes');
      displayNameInput.props.onChangeText('Clinton');
    });

    await pressSubmit(renderer!.root);

    expect(renderedText(renderer!.root)).toContain(
      'Could not create your family. Please try again.',
    );
  });
});
