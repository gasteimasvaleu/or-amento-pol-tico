import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.mandatointeligente.app',
  appName: 'Mandato Intelligence',
  webDir: 'dist',
  server: {
    url: 'https://app.mandatointeligente.app?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#000000',
    scheme: 'Mandato Intelligence',
  },
};

export default config;
