import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import Constants from 'expo-constants';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { useCurrencyStore } from './src/store/currencyStore';
import { initializeAdapty } from './src/services/adapty';

const AppContent: React.FC = () => {
  const { colors, isDark } = useTheme();
  const hasHydrated = useCurrencyStore((state) => state._hasHydrated);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'tripy-entry-debug-1',hypothesisId:'H1',location:'App.tsx:18',message:'AppContent mounted',data:{appOwnership:Constants.appOwnership,slug:Constants.expoConfig?.slug ?? null,hostUri:Constants.expoConfig?.hostUri ?? null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    void initializeAdapty();
  }, []);

  useEffect(() => {
    void (async () => {
      const initialUrl = await Linking.getInitialURL();
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'tripy-entry-debug-1',hypothesisId:'H2',location:'App.tsx:27',message:'Initial deep link URL observed',data:{initialUrl:initialUrl ?? null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    })();
  }, []);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'tripy-entry-debug-1',hypothesisId:'H3',location:'App.tsx:35',message:'Hydration state changed',data:{hasHydrated},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [hasHydrated]);

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      };

  if (!hasHydrated) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
