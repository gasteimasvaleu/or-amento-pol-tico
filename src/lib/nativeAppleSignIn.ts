import { Capacitor, registerPlugin } from "@capacitor/core";

interface NativeAppleSignInPlugin {
  authorize(): Promise<{
    identityToken: string;
    authorizationCode: string;
    givenName: string | null;
    familyName: string | null;
    email: string | null;
  }>;
}

const NativeAppleSignIn = registerPlugin<NativeAppleSignInPlugin>("NativeAppleSignIn");

export async function nativeAppleSignIn() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("Native Apple Sign In is only available on native platforms");
  }
  if (!Capacitor.isPluginAvailable("NativeAppleSignIn")) {
    throw new Error("NativeAppleSignIn plugin not available");
  }
  return NativeAppleSignIn.authorize();
}
