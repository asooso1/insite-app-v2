/**
 * Babel Configuration
 *
 * Expo SDK 54 + Tamagui 설정 (Expo Go 호환)
 * Reanimated 제거 - React Native Animated API 사용
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Tamagui 플러그인
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './src/theme/tamagui.config.ts',
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
    ],
  };
};
