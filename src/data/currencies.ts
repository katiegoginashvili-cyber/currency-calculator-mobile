export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  category: 'fiat' | 'crypto' | 'metal';
  flagBg?: string; // Background color for flag circle
}

// Uniform gray background for all flags
export const getFlagBackground = (_code: string): string => {
  return '#F2F2F7';
};

export const currencies: Currency[] = [
  // Fiat currencies
  { code: 'USD', name: 'United States Dollar', symbol: '$', flag: '🇺🇸', category: 'fiat' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', category: 'fiat' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', category: 'fiat' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', category: 'fiat' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', category: 'fiat' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭', category: 'fiat' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', category: 'fiat' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', category: 'fiat' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', category: 'fiat' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', flag: '🇬🇪', category: 'fiat' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', category: 'fiat' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', category: 'fiat' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', category: 'fiat' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', category: 'fiat' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', category: 'fiat' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', category: 'fiat' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', category: 'fiat' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', category: 'fiat' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱', category: 'fiat' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', category: 'fiat' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', category: 'fiat' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽', category: 'fiat' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', category: 'fiat' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', category: 'fiat' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', category: 'fiat' },
  
  // Cryptocurrencies
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', flag: '🪙', category: 'crypto' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', flag: '🪙', category: 'crypto' },
  { code: 'USDT', name: 'Tether', symbol: '₮', flag: '🪙', category: 'crypto' },
  { code: 'BNB', name: 'Binance Coin', symbol: 'BNB', flag: '🪙', category: 'crypto' },
  { code: 'XRP', name: 'Ripple', symbol: 'XRP', flag: '🪙', category: 'crypto' },
  { code: 'ADA', name: 'Cardano', symbol: '₳', flag: '🪙', category: 'crypto' },
  { code: 'SOL', name: 'Solana', symbol: 'SOL', flag: '🪙', category: 'crypto' },
  { code: 'DOGE', name: 'Dogecoin', symbol: 'Ð', flag: '🪙', category: 'crypto' },
  
  // Precious Metals
  { code: 'XAU', name: 'Gold (oz)', symbol: 'Au', flag: '🥇', category: 'metal' },
  { code: 'XAG', name: 'Silver (oz)', symbol: 'Ag', flag: '🥈', category: 'metal' },
  { code: 'XPT', name: 'Platinum (oz)', symbol: 'Pt', flag: '⬜', category: 'metal' },
  { code: 'XPD', name: 'Palladium (oz)', symbol: 'Pd', flag: '⬜', category: 'metal' },
];

// Mock exchange rates relative to USD
export const mockRatesUSD: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  JPY: 149.50,
  INR: 83.12,
  GEL: 2.67,
  TRY: 30.25,
  AED: 3.67,
  SGD: 1.34,
  HKD: 7.82,
  NZD: 1.64,
  SEK: 10.45,
  NOK: 10.62,
  DKK: 6.87,
  PLN: 4.02,
  RUB: 89.50,
  BRL: 4.97,
  MXN: 17.15,
  ZAR: 18.75,
  KRW: 1325.00,
  THB: 35.20,
  BTC: 0.000024,
  ETH: 0.00041,
  USDT: 1.0,
  BNB: 0.0033,
  XRP: 1.85,
  ADA: 2.50,
  SOL: 0.0098,
  DOGE: 12.50,
  XAU: 0.00049,
  XAG: 0.043,
  XPT: 0.00105,
  XPD: 0.00098,
};

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return currencies.find((c) => c.code === code);
};

// Map country/region codes to currency codes
const regionToCurrency: Record<string, string> = {
  US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', NZ: 'NZD',
  EU: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR',
  CH: 'CHF', JP: 'JPY', CN: 'CNY', IN: 'INR', GE: 'GEL',
  TR: 'TRY', AE: 'AED', SG: 'SGD', HK: 'HKD', SE: 'SEK',
  NO: 'NOK', DK: 'DKK', PL: 'PLN', RU: 'RUB', BR: 'BRL',
  MX: 'MXN', ZA: 'ZAR', KR: 'KRW', TH: 'THB',
};

export const getLocalCurrency = (): string => {
  try {
    // Get locale from the system
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';
    // Extract region code (e.g., 'en-US' -> 'US', 'ka-GE' -> 'GE')
    const parts = locale.split('-');
    const region = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'US';
    return regionToCurrency[region] || 'USD';
  } catch {
    return 'USD';
  }
};

export const formatCurrencyValue = (
  value: number,
  currencyCode: string,
  decimalDigits: number | null
): string => {
  const currency = getCurrencyByCode(currencyCode);
  const symbol = currency?.symbol || currencyCode;
  
  // Determine decimal places
  let decimals = 2;
  if (decimalDigits !== null) {
    decimals = decimalDigits;
  } else {
    // Auto logic: use more decimals for crypto/metals and small values
    if (currency?.category === 'crypto' || currency?.category === 'metal') {
      decimals = value < 1 ? 6 : 4;
    } else if (currencyCode === 'JPY' || currencyCode === 'KRW') {
      decimals = 0;
    }
  }
  
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
    return `${symbol}${formatted}`;
  } catch {
    return `${symbol}${value.toFixed(decimals)}`;
  }
};
