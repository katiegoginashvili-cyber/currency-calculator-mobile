import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useCurrencyStore } from '../store/currencyStore';
import { SettingsRow } from '../components/SettingsRow';
import { SectionHeader } from '../components/SectionHeader';
import { PaywallModal } from '../components/PaywallModal';
import { purchaseAdaptyPlan, restoreAdaptyPurchases } from '../services/adapty';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    locationSuggestions,
    toggleLocationSuggestions,
    isPro,
  } = useCurrencyStore();
  const [showPaywall, setShowPaywall] = React.useState(false);

  React.useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'pro-paywall-pre-fix',hypothesisId:'H4',location:'src/screens/SettingsScreen.tsx:28',message:'Settings screen pro badge/paywall state',data:{isPro,showPaywall},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [isPro, showPaywall]);

  const legalText = `By downloading or using this application (“App”), you agree to the following Terms of Service. If you do not agree, please do not use the App.

1. Use of the App

The App provides currency conversion tools, including:

Real-time exchange rate conversion

Offline conversion using previously stored rates

Optional camera-based price recognition

The App is intended for personal use only.

You agree not to misuse or interfere with the App.

2. Exchange Rate Information

Exchange rates are provided for informational purposes only.

Rates may not reflect exact bank or card transaction rates.

Data may be delayed or temporarily unavailable.

Offline mode may use previously stored exchange rates.

No guarantee is made regarding accuracy or completeness.

Any financial decisions made using the App are your responsibility.

3. Subscriptions & Payments

Certain features may require a paid subscription.

Payments are processed through the Apple App Store. Subscriptions renew automatically unless canceled in your Apple account settings.

Refunds must be requested directly from Apple.

4. Data & Third-Party Services

The App does not require account registration and does not directly collect personal identification information.

However, the App relies on third-party services, including:

Exchange rate data providers

Subscription management services

Analytics services

These third parties may process limited device-related or usage data according to their own privacy policies.

Camera access, when used, is for on-device price recognition. Images are not intentionally stored or shared by the App.

5. Availability

The App is provided “as available”.

We do not guarantee uninterrupted or error-free operation.

Features may be modified or discontinued at any time.

6. Intellectual Property

All software, design, and content within the App are protected by applicable intellectual property laws.

You may not copy, modify, or reverse engineer the App.

7. Limitation of Liability

The App is provided “as is”.

No responsibility is accepted for:

Financial losses

Incorrect calculations

Service interruptions

Third-party service failures

Use of the App is at your own risk.

8. Changes to These Terms

These Terms may be updated periodically. Continued use of the App after updates constitutes acceptance of the revised Terms.`;

  const privacyText = `This Privacy Policy explains how the Currency Converter application (“App”) handles information when you use it.

By using the App, you agree to the practices described in this policy.

Information We Do Not Directly Collect

The App does not require account registration and does not ask users to provide personally identifiable information such as:

Name

Email address

Phone number

Payment details

The App does not intentionally collect or store personal data on its own servers.

Exchange Rate Requests

To provide real-time currency conversion, the App connects to third-party exchange rate data providers.

When this happens, certain technical information such as IP address or device-related data may be processed by the exchange rate provider. This data is handled according to the provider’s own privacy policy.

The App does not control how third-party services process such technical information.

Subscription & Payment Processing

If you purchase a subscription:

Payments are processed by Apple through the App Store.

The App does not receive or store your payment details.

Subscription validation may be handled using third-party services such as Adapty.

These services may process limited technical or transactional information necessary to verify subscription status.

Analytics & Usage Data

The App may use third-party analytics tools (such as Microsoft Clarity or similar services) to understand general usage patterns and improve the user experience.

These tools may collect anonymous technical information, including:

Device type

Operating system version

Interaction data

Session activity

Performance metrics

This data is used for improving app functionality and performance.

No personally identifiable information is intentionally collected by the App itself.

Log Data

In case of errors or technical issues, third-party services may automatically collect diagnostic information. This may include:

IP address

Device name

Operating system version

App configuration

Date and time of usage

This information is used strictly for troubleshooting and performance monitoring.

Cookies & Similar Technologies

The App itself does not use cookies directly. However, third-party services integrated into the App may use similar technologies to collect technical information for analytics or service functionality.

You can control certain permissions and tracking preferences through your device settings.

Service Providers

The App relies on third-party providers to:

Deliver exchange rate data

Process subscriptions

Provide analytics

Support app functionality

These third parties may process limited information strictly for providing their services.

Security

Reasonable measures are taken to protect information processed by the App. However, no method of electronic transmission or storage is completely secure, and absolute security cannot be guaranteed.

Children’s Privacy

The App is not directed to children under the age of 13 and does not knowingly collect personal information from children.

Changes to This Policy

This Privacy Policy may be updated from time to time. Continued use of the App after changes means you accept the updated policy.

Contact

If you have any questions regarding this Privacy Policy, you may contact:

appsmajestic@gmail.com`;

  const openFeedbackEmail = async () => {
    const mailtoUrl = 'mailto:appsmajestic@gmail.com?subject=Currency%20Calculator%20Feedback';
    const supported = await Linking.canOpenURL(mailtoUrl);
    if (!supported) {
      Alert.alert('Mail app not available', 'Please send your feedback to appsmajestic@gmail.com');
      return;
    }
    await Linking.openURL(mailtoUrl);
  };

  const openAppStoreRating = async () => {
    const appStoreReviewUrl = 'itms-apps://itunes.apple.com/app/id6759636829?action=write-review';
    const fallbackUrl = 'https://apps.apple.com/app/id6759636829?action=write-review';
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'rating-pre-fix',hypothesisId:'R1',location:'src/screens/SettingsScreen.tsx:241',message:'Rate button tapped',data:{appStoreReviewUrl,fallbackUrl},timestamp:Date.now()})}).catch(()=>{});
    console.log('[RateDebug]', JSON.stringify({runId:'rating-post-fix',hypothesisId:'R1',location:'SettingsScreen.tsx:241',message:'Rate button tapped',data:{appStoreReviewUrl,fallbackUrl},timestamp:Date.now()}));
    // #endregion
    const supported = await Linking.canOpenURL(appStoreReviewUrl);
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'rating-pre-fix',hypothesisId:'R2',location:'src/screens/SettingsScreen.tsx:244',message:'Rate canOpenURL result',data:{supported},timestamp:Date.now()})}).catch(()=>{});
    console.log('[RateDebug]', JSON.stringify({runId:'rating-post-fix',hypothesisId:'R2',location:'SettingsScreen.tsx:244',message:'Rate canOpenURL result',data:{supported},timestamp:Date.now()}));
    // #endregion
    const targetUrl = supported ? appStoreReviewUrl : fallbackUrl;
    try {
      await Linking.openURL(targetUrl);
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'rating-pre-fix',hypothesisId:'R3',location:'src/screens/SettingsScreen.tsx:251',message:'Rate openURL success',data:{targetUrl},timestamp:Date.now()})}).catch(()=>{});
      console.log('[RateDebug]', JSON.stringify({runId:'rating-post-fix',hypothesisId:'R3',location:'SettingsScreen.tsx:251',message:'Rate openURL success',data:{targetUrl},timestamp:Date.now()}));
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/30933eef-a3b4-4469-b38d-b3c1692116d3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0c8447'},body:JSON.stringify({sessionId:'0c8447',runId:'rating-pre-fix',hypothesisId:'R4',location:'src/screens/SettingsScreen.tsx:256',message:'Rate openURL failed',data:{targetUrl,errorMessage:error instanceof Error ? error.message : String(error)},timestamp:Date.now()})}).catch(()=>{});
      console.log('[RateDebug]', JSON.stringify({runId:'rating-post-fix',hypothesisId:'R4',location:'SettingsScreen.tsx:256',message:'Rate openURL failed',data:{targetUrl,errorMessage:error instanceof Error ? error.message : String(error)},timestamp:Date.now()}));
      // #endregion
      throw error;
    }
  };

  const handlePurchase = async (planId: string) => {
    const result = await purchaseAdaptyPlan(planId);
    if (!result.success) {
      if (!result.cancelled) {
        Alert.alert('Purchase failed', result.message);
      }
      return;
    }
    setShowPaywall(false);
  };

  const handleRestore = async () => {
    const result = await restoreAdaptyPurchases();
    if (!result.success) {
      Alert.alert('Restore', result.message);
      return;
    }
    setShowPaywall(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={handlePurchase}
        onRestore={handleRestore}
      />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        {!isPro ? (
          <TouchableOpacity
            style={[styles.getProBadge, { backgroundColor: colors.primary }]}
            onPress={() => setShowPaywall(true)}
          >
            <MaterialIcons name="star" size={14} color="#FFFFFF" />
            <Text style={styles.getProText}>Go Pro</Text>
          </TouchableOpacity>
        ) : null}
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
            onPress={() => Alert.alert('Coming soon', 'This feature will be added soon.')}
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
            onPress={openFeedbackEmail}
            showArrow
            leftIcon={<MaterialIcons name="chat" size={22} color={colors.primary} />}
          />
          <View style={[styles.separator, { backgroundColor: colors.separator, marginLeft: 54 }]} />
          <SettingsRow
            title="Rate in the App Store"
            onPress={openAppStoreRating}
            showArrow
            leftIcon={<MaterialIcons name="star" size={22} color={colors.primary} />}
          />
        </View>

        <SectionHeader title="Legal" />
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingsRow
            title="Terms of Service"
            onPress={() => navigation.navigate('LegalDocument', { title: 'Terms of Service', content: legalText })}
            showArrow
            leftIcon={<MaterialIcons name="description" size={22} color={colors.primary} />}
          />
          <View style={[styles.separator, { backgroundColor: colors.separator, marginLeft: 54 }]} />
          <SettingsRow
            title="Privacy Policy"
            onPress={() => navigation.navigate('LegalDocument', { title: 'Privacy Policy', content: privacyText })}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  getProBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
  },
  getProText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
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
