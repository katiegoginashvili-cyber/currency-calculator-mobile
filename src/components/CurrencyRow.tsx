import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getCurrencyByCode, formatCurrencyValue, getFlagBackground } from '../data/currencies';
import { useCurrencyStore, getConvertedAmount } from '../store/currencyStore';

interface CurrencyRowProps {
  currencyCode: string;
  onPress?: () => void;
  showValue?: boolean;
  showConversion?: boolean; // Show "USD to EUR" style text
}

export const CurrencyRow: React.FC<CurrencyRowProps> = ({
  currencyCode,
  onPress,
  showValue = true,
  showConversion = false,
}) => {
  const { colors } = useTheme();
  const { currentAmount, baseCurrency, rates, decimalDigits } = useCurrencyStore();
  
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return null;

  const convertedAmount = getConvertedAmount(currentAmount, baseCurrency, currencyCode, rates);
  const isBase = currencyCode === baseCurrency;

  // Format value without currency symbol for cleaner look
  const formatValue = (value: number): string => {
    const decimals = decimalDigits !== null ? decimalDigits : 2;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.flagContainer, { backgroundColor: getFlagBackground(currencyCode) }]}>
        <Text style={styles.flag}>{currency.flag}</Text>
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {currency.name}
        </Text>
        <Text style={[styles.code, { color: colors.textSecondary }]}>
          {showConversion ? `${currencyCode} to ${baseCurrency}` : currencyCode}
        </Text>
      </View>
      
      {showValue && (
        <View style={styles.valueContainer}>
          <Text style={[
            styles.value, 
            { color: colors.text },
            isBase && styles.valueBase
          ]}>
            {isBase ? currentAmount : formatValue(convertedAmount)}
          </Text>
          <View style={[styles.underline, { backgroundColor: colors.border }]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  flagContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  flag: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  code: {
    fontSize: 14,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 17,
    fontWeight: '400',
    paddingBottom: 2,
  },
  valueBase: {
    fontWeight: '600',
  },
  underline: {
    height: 1,
    width: '100%',
    marginTop: 2,
  },
});
