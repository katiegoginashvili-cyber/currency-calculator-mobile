import Constants from 'expo-constants';
import { adapty } from 'react-native-adapty';

let isAdaptyInitialized = false;

export const initializeAdapty = async (): Promise<void> => {
  if (isAdaptyInitialized) {
    return;
  }

  if (Constants.appOwnership === 'expo') {
    console.warn('[Adapty] Expo Go detected. Use a development build to enable Adapty.');
    return;
  }

  const sdkKey = Constants.expoConfig?.extra?.adaptyPublicSdkKey as string | undefined;

  if (!sdkKey) {
    console.warn(
      '[Adapty] Missing adaptyPublicSdkKey. Set expo.extra.adaptyPublicSdkKey in app.json',
    );
    return;
  }

  try {
    await adapty.activate(sdkKey);
    isAdaptyInitialized = true;
  } catch (error) {
    console.warn('[Adapty] Failed to activate SDK', error);
  }
};
