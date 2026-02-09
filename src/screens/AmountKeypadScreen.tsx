import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useCurrencyStore } from '../store/currencyStore';
import { getCurrencyByCode, getFlagBackground } from '../data/currencies';
import type { RootStackParamList } from '../navigation/types';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = (width - 80) / 4;

type RouteProps = RouteProp<RootStackParamList, 'AmountKeypad'>;

export const AmountKeypadScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { currencyCode } = route.params || { currencyCode: 'USD' };
  
  const { setCurrentAmount, setBaseCurrency } = useCurrencyStore();
  const [inputValue, setInputValue] = useState('');
  
  // Animations
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(height)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const selectedCurrency = getCurrencyByCode(currencyCode);

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (key === '.') {
      if (!inputValue.includes('.')) {
        setInputValue((prev) => (prev === '' ? '0.' : prev + '.'));
      }
    } else {
      setInputValue((prev) => {
        if (prev === '0' && key !== '.') return key;
        return prev + key;
      });
    }
  };

  const handleConvert = () => {
    const amount = parseFloat(inputValue) || 0;
    setBaseCurrency(currencyCode);
    setCurrentAmount(amount);
    animateOut();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: height,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  };

  const handleClose = () => {
    animateOut();
  };

  const displayValue = inputValue || '0';
  const isPlaceholder = !inputValue;

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ];

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1} />
      </Animated.View>
      
      {/* Sheet */}
      <Animated.View 
        style={[
          styles.sheet, 
          { 
            paddingBottom: insets.bottom + 16,
            transform: [{ translateY: sheetTranslateY }],
          }
        ]}
      >
        {/* Handle bar */}
        <View style={styles.handleBar} />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.currencyInfo}>
            <View style={[styles.flagContainer, { backgroundColor: getFlagBackground(currencyCode) }]}>
              <Text style={styles.currencyFlag}>{selectedCurrency?.flag}</Text>
            </View>
            <View style={styles.currencyTextContainer}>
              <Text style={styles.currencyName}>{selectedCurrency?.name}</Text>
              <Text style={styles.currencyCode}>{selectedCurrency?.code}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={20} color="#1C1C1E" />
          </TouchableOpacity>
        </View>

        {/* Amount Display */}
        <View style={styles.displayContainer}>
          <Text style={styles.currencySymbol}>{selectedCurrency?.symbol}</Text>
          <Text style={[styles.amountDisplay, isPlaceholder && styles.amountPlaceholder]}>
            {displayValue}
          </Text>
        </View>

        {/* Quick Amount Chips */}
        <View style={styles.chipsContainer}>
          {[10, 100, 1000, 5000].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.chip}
              onPress={() => setInputValue(amount.toString())}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>+{amount.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Keypad */}
        <View style={styles.keypadContainer}>
          {keypadButtons.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keyRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.keyButton}
                  onPress={() => handleKeyPress(key)}
                  activeOpacity={0.6}
                >
                  {key === 'backspace' ? (
                    <MaterialIcons name="backspace" size={22} color="#1C1C1E" />
                  ) : (
                    <Text style={styles.keyText}>{key}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Convert Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.convertButton} 
            onPress={handleConvert} 
            activeOpacity={0.8}
          >
            <Text style={styles.convertButtonText}>Convert</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currencyFlag: {
    fontSize: 24,
  },
  currencyTextContainer: {
    justifyContent: 'center',
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  currencyCode: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '300',
    color: '#8E8E93',
  },
  amountDisplay: {
    fontSize: 56,
    fontWeight: '300',
    color: '#1C1C1E',
    letterSpacing: -2,
  },
  amountPlaceholder: {
    color: '#C7C7CC',
  },
  chipsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0066FF',
  },
  keypadContainer: {
    paddingHorizontal: 40,
    paddingBottom: 16,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  keyButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#1C1C1E',
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
  convertButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  convertButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
