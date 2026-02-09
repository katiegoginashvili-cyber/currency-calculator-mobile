import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SeparatorProps {
  inset?: boolean;
}

export const Separator: React.FC<SeparatorProps> = ({ inset = true }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.separator,
        { backgroundColor: colors.separatorColor },
        inset && styles.inset,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  inset: {
    marginLeft: 56,
  },
});
