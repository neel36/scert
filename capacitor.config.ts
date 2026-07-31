import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cgboard.scert',
  appName: 'BOOKS AND NOTES CG BOARD',
  webDir: 'public',
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: '#0f172a'
  }
};

export default config;
