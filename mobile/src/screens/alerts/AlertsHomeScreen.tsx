import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../hooks/useTheme';
import { useAlertStore } from '../../store/alertStore';
import { typography, spacing, radii } from '../../constants/theme';
import AlertRow from '../../components/alerts/AlertRow';
import Divider from '../../components/common/Divider';
import EmptyState from '../../components/common/EmptyState';
import type { AlertsNavigationProp } from '../../types/navigation';
import type { AlertStatus } from '../../types/models';

type Filter = 'all' | AlertStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Paused' },
  { key: 'triggered', label: 'Triggered' },
];

export default function AlertsHomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AlertsNavigationProp>();
  const { alerts, toggleAlert, deleteAlert } = useAlertStore();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);

  const handleDelete = (id: string, symbol: string) => {
    Alert.alert('Delete Alert', `Delete alert for ${symbol}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAlert(id) },
    ]);
  };

  const counts = {
    all: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    inactive: alerts.filter(a => a.status === 'inactive').length,
    triggered: alerts.filter(a => a.status === 'triggered').length,
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
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Alerts</Text>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateAlert', undefined)}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.createBtnText}>New Alert</Text>
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <View style={styles.filters}>
          {FILTERS.map(f => {
            const active = f.key === filter;
            const count = counts[f.key];
            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterTab,
                  active && { backgroundColor: colors.primary },
                  !active && { backgroundColor: colors.surfacePress },
                ]}
                onPress={() => setFilter(f.key)}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    { color: active ? '#fff' : colors.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      { backgroundColor: active ? 'rgba(255,255,255,0.3)' : colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        { color: active ? '#fff' : colors.textTertiary },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title={filter === 'all' ? 'No alerts yet' : `No ${filter} alerts`}
          description={
            filter === 'all'
              ? 'Create an alert to get notified when price or technical conditions are met.'
              : undefined
          }
          actionLabel={filter === 'all' ? 'Create Alert' : undefined}
          onAction={filter === 'all' ? () => navigation.navigate('CreateAlert', undefined) : undefined}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={a => a.id}
          ItemSeparatorComponent={() => <Divider indent={spacing[4]} />}
          renderItem={({ item }) => (
            <AlertRow
              alert={item}
              onPress={() => navigation.navigate('AlertDetail', { alertId: item.id })}
              onToggle={active => toggleAlert(item.id, active)}
              onDelete={() => handleDelete(item.id, item.symbol)}
            />
          )}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 20 }]}
        onPress={() => navigation.navigate('CreateAlert', undefined)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: spacing[3], paddingHorizontal: spacing[4] },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] },
  title: { fontSize: typography.size['2xl'], fontWeight: typography.weight.bold, letterSpacing: -0.5 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing[3], paddingVertical: 8,
    borderRadius: radii.full,
  },
  createBtnText: { color: '#fff', fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  filters: { flexDirection: 'row', gap: spacing[2] },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing[3], paddingVertical: 6,
    borderRadius: radii.full,
  },
  filterLabel: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  filterBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: radii.full },
  filterBadgeText: { fontSize: 10, fontWeight: typography.weight.semibold },
  fab: {
    position: 'absolute', right: spacing[5],
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
});
