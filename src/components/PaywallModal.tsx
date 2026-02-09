import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

// Hero image
const heroImage = require('../../assets/paywall-hero.png');

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: (planId: string) => void;
}

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$1.99',
    description: 'Billed Monthly',
    badge: null,
  },
  {
    id: 'annual',
    name: 'Yearly',
    price: '$9.99',
    description: 'Save $13.89',
    badge: '58% OFF',
  },
];

const PRO_FEATURES = [
  'Unlimited conversions',
  'Charts & historical data',
  'Unlimited currencies',
  'Widgets (Coming soon)',
];

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onPurchase,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState('annual');

  const handleSubscribe = () => {
    onPurchase(selectedPlan);
  };

  // Light theme colors matching app style
  const paywallColors = {
    background: '#F5F5F7',
    surface: '#FFFFFF',
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    accent: colors.primary,
    border: '#E5E5EA',
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: paywallColors.background }]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section with Image and Overlay */}
          <View style={styles.heroSection}>
            {/* Full-width Hero Image */}
            <Image 
              source={heroImage} 
              style={styles.heroImage}
              resizeMode="cover"
            />
            
            {/* iOS-style blur gradient overlay */}
            <LinearGradient
              colors={[
                'rgba(245, 245, 247, 0)',
                'rgba(245, 245, 247, 0.3)',
                'rgba(245, 245, 247, 0.6)',
                'rgba(245, 245, 247, 0.85)',
                'rgba(245, 245, 247, 1)',
              ]}
              locations={[0, 0.3, 0.5, 0.7, 1]}
              style={styles.heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />

            {/* Header with Restore and Close - on top of image */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity style={styles.restoreButton}>
                <Text style={[styles.restoreText, { color: paywallColors.text }]}>
                  Restore
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={paywallColors.text} />
              </TouchableOpacity>
            </View>

            {/* Title Section - on top of image */}
            <View style={styles.titleSection}>
              <View style={styles.titleRow}>
                <Text style={[styles.appName, { color: paywallColors.text }]}>Currency </Text>
                <View style={[styles.proBadge, { backgroundColor: paywallColors.accent }]}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
              <Text style={[styles.subtitle, { color: paywallColors.textSecondary }]}>
                Unlock the full power of{'\n'}currency conversion
              </Text>
            </View>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            {PRO_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <MaterialIcons name="check" size={20} color={paywallColors.accent} />
                <Text style={[styles.featureText, { color: paywallColors.text }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Plans */}
          <View style={styles.plansContainer}>
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: paywallColors.surface,
                      borderColor: isSelected ? paywallColors.accent : paywallColors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <View style={[styles.planBadge, { backgroundColor: paywallColors.accent }]}>
                      <Text style={styles.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}

                  {/* Selection indicator */}
                  <View style={[
                    styles.selectionCircle,
                    { borderColor: isSelected ? paywallColors.accent : paywallColors.border }
                  ]}>
                    {isSelected && (
                      <View style={[styles.selectionInner, { backgroundColor: paywallColors.accent }]} />
                    )}
                  </View>

                  {/* Plan info */}
                  <View style={styles.planInfo}>
                    <Text style={[styles.planName, { color: paywallColors.text }]}>
                      {plan.name}
                    </Text>
                    <Text style={[styles.planPrice, { color: paywallColors.text }]}>
                      {plan.price}
                    </Text>
                    <Text style={[
                      styles.planDescription, 
                      { color: plan.id === 'annual' ? paywallColors.accent : paywallColors.textSecondary }
                    ]}>
                      {plan.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Section - Fixed */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24, backgroundColor: paywallColors.background }]}>
          {/* Subscribe Button */}
          <TouchableOpacity
            style={[styles.subscribeButton, { backgroundColor: paywallColors.accent }]}
            onPress={handleSubscribe}
          >
            <Text style={styles.subscribeButtonText}>
              Subscribe
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    width: width,
    height: 380,
    position: 'relative',
  },
  heroImage: {
    width: width,
    height: 380,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closeButton: {
    padding: 4,
  },
  restoreButton: {
    padding: 4,
  },
  restoreText: {
    fontSize: 16,
    fontWeight: '500',
  },
  titleSection: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '300',
  },
  proBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  plansContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  planCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  selectionCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  selectionInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 13,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  subscribeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
