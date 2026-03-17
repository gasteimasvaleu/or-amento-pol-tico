import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.mandatointeligente.app',
  appName: 'Mandato Intelligence',
  webDir: 'dist',
  ios: {
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
