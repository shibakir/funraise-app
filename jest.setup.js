// Mock fetch for Apollo Client
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
  })
);

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  Link: ({ children, ...props }) => children,
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
  ImagePickerResult: {},
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

// Mock React Native TurboModules
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn(() => ({
    getConstants: jest.fn(() => ({})),
  })),
}));

// Mock Settings Manager
jest.mock('react-native/Libraries/Settings/Settings.ios', () => ({
  get: jest.fn(),
  set: jest.fn(),
  watchKeys: jest.fn(),
  clearWatch: jest.fn(),
}));

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  RN.Alert = {
    alert: jest.fn(),
  };
  
  RN.Dimensions = {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  RN.Settings = {
    get: jest.fn(),
    set: jest.fn(),
    watchKeys: jest.fn(),
    clearWatch: jest.fn(),
  };
  
  return RN;
});


// Global test utils
global.__DEV__ = true;

// Silence the warning about act() wrapping
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is no longer supported')) {
      return;
    }
    return originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
}); 