/**
 * Mock for react-native in Jest tests.
 */
export const Alert = {
  alert: jest.fn(),
  prompt: jest.fn(),
};

export const View = 'View';
export const Text = 'Text';
export const Modal = 'Modal';
export const TouchableOpacity = 'TouchableOpacity';

export const StyleSheet = {
  create: (styles: Record<string, unknown>) => styles,
};

/** Present so ensurePrimerNativeModule() passes in tests when using Primer checkout flow. */
export const NativeModules = {
  NativePrimer: {},
};
