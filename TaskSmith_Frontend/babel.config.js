module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Required for Reanimated v3/v4
      "react-native-reanimated/plugin",
    ],
  };
};
