import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cgboard.scert',
  appName: 'BOOKS AND NOTES CG BOARD',
  webDir: 'public',
  server: {
    url: 'https://scert.vercel.app',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: '#ffffff'
  }
};

export default config;
