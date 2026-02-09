import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedIndex,
  onSelect,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.inputBackground }]}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            selectedIndex === index && {
              backgroundColor: colors.surface,
            },
          ]}
          onPress={() => onSelect(index)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.optionText,
              {
                color: selectedIndex === index ? colors.text : colors.textSecondary,
                fontWeight: selectedIndex === index ? '600' : '400',
              },
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 13,
  },
});
