import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.mandatointeligente.app',
  appName: 'Mandato Intelligence',
  webDir: 'dist',
  server: {
    url: 'https://238c6c3f-cd3d-4924-bcd9-404c97bcf042.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#FFFFFF',
    scheme: 'mandatointeligente',
  },
  plugins: {
    Camera: {
      NSCameraUsageDescription: 'Este app precisa acessar a câmera para capturar fotos.',
      NSPhotoLibraryUsageDescription: 'Este app precisa acessar suas fotos para enviar mídias.',
      NSPhotoLibraryAddUsageDescription: 'Este app precisa salvar fotos na sua galeria.',
    },
  },
};

export default config;
