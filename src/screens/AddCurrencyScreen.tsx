import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useCurrencyStore } from '../store/currencyStore';
import { currencies, Currency } from '../data/currencies';
import { SearchInput } from '../components/SearchInput';
import { SegmentedControl } from '../components/SegmentedControl';
import { SectionHeader } from '../components/SectionHeader';
import { Separator } from '../components/Separator';

type CategoryFilter = 'all' | 'crypto' | 'metal';

export const AddCurrencyScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { selectedCurrencies, addCurrency, locationSuggestions } = useCurrencyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [addedCurrencies, setAddedCurrencies] = useState<string[]>([]);

  const categoryOptions = ['All', 'Crypto', 'Metal'];
  const categoryMap: Record<number, CategoryFilter> = {
    0: 'all',
    1: 'crypto',
    2: 'metal',
  };

  const filteredCurrencies = useMemo(() => {
    let result = currencies;

    // Filter by category
    const category = categoryMap[categoryIndex];
    if (category !== 'all') {
      result = result.filter((c) => c.category === category);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(query) ||
          c.name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [categoryIndex, searchQuery]);

  const locationCurrencies = useMemo(() => {
    // Mock location-based suggestion for Georgia
    return currencies.filter((c) => c.code === 'GEL');
  }, []);

  const handleAddCurrency = (code: string) => {
    if (!selectedCurrencies.includes(code)) {
      addCurrency(code);
      setAddedCurrencies((prev) => [...prev, code]);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const isSelected = (code: string) =>
    selectedCurrencies.includes(code) || addedCurrencies.includes(code);

  const renderCurrencyItem = ({ item, index }: { item: Currency; index: number }) => (
    <>
      <TouchableOpacity
        style={[styles.currencyRow, { backgroundColor: colors.surface }]}
        onPress={() => handleAddCurrency(item.code)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.code, { color: colors.textSecondary }]}>
            {item.code}
          </Text>
        </View>
        <View
          style={[
            styles.checkCircle,
            isSelected(item.code)
              ? { backgroundColor: colors.success }
              : { borderColor: colors.border, borderWidth: 2 },
          ]}
        >
          {isSelected(item.code) && (
            <Text style={styles.checkMark}>✓</Text>
          )}
        </View>
      </TouchableOpacity>
      {index < filteredCurrencies.length - 1 && <Separator />}
    </>
  );

  const renderHeader = () => (
    <View>
      {locationSuggestions && locationCurrencies.length > 0 && categoryIndex === 0 && !searchQuery && (
        <>
          <SectionHeader title="My Location — Georgia" />
          <View style={[styles.listContainer, { backgroundColor: colors.surface }]}>
            {locationCurrencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={styles.currencyRow}
                onPress={() => handleAddCurrency(currency.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{currency.flag}</Text>
                <View style={styles.textContainer}>
                  <Text style={[styles.name, { color: colors.text }]}>
                    {currency.name}
                  </Text>
                  <Text style={[styles.code, { color: colors.textSecondary }]}>
                    {currency.code}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkCircle,
                    isSelected(currency.code)
                      ? { backgroundColor: colors.success }
                      : { borderColor: colors.border, borderWidth: 2 },
                  ]}
                >
                  {isSelected(currency.code) && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      <SectionHeader title="All Currencies" />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Currency</Text>
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <Text style={[styles.doneText, { color: colors.primary }]}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlsContainer}>
        <SegmentedControl
          options={categoryOptions}
          selectedIndex={categoryIndex}
          onSelect={setCategoryIndex}
        />
      </View>

      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search currencies..."
      />

      <FlatList
        data={filteredCurrencies}
        keyExtractor={(item) => item.code}
        renderItem={renderCurrencyItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 12,
  },
  headerButton: {
    width: 60,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  doneText: {
    fontSize: 17,
    fontWeight: '500',
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  listContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flag: {
    fontSize: 32,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    marginBottom: 2,
  },
  code: {
    fontSize: 13,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
