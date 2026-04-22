import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { AppTabParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';
import { useNotificationStore } from '../store/notificationStore';
import { typography, radii } from '../constants/theme';

import WatchlistNavigator from './WatchlistNavigator';
import SearchNavigator from './SearchNavigator';
import AlertsNavigator from './AlertsNavigator';
import PortfolioNavigator from './PortfolioNavigator';
import SettingsNavigator from './SettingsNavigator';

const Tab = createBottomTabNavigator<AppTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  active: IoniconsName;
  inactive: IoniconsName;
  label: string;
}

const TAB_ICONS: Record<keyof AppTabParamList, TabConfig> = {
  WatchlistTab: { active: 'star',         inactive: 'star-outline',         label: 'Watchlist' },
  SearchTab:    { active: 'search',        inactive: 'search-outline',        label: 'Search'    },
  AlertsTab:    { active: 'notifications', inactive: 'notifications-outline', label: 'Alerts'    },
  PortfolioTab: { active: 'pie-chart',     inactive: 'pie-chart-outline',     label: 'Portfolio' },
  SettingsTab:  { active: 'person',        inactive: 'person-outline',        label: 'Settings'  },
};

export default function TabNavigator() {
  const { colors } = useTheme();
  const unreadCount = useNotificationStore(s => s.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const cfg = TAB_ICONS[route.name as keyof AppTabParamList];
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingBottom: 4,
            paddingTop: 4,
            height: 60,
          },
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarLabelStyle: {
            fontSize: typography.size.xs,
            fontWeight: typography.weight.medium,
            marginTop: 2,
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? cfg.active : cfg.inactive}
              size={size - 2}
              color={color}
            />
          ),
          tabBarLabel: cfg.label,
        };
      }}
    >
      <Tab.Screen name="WatchlistTab" component={WatchlistNavigator} />
      <Tab.Screen name="SearchTab" component={SearchNavigator} />
      <Tab.Screen
        name="AlertsTab"
        component={AlertsNavigator}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#EF4444',
            fontSize: 10,
            minWidth: 16,
            height: 16,
            borderRadius: radii.full,
          },
        }}
      />
      <Tab.Screen name="PortfolioTab" component={PortfolioNavigator} />
      <Tab.Screen name="SettingsTab" component={SettingsNavigator} />
    </Tab.Navigator>
  );
}
