import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.mandatointeligente.app',
  appName: 'Mandato Intelligence',
  webDir: 'dist',
  ios: {
    backgroundColor: '#FFFFFF',
    scheme: 'mandatointeligente',
    buildNumber: '15',
  },
  plugins: {
    Camera: {
      NSCameraUsageDescription: 'O Mandato Intelligence usa a câmera para que você possa fotografar comprovantes de despesas, registros de atividades parlamentares e documentos para anexar aos seus cadastros.',
      NSPhotoLibraryUsageDescription: 'O Mandato Intelligence acessa sua galeria de fotos para que você possa selecionar imagens e anexá-las a cadastros de eleitores, mídias de cidades e registros de atividades parlamentares.',
      NSPhotoLibraryAddUsageDescription: 'O Mandato Intelligence salva na sua galeria as imagens e mídias geradas pelo app, como postagens para redes sociais e materiais de divulgação parlamentar.',
    },
    LiveUpdates: {
      appId: '0ec0d586',
      channel: 'Production',
      autoUpdateMethod: 'background',
    },
  },
};

export default config;
