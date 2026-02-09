import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors } from './colors';
import { useCurrencyStore } from '../store/currencyStore';

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const themeMode = useCurrencyStore((state) => state.themeMode);

  const { colors, isDark } = useMemo(() => {
    let isDarkMode = false;
    
    if (themeMode === 'system') {
      isDarkMode = systemScheme === 'dark';
    } else {
      isDarkMode = themeMode === 'dark';
    }

    return {
      colors: isDarkMode ? darkColors : lightColors,
      isDark: isDarkMode,
    };
  }, [themeMode, systemScheme]);

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
