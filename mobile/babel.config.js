module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // NOTE: react-native-reanimated/plugin is omitted because this project uses
    // React Native's built-in Animated API, not the Reanimated worklet API.
    // Add "react-native-reanimated/plugin" here if you import from react-native-reanimated.
  };
};
