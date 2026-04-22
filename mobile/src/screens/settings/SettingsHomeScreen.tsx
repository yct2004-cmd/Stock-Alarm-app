import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../hooks/useTheme';
import { useAuthStore, selectUser } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useNotificationStore } from '../../store/notificationStore';
import { typography, spacing, radii } from '../../constants/theme';
import { APP_NAME, APP_VERSION } from '../../constants';

export default function SettingsHomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore(selectUser);
  const logout = useAuthStore(s => s.logout);
  const { settings, updateSettings } = useSettingsStore();
  const { notifications, unreadCount, markAllRead } = useNotificationStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top + 8 },
        ]}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Profile card */}
        {user && (
          <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.displayName, { color: colors.textPrimary }]}>
                {user.displayName}
              </Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('AccountSettings')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications section */}
        <SectionLabel label="NOTIFICATIONS" colors={colors} />
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon="notifications-outline"
            iconBg="#3B82F6"
            label="Notification Center"
            badge={unreadCount > 0 ? String(unreadCount) : undefined}
            onPress={() => {
              markAllRead();
              navigation.navigate('NotificationSettings');
            }}
            colors={colors}
          />
          <Separator colors={colors} />
          <SettingsRow
            icon="moon-outline"
            iconBg="#6366F1"
            label="Quiet Hours"
            value={settings.quietHoursEnabled ? 'On' : 'Off'}
            onPress={() => navigation.navigate('NotificationSettings')}
            colors={colors}
          />
        </View>

        {/* Appearance */}
        <SectionLabel label="APPEARANCE" colors={colors} />
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="moon-outline" size={16} color="#fff" />
            </View>
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={settings.theme === 'dark' ? colors.primary : colors.textTertiary}
            />
          </View>
          <Separator colors={colors} />
          <SettingsRow
            icon="color-palette-outline"
            iconBg="#EC4899"
            label="Appearance"
            value={settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
            onPress={() => navigation.navigate('AppearanceSettings')}
            colors={colors}
          />
        </View>

        {/* Account */}
        <SectionLabel label="ACCOUNT" colors={colors} />
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon="person-outline"
            iconBg="#22C55E"
            label="Account Settings"
            onPress={() => navigation.navigate('AccountSettings')}
            colors={colors}
          />
          <Separator colors={colors} />
          <SettingsRow
            icon="shield-outline"
            iconBg="#F59E0B"
            label="Privacy & Security"
            onPress={() => {}}
            colors={colors}
          />
        </View>

        {/* About */}
        <SectionLabel label="ABOUT" colors={colors} />
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon="information-circle-outline"
            iconBg="#6B7280"
            label="About"
            value={`v${APP_VERSION}`}
            onPress={() => navigation.navigate('About')}
            colors={colors}
          />
          <Separator colors={colors} />
          <SettingsRow
            icon="document-text-outline"
            iconBg="#6B7280"
            label="Market Data Disclaimer"
            onPress={() => navigation.navigate('About')}
            colors={colors}
          />
        </View>

        {/* Sign out */}
        <View style={[styles.group, { backgroundColor: colors.surface, marginTop: spacing[6] }]}>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={[styles.iconWrap, { backgroundColor: '#EF4444' }]}>
              <Ionicons name="log-out-outline" size={16} color="#fff" />
            </View>
            <Text style={[styles.rowLabel, { color: '#EF4444', fontWeight: typography.weight.medium }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          {APP_NAME} · Data for informational purposes only.{'\n'}Not financial advice.
        </Text>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[slStyles.label, { color: colors.textTertiary }]}>{label}</Text>
  );
}

function Separator({ colors }: { colors: any }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: 52 }]} />;
}

function SettingsRow({
  icon, iconBg, label, value, badge, onPress, colors,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  label: string;
  value?: string;
  badge?: string;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color="#fff" />
      </View>
      <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
      <View style={styles.rowRight}>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : value ? (
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>
        ) : null}
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: typography.size['2xl'], fontWeight: typography.weight.bold, letterSpacing: -0.5 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing[4],
    padding: spacing[4],
    borderRadius: radii.lg,
    gap: spacing[3],
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: typography.size.xl, fontWeight: typography.weight.bold },
  profileInfo: { flex: 1 },
  displayName: { fontSize: typography.size.base, fontWeight: typography.weight.semibold },
  email: { fontSize: typography.size.sm, marginTop: 2 },
  group: {
    marginHorizontal: spacing[4],
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  iconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: typography.size.base },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: typography.size.sm },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.full },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: typography.weight.bold },
  footer: {
    textAlign: 'center',
    fontSize: typography.size.xs,
    lineHeight: 18,
    paddingHorizontal: spacing[8],
    marginTop: spacing[4],
  },
});

const slStyles = StyleSheet.create({
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: spacing[4] + 4,
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
});
