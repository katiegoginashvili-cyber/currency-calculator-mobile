import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ConvertScreen } from '../screens/ConvertScreen';
import { ChartScreen } from '../screens/ChartScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CustomTabBar } from '../components/CustomTabBar';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/111fb94f-2b9a-4989-be5f-03386ef7a034',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'splash-debug-run-4',hypothesisId:'H11',location:'TabNavigator.tsx:12',message:'Tab navigator render entered',data:{tabs:['Convert','Statistics','Settings']},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Convert" component={ConvertScreen} />
      <Tab.Screen name="Statistics" component={ChartScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
