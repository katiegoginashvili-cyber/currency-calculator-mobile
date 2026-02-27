import React, { useState, useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { TabNavigator } from './TabNavigator';
import { AmountKeypadScreen } from '../screens/AmountKeypadScreen';
import { AddCurrencyScreen } from '../screens/AddCurrencyScreen';
import { EditCurrenciesScreen } from '../screens/EditCurrenciesScreen';
import { DisplaySettingsScreen } from '../screens/DisplaySettingsScreen';
import { UpdateRatesSettingsScreen } from '../screens/UpdateRatesSettingsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LegalDocumentScreen } from '../screens/LegalDocumentScreen';
import { RootStackParamList } from './types';
import { View, ActivityIndicator, Alert } from 'react-native';
import { PaywallModal } from '../components/PaywallModal';
import { purchaseAdaptyPlan, restoreAdaptyPurchases } from '../services/adapty';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLaunchPaywall, setShowLaunchPaywall] = useState(false);
  const loadingStartMsRef = useRef<number>(Date.now());

  useEffect(() => {
    // #region agent log
    console.log('[SplashDebug]', JSON.stringify({
      runId: 'splash-console-run-1',
      hypothesisId: 'H3',
      location: 'RootNavigator.tsx:25',
      message: 'RootNavigator mounted',
      data: {},
      timestamp: Date.now(),
    }));
    // #endregion
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }
    const startMs = loadingStartMsRef.current;
    const timer = setTimeout(() => {
      if (isLoading) {
        // #region agent log
        console.log('[SplashDebug]', JSON.stringify({
          runId: 'splash-console-run-3',
          hypothesisId: 'H9',
          location: 'RootNavigator.tsx:42',
          message: 'Root loading exceeded threshold',
          data: { elapsedMs: Date.now() - startMs, isLoading, showOnboarding },
          timestamp: Date.now(),
        }));
        // #endregion
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [isLoading, showOnboarding]);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-debug-run-2',hypothesisId:'H3',location:'RootNavigator.tsx:28',message:'Root navigator visual gate state',data:{isLoading,showOnboarding,background:colors.background},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // #region agent log
    console.log('[SplashDebug]', JSON.stringify({
      runId: 'splash-console-run-1',
      hypothesisId: 'H3',
      location: 'RootNavigator.tsx:36',
      message: 'Root navigator visual gate state',
      data: { isLoading, showOnboarding, background: colors.background },
      timestamp: Date.now(),
    }));
    // #endregion
  }, [isLoading, showOnboarding, colors.background]);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-debug-run-2',hypothesisId:'H5',location:'RootNavigator.tsx:41',message:'Onboarding storage probe',data:{onboardingComplete},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      // #region agent log
      console.log('[SplashDebug]', JSON.stringify({
        runId: 'splash-console-run-1',
        hypothesisId: 'H5',
        location: 'RootNavigator.tsx:52',
        message: 'Onboarding storage probe',
        data: { onboardingComplete },
        timestamp: Date.now(),
      }));
      // #endregion
      const shouldShowOnboarding = onboardingComplete !== 'true';
      // #region agent log
      console.log('[SplashDebug]', JSON.stringify({
        runId: 'splash-console-run-1',
        hypothesisId: 'H6',
        location: 'RootNavigator.tsx:60',
        message: 'Resolved onboarding visibility',
        data: { onboardingComplete, shouldShowOnboarding },
        timestamp: Date.now(),
      }));
      // #endregion
      setShowOnboarding(shouldShowOnboarding);
      setShowLaunchPaywall(!shouldShowOnboarding);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleLaunchPaywallClose = () => {
    setShowLaunchPaywall(false);
  };

  const handleLaunchPaywallPurchase = async (planId: string) => {
    const result = await purchaseAdaptyPlan(planId);
    if (!result.success) {
      if (!result.cancelled) {
        Alert.alert('Purchase failed', result.message);
      }
      return;
    }
    setShowLaunchPaywall(false);
  };

  const handleLaunchPaywallRestore = async () => {
    const result = await restoreAdaptyPurchases();
    if (!result.success) {
      Alert.alert('Restore', result.message);
      return;
    }
    setShowLaunchPaywall(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="AmountKeypad"
          component={AmountKeypadScreen}
          options={{
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="AddCurrency"
          component={AddCurrencyScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="EditCurrencies"
          component={EditCurrenciesScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="ScanModal"
          component={ScanScreen}
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen
          name="DisplaySettings"
          component={DisplaySettingsScreen}
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="UpdateRatesSettings"
          component={UpdateRatesSettingsScreen}
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="LegalDocument"
          component={LegalDocumentScreen}
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="OnboardingPreview"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        >
          {() => <OnboardingScreen onComplete={() => {}} />}
        </Stack.Screen>
      </Stack.Navigator>

      <PaywallModal
        visible={showLaunchPaywall}
        onClose={handleLaunchPaywallClose}
        onPurchase={handleLaunchPaywallPurchase}
        onRestore={handleLaunchPaywallRestore}
      />
    </>
  );
};
