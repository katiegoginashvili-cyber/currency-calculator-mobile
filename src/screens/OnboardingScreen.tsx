import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaywallModal } from '../components/PaywallModal';

const { width } = Dimensions.get('window');

// 3D Illustrations
const imageSpeed = require('../../assets/onboarding-speed.png');
const imageMulti = require('../../assets/onboarding-multi.png');
const imageOffline = require('../../assets/onboarding-offline.png');

interface OnboardingSlide {
  id: string;
  visualType: 'speed' | 'cards' | 'offline';
  title: string;
  subtitle: string;
  buttonText: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    visualType: 'speed',
    title: 'Convert the\nCurrency Faster!',
    subtitle: 'Effortlessly Convert Currencies for Busy Individuals Who Value Their Time',
    buttonText: 'Next',
  },
  {
    id: '2',
    visualType: 'cards',
    title: 'Multi Currency\nConversion',
    subtitle: 'Our app offers a powerful feature that allows you to quickly and easily convert any currency into another one',
    buttonText: 'Next',
  },
  {
    id: '3',
    visualType: 'offline',
    title: 'Offline Currency\nConverter',
    subtitle: 'Use our app to convert currencies without an internet connection, perfect for travel in any country',
    buttonText: 'Get Started',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      // Show paywall after onboarding
      setShowPaywall(true);
    }
  };

  const handleSkip = async () => {
    // Show paywall even when skipping
    setShowPaywall(true);
  };

  const handleClosePaywall = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    onComplete();
  };

  const handlePurchase = async (planId: string) => {
    // TODO: Integrate with Adapty
    console.log('Purchase plan:', planId);
    await AsyncStorage.setItem('onboarding_complete', 'true');
    onComplete();
  };

  const renderVisual = (visualType: string) => {
    let imageSource;
    
    switch (visualType) {
      case 'speed':
        imageSource = imageSpeed;
        break;
      case 'cards':
        imageSource = imageMulti;
        break;
      case 'offline':
        imageSource = imageOffline;
        break;
      default:
        return null;
    }

    return (
      <View style={styles.imageContainer}>
        <Image
          source={imageSource}
          style={styles.image3D}
          resizeMode="cover"
        />
      </View>
    );
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={[styles.slide, { width }]}>
        {/* Visual */}
        <View style={styles.fullWidthVisual}>
          {renderVisual(item.visualType)}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {item.subtitle}
          </Text>
        </View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {ONBOARDING_SLIDES.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip Button */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 16 }]}
        onPress={handleSkip}
      >
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
        {renderDots()}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {ONBOARDING_SLIDES[currentIndex].buttonText}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={handleClosePaywall}
        onPurchase={handlePurchase}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthVisual: {
    width: width,
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // 3D Image container - edge to edge
  imageContainer: {
    width: width,
    height: 380,
  },
  image3D: {
    width: '100%',
    height: '100%',
  },
});
