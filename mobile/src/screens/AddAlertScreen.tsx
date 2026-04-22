import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { ConditionType, CreateAlertPayload, MAWindow } from "../types/alert";

interface Props {
  onCancel: () => void;
  onSubmit: (payload: CreateAlertPayload) => Promise<void>;
}

const MA_WINDOWS: MAWindow[] = [5, 10, 20, 30, 60];

export function AddAlertScreen({ onCancel, onSubmit }: Props) {
  const [ticker, setTicker] = useState("");
  const [conditionType, setConditionType] = useState<ConditionType>("ma");
  const [maWindow, setMaWindow] = useState<MAWindow>(20);
  const [targetPrice, setTargetPrice] = useState("");
  const [monitorPremarket, setMonitorPremarket] = useState(false);
  const [monitorRegular, setMonitorRegular] = useState(true);
  const [monitorAfterhours, setMonitorAfterhours] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!ticker.trim()) return false;
    if (!monitorPremarket && !monitorRegular && !monitorAfterhours) return false;
    if (conditionType === "price") {
      return Number(targetPrice) > 0;
    }
    return true;
  }, [ticker, monitorPremarket, monitorRegular, monitorAfterhours, conditionType, targetPrice]);

  const handleSubmit = async () => {
    setError(null);
    if (!canSubmit) return;
    const payload: CreateAlertPayload = {
      ticker: ticker.trim().toUpperCase(),
      condition_type: conditionType,
      monitor_premarket: monitorPremarket,
      monitor_regular: monitorRegular,
      monitor_afterhours: monitorAfterhours,
      is_enabled: true,
      ...(conditionType === "ma"
        ? { ma_window: maWindow }
        : { target_price: Number(targetPrice) }),
    };
    try {
      setSubmitting(true);
      await onSubmit(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create alert.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Alert</Text>

      <Text style={styles.label}>Ticker</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. NVDA / QQQ / ^IXIC"
        autoCapitalize="characters"
        value={ticker}
        onChangeText={setTicker}
      />

      <Text style={styles.label}>Condition Type</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.chip, conditionType === "ma" && styles.chipActive]}
          onPress={() => setConditionType("ma")}
        >
          <Text style={styles.chipText}>MA</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, conditionType === "price" && styles.chipActive]}
          onPress={() => setConditionType("price")}
        >
          <Text style={styles.chipText}>Custom Price</Text>
        </Pressable>
      </View>

      {conditionType === "ma" ? (
        <>
          <Text style={styles.label}>MA Window</Text>
          <View style={styles.rowWrap}>
            {MA_WINDOWS.map((w) => (
              <Pressable
                key={w}
                style={[styles.chip, maWindow === w && styles.chipActive]}
                onPress={() => setMaWindow(w)}
              >
                <Text style={styles.chipText}>MA{w}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.label}>Target Price</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 432.00"
            value={targetPrice}
            keyboardType="decimal-pad"
            onChangeText={setTargetPrice}
          />
        </>
      )}

      <Text style={styles.label}>Sessions</Text>
      <View style={styles.sessionRow}>
        <Text>Premarket</Text>
        <Switch value={monitorPremarket} onValueChange={setMonitorPremarket} />
      </View>
      <View style={styles.sessionRow}>
        <Text>Regular</Text>
        <Switch value={monitorRegular} onValueChange={setMonitorRegular} />
      </View>
      <View style={styles.sessionRow}>
        <Text>Afterhours</Text>
        <Switch value={monitorAfterhours} onValueChange={setMonitorAfterhours} />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.footerRow}>
        <Pressable style={styles.secondaryBtn} onPress={onCancel} disabled={submitting}>
          <Text>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryBtn, (!canSubmit || submitting) && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          <Text style={styles.primaryBtnText}>{submitting ? "Saving..." : "Create"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, paddingTop: 56, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  label: { marginTop: 10, marginBottom: 6, fontWeight: "600", color: "#0f172a" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  row: { flexDirection: "row", gap: 10 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { borderColor: "#1d4ed8", backgroundColor: "#dbeafe" },
  chipText: { fontWeight: "600", color: "#0f172a" },
  sessionRow: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  primaryBtn: {
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "600" },
  secondaryBtn: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  errorText: { color: "#dc2626", marginTop: 8 },
});
