import Constants from 'expo-constants';
import { adapty } from 'react-native-adapty';
import { useCurrencyStore } from '../store/currencyStore';
import { trackRatingSuccessEvent } from './ratingPrompt';

let isAdaptyInitialized = false;

const ADAPTY_PLACEMENT_ID = 'cc_Standard';
const ADAPTY_ACCESS_LEVEL_ID = 'Premium';
const ADAPTY_PRODUCT_IDS = {
  weekly: 'Currency_Weekly',
  annual: 'Currency_Annually',
} as const;

export type AdaptyPlanId = keyof typeof ADAPTY_PRODUCT_IDS;

type AdaptyResult = {
  success: boolean;
  cancelled?: boolean;
  message: string;
};

const normalizeAdaptyErrorMessage = (error: any): string => {
  const fallback =
    error instanceof Error
      ? error.message
      : typeof error?.message === 'string'
        ? error.message
        : 'Purchase failed.';

  const detailRaw = typeof error?.detail === 'string' ? error.detail : null;
  if (!detailRaw) return fallback;

  try {
    const parsed = JSON.parse(detailRaw);
    const detailText =
      parsed?.detail ??
      parsed?.errors?.[0]?.detail ??
      parsed?.message ??
      null;
    if (typeof detailText === 'string' && detailText.includes('Placement Not Found')) {
      return 'Adapty placement not found. Check app key and placement ID for the same Adapty app.';
    }
  } catch {
    // Ignore non-JSON detail payloads.
  }

  if (detailRaw.includes('Placement Not Found')) {
    return 'Adapty placement not found. Check app key and placement ID for the same Adapty app.';
  }

  return fallback;
};

const resolveVendorProductId = (product: any): string | null => {
  if (!product || typeof product !== 'object') return null;
  const candidate =
    product.vendorProductId ??
    product.subscription?.vendorProductId ??
    product.paywallProduct?.vendorProductId ??
    null;
  return typeof candidate === 'string' ? candidate : null;
};

const resolveIsProFromProfile = (profile: any): boolean => {
  const accessLevels = profile?.accessLevels;
  if (!accessLevels || typeof accessLevels !== 'object') return false;
  if (accessLevels[ADAPTY_ACCESS_LEVEL_ID]?.isActive === true) return true;
  if (accessLevels.premium?.isActive === true) return true;
  return Object.values(accessLevels).some((item: any) => item?.isActive === true);
};

const setProStatus = (isPro: boolean) => {
  useCurrencyStore.getState().setIsPro(isPro);
};

const fetchPlacementProducts = async (): Promise<Record<AdaptyPlanId, any>> => {
  const sdk = adapty as any;
  const paywall = await sdk.getPaywall(ADAPTY_PLACEMENT_ID);
  const products = await sdk.getPaywallProducts(paywall);
  const byId = new Map<string, any>();

  for (const product of products ?? []) {
    const vendorProductId = resolveVendorProductId(product);
    if (vendorProductId) {
      byId.set(vendorProductId, product);
    }
  }

  const weeklyProduct = byId.get(ADAPTY_PRODUCT_IDS.weekly);
  const annualProduct = byId.get(ADAPTY_PRODUCT_IDS.annual);

  if (!weeklyProduct || !annualProduct) {
    throw new Error(
      'Adapty products missing. Check placement cc_Standard and product IDs Currency_Weekly/Currency_Annually.',
    );
  }

  return {
    weekly: weeklyProduct,
    annual: annualProduct,
  };
};

export const syncAdaptyProStatus = async (): Promise<boolean> => {
  const sdk = adapty as any;
  const profile = await sdk.getProfile();
  const isPro = resolveIsProFromProfile(profile);
  setProStatus(isPro);
  return isPro;
};

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
    try {
      await syncAdaptyProStatus();
    } catch (profileError) {
      console.warn('[Adapty] Failed to sync initial profile state', profileError);
    }
  } catch (error) {
    const err: any = error;
    if (err?.adaptyCode === 3005 || String(err?.message ?? '').includes('activateOnceError')) {
      // SDK reports already activated in current process: treat as initialized.
      isAdaptyInitialized = true;
      return;
    }
    console.warn('[Adapty] Failed to activate SDK', error);
  }
};

export const purchaseAdaptyPlan = async (planId: string): Promise<AdaptyResult> => {
  if (planId !== 'weekly' && planId !== 'annual') {
    return { success: false, message: 'Unknown plan selected.' };
  }

  await initializeAdapty();
  const sdk = adapty as any;

  try {
    const products = await fetchPlacementProducts();
    const selectedProduct = products[planId];
    const purchaseResult = await sdk.makePurchase(selectedProduct);
    const purchaseType =
      typeof purchaseResult?.type === 'string' ? purchaseResult.type : null;
    if (purchaseType && purchaseType.toLowerCase().includes('cancel')) {
      return { success: false, cancelled: true, message: 'Purchase cancelled.' };
    }
    const profile = purchaseResult?.profile ?? (await sdk.getProfile());
    const isPro = resolveIsProFromProfile(profile);
    setProStatus(isPro);

    if (!isPro) {
      return {
        success: false,
        message: 'Purchase completed but premium access is not active yet. Please try Restore.',
      };
    }

    void trackRatingSuccessEvent('subscription_activated');
    return { success: true, message: 'Subscription activated.' };
  } catch (error) {
    const err: any = error;
    const message = normalizeAdaptyErrorMessage(err);
    const normalized = message.toLowerCase();
    const cancelled =
      normalized.includes('cancel') ||
      normalized.includes('canceled') ||
      normalized.includes('cancelled') ||
      normalized.includes('aborted');
    return {
      success: false,
      cancelled,
      message: cancelled ? 'Purchase cancelled.' : message,
    };
  }
};

export const restoreAdaptyPurchases = async (): Promise<AdaptyResult> => {
  await initializeAdapty();
  const sdk = adapty as any;

  try {
    const profile = await sdk.restorePurchases();
    const isPro = resolveIsProFromProfile(profile);
    setProStatus(isPro);
    if (isPro) {
      void trackRatingSuccessEvent('subscription_activated');
    }
    return isPro
      ? { success: true, message: 'Purchases restored successfully.' }
      : { success: false, message: 'No active subscription was found to restore.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Restore failed.';
    return { success: false, message };
  }
};
