// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    default: {
      call: () => {},
      createAnimatedComponent: (component) => component,
      View,
      Text: require('react-native').Text,
      Image: require('react-native').Image,
      ScrollView: require('react-native').ScrollView,
      FlatList: require('react-native').FlatList,
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    withDelay: jest.fn((_, value) => value),
    withSequence: jest.fn((...values) => values[0]),
    withRepeat: jest.fn((value) => value),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      bezier: jest.fn(),
    },
    createAnimatedComponent: (component) => component,
    View: require('react-native').View,
  };
});
