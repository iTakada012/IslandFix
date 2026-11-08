import 'dotenv/config';

export default {
  expo: {
    name: "IslandFix",
    slug: "expo-go-villa-sample",
    version: "1.0.0",
    scheme: "expo-go-villa-sample",
    platforms: ["ios", "android", "web"],
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true
        }
      ],
      "expo-localization",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to attach photos to your reports",
          cameraPermission: "Allow $(PRODUCT_NAME) to take photos of problems you report"
        }
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission: "Allow $(PRODUCT_NAME) to add your location to a report"
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true
    },
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    extra: {
      API_URL: process.env.API_URL,
      SECRET_KEY: process.env.SECRET_KEY,
      VAR_NUMBER: process.env.VAR_NUMBER,
      VAR_BOOL: process.env.VAR_BOOL,
    }
  }
};
