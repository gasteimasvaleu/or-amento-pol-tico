import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.238c6c3fcd3d4924bcd9404c97bcf042',
  appName: 'politico-controle-facil',
  webDir: 'dist',
  server: {
    url: 'https://238c6c3f-cd3d-4924-bcd9-404c97bcf042.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#000000',
    scheme: 'politico-controle-facil',
  },
};

export default config;
