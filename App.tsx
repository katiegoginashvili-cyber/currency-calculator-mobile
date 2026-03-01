import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet, Image, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Clarity from '@microsoft/react-native-clarity';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { useCurrencyStore } from './src/store/currencyStore';
import { initializeAdapty } from './src/services/adapty';

const splashRoundedAsset = require('./assets/splash-rounded.png');
const iconAsset = require('./assets/icon.png');

const AppContent: React.FC = () => {
  const { colors, isDark } = useTheme();
  const hasHydrated = useCurrencyStore((state) => state._hasHydrated);

  useEffect(() => {
    const errorUtils = (global as any).ErrorUtils;
    const previousGlobalHandler = errorUtils?.getGlobalHandler?.();
    if (errorUtils?.setGlobalHandler) {
      errorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        if (previousGlobalHandler) {
          previousGlobalHandler(error, isFatal);
        }
      });
    }
    const clarityProjectId = (Constants.expoConfig?.extra?.clarityProjectId as string | undefined)?.trim();
    if (clarityProjectId) {
      try {
        Clarity.initialize(clarityProjectId);
      } catch (clarityError) {
        console.warn('[Clarity] Failed to initialize', clarityError);
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-round-debug-1',hypothesisId:'H1',location:'App.tsx:38',message:'Launch config snapshot',data:{platform:Platform.OS,appName:Constants.expoConfig?.name ?? null,splashImage:Constants.expoConfig?.splash?.image ?? null,splashResizeMode:Constants.expoConfig?.splash?.resizeMode ?? null,appOwnership:Constants.appOwnership ?? null,executionEnvironment:Constants.executionEnvironment ?? null,bundleId:Constants.expoConfig?.ios?.bundleIdentifier ?? null,androidPackage:Constants.expoConfig?.android?.package ?? null},timestamp:Date.now()})}).catch(()=>{});
    console.log('[SplashRoundDebug]', JSON.stringify({runId:'splash-round-debug-1',hypothesisId:'H1',location:'App.tsx:39',message:'Launch config snapshot',data:{platform:Platform.OS,appName:Constants.expoConfig?.name ?? null,splashImage:Constants.expoConfig?.splash?.image ?? null,splashResizeMode:Constants.expoConfig?.splash?.resizeMode ?? null,appOwnership:Constants.appOwnership ?? null,executionEnvironment:Constants.executionEnvironment ?? null,bundleId:Constants.expoConfig?.ios?.bundleIdentifier ?? null,androidPackage:Constants.expoConfig?.android?.package ?? null},timestamp:Date.now()}));
    // #endregion

    const resolvedSplashRounded = Image.resolveAssetSource(splashRoundedAsset);
    const resolvedIcon = Image.resolveAssetSource(iconAsset);
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-round-debug-1',hypothesisId:'H2',location:'App.tsx:43',message:'Bundled asset resolution snapshot',data:{splashRounded:{uri:resolvedSplashRounded?.uri ?? null,width:resolvedSplashRounded?.width ?? null,height:resolvedSplashRounded?.height ?? null},icon:{uri:resolvedIcon?.uri ?? null,width:resolvedIcon?.width ?? null,height:resolvedIcon?.height ?? null}},timestamp:Date.now()})}).catch(()=>{});
    console.log('[SplashRoundDebug]', JSON.stringify({runId:'splash-round-debug-1',hypothesisId:'H2',location:'App.tsx:46',message:'Bundled asset resolution snapshot',data:{splashRounded:{uri:resolvedSplashRounded?.uri ?? null,width:resolvedSplashRounded?.width ?? null,height:resolvedSplashRounded?.height ?? null},icon:{uri:resolvedIcon?.uri ?? null,width:resolvedIcon?.width ?? null,height:resolvedIcon?.height ?? null}},timestamp:Date.now()}));
    // #endregion

    void initializeAdapty();

    return () => {
      if (errorUtils?.setGlobalHandler && previousGlobalHandler) {
        errorUtils.setGlobalHandler(previousGlobalHandler);
      }
    };
  }, []);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-round-debug-1',hypothesisId:'H3',location:'App.tsx:58',message:'Hydration gate state',data:{hasHydrated},timestamp:Date.now()})}).catch(()=>{});
    console.log('[SplashRoundDebug]', JSON.stringify({runId:'splash-round-debug-1',hypothesisId:'H3',location:'App.tsx:59',message:'Hydration gate state',data:{hasHydrated},timestamp:Date.now()}));
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
