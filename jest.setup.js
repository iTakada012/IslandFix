/* eslint-env jest */
// In-memory AsyncStorage so stores can be tested without a device.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
