import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockRatesUSD } from '../data/currencies';
import { fetchExchangeRates } from '../api/exchangeRates';

export type ThemeMode = 'light' | 'dark' | 'system';
export type UpdateMode = 'auto' | 'manual';

// PRO Limits
export const FREE_LIMITS = {
  MAX_CONVERSIONS_PER_DAY: 5,
  MAX_CURRENCIES: 3,
  MAX_REFRESHES_PER_DAY: 1,
};

interface CurrencyState {
  // Currency data
  baseCurrency: string;
  selectedCurrencies: string[];
  rates: Record<string, number>;
  lastUpdated: string;
  currentAmount: number;
  
  // Display settings
  themeMode: ThemeMode;
  decimalDigits: number | null; // null means "Auto" / "No Volume"
  boldText: boolean;
  useSystemSize: boolean;
  
  // App settings
  locationSuggestions: boolean;
  inappCurrency: boolean;
  appealSounds: boolean;
  updateMode: UpdateMode;
  
  // PRO / Subscription state
  isPro: boolean;
  conversionCount: number;
  lastConversionDate: string;
  refreshCount: number;
  lastRefreshDate: string;
  
  // Actions
  setBaseCurrency: (code: string) => void;
  addCurrency: (code: string) => void;
  removeCurrency: (code: string) => void;
  reorderCurrency: (fromIndex: number, toIndex: number) => void;
  setSelectedCurrencies: (currencies: string[]) => void;
  setCurrentAmount: (amount: number) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setDecimalDigits: (digits: number | null) => void;
  toggleBoldText: () => void;
  toggleSystemSize: () => void;
  toggleLocationSuggestions: () => void;
  toggleInappCurrency: () => void;
  toggleAppealSounds: () => void;
  setUpdateMode: (mode: UpdateMode) => void;
  mockRefreshRates: () => void;
  refreshRates: () => Promise<void>;
  isRefreshing: boolean;
  
  // PRO actions
  setIsPro: (isPro: boolean) => void;
  incrementConversionCount: () => void;
  canConvert: () => boolean;
  canAddCurrency: () => boolean;
  canRefresh: () => boolean;
  getRemainingConversions: () => number;
  
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

const getFormattedDate = (): string => {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[now.getMonth()];
  const day = now.getDate();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${month} ${day}, ${hours}:${minutes} (GMT)`;
};

const getTodayDateString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const generateMockRates = (baseRates: Record<string, number>): Record<string, number> => {
  const newRates: Record<string, number> = {};
  Object.keys(baseRates).forEach((key) => {
    // Add random variation of +-1%
    const variation = 1 + (Math.random() - 0.5) * 0.02;
    newRates[key] = baseRates[key] * variation;
  });
  // Keep USD at 1
  newRates['USD'] = 1;
  return newRates;
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      // Initial state
      baseCurrency: 'USD',
      selectedCurrencies: ['EUR', 'GBP', 'GEL'], // Start with 3 currencies (FREE limit)
      rates: { ...mockRatesUSD },
      lastUpdated: getFormattedDate(),
      currentAmount: 100,
      
      themeMode: 'system',
      decimalDigits: null,
      boldText: false,
      useSystemSize: true,
      
      locationSuggestions: true,
      inappCurrency: true,
      appealSounds: true,
      updateMode: 'auto',
      isRefreshing: false,
      
      // PRO state
      isPro: false,
      conversionCount: 0,
      lastConversionDate: '',
      refreshCount: 0,
      lastRefreshDate: '',
      
      _hasHydrated: false,
      
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      setBaseCurrency: (code) => {
        const { selectedCurrencies } = get();
        // Ensure base currency is in selected list
        if (!selectedCurrencies.includes(code)) {
          set({ 
            baseCurrency: code,
            selectedCurrencies: [code, ...selectedCurrencies]
          });
        } else {
          set({ baseCurrency: code });
        }
      },

      addCurrency: (code) => {
        const { selectedCurrencies } = get();
        if (!selectedCurrencies.includes(code)) {
          set({ selectedCurrencies: [...selectedCurrencies, code] });
        }
      },

      removeCurrency: (code) => {
        const { selectedCurrencies, baseCurrency } = get();
        if (code === baseCurrency) return; // Can't remove base currency
        set({ selectedCurrencies: selectedCurrencies.filter((c) => c !== code) });
      },

      reorderCurrency: (fromIndex, toIndex) => {
        const { selectedCurrencies } = get();
        const newList = [...selectedCurrencies];
        const [removed] = newList.splice(fromIndex, 1);
        newList.splice(toIndex, 0, removed);
        set({ selectedCurrencies: newList });
      },

      setSelectedCurrencies: (currencies) => {
        set({ selectedCurrencies: currencies });
      },

      setCurrentAmount: (amount) => {
        set({ currentAmount: amount });
      },

      setThemeMode: (mode) => {
        set({ themeMode: mode });
      },

      setDecimalDigits: (digits) => {
        set({ decimalDigits: digits });
      },

      toggleBoldText: () => {
        set((state) => ({ boldText: !state.boldText }));
      },

      toggleSystemSize: () => {
        set((state) => ({ useSystemSize: !state.useSystemSize }));
      },

      toggleLocationSuggestions: () => {
        set((state) => ({ locationSuggestions: !state.locationSuggestions }));
      },

      toggleInappCurrency: () => {
        set((state) => ({ inappCurrency: !state.inappCurrency }));
      },

      toggleAppealSounds: () => {
        set((state) => ({ appealSounds: !state.appealSounds }));
      },

      setUpdateMode: (mode) => {
        set({ updateMode: mode });
      },

      mockRefreshRates: () => {
        const { rates } = get();
        set({
          rates: generateMockRates(rates),
          lastUpdated: getFormattedDate(),
        });
      },

      refreshRates: async () => {
        set({ isRefreshing: true });
        try {
          const data = await fetchExchangeRates('USD');
          const today = getTodayDateString();
          const { lastRefreshDate, refreshCount, isPro } = get();
          
          // Update refresh count
          const newRefreshCount = lastRefreshDate === today ? refreshCount + 1 : 1;
          
          set({
            rates: data.conversion_rates,
            lastUpdated: getFormattedDate(),
            isRefreshing: false,
            refreshCount: newRefreshCount,
            lastRefreshDate: today,
          });
        } catch (error) {
          console.error('Failed to refresh rates:', error);
          set({ isRefreshing: false });
        }
      },

      // PRO actions
      setIsPro: (isPro) => {
        set({ isPro });
      },

      incrementConversionCount: () => {
        const { lastConversionDate, conversionCount } = get();
        const today = getTodayDateString();
        
        if (lastConversionDate === today) {
          set({ conversionCount: conversionCount + 1 });
        } else {
          set({ conversionCount: 1, lastConversionDate: today });
        }
      },

      canConvert: () => {
        const { isPro, conversionCount, lastConversionDate } = get();
        if (isPro) return true;
        
        const today = getTodayDateString();
        if (lastConversionDate !== today) return true;
        
        return conversionCount < FREE_LIMITS.MAX_CONVERSIONS_PER_DAY;
      },

      canAddCurrency: () => {
        const { isPro, selectedCurrencies } = get();
        if (isPro) return true;
        return selectedCurrencies.length < FREE_LIMITS.MAX_CURRENCIES;
      },

      canRefresh: () => {
        const { isPro, refreshCount, lastRefreshDate } = get();
        if (isPro) return true;
        
        const today = getTodayDateString();
        if (lastRefreshDate !== today) return true;
        
        return refreshCount < FREE_LIMITS.MAX_REFRESHES_PER_DAY;
      },

      getRemainingConversions: () => {
        const { isPro, conversionCount, lastConversionDate } = get();
        if (isPro) return Infinity;
        
        const today = getTodayDateString();
        if (lastConversionDate !== today) return FREE_LIMITS.MAX_CONVERSIONS_PER_DAY;
        
        return Math.max(0, FREE_LIMITS.MAX_CONVERSIONS_PER_DAY - conversionCount);
      },
    }),
    {
      name: 'currency-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        baseCurrency: state.baseCurrency,
        selectedCurrencies: state.selectedCurrencies,
        rates: state.rates,
        lastUpdated: state.lastUpdated,
        currentAmount: state.currentAmount,
        themeMode: state.themeMode,
        decimalDigits: state.decimalDigits,
        boldText: state.boldText,
        useSystemSize: state.useSystemSize,
        locationSuggestions: state.locationSuggestions,
        inappCurrency: state.inappCurrency,
        appealSounds: state.appealSounds,
        updateMode: state.updateMode,
        // PRO state
        isPro: state.isPro,
        conversionCount: state.conversionCount,
        lastConversionDate: state.lastConversionDate,
        refreshCount: state.refreshCount,
        lastRefreshDate: state.lastRefreshDate,
      }),
    }
  )
);

// Helper function to calculate converted amount
export const getConvertedAmount = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number => {
  // Convert from source to USD, then from USD to target
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
};
