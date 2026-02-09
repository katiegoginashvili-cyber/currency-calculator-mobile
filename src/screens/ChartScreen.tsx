import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { useCurrencyStore, getConvertedAmount } from '../store/currencyStore';
import { PaywallModal } from '../components/PaywallModal';


import { getCurrencyByCode, getFlagBackground, currencies } from '../data/currencies';
import { fetchChartData, ChartDataPoint } from '../api/exchangeRates';

const { width, height } = Dimensions.get('window');

const TIME_PERIODS = ['1D', '1W', '1M', '3M', '1Y', '5Y', '10Y'];

export const ChartScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { rates, refreshRates, isRefreshing, isPro } = useCurrencyStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Currency picker modal
  const [showPicker, setShowPicker] = useState(false);
  const [pickingFor, setPickingFor] = useState<'from' | 'to'>('from');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Paywall modal
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Fetch chart data when currencies or period change
  useEffect(() => {
    const loadChartData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchChartData(fromCurrency, toCurrency, selectedPeriod);
        setChartData(data);
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChartData();
  }, [fromCurrency, toCurrency, selectedPeriod]);
  
  const currentRate = useMemo(() => {
    return getConvertedAmount(1, fromCurrency, toCurrency, rates);
  }, [fromCurrency, toCurrency, rates]);
  
  const { changeAmount, changePercent } = useMemo(() => {
    if (chartData.length < 2) return { changeAmount: 0, changePercent: 0 };
    const firstRate = chartData[0].rate;
    const lastRate = chartData[chartData.length - 1].rate;
    const change = lastRate - firstRate;
    const percent = (change / firstRate) * 100;
    return { changeAmount: change, changePercent: percent };
  }, [chartData]);

  // Stats calculations
  const stats = useMemo(() => {
    if (chartData.length === 0) return { high: 0, low: 0, average: 0 };
    const rates = chartData.map(d => d.rate);
    const high = Math.max(...rates);
    const low = Math.min(...rates);
    const average = rates.reduce((a, b) => a + b, 0) / rates.length;
    return { high, low, average };
  }, [chartData]);
  
  const fromCurrencyData = getCurrencyByCode(fromCurrency);
  const toCurrencyData = getCurrencyByCode(toCurrency);
  
  const handleSelectCurrency = (code: string) => {
    if (pickingFor === 'from') {
      if (code === toCurrency) setToCurrency(fromCurrency);
      setFromCurrency(code);
    } else {
      if (code === fromCurrency) setFromCurrency(toCurrency);
      setToCurrency(code);
    }
    setShowPicker(false);
    setSearchQuery('');
  };
  
  const openPicker = (type: 'from' | 'to') => {
    setPickingFor(type);
    setShowPicker(true);
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleRefresh = async () => {
    await refreshRates();
    // Also reload chart data
    setIsLoading(true);
    try {
      const data = await fetchChartData(fromCurrency, toCurrency, selectedPeriod);
      setChartData(data);
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Chart dimensions
  const chartHeight = height * 0.28;
  const chartWidth = width - 116; // Extra padding to keep dot inside
  
  const chartRates = chartData.map(d => d.rate);
  const minValue = chartRates.length > 0 ? Math.min(...chartRates) : 0;
  const maxValue = chartRates.length > 0 ? Math.max(...chartRates) : 1;
  const midValue = (minValue + maxValue) / 2;
  const range = maxValue - minValue || 1;
  
  const getY = (value: number) => {
    return chartHeight - 10 - ((value - minValue) / range) * (chartHeight - 20);
  };

  const isPositive = changePercent >= 0;
  const chartColor = isPositive ? colors.success : colors.error;

  // Generate SVG path for chart
  const generateChartPath = () => {
    if (chartData.length === 0) return { linePath: '', areaPath: '' };
    
    const points = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * chartWidth;
      const y = getY(point.rate);
      return { x, y };
    });
    
    // Line path
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }
    
    // Area path (for gradient fill)
    let areaPath = linePath;
    areaPath += ` L ${points[points.length - 1].x} ${chartHeight}`;
    areaPath += ` L ${points[0].x} ${chartHeight}`;
    areaPath += ' Z';
    
    return { linePath, areaPath };
  };

  const { linePath, areaPath } = generateChartPath();

  // Get period label
  const getPeriodLabel = () => {
    const labels: Record<string, string> = {
      '1D': 'Past day', '1W': 'Past week', '1M': 'Past month',
      '3M': 'Past 3 months', '1Y': 'Past year', '5Y': 'Past 5 years', '10Y': 'Past 10 years'
    };
    return labels[selectedPeriod] || '';
  };

  // Filter currencies for picker
  const fiatCurrencies = currencies.filter(c => c.category === 'fiat');
  const filteredCurrencies = searchQuery
    ? fiatCurrencies.filter(c => 
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : fiatCurrencies;

  const handleUpgrade = () => {
    setShowPaywall(true);
  };

  const handlePurchase = (planId: string) => {
    // TODO: Integrate with Adapty
    console.log('Purchase plan:', planId);
    setShowPaywall(false);
    // For now, just show alert
    Alert.alert('Purchase', `Selected plan: ${planId}\n\nAdapty integration will be added here.`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* PRO Overlay - shown when not PRO */}
      {!isPro && (
        <BlurView intensity={25} tint="light" style={[styles.proOverlayBlur, { backgroundColor: 'rgba(255, 255, 255, 0.5)' }]}>
          <View style={[styles.proIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <MaterialIcons name="lock" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.proTitle, { color: colors.text }]}>PRO Feature</Text>
          <Text style={[styles.proDescription, { color: colors.textSecondary }]}>
            Unlock charts and historical exchange rate data with PRO subscription
          </Text>
          <TouchableOpacity 
            style={[styles.proButton, { backgroundColor: colors.primary }]}
            onPress={handleUpgrade}
          >
            <MaterialIcons name="star" size={20} color="#FFFFFF" />
            <Text style={styles.proButtonText}>Upgrade to PRO</Text>
          </TouchableOpacity>
        </BlurView>
      )}
      
      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={handlePurchase}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Charts</Text>
        {isPro && (
          <TouchableOpacity 
            style={styles.alertButton}
            onPress={() => Alert.alert('Coming soon', 'This feature will be available soon.')}
          >
            <MaterialIcons name="notifications-none" size={18} color={colors.primary} />
            <Text style={[styles.alertButtonText, { color: colors.primary }]}>Create alert</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={isPro}
        refreshControl={isPro ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            title="Updating rates..."
            titleColor={colors.textSecondary}
          />
        ) : undefined}
      >
        {/* Stats Card with Rate Info */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          {/* Rate Info - Top Section */}
          <View style={styles.rateSection}>
            <Text style={[styles.rateText, { color: colors.text }]}>
              1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
            </Text>
            <Text style={[styles.changeText, { color: isPositive ? colors.success : colors.error }]}>
              {isPositive ? '+' : ''}{changeAmount.toFixed(4)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              <Text style={{ color: colors.textSecondary }}> · {getPeriodLabel()}</Text>
            </Text>
          </View>
          
          {/* Divider */}
          <View style={[styles.horizontalDivider, { backgroundColor: colors.separator }]} />
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>High</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.high.toFixed(4)}</Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.separator }]} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Low</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.low.toFixed(4)}</Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.separator }]} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Average</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.average.toFixed(4)}</Text>
            </View>
          </View>
        </View>

        {/* Chart Card */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
          {isLoading ? (
            <View style={[styles.chartLoading, { height: chartHeight }]}>
              <ActivityIndicator size="large" color={colors.textSecondary} />
            </View>
          ) : error ? (
            <View style={[styles.chartLoading, { height: chartHeight }]}>
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
            </View>
          ) : (
            <View style={styles.chartWithLabels}>
              {/* Y-axis labels */}
              <View style={styles.yAxisLabels}>
                <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>
                  {maxValue.toFixed(3)}
                </Text>
                <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>
                  {midValue.toFixed(3)}
                </Text>
                <Text style={[styles.axisLabel, { color: colors.textTertiary }]}>
                  {minValue.toFixed(3)}
                </Text>
              </View>

              {/* Chart Area */}
              <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
                {/* Grid lines */}
                <View style={[styles.gridLine, { top: 10, backgroundColor: colors.separator }]} />
                <View style={[styles.gridLine, { top: chartHeight / 2, backgroundColor: colors.separator }]} />
                <View style={[styles.gridLine, { top: chartHeight - 10, backgroundColor: colors.separator }]} />

                {/* SVG Chart with gradient */}
                {chartData.length > 0 && (
                  <Svg width={chartWidth} height={chartHeight} style={styles.svgChart}>
                    <Defs>
                      <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={chartColor} stopOpacity="0.2" />
                        <Stop offset="1" stopColor={chartColor} stopOpacity="0" />
                      </LinearGradient>
                    </Defs>
                    
                    {/* Gradient fill */}
                    <Path d={areaPath} fill="url(#chartGradient)" />
                    
                    {/* Line */}
                    <Path
                      d={linePath}
                      stroke={chartColor}
                      strokeWidth={2}
                      fill="none"
                    />
                  </Svg>
                )}

                {/* Current value dot */}
                {chartData.length > 0 && (
                  <View
                    style={[
                      styles.currentDot,
                      {
                        left: chartWidth - 6,
                        top: getY(chartData[chartData.length - 1].rate) - 6,
                        backgroundColor: chartColor,
                        borderColor: colors.surface,
                      },
                    ]}
                  />
                )}
              </View>
            </View>
          )}

          {/* Period Selector inside chart card */}
          <View style={styles.periodContainer}>
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodText,
                  { color: colors.textTertiary },
                  selectedPeriod === period && { color: colors.text },
                ]}>
                  {period.toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Currency Selectors */}
        <View style={styles.currencySelectorsWrapper}>
          <View style={styles.currencySelectorsRow}>
            <TouchableOpacity 
              style={styles.currencySelector}
              onPress={() => openPicker('from')}
            >
              <View style={[styles.selectorFlagCircle, { backgroundColor: getFlagBackground(fromCurrency) }]}>
                <Text style={styles.selectorFlagEmoji}>{fromCurrencyData?.flag}</Text>
              </View>
              <Text style={[styles.selectorCode, { color: colors.text }]}>{fromCurrency}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.currencySelector}
              onPress={() => openPicker('to')}
            >
              <View style={[styles.selectorFlagCircle, { backgroundColor: getFlagBackground(toCurrency) }]}>
                <Text style={styles.selectorFlagEmoji}>{toCurrencyData?.flag}</Text>
              </View>
              <Text style={[styles.selectorCode, { color: colors.text }]}>{toCurrency}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Floating Swap Button - Centered */}
          <View style={styles.swapButtonContainer}>
            <TouchableOpacity 
              style={[styles.swapButton, { backgroundColor: colors.surface, borderColor: colors.border }]} 
              onPress={handleSwapCurrencies}
            >
              <MaterialIcons name="swap-horiz" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Currency Picker Modal */}
      <Modal
        visible={showPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPicker(false)}
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
            <TouchableOpacity onPress={() => { setShowPicker(false); setSearchQuery(''); }}>
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
              const isSelected = (pickingFor === 'from' ? fromCurrency : toCurrency) === item.code;
              return (
                <TouchableOpacity
                  style={[styles.currencyItem, { backgroundColor: colors.surface }]}
                  onPress={() => handleSelectCurrency(item.code)}
                >
                  <View style={[styles.pickerFlagCircle, { backgroundColor: getFlagBackground(item.code) }]}>
                    <Text style={styles.pickerFlagEmoji}>{item.flag}</Text>
                  </View>
                  <View style={styles.currencyItemText}>
                    <Text style={[styles.currencyItemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.currencyItemCode, { color: colors.textSecondary }]}>{item.code}</Text>
                  </View>
                  {isSelected && (
                    <MaterialIcons name="check" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.separator, marginLeft: 78 }} />}
            contentContainerStyle={styles.currencyList}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // PRO Overlay styles
  proOverlayBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  proIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  proTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  proDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  proButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  // Currency Selectors
  currencySelectorsWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  currencySelectorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencySelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
    backgroundColor: '#EBEDF0',
  },
  selectorFlagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorFlagEmoji: {
    fontSize: 20,
  },
  selectorCode: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  swapButtonContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -18,
    marginTop: -18,
    zIndex: 1,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  // Rate Info (inside stats card)
  rateSection: {
    marginBottom: 14,
  },
  rateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  changeText: {
    fontSize: 14,
  },
  // Alert Button (in header)
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  horizontalDivider: {
    height: 1,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
  },
  // Period Selector
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  periodButtonActive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Chart
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  chartLoading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartWithLabels: {
    flexDirection: 'row',
  },
  yAxisLabels: {
    width: 48,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
    marginRight: 8,
  },
  axisLabel: {
    fontSize: 11,
    fontWeight: '400',
  },
  chartArea: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  svgChart: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  currentDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Stats Section
  statsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
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
  currencyList: {
    paddingHorizontal: 16,
  },
  currencyItem: {
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
  currencyItemText: {
    flex: 1,
  },
  currencyItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  currencyItemCode: {
    fontSize: 14,
  },
});
