import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gigdrive.app',
  appName: 'GigDrive',
  webDir: 'dist',
  server: {
    // Uncomment for local dev on device:
    // url: 'http://192.168.1.x:5173',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0a0a0f',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0f',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  android: {
    backgroundColor: '#0a0a0f',
  },
  ios: {
    backgroundColor: '#0a0a0f',
    contentInset: 'automatic',
  },
};

export default config;
