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
import { useTheme } from '../theme/ThemeContext';
import { useCurrencyStore, ThemeMode } from '../store/currencyStore';
import { SettingsRow } from '../components/SettingsRow';
import { Separator } from '../components/Separator';
import { SectionHeader } from '../components/SectionHeader';
import { formatCurrencyValue } from '../data/currencies';

export const DisplaySettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const {
    themeMode,
    decimalDigits,
    boldText,
    useSystemSize,
    setThemeMode,
    setDecimalDigits,
    toggleBoldText,
    toggleSystemSize,
  } = useCurrencyStore();

  const themeOptions: { label: string; value: ThemeMode }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  const decimalOptions: { label: string; value: number | null }[] = [
    { label: 'Auto', value: null },
    { label: '0', value: 0 },
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
  ];

  const previewValue = formatCurrencyValue(1234.5678, 'USD', decimalDigits);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Display</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Preview Section */}
        <SectionHeader title="Preview" />
        <View style={[styles.previewSection, { backgroundColor: colors.surface }]}>
          <View style={styles.previewRow}>
            <View style={styles.previewLeft}>
              <Text style={styles.previewFlag}>🇺🇸</Text>
              <Text
                style={[
                  styles.previewName,
                  { color: colors.text, fontWeight: boldText ? '600' : '400' },
                ]}
              >
                United States Dollar
              </Text>
            </View>
            <View style={[styles.previewPill, { backgroundColor: colors.pillBackground }]}>
              <Text style={[styles.previewValue, { color: colors.pillText }]}>
                {previewValue}
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Section */}
        <SectionHeader title="Theme" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {themeOptions.map((option, index) => (
            <React.Fragment key={option.value}>
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => setThemeMode(option.value)}
              >
                <Text style={[styles.radioLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
                <View
                  style={[
                    styles.radioCircle,
                    { borderColor: colors.primary },
                    themeMode === option.value && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  {themeMode === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
              {index < themeOptions.length - 1 && <Separator inset={false} />}
            </React.Fragment>
          ))}
        </View>

        {/* Decimal Digits Section */}
        <SectionHeader title="Decimal Digits" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.decimalGrid}>
            {decimalOptions.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.decimalButton,
                  {
                    backgroundColor:
                      decimalDigits === option.value
                        ? colors.primary
                        : colors.inputBackground,
                  },
                ]}
                onPress={() => setDecimalDigits(option.value)}
              >
                <Text
                  style={[
                    styles.decimalButtonText,
                    {
                      color:
                        decimalDigits === option.value
                          ? '#FFFFFF'
                          : colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.decimalHint, { color: colors.textSecondary }]}>
            "Auto" adjusts decimals based on currency type
          </Text>
        </View>

        {/* Text Options */}
        <SectionHeader title="Text Options" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            title="Bold Text"
            subtitle="Use bold font for currency names"
            toggleValue={boldText}
            onToggle={toggleBoldText}
          />
          <Separator />
          <SettingsRow
            title="Use System Size"
            subtitle="Match device text size settings"
            toggleValue={useSystemSize}
            onToggle={toggleSystemSize}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 80,
  },
  backText: {
    fontSize: 17,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewSection: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewFlag: {
    fontSize: 32,
    marginRight: 12,
  },
  previewName: {
    fontSize: 16,
  },
  previewPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  previewValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  radioLabel: {
    fontSize: 16,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  decimalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  decimalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  decimalButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  decimalHint: {
    fontSize: 13,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
