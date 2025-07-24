import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Cable Junction',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      launchAutoHide: true
    },
    StatusBar: {
      overlaysWebView: false,
      style: "DARK",
      backgroundColor: "#000000",
    },
  }
};

export default config;
