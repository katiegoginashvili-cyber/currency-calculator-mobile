import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useCurrencyStore } from '../store/currencyStore';
import { SettingsRow } from '../components/SettingsRow';
import { SectionHeader } from '../components/SectionHeader';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    locationSuggestions,
    toggleLocationSuggestions,
  } = useCurrencyStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Appearance" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            title="Display"
            subtitle="Theme, decimals, text size"
            onPress={() => navigation.navigate('DisplaySettings')}
            showArrow
            leftIcon={<MaterialIcons name="palette" size={22} color={colors.primary} />}
          />
        </View>

        <SectionHeader title="Data" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            title="Update Rates"
            subtitle="Configure rate updates"
            onPress={() => navigation.navigate('UpdateRatesSettings')}
            showArrow
            leftIcon={<MaterialIcons name="sync" size={22} color={colors.primary} />}
          />
        </View>

        <SectionHeader title="Preferences" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            title="Widget"
            subtitle="Configure home screen widget"
            onPress={() => {}}
            showArrow
            leftIcon={<MaterialIcons name="widgets" size={22} color={colors.primary} />}
          />
          <View style={[styles.separator, { backgroundColor: colors.separator, marginLeft: 54 }]} />
          <SettingsRow
            title="Location Suggestions"
            leftIcon={<MaterialIcons name="location-on" size={22} color={colors.primary} />}
            toggleValue={locationSuggestions}
            onToggle={toggleLocationSuggestions}
          />
        </View>

        <SectionHeader title="Support" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            title="Feedback & Support"
            onPress={() => {}}
            showArrow
            leftIcon={<MaterialIcons name="chat" size={22} color={colors.primary} />}
          />
          <View style={[styles.separator, { backgroundColor: colors.separator, marginLeft: 54 }]} />
          <SettingsRow
            title="Rate in the App Store"
            onPress={() => {}}
            showArrow
            leftIcon={<MaterialIcons name="star" size={22} color={colors.primary} />}
          />
        </View>

        <SectionHeader title="Legal" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            title="Terms of Service"
            onPress={() => {}}
            showArrow
            leftIcon={<MaterialIcons name="description" size={22} color={colors.primary} />}
          />
          <View style={[styles.separator, { backgroundColor: colors.separator, marginLeft: 54 }]} />
          <SettingsRow
            title="Privacy Policy"
            onPress={() => {}}
            showArrow
            leftIcon={<MaterialIcons name="lock" size={22} color={colors.primary} />}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Currency Calculator v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 140,
  },
  footerText: {
    fontSize: 13,
  },
});
