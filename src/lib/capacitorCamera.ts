import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Pick an image using Capacitor Camera on native, or fall back to file input on web.
 * Returns a data URL string.
 */
export async function pickImage(options?: {
  source?: 'prompt' | 'camera' | 'gallery';
  quality?: number;
}): Promise<string | null> {
  const source = options?.source ?? 'prompt';
  const quality = options?.quality ?? 80;

  if (Capacitor.isNativePlatform()) {
    try {
      const sourceMap = {
        prompt: CameraSource.Prompt,
        camera: CameraSource.Camera,
        gallery: CameraSource.Photos,
      };

      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: sourceMap[source],
        quality,
      });

      return photo.dataUrl ?? null;
    } catch (err: any) {
      // User cancelled
      if (err?.message?.includes('cancelled') || err?.message?.includes('canceled')) {
        return null;
      }
      throw err;
    }
  }

  // Web fallback: use a hidden file input
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    // Handle cancel (no reliable event, but this covers most cases)
    input.click();
  });
}

/**
 * Convert a data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}
