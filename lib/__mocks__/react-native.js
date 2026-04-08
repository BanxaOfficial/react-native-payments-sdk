"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeModules = exports.StyleSheet = exports.TouchableOpacity = exports.Modal = exports.Text = exports.View = exports.Alert = void 0;
/**
 * Mock for react-native in Jest tests.
 */
exports.Alert = {
    alert: jest.fn(),
    prompt: jest.fn(),
};
exports.View = 'View';
exports.Text = 'Text';
exports.Modal = 'Modal';
exports.TouchableOpacity = 'TouchableOpacity';
exports.StyleSheet = {
    create: (styles) => styles,
};
/** Present so ensurePrimerNativeModule() passes in tests when using Primer checkout flow. */
exports.NativeModules = {
    NativePrimer: {},
};
