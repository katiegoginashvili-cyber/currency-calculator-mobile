import React, { useMemo, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
  TextInput,
  Animated,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useCurrencyStore, getConvertedAmount, FREE_LIMITS } from '../store/currencyStore';
import { CurrencyRow } from '../components/CurrencyRow';
import { PaywallModal } from '../components/PaywallModal';
import { getCurrencyByCode, getFlagBackground, currencies, getLocalCurrency } from '../data/currencies';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const BUTTON_SIZE = (width - 60) / 4;

const TABS = ['Calculator', 'Multi Convert'];

export const ConvertScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { 
    selectedCurrencies, 
    baseCurrency, 
    rates, 
    lastUpdated, 
    isRefreshing, 
    refreshRates, 
    setBaseCurrency, 
    setCurrentAmount,
    isPro,
    canConvert,
    canRefresh,
    incrementConversionCount,
    getRemainingConversions,
  } = useCurrencyStore();
  const [activeTab, setActiveTab] = useState(0);
  
  // Get local currency based on device location
  const localCurrency = useMemo(() => getLocalCurrency(), []);
  
  // Calculator state - prioritize local currency
  const [fromCurrency, setFromCurrency] = useState(() => localCurrency);
  const [toCurrency, setToCurrency] = useState(() => localCurrency === 'USD' ? 'EUR' : 'USD');
  const [inputValue, setInputValue] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [pendingOperator, setPendingOperator] = useState<string | null>(null);
  const [shouldResetInput, setShouldResetInput] = useState(false);
  
  // Currency picker modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'from' | 'to'>('from');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Paywall modal state
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Cursor blinking animation
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  // Refresh rates on mount
  useEffect(() => {
    refreshRates();
  }, []);

  // Show paywall modal
  const showPaywallModal = () => {
    setShowPaywall(true);
  };

  const handlePurchase = (planId: string) => {
    // TODO: Integrate with Adapty
    console.log('Purchase plan:', planId);
    setShowPaywall(false);
    Alert.alert('Purchase', `Selected plan: ${planId}\n\nAdapty integration will be added here.`);
  };

  // Calculate converted amount
  const convertedAmount = useMemo(() => {
    const amount = parseFloat(inputValue) || 0;
    return getConvertedAmount(amount, fromCurrency, toCurrency, rates);
  }, [inputValue, fromCurrency, toCurrency, rates]);

  const fromCurrencyData = getCurrencyByCode(fromCurrency);
  const toCurrencyData = getCurrencyByCode(toCurrency);

  // Ensure local currency is first, then base currency
  const sortedCurrencies = useMemo(() => {
    const currencyList = [...selectedCurrencies];
    
    // First, move local currency to top if it exists
    const localIndex = currencyList.indexOf(localCurrency);
    if (localIndex > 0) {
      currencyList.splice(localIndex, 1);
      currencyList.unshift(localCurrency);
    } else if (localIndex === -1 && currencies.some(c => c.code === localCurrency)) {
      currencyList.unshift(localCurrency);
    }
    
    // Then ensure base currency is near top (after local)
    if (baseCurrency !== localCurrency) {
      const baseIndex = currencyList.indexOf(baseCurrency);
      if (baseIndex > 1) {
        currencyList.splice(baseIndex, 1);
        currencyList.splice(1, 0, baseCurrency);
      } else if (baseIndex === -1) {
        currencyList.splice(1, 0, baseCurrency);
      }
    }
    
    return currencyList;
  }, [selectedCurrencies, baseCurrency, localCurrency]);

  const handleCurrencyPress = (currencyCode: string) => {
    navigation.navigate('AmountKeypad', { currencyCode });
  };

  const handleAddNew = () => {
    navigation.navigate('EditCurrencies');
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const openCurrencyPicker = (target: 'from' | 'to') => {
    setPickerTarget(target);
    setSearchQuery('');
    setPickerVisible(true);
  };

  const handleSelectCurrency = (code: string) => {
    if (pickerTarget === 'from') {
      setFromCurrency(code);
    } else {
      setToCurrency(code);
    }
    setPickerVisible(false);
  };

  const filteredCurrencies = useMemo(() => {
    let list = currencies.filter(c => c.category === 'fiat');
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (c) => c.code.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)
      );
    }
    
    // Prioritize local currency at top
    const localIndex = list.findIndex(c => c.code === localCurrency);
    if (localIndex > 0) {
      const [localItem] = list.splice(localIndex, 1);
      list.unshift(localItem);
    }
    
    return list;
  }, [searchQuery, localCurrency]);

  const calculateResult = (a: number, operator: string, b: number): number => {
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleKeyPress = (key: string) => {
    const operators = ['+', '-', '×', '÷'];
    
    if (key === 'C') {
      setInputValue('0');
      setStoredValue(null);
      setPendingOperator(null);
      setShouldResetInput(false);
    } else if (key === 'backspace') {
      if (!shouldResetInput) {
        setInputValue((prev) => prev.length > 1 ? prev.slice(0, -1) : '0');
      }
    } else if (key === '.') {
      if (shouldResetInput) {
        setInputValue('0.');
        setShouldResetInput(false);
      } else if (!inputValue.includes('.')) {
        setInputValue((prev) => prev + '.');
      }
    } else if (key === '+/-') {
      setInputValue((prev) => prev.startsWith('-') ? prev.slice(1) : (prev !== '0' ? '-' + prev : prev));
    } else if (operators.includes(key)) {
      const currentValue = parseFloat(inputValue) || 0;
      if (storedValue !== null && pendingOperator && !shouldResetInput) {
        const result = calculateResult(storedValue, pendingOperator, currentValue);
        setStoredValue(result);
        setInputValue(result.toString());
      } else {
        setStoredValue(currentValue);
      }
      setPendingOperator(key);
      setShouldResetInput(true);
    } else if (key === '=') {
      // Check conversion limit
      if (!canConvert()) {
        showPaywallModal();
        return;
      }
      
      if (storedValue !== null && pendingOperator) {
        const currentValue = parseFloat(inputValue) || 0;
        const result = calculateResult(storedValue, pendingOperator, currentValue);
        setInputValue(result.toString());
        setStoredValue(null);
        setPendingOperator(null);
        setShouldResetInput(true);
        incrementConversionCount();
      }
    } else {
      // Number input
      if (shouldResetInput) {
        setInputValue(key);
        setShouldResetInput(false);
      } else {
        setInputValue((prev) => {
          if (prev === '0') return key;
          return prev + key;
        });
      }
    }
  };

  const handleApplyToMulti = () => {
    const amount = parseFloat(inputValue) || 0;
    setBaseCurrency(fromCurrency);
    setCurrentAmount(amount);
    setActiveTab(1);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(num);
  };

  // Format input value with commas (for display only)
  const formatInputDisplay = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    // Split by decimal point
    const parts = value.split('.');
    const intPart = parts[0];
    const decPart = parts[1];
    
    // Format integer part with commas
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return with decimal if exists
    if (decPart !== undefined) {
      return `${formattedInt}.${decPart}`;
    }
    return formattedInt;
  };

  // Calculate font size based on text length (iOS-style scaling)
  const getScaledFontSize = (text: string, baseSize: number = 28) => {
    const length = text.replace(/,/g, '').length;
    if (length <= 8) return baseSize;
    if (length <= 10) return baseSize - 4;
    if (length <= 12) return baseSize - 8;
    if (length <= 14) return baseSize - 12;
    return baseSize - 14;
  };

  const handleRefresh = async () => {
    if (!canRefresh()) {
      showPaywallModal();
      return;
    }
    await refreshRates();
  };

  const keypadButtons = [
    ['C', '+/-', 'backspace', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '0-wide', '.', '='],
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Convert</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.proBadge, { backgroundColor: colors.primary }]}
            onPress={showPaywallModal}
          >
            <MaterialIcons name="star" size={14} color="#FFFFFF" />
            <Text style={styles.proBadgeText}>Upgrade to PRO</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Last Updated */}
      <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
        Updated: {lastUpdated}
      </Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === index && { backgroundColor: colors.surface },
            ]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === index ? colors.text : colors.textSecondary },
              activeTab === index && styles.tabTextActive,
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 0 ? (
        // Calculator Tab
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.calculatorContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              title="Updating rates..."
              titleColor={colors.textSecondary}
            />
          }
        >
          {/* Currency Cards */}
          <View style={[styles.currencyCardsContainer, { backgroundColor: colors.surface }]}>
            {/* From Currency */}
            <View style={styles.currencyRow}>
              <TouchableOpacity 
                style={styles.currencySelector}
                onPress={() => openCurrencyPicker('from')}
              >
                <View style={[styles.flagCircle, { backgroundColor: getFlagBackground(fromCurrency) }]}>
                  <Text style={styles.flagEmoji}>{fromCurrencyData?.flag}</Text>
                </View>
                <View style={styles.currencyTextColumn}>
                  <View style={styles.currencyCodeRow}>
                    <Text style={[styles.currencyCode, { color: colors.text }]}>{fromCurrency}</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={18} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.rateInfo, { color: colors.textSecondary }]}>
                    1 {fromCurrency} = {getConvertedAmount(1, fromCurrency, toCurrency, rates).toFixed(4)} {toCurrency}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.amountWithCursor}>
                <Text style={[
                  styles.amountValue, 
                  { color: colors.text, fontSize: getScaledFontSize(formatInputDisplay(inputValue)) }
                ]}>
                  {formatInputDisplay(inputValue)}
                </Text>
                <Animated.Text style={[
                  styles.cursor, 
                  { color: colors.primary, opacity: cursorOpacity, fontSize: getScaledFontSize(formatInputDisplay(inputValue)) }
                ]}>
                  |
                </Animated.Text>
              </View>
            </View>

            {/* Divider with Swap Button */}
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.separator }]} />
              <TouchableOpacity 
                style={[styles.swapButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleSwapCurrencies}
              >
                <MaterialIcons name="swap-vert" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* To Currency */}
            <View style={styles.currencyRow}>
              <TouchableOpacity 
                style={styles.currencySelector}
                onPress={() => openCurrencyPicker('to')}
              >
                <View style={[styles.flagCircle, { backgroundColor: getFlagBackground(toCurrency) }]}>
                  <Text style={styles.flagEmoji}>{toCurrencyData?.flag}</Text>
                </View>
                <View style={styles.currencyTextColumn}>
                  <View style={styles.currencyCodeRow}>
                    <Text style={[styles.currencyCode, { color: colors.text }]}>{toCurrency}</Text>
                    <MaterialIcons name="keyboard-arrow-down" size={18} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.rateInfo, { color: colors.textSecondary }]}>
                    1 {toCurrency} = {getConvertedAmount(1, toCurrency, fromCurrency, rates).toFixed(4)} {fromCurrency}
                  </Text>
                </View>
              </TouchableOpacity>
              <Text style={[
                styles.amountValue, 
                { color: colors.textSecondary, fontSize: getScaledFontSize(formatNumber(convertedAmount)) }
              ]}>
                {formatNumber(convertedAmount)}
              </Text>
            </View>
          </View>

          {/* Keypad */}
          <View style={styles.keypadContainer}>
            {keypadButtons.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keyRow}>
                {row.map((key, keyIndex) => {
                  if (key === '0-wide') return null;
                  
                  const isWideZero = key === '0' && rowIndex === 4;
                  const isEquals = key === '=';
                  const isBackspace = key === 'backspace';
                  const isOperator = ['÷', '×', '-', '+'].includes(key);
                  const isActiveOperator = isOperator && pendingOperator === key;
                  
                  return (
                    <TouchableOpacity
                      key={`${rowIndex}-${keyIndex}`}
                      style={[
                        styles.keyButton,
                        { backgroundColor: colors.surface },
                        isWideZero && styles.keyButtonWide,
                        isActiveOperator && { backgroundColor: colors.primary + '20' },
                      ]}
                      onPress={() => handleKeyPress(key)}
                      activeOpacity={0.6}
                    >
                      {isBackspace ? (
                        <MaterialIcons name="backspace" size={22} color={colors.textSecondary} />
                      ) : (
                        <Text style={[
                          styles.keyText,
                          { color: colors.text },
                          isEquals && { color: colors.primary },
                          isOperator && { color: colors.primary },
                          key === 'C' && { color: colors.error },
                          key === '+/-' && { color: colors.textSecondary },
                        ]}>
                          {key}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Bottom padding for tab bar */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      ) : (
        // Multi Convert Tab
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              title="Updating rates..."
              titleColor={colors.textSecondary}
            />
          }
        >
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Currencies
            </Text>
            <TouchableOpacity onPress={handleAddNew}>
              <Text style={[styles.addNew, { color: colors.primary }]}>Add new</Text>
            </TouchableOpacity>
          </View>

          {/* Currency List */}
          <View style={[styles.listContainer, { backgroundColor: colors.surface }]}>
            {sortedCurrencies.map((currencyCode, index) => (
              <React.Fragment key={currencyCode}>
                <CurrencyRow
                  currencyCode={currencyCode}
                  onPress={() => handleCurrencyPress(currencyCode)}
                />
                {index < sortedCurrencies.length - 1 && (
                  <View style={[styles.separator, { backgroundColor: colors.separator, marginLeft: 78 }]} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Bottom padding for tab bar */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {/* Currency Picker Modal */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Search header */}
          <View style={[styles.searchHeader, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
              <MaterialIcons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search"
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
            <TouchableOpacity onPress={() => { setPickerVisible(false); setSearchQuery(''); }}>
              <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          {/* Section title */}
          <Text style={[styles.pickerSectionTitle, { color: colors.textSecondary }]}>
            Select currency
          </Text>
          
          <FlatList
            data={filteredCurrencies}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const isSelected = pickerTarget === 'from' ? item.code === fromCurrency : item.code === toCurrency;
              return (
                <TouchableOpacity
                  style={[styles.pickerItem, { backgroundColor: colors.surface }]}
                  onPress={() => handleSelectCurrency(item.code)}
                >
                  <View style={[styles.pickerFlagCircle, { backgroundColor: getFlagBackground(item.code) }]}>
                    <Text style={styles.pickerFlagEmoji}>{item.flag}</Text>
                  </View>
                  <View style={styles.pickerInfo}>
                    <Text style={[styles.pickerName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.pickerCode, { color: colors.textSecondary }]}>{item.code}</Text>
                  </View>
                  {isSelected && (
                    <MaterialIcons name="check" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.pickerList}
            ItemSeparatorComponent={() => (
              <View style={[styles.pickerSeparator, { backgroundColor: colors.separator }]} />
            )}
          />
        </View>
      </Modal>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={handlePurchase}
      />
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
    paddingBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  proBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  lastUpdated: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  calculatorContent: {
    paddingHorizontal: 16,
  },
  // Currency Cards
  currencyCardsContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 24,
  },
  currencyTextColumn: {
    justifyContent: 'center',
  },
  currencyCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: '600',
  },
  rateInfo: {
    fontSize: 13,
    marginTop: 2,
  },
  amountWithCursor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '500',
  },
  cursor: {
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
  },
  // Keypad
  keypadContainer: {
    gap: 4,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 4,
  },
  keyButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyButtonWide: {
    flex: 2,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '500',
  },
  // Multi Convert
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addNew: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
  },
  bottomPadding: {
    height: 120,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  pickerSectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  pickerList: {
    paddingHorizontal: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    borderRadius: 12,
  },
  pickerFlagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerFlagEmoji: {
    fontSize: 24,
  },
  pickerInfo: {
    flex: 1,
  },
  pickerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  pickerCode: {
    fontSize: 14,
  },
  pickerSeparator: {
    height: 1,
    marginLeft: 74,
  },
});
