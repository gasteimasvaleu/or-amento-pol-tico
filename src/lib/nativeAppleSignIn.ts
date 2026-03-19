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
  console.log("[AppleSignIn] nativeAppleSignIn() called");
  console.log("[AppleSignIn] isNativePlatform:", Capacitor.isNativePlatform());
  console.log("[AppleSignIn] pluginAvailable:", Capacitor.isPluginAvailable("NativeAppleSignIn"));

  if (!Capacitor.isNativePlatform()) {
    throw new Error("Native Apple Sign In is only available on native platforms");
  }
  if (!Capacitor.isPluginAvailable("NativeAppleSignIn")) {
    throw new Error("NativeAppleSignIn plugin not available — ensure it is registered in MyViewController");
  }

  console.log("[AppleSignIn] calling NativeAppleSignIn.authorize()...");
  try {
    const result = await NativeAppleSignIn.authorize();
    console.log("[AppleSignIn] authorize() succeeded, has token:", !!result.identityToken);
    return result;
  } catch (error: any) {
    console.error("[AppleSignIn] authorize() error:", error?.message || error);
    throw error;
  }
}
