import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WatchlistStackParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';
import WatchlistHomeScreen from '../screens/watchlist/WatchlistHomeScreen';
import StockDetailScreen from '../screens/stock/StockDetailScreen';
import ManageWatchlistsScreen from '../screens/watchlist/ManageWatchlistsScreen';
import CreateWatchlistScreen from '../screens/watchlist/CreateWatchlistScreen';

const Stack = createNativeStackNavigator<WatchlistStackParamList>();

export default function WatchlistNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="WatchlistHome" component={WatchlistHomeScreen} />
      <Stack.Screen name="StockDetail" component={StockDetailScreen} />
      <Stack.Screen name="ManageWatchlists" component={ManageWatchlistsScreen} />
      <Stack.Screen name="CreateWatchlist" component={CreateWatchlistScreen} />
    </Stack.Navigator>
  );
}
