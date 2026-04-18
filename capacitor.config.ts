import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bikeroute.app',
  appName: 'BikeRoute',
  webDir: 'dist',
  server: {
    // Remove this block for production builds
    androidScheme: 'https',
  },
  plugins: {
    Geolocation: {
      // iOS: these descriptions appear in permission dialogs
    },
  },
  android: {
    // Enables background location (requires ACCESS_BACKGROUND_LOCATION in manifest)
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
