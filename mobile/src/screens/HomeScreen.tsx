import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { AlertItem } from "../types/alert";

interface Props {
  alerts: AlertItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onAddPress: () => void;
  onToggle: (item: AlertItem, nextEnabled: boolean) => void;
  onDelete: (item: AlertItem) => void;
}

function formatCondition(item: AlertItem): string {
  if (item.condition_type === "ma" && item.ma_window) {
    return `MA${item.ma_window}`;
  }
  return `Price <= ${item.target_price ?? "-"}`;
}

function formatSessions(item: AlertItem): string {
  const sessions: string[] = [];
  if (item.monitor_premarket) sessions.push("盘前");
  if (item.monitor_regular) sessions.push("盘中");
  if (item.monitor_afterhours) sessions.push("盘后");
  return sessions.join(" / ");
}

export function HomeScreen({
  alerts,
  loading,
  error,
  onRefresh,
  onAddPress,
  onToggle,
  onDelete,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Alarm Alerts</Text>
      <View style={styles.row}>
        <Pressable style={styles.primaryBtn} onPress={onAddPress}>
          <Text style={styles.primaryBtnText}>+ Add Alert</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={onRefresh}>
          <Text style={styles.secondaryBtnText}>Refresh</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator size="large" />}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={alerts}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No alerts yet.</Text> : null
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.ticker}>{item.ticker}</Text>
            <Text style={styles.meta}>Condition: {formatCondition(item)}</Text>
            <Text style={styles.meta}>Sessions: {formatSessions(item)}</Text>
            <View style={styles.cardActions}>
              <View style={styles.switchWrap}>
                <Text>Enabled</Text>
                <Switch
                  value={item.is_enabled}
                  onValueChange={(next) => onToggle(item, next)}
                />
              </View>
              <Pressable
                style={styles.deleteBtn}
                onPress={() =>
                  Alert.alert(
                    "Delete Alert",
                    `Delete ${item.ticker} alert?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => onDelete(item) },
                    ]
                  )
                }
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 56, backgroundColor: "#f8fafc" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  primaryBtn: {
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
  secondaryBtn: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  secondaryBtnText: { color: "#0f172a", fontWeight: "600" },
  listContent: { paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  ticker: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  meta: { color: "#334155", marginBottom: 2 },
  cardActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  deleteBtn: { backgroundColor: "#fee2e2", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  deleteBtnText: { color: "#b91c1c", fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#64748b", marginTop: 40 },
  errorText: { color: "#dc2626", marginBottom: 8 },
});
