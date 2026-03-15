import React, { useState, useEffect } from 'react';
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
import { useCurrencyStore } from '../store/currencyStore';
import { RootStackParamList } from './types';
import { View, ActivityIndicator, Alert } from 'react-native';
import { PaywallModal } from '../components/PaywallModal';
import { RatingSentimentModal } from '../components/RatingSentimentModal';
import { purchaseAdaptyPlan, restoreAdaptyPurchases } from '../services/adapty';
import {
  dismissRatingPrompt,
  handleRatingSentimentSelection,
  registerRatingPromptHandler,
} from '../services/ratingPrompt';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { colors } = useTheme();
  const isPro = useCurrencyStore((state) => state.isPro);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLaunchPaywall, setShowLaunchPaywall] = useState(false);
  const [showRatingSentimentModal, setShowRatingSentimentModal] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    const unsubscribe = registerRatingPromptHandler(() => {
      setShowRatingSentimentModal(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isPro && showLaunchPaywall) {
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'pro-paywall-post-fix',hypothesisId:'H1',location:'src/navigation/RootNavigator.tsx:36',message:'Auto-hiding launch paywall for PRO user',data:{isPro,showLaunchPaywall},timestamp:Date.now()})}).catch(()=>{});
      console.log('[ProPaywallDebug]', JSON.stringify({runId:'pro-paywall-post-fix',hypothesisId:'H1',location:'RootNavigator.tsx:36',message:'Auto-hiding launch paywall for PRO user',data:{isPro,showLaunchPaywall},timestamp:Date.now()}));
      // #endregion
      setShowLaunchPaywall(false);
    }
  }, [isPro, showLaunchPaywall]);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'pro-paywall-pre-fix',hypothesisId:'H1',location:'src/navigation/RootNavigator.tsx:33',message:'Root paywall gate snapshot',data:{isLoading,showOnboarding,showLaunchPaywall,isPro},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-round-debug-1',hypothesisId:'H4',location:'RootNavigator.tsx:31',message:'Root navigator visual gates',data:{isLoading,showOnboarding,showLaunchPaywall,background:colors.background},timestamp:Date.now()})}).catch(()=>{});
    console.log('[SplashRoundDebug]', JSON.stringify({runId:'splash-round-debug-1',hypothesisId:'H4',location:'RootNavigator.tsx:32',message:'Root navigator visual gates',data:{isLoading,showOnboarding,showLaunchPaywall,background:colors.background},timestamp:Date.now()}));
    // #endregion
  }, [isLoading, showOnboarding, showLaunchPaywall, colors.background, isPro]);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
      const shouldShowOnboarding = onboardingComplete !== 'true';
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'pro-paywall-pre-fix',hypothesisId:'H2',location:'src/navigation/RootNavigator.tsx:46',message:'Onboarding status before paywall toggle',data:{onboardingComplete,shouldShowOnboarding,isProSnapshot:isPro},timestamp:Date.now()})}).catch(()=>{});
      console.log('[ProPaywallDebug]', JSON.stringify({runId:'pro-paywall-post-fix',hypothesisId:'H2',location:'RootNavigator.tsx:52',message:'Onboarding status with isPro gate',data:{onboardingComplete,shouldShowOnboarding,isProSnapshot:isPro},timestamp:Date.now()}));
      // #endregion
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-round-debug-1',hypothesisId:'H5',location:'RootNavigator.tsx:40',message:'Onboarding storage result',data:{onboardingComplete,shouldShowOnboarding},timestamp:Date.now()})}).catch(()=>{});
      console.log('[SplashRoundDebug]', JSON.stringify({runId:'splash-round-debug-1',hypothesisId:'H5',location:'RootNavigator.tsx:41',message:'Onboarding storage result',data:{onboardingComplete,shouldShowOnboarding},timestamp:Date.now()}));
      // #endregion
      setShowOnboarding(shouldShowOnboarding);
      setShowLaunchPaywall(!shouldShowOnboarding && !isPro);
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

  const handleRatingModalClose = () => {
    setShowRatingSentimentModal(false);
    dismissRatingPrompt();
  };

  const handlePositiveRating = async () => {
    setShowRatingSentimentModal(false);
    await handleRatingSentimentSelection('positive');
  };

  const handleNegativeRating = async () => {
    setShowRatingSentimentModal(false);
    await handleRatingSentimentSelection('negative');
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

      <RatingSentimentModal
        visible={showRatingSentimentModal}
        onClose={handleRatingModalClose}
        onPositive={handlePositiveRating}
        onNegative={handleNegativeRating}
      />
    </>
  );
};
