import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface SettingsRowProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  leftIcon?: React.ReactNode;
  rightContent?: React.ReactNode;
  disabled?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  title,
  subtitle,
  onPress,
  showArrow = false,
  toggleValue,
  onToggle,
  leftIcon,
  rightContent,
  disabled = false,
}) => {
  const { colors } = useTheme();

  const content = (
    <View style={styles.container}>
      {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            { color: disabled ? colors.textSecondary : colors.text },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightContent}
      {toggleValue !== undefined && onToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.success }}
          thumbColor="#FFFFFF"
          style={styles.switch}
        />
      )}
      {showArrow && (
        <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
      )}
    </View>
  );

  if (onPress && toggleValue === undefined) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6} disabled={disabled}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  iconContainer: {
    marginRight: 14,
    width: 24,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  switch: {
    marginLeft: 8,
  },
});
