import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AlertsStackParamList } from '../types/navigation';
import { useTheme } from '../hooks/useTheme';
import AlertsHomeScreen from '../screens/alerts/AlertsHomeScreen';
import CreateAlertScreen from '../screens/alerts/CreateAlertScreen';
import EditAlertScreen from '../screens/alerts/EditAlertScreen';
import AlertDetailScreen from '../screens/alerts/AlertDetailScreen';
import AlertHistoryScreen from '../screens/alerts/AlertHistoryScreen';

const Stack = createNativeStackNavigator<AlertsStackParamList>();

export default function AlertsNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="AlertsHome" component={AlertsHomeScreen} />
      <Stack.Screen
        name="CreateAlert"
        component={CreateAlertScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="EditAlert"
        component={EditAlertScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="AlertDetail" component={AlertDetailScreen} />
      <Stack.Screen name="AlertHistory" component={AlertHistoryScreen} />
    </Stack.Navigator>
  );
}
