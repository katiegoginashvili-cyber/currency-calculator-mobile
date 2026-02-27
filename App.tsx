import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { useCurrencyStore } from './src/store/currencyStore';
import { initializeAdapty } from './src/services/adapty';

const AppContent: React.FC = () => {
  const { colors, isDark } = useTheme();
  const hasHydrated = useCurrencyStore((state) => state._hasHydrated);

  useEffect(() => {
    const errorUtils = (global as any).ErrorUtils;
    const previousGlobalHandler = errorUtils?.getGlobalHandler?.();
    if (errorUtils?.setGlobalHandler) {
      errorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        // #region agent log
        fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-debug-run-4',hypothesisId:'H14',location:'App.tsx:23',message:'Global JS error captured',data:{isFatal:!!isFatal,name:error?.name ?? null,message:error?.message ?? null,stack:error?.stack?.slice?.(0,500) ?? null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (previousGlobalHandler) {
          previousGlobalHandler(error, isFatal);
        }
      });
    }

    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-debug-run-1',hypothesisId:'H1',location:'App.tsx:18',message:'Runtime app identity on launch',data:{platform:Platform.OS,appOwnership:Constants.appOwnership ?? null,executionEnvironment:Constants.executionEnvironment ?? null,nativeBuildVersion:Constants.nativeBuildVersion ?? null,nativeAppVersion:Constants.nativeAppVersion ?? null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-debug-run-1',hypothesisId:'H2',location:'App.tsx:21',message:'Runtime splash config snapshot',data:{splashImage:Constants.expoConfig?.splash?.image ?? null,splashResizeMode:Constants.expoConfig?.splash?.resizeMode ?? null,splashBackground:Constants.expoConfig?.splash?.backgroundColor ?? null,iosBundleId:Constants.expoConfig?.ios?.bundleIdentifier ?? null,androidPackage:Constants.expoConfig?.android?.package ?? null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-debug-run-1',hypothesisId:'H4',location:'App.tsx:24',message:'Android splash-related config snapshot',data:{androidAdaptiveBackground:Constants.expoConfig?.android?.adaptiveIcon?.backgroundColor ?? null,androidHasSplash:!!Constants.expoConfig?.splash,scheme:Constants.expoConfig?.scheme ?? null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // #region agent log
    console.log('[SplashDebug]', JSON.stringify({
      runId: 'splash-console-run-1',
      hypothesisId: 'H1',
      location: 'App.tsx:31',
      message: 'Runtime app identity on launch',
      data: {
        platform: Platform.OS,
        appOwnership: Constants.appOwnership ?? null,
        executionEnvironment: Constants.executionEnvironment ?? null,
        nativeBuildVersion: Constants.nativeBuildVersion ?? null,
        nativeAppVersion: Constants.nativeAppVersion ?? null,
      },
      timestamp: Date.now(),
    }));
    // #endregion
    // #region agent log
    console.log('[SplashDebug]', JSON.stringify({
      runId: 'splash-console-run-1',
      hypothesisId: 'H2',
      location: 'App.tsx:47',
      message: 'Runtime splash config snapshot',
      data: {
        splashImage: Constants.expoConfig?.splash?.image ?? null,
        splashResizeMode: Constants.expoConfig?.splash?.resizeMode ?? null,
        splashBackground: Constants.expoConfig?.splash?.backgroundColor ?? null,
        iosBundleId: Constants.expoConfig?.ios?.bundleIdentifier ?? null,
        androidPackage: Constants.expoConfig?.android?.package ?? null,
      },
      timestamp: Date.now(),
    }));
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'tripy-entry-debug-1',hypothesisId:'H1',location:'App.tsx:18',message:'AppContent mounted',data:{appOwnership:Constants.appOwnership,slug:Constants.expoConfig?.slug ?? null,hostUri:Constants.expoConfig?.hostUri ?? null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    void initializeAdapty();

    return () => {
      if (errorUtils?.setGlobalHandler && previousGlobalHandler) {
        errorUtils.setGlobalHandler(previousGlobalHandler);
      }
    };
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
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-debug-run-1',hypothesisId:'H3',location:'App.tsx:38',message:'Hydration gate status for splash handoff',data:{hasHydrated},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // #region agent log
    console.log('[SplashDebug]', JSON.stringify({
      runId: 'splash-console-run-1',
      hypothesisId: 'H3',
      location: 'App.tsx:76',
      message: 'Hydration gate status for splash handoff',
      data: { hasHydrated },
      timestamp: Date.now(),
    }));
    // #endregion

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
    // #region agent log
    console.log('[SplashDebug]', JSON.stringify({
      runId: 'splash-console-run-2',
      hypothesisId: 'H8',
      location: 'App.tsx:123',
      message: 'Rendering loading branch',
      data: { hasHydrated },
      timestamp: Date.now(),
    }));
    // #endregion
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // #region agent log
  console.log('[SplashDebug]', JSON.stringify({
    runId: 'splash-console-run-2',
    hypothesisId: 'H8',
    location: 'App.tsx:136',
    message: 'Rendering navigation branch',
    data: { hasHydrated },
    timestamp: Date.now(),
  }));
  // #endregion
  return (
    <NavigationContainer
      theme={navigationTheme}
      onReady={() => {
        // #region agent log
        fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-debug-run-4',hypothesisId:'H10',location:'App.tsx:157',message:'Navigation container ready',data:{hasHydrated},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      }}
    >
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
