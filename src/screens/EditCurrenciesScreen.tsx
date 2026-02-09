import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useCurrencyStore, FREE_LIMITS } from '../store/currencyStore';
import { currencies, getCurrencyByCode, Currency, getFlagBackground } from '../data/currencies';
import { PaywallModal } from '../components/PaywallModal';

export const EditCurrenciesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const {
    selectedCurrencies,
    addCurrency,
    removeCurrency,
    reorderCurrency,
    isPro,
    canAddCurrency,
  } = useCurrencyStore();

  const [viewMode, setViewMode] = useState<'selected' | 'all'>('selected');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

  const handleClose = () => {
    navigation.goBack();
  };

  const showPaywallModal = () => {
    setShowPaywall(true);
  };

  const handlePurchase = (planId: string) => {
    // TODO: Integrate with Adapty
    console.log('Purchase plan:', planId);
    setShowPaywall(false);
    Alert.alert('Purchase', `Selected plan: ${planId}\n\nAdapty integration will be added here.`);
  };

  const handleToggleCurrency = (code: string) => {
    if (selectedCurrencies.includes(code)) {
      removeCurrency(code);
    } else {
      // Check currency limit
      if (!canAddCurrency()) {
        showPaywallModal();
        return;
      }
      addCurrency(code);
    }
  };

  const handleRemove = useCallback((code: string) => {
    removeCurrency(code);
  }, [removeCurrency]);

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderCurrency(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < selectedCurrencies.length - 1) {
      reorderCurrency(index, index + 1);
    }
  };

  const selectedCurrencyItems = useMemo(() => {
    return selectedCurrencies.map(code => getCurrencyByCode(code)).filter(Boolean) as Currency[];
  }, [selectedCurrencies]);

  const allCurrencyItems = useMemo(() => {
    let list = currencies.filter(c => c.category === 'fiat');

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(query) ||
          c.name.toLowerCase().includes(query)
      );
    }

    return list;
  }, [searchQuery]);

  const renderSelectedItem = (item: Currency, index: number) => {
    const isFirst = index === 0;
    const isLast = index === selectedCurrencyItems.length - 1;

    return (
      <View key={item.code}>
        <View style={[styles.row, { backgroundColor: colors.surface }]}>
          {/* Reorder buttons */}
          <View style={styles.reorderContainer}>
            <TouchableOpacity
              style={[styles.reorderButton, isFirst && styles.reorderButtonDisabled]}
              onPress={() => handleMoveUp(index)}
              disabled={isFirst}
            >
              <MaterialIcons 
                name="keyboard-arrow-up" 
                size={22} 
                color={isFirst ? colors.border : colors.textSecondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reorderButton, isLast && styles.reorderButtonDisabled]}
              onPress={() => handleMoveDown(index)}
              disabled={isLast}
            >
              <MaterialIcons 
                name="keyboard-arrow-down" 
                size={22} 
                color={isLast ? colors.border : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.flagCircle, { backgroundColor: getFlagBackground(item.code) }]}>
            <Text style={styles.flag}>{item.flag}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.code, { color: colors.textSecondary }]}>{item.code}</Text>
          </View>

          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colors.error }]}
            onPress={() => handleRemove(item.code)}
          >
            <MaterialIcons name="remove" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {!isLast && <View style={[styles.separator, { backgroundColor: colors.separator, marginLeft: 98 }]} />}
      </View>
    );
  };

  const renderAllItem = (item: Currency, index: number) => {
    const isSelected = selectedCurrencies.includes(item.code);
    const isLast = index === allCurrencyItems.length - 1;

    return (
      <View key={item.code}>
        <TouchableOpacity
          style={[styles.row, { backgroundColor: colors.surface }]}
          onPress={() => handleToggleCurrency(item.code)}
          activeOpacity={0.7}
        >
          <View style={[styles.flagCircle, { backgroundColor: getFlagBackground(item.code) }]}>
            <Text style={styles.flag}>{item.flag}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.code, { color: colors.textSecondary }]}>{item.code}</Text>
          </View>

          <View
            style={[
              styles.checkCircle,
              isSelected
                ? { backgroundColor: colors.success }
                : { borderColor: colors.border, borderWidth: 2 },
            ]}
          >
            {isSelected && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>
        {!isLast && <View style={[styles.separator, { backgroundColor: colors.separator, marginLeft: 78 }]} />}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Currencies</Text>
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <Text style={[styles.doneText, { color: colors.primary }]}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.border }]}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search currencies..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* View Mode Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'selected' && { backgroundColor: colors.surface }]}
          onPress={() => setViewMode('selected')}
        >
          <Text style={[
            styles.tabText,
            { color: viewMode === 'selected' ? colors.text : colors.textSecondary }
          ]}>
            Selected ({selectedCurrencies.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'all' && { backgroundColor: colors.surface }]}
          onPress={() => setViewMode('all')}
        >
          <Text style={[
            styles.tabText,
            { color: viewMode === 'all' ? colors.text : colors.textSecondary }
          ]}>
            All Currencies
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[styles.listContent, { backgroundColor: colors.surface }]}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'selected' ? (
          selectedCurrencyItems.length > 0 ? (
            selectedCurrencyItems.map((item, index) => renderSelectedItem(item, index))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No currencies selected
              </Text>
            </View>
          )
        ) : (
          allCurrencyItems.length > 0 ? (
            allCurrencyItems.map((item, index) => renderAllItem(item, index))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No currencies found
              </Text>
            </View>
          )
        )}
      </ScrollView>

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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  reorderContainer: {
    marginRight: 10,
  },
  reorderButton: {
    padding: 2,
  },
  reorderButtonDisabled: {
    opacity: 0.3,
  },
  flagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  flag: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  code: {
    fontSize: 14,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
});
