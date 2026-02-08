/**
 * Babel Configuration
 *
 * Expo SDK 54 + Tamagui + Reanimated 설정
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Tamagui 플러그인 (react-native-reanimated 전에 위치)
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './src/theme/tamagui.config.ts',
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
      // Reanimated 플러그인은 항상 마지막에 위치해야 함
      'react-native-reanimated/plugin',
    ],
  };
};
