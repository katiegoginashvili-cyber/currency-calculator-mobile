import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import * as StoreReview from 'expo-store-review';

export type RatingTrigger =
  | 'convert_success'
  | 'scan_success'
  | 'chart_refresh_success'
  | 'subscription_activated';

export type RatingSentiment = 'positive' | 'negative';

type RatingPromptState = {
  firstSeenAt: number;
  sessions: number;
  successfulActions: number;
  lastPromptAt: number;
  promptTimestamps: number[];
};

const STORAGE_KEY = 'rating_prompt_state_v1';
const SUPPORT_EMAIL = 'appsmajestic@gmail.com';
const APP_STORE_REVIEW_URL = 'itms-apps://itunes.apple.com/app/id6759636829?action=write-review';
const APP_STORE_FALLBACK_URL = 'https://apps.apple.com/app/id6759636829?action=write-review';
const MIN_SESSIONS = 3;
const MIN_SUCCESS_ACTIONS = 3;
const MIN_INSTALL_AGE_MS = 2 * 24 * 60 * 60 * 1000;
const PROMPT_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
const PROMPT_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;
const MAX_PROMPTS_PER_WINDOW = 3;

let promptInFlight = false;
let operationChain: Promise<void> = Promise.resolve();
let promptHandler: ((trigger: RatingTrigger) => void) | null = null;

const DEFAULT_STATE: RatingPromptState = {
  firstSeenAt: 0,
  sessions: 0,
  successfulActions: 0,
  lastPromptAt: 0,
  promptTimestamps: [],
};

const queueOperation = (operation: () => Promise<void>): Promise<void> => {
  operationChain = operationChain.then(operation).catch(() => {});
  return operationChain;
};

const loadState = async (): Promise<RatingPromptState> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<RatingPromptState>;
    return {
      firstSeenAt: typeof parsed.firstSeenAt === 'number' ? parsed.firstSeenAt : 0,
      sessions: typeof parsed.sessions === 'number' ? parsed.sessions : 0,
      successfulActions: typeof parsed.successfulActions === 'number' ? parsed.successfulActions : 0,
      lastPromptAt: typeof parsed.lastPromptAt === 'number' ? parsed.lastPromptAt : 0,
      promptTimestamps: Array.isArray(parsed.promptTimestamps)
        ? parsed.promptTimestamps.filter((item) => typeof item === 'number')
        : [],
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
};

const saveState = async (state: RatingPromptState): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const trimPromptWindow = (timestamps: number[], now: number): number[] =>
  timestamps.filter((timestamp) => now - timestamp <= PROMPT_WINDOW_MS);

const isEligibleForPrompt = (state: RatingPromptState, trigger: RatingTrigger, now: number): boolean => {
  const promptsInWindow = trimPromptWindow(state.promptTimestamps, now);
  const isCooledDown = state.lastPromptAt > 0 && now - state.lastPromptAt < PROMPT_COOLDOWN_MS;
  if (isCooledDown) return false;
  if (promptsInWindow.length >= MAX_PROMPTS_PER_WINDOW) return false;

  if (trigger === 'subscription_activated') {
    return true;
  }

  const installAge = state.firstSeenAt > 0 ? now - state.firstSeenAt : 0;
  if (state.sessions < MIN_SESSIONS) return false;
  if (installAge < MIN_INSTALL_AGE_MS) return false;
  if (state.successfulActions < MIN_SUCCESS_ACTIONS) return false;
  return true;
};

const openSupportMail = async (): Promise<void> => {
  const subject = encodeURIComponent('Currency Calculator Feedback');
  const body = encodeURIComponent('Hi team,\n\nI want to share feedback:\n');
  const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  const canOpenMail = await Linking.canOpenURL(mailUrl);
  if (canOpenMail) {
    await Linking.openURL(mailUrl);
  }
};

const requestNativeReview = async (): Promise<void> => {
  try {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
      return;
    }
  } catch {
    // Fallback to direct App Store review link below.
  }

  const canOpenNative = await Linking.canOpenURL(APP_STORE_REVIEW_URL);
  await Linking.openURL(canOpenNative ? APP_STORE_REVIEW_URL : APP_STORE_FALLBACK_URL);
};

export const registerRatingPromptHandler = (handler: (trigger: RatingTrigger) => void): (() => void) => {
  promptHandler = handler;
  return () => {
    if (promptHandler === handler) {
      promptHandler = null;
    }
  };
};

export const recordRatingSession = async (): Promise<void> => {
  await queueOperation(async () => {
    const now = Date.now();
    const state = await loadState();
    state.firstSeenAt = state.firstSeenAt > 0 ? state.firstSeenAt : now;
    state.sessions += 1;
    state.promptTimestamps = trimPromptWindow(state.promptTimestamps, now);
    await saveState(state);
  });
};

export const trackRatingSuccessEvent = async (trigger: RatingTrigger): Promise<void> => {
  await queueOperation(async () => {
    const now = Date.now();
    const state = await loadState();
    state.firstSeenAt = state.firstSeenAt > 0 ? state.firstSeenAt : now;
    state.promptTimestamps = trimPromptWindow(state.promptTimestamps, now);
    state.successfulActions += 1;

    if (!promptInFlight && promptHandler && isEligibleForPrompt(state, trigger, now)) {
      promptInFlight = true;
      state.lastPromptAt = now;
      state.promptTimestamps.push(now);
      await saveState(state);
      promptHandler(trigger);
      return;
    }

    await saveState(state);
  });
};

export const handleRatingSentimentSelection = async (sentiment: RatingSentiment): Promise<void> => {
  promptInFlight = false;
  if (sentiment === 'positive') {
    await requestNativeReview();
    return;
  }
  await openSupportMail();
};

export const dismissRatingPrompt = (): void => {
  promptInFlight = false;
};
