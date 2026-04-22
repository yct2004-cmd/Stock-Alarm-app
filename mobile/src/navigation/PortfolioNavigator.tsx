import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PortfolioStackParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';
import PortfolioHomeScreen from '../screens/portfolio/PortfolioHomeScreen';
import AddHoldingScreen from '../screens/portfolio/AddHoldingScreen';
import EditHoldingScreen from '../screens/portfolio/EditHoldingScreen';
import StockDetailScreen from '../screens/stock/StockDetailScreen';

const Stack = createNativeStackNavigator<PortfolioStackParamList>();

export default function PortfolioNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="PortfolioHome" component={PortfolioHomeScreen} />
      <Stack.Screen
        name="AddHolding"
        component={AddHoldingScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="EditHolding"
        component={EditHoldingScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="StockDetail" component={StockDetailScreen} />
    </Stack.Navigator>
  );
}
