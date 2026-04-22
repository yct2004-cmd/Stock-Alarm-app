import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, CompositeScreenProps } from '@react-navigation/native';

// ─── Stack param lists ────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type AppTabParamList = {
  WatchlistTab: undefined;
  SearchTab: undefined;
  AlertsTab: undefined;
  PortfolioTab: undefined;
  SettingsTab: undefined;
};

export type WatchlistStackParamList = {
  WatchlistHome: undefined;
  StockDetail: { symbol: string; name: string };
  ManageWatchlists: undefined;
  CreateWatchlist: undefined;
};

export type SearchStackParamList = {
  SearchHome: undefined;
  StockDetail: { symbol: string; name: string };
};

export type AlertsStackParamList = {
  AlertsHome: undefined;
  CreateAlert: { symbol?: string; name?: string } | undefined;
  EditAlert: { alertId: string };
  AlertDetail: { alertId: string };
  AlertHistory: undefined;
};

export type PortfolioStackParamList = {
  PortfolioHome: undefined;
  AddHolding: undefined;
  EditHolding: { holdingId: string };
  StockDetail: { symbol: string; name: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  AccountSettings: undefined;
  NotificationSettings: undefined;
  AppearanceSettings: undefined;
  About: undefined;
};

// ─── Screen prop types (convenience exports) ─────────────────────────────────

export type WatchlistHomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<WatchlistStackParamList, 'WatchlistHome'>,
  BottomTabScreenProps<AppTabParamList>
>;

export type StockDetailScreenProps = NativeStackScreenProps<
  WatchlistStackParamList,
  'StockDetail'
>;

export type CreateAlertScreenProps = NativeStackScreenProps<
  AlertsStackParamList,
  'CreateAlert'
>;

export type EditAlertScreenProps = NativeStackScreenProps<
  AlertsStackParamList,
  'EditAlert'
>;

// ─── Navigation prop types (for useNavigation hook typing) ───────────────────

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type AppTabNavigationProp = BottomTabNavigationProp<AppTabParamList>;

export type WatchlistNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<WatchlistStackParamList>,
  AppTabNavigationProp
>;

export type AlertsNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<AlertsStackParamList>,
  AppTabNavigationProp
>;
