import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';

type IconName = 'calculate' | 'trending-up' | 'settings';

const TAB_ICONS: Record<string, IconName> = {
  Convert: 'calculate',
  Chart: 'trending-up',
  Settings: 'settings',
};

const ICON_SIZE = 50;
const ICON_GAP = 20;
const BAR_PADDING = 10;

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  // Animation value for the indicator position
  const indicatorPosition = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: state.index,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [state.index]);

  // Calculate the translate X for the indicator
  const tabWidth = ICON_SIZE + ICON_GAP;
  const translateX = indicatorPosition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, tabWidth, tabWidth * 2],
  });

  // Colors based on theme
  const barBackground = isDark ? colors.surface : '#1C1C1E';
  const activeBackground = isDark ? colors.text : '#FFFFFF';
  const activeIconColor = isDark ? colors.surface : '#1C1C1E';
  const inactiveIconColor = isDark ? colors.textSecondary : '#8E8E93';

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
      <View style={[styles.tabBar, { backgroundColor: barBackground }]}>
        {/* Animated indicator background */}
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: activeBackground,
              transform: [{ translateX }],
            },
          ]}
        />
        
        {/* Tab buttons */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconName = TAB_ICONS[route.name] || 'circle';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <MaterialIcons
                  name={iconName}
                  size={24}
                  color={isFocused ? activeIconColor : inactiveIconColor}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: (ICON_SIZE + BAR_PADDING * 2) / 2,
    padding: BAR_PADDING,
    gap: ICON_GAP,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  indicator: {
    position: 'absolute',
    left: BAR_PADDING,
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
