import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../app/(auth)/login';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: object }) => (
      <View style={style}>{children}</View>
    ),
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock the auth store
const mockSignInWithPhone = jest.fn();
jest.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    signInWithPhone: mockSignInWithPhone,
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithPhone.mockResolvedValue({ error: null });
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    expect(getByText('Chopsticks')).toBeTruthy();
    expect(getByText('Find your next meal buddy')).toBeTruthy();
    expect(getByText('Phone Number')).toBeTruthy();
    expect(getByText('+84')).toBeTruthy();
    expect(getByPlaceholderText('Enter your phone')).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
  });

  it('allows typing in the phone input', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    const input = getByPlaceholderText('Enter your phone');

    fireEvent.changeText(input, '0912345678');

    expect(input.props.value).toBe('0912345678');
  });

  it('shows error when phone number is too short', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const input = getByPlaceholderText('Enter your phone');
    const button = getByText('Continue');

    fireEvent.changeText(input, '123');
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText('Please enter a valid phone number')).toBeTruthy();
    });
  });

  it('calls signInWithPhone with formatted number when valid', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const input = getByPlaceholderText('Enter your phone');
    const button = getByText('Continue');

    fireEvent.changeText(input, '0912345678');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockSignInWithPhone).toHaveBeenCalledWith('+84912345678');
    });
  });

  it('shows loading state when submitting', async () => {
    // Make the mock take time to resolve
    mockSignInWithPhone.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );

    const { getByPlaceholderText, getByText, queryByText } = render(<LoginScreen />);

    const input = getByPlaceholderText('Enter your phone');
    const button = getByText('Continue');

    fireEvent.changeText(input, '0912345678');
    fireEvent.press(button);

    await waitFor(() => {
      expect(queryByText('Sending...')).toBeTruthy();
    });
  });

  it('displays error message on auth failure', async () => {
    mockSignInWithPhone.mockResolvedValue({
      error: { message: 'Invalid phone number' },
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const input = getByPlaceholderText('Enter your phone');
    const button = getByText('Continue');

    fireEvent.changeText(input, '0912345678');
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText('Invalid phone number')).toBeTruthy();
    });
  });

  it('handles phone numbers starting with + correctly', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    const input = getByPlaceholderText('Enter your phone');
    const button = getByText('Continue');

    fireEvent.changeText(input, '+84912345678');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockSignInWithPhone).toHaveBeenCalledWith('+84912345678');
    });
  });
});
