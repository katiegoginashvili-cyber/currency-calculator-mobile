import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ConvertScreen } from '../screens/ConvertScreen';
import { ChartScreen } from '../screens/ChartScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CustomTabBar } from '../components/CustomTabBar';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Convert" component={ConvertScreen} />
      <Tab.Screen name="Chart" component={ChartScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
