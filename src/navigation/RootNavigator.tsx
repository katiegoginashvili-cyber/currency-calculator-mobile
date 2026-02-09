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
import { RootStackParamList } from './types';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Reset onboarding to show it again (remove this line after testing)
      await AsyncStorage.removeItem('onboarding_complete');
      
      const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
      setShowOnboarding(onboardingComplete !== 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
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
    </Stack.Navigator>
  );
};
