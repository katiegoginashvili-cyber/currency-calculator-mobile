import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const PromoCard: React.FC = () => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: '#FFD60A' }]}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>💎</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Upgrade to Currency+</Text>
        <Text style={styles.subtitle}>Remove ads, unlock all features</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: 'rgba(0, 0, 0, 0.4)',
    fontWeight: '300',
  },
});
