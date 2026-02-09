# Currency Calculator

A React Native (Expo) currency converter app with a modern UI, mock exchange rates, and local persistence.

## Features

- **Currency Conversion**: Convert between multiple currencies with live-updating values
- **Amount Keypad**: Beautiful gradient keypad for entering amounts
- **Add/Remove Currencies**: Choose from fiat, crypto, and precious metals
- **Edit Currencies**: Reorder currencies and set base currency
- **Settings**: Theme selection, decimal digits, text options
- **Update Rates**: Manual or automatic rate refresh (mock data)
- **Persistence**: All settings saved locally via AsyncStorage
- **Dark Mode**: Full support for light, dark, and system themes

## Tech Stack

- **Expo SDK 54** (latest stable)
- **React Native 0.81.5** with **TypeScript 5.9**
- **React 19.1.0**
- **React Navigation 7** (native-stack + bottom-tabs)
- **Zustand 5** for state management
- **AsyncStorage** for persistence
- **react-native-safe-area-context**
- **react-native-gesture-handler**
- **react-native-reanimated 4**

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo CLI (optional, can use npx)

### Installation

```bash
# Navigate to project directory
cd "Currency calculator"

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

After starting the server, you can:

- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CurrencyRow.tsx
│   ├── SettingsRow.tsx
│   ├── SegmentedControl.tsx
│   ├── SectionHeader.tsx
│   ├── SearchInput.tsx
│   ├── PromoCard.tsx
│   └── Separator.tsx
│
├── screens/             # App screens
│   ├── ConvertScreen.tsx
│   ├── AmountKeypadScreen.tsx
│   ├── AddCurrencyScreen.tsx
│   ├── EditScreen.tsx
│   ├── EditCurrenciesScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── DisplaySettingsScreen.tsx
│   └── UpdateRatesSettingsScreen.tsx
│
├── navigation/          # Navigation configuration
│   ├── types.ts
│   ├── TabNavigator.tsx
│   └── RootNavigator.tsx
│
├── store/               # Zustand state management
│   └── currencyStore.ts
│
├── data/                # Mock data and utilities
│   └── currencies.ts
│
└── theme/               # Theme configuration
    ├── colors.ts
    └── ThemeContext.tsx
```

## Screens

### Convert Tab (Main)
- Lists selected currencies with converted amounts
- Tap a currency to open the amount keypad
- Green pill shows converted value based on current amount

### Amount Keypad
- Full-screen modal with gradient background
- Numeric keypad with quick buttons (1K, 10K)
- Converts from base currency to selected currency

### Add Currency
- Segmented control: All / Crypto / Metal
- Search functionality
- Location-based suggestions (Georgia → GEL)
- Checkmark indicates already added currencies

### Edit Currencies
- Reorder with up/down arrows
- Remove currencies (except base)
- Set any currency as base

### Settings
- Display settings (theme, decimals, bold text)
- Update rates (auto/manual)
- Various toggles and placeholder rows

### Display Settings
- Light / Dark / System theme selection
- Decimal digits (Auto, 0-6)
- Bold text toggle
- System size toggle
- Live preview

### Update Rates Settings
- Automatic vs Manual update mode
- Refresh button for manual mode
- Shows last updated timestamp
- Mock refresh adds ±1% random variation

## Mock Data

The app includes mock exchange rates for:

### Fiat Currencies
USD, EUR, GBP, AUD, CAD, CHF, CNY, JPY, INR, GEL, TRY, AED, and more

### Cryptocurrencies
BTC, ETH, USDT, BNB, XRP, ADA, SOL, DOGE

### Precious Metals
XAU (Gold), XAG (Silver), XPT (Platinum), XPD (Palladium)

## State Management

The app uses Zustand with AsyncStorage persistence. Key state includes:

- `baseCurrency`: The reference currency (default: USD)
- `selectedCurrencies`: List of currencies to display
- `currentAmount`: Amount to convert
- `rates`: Mock exchange rates relative to USD
- `themeMode`: light | dark | system
- `decimalDigits`: null (auto) or 0-6
- Various preference toggles

## Notes

- This is a **front-end only** app with **mock data**
- No real API calls are made
- Exchange rates are randomly adjusted on "refresh"
- All data persists locally on the device
