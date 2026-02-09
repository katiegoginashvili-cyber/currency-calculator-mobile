import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { SettingsRow } from '../components/SettingsRow';
import { Separator } from '../components/Separator';
import { SectionHeader } from '../components/SectionHeader';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const EditScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleEditAmount = () => {
    navigation.navigate('AmountKeypad', { currencyCode: 'USD' });
  };

  const handleEditCurrencies = () => {
    navigation.navigate('EditCurrencies');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Currency</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Quick Actions" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            title="Edit Amount"
            subtitle="Change the conversion amount"
            onPress={handleEditAmount}
            showArrow
            leftIcon={<Text style={styles.icon}>💰</Text>}
          />
          <Separator />
          <SettingsRow
            title="Edit Currencies"
            subtitle="Reorder, remove, or set base currency"
            onPress={handleEditCurrencies}
            showArrow
            leftIcon={<Text style={styles.icon}>📋</Text>}
          />
        </View>

        <SectionHeader title="App" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            title="Settings"
            subtitle="Display, rates, and preferences"
            onPress={handleSettings}
            showArrow
            leftIcon={<Text style={styles.icon}>⚙️</Text>}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  icon: {
    fontSize: 22,
  },
});
