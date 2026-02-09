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
import { useCurrencyStore, UpdateMode } from '../store/currencyStore';
import { Separator } from '../components/Separator';
import { SectionHeader } from '../components/SectionHeader';

export const UpdateRatesSettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { updateMode, lastUpdated, setUpdateMode, mockRefreshRates } =
    useCurrencyStore();

  const updateOptions: { label: string; value: UpdateMode; description: string }[] = [
    {
      label: 'Automatically',
      value: 'auto',
      description: 'Rates update in the background when connected',
    },
    {
      label: 'Manually',
      value: 'manual',
      description: 'You control when rates are updated',
    },
  ];

  const handleRefresh = () => {
    mockRefreshRates();
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Update Rates
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* New Feature Banner */}
        <View style={[styles.featureBanner, { backgroundColor: colors.primary }]}>
          <Text style={styles.featureLabel}>✨ New Feature</Text>
          <Text style={styles.featureTitle}>Rate Update Control</Text>
          <Text style={styles.featureDescription}>
            Choose how you want exchange rates to be updated. Automatic updates
            ensure you always have the latest rates, while manual mode gives you
            full control.
          </Text>
        </View>

        {/* Update Mode Options */}
        <SectionHeader title="Update Mode" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {updateOptions.map((option, index) => (
            <React.Fragment key={option.value}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setUpdateMode(option.value)}
              >
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  <Text
                    style={[styles.optionDescription, { color: colors.textSecondary }]}
                  >
                    {option.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    { borderColor: colors.primary },
                    updateMode === option.value && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  {updateMode === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
              {index < updateOptions.length - 1 && <Separator inset={false} />}
            </React.Fragment>
          ))}
        </View>

        {/* Manual Refresh Section */}
        {updateMode === 'manual' && (
          <>
            <SectionHeader title="Manual Refresh" />
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <View style={styles.lastUpdatedContainer}>
                <Text style={[styles.lastUpdatedLabel, { color: colors.textSecondary }]}>
                  Rates last updated:
                </Text>
                <Text style={[styles.lastUpdatedValue, { color: colors.text }]}>
                  {lastUpdated}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: colors.primary }]}
                onPress={handleRefresh}
                activeOpacity={0.8}
              >
                <Text style={styles.refreshButtonText}>Refresh Rates Now</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Status Section */}
        <SectionHeader title="Status" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Last updated
            </Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>
              {lastUpdated}
            </Text>
          </View>
          <Separator inset={false} />
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Update mode
            </Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>
              {updateMode === 'auto' ? 'Automatic' : 'Manual'}
            </Text>
          </View>
          <Separator inset={false} />
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Data source
            </Text>
            <Text style={[styles.statusValue, { color: colors.text }]}>
              Mock Data (Demo)
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Note: This is a demo app using mock exchange rates.{'\n'}
            Rates are randomly adjusted by ±1% on refresh.
          </Text>
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
  featureBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
  },
  featureLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionContent: {
    flex: 1,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
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
  lastUpdatedContainer: {
    padding: 16,
    alignItems: 'center',
  },
  lastUpdatedLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  lastUpdatedValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  refreshButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusLabel: {
    fontSize: 15,
  },
  statusValue: {
    fontSize: 15,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
