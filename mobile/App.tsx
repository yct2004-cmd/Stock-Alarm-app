import React, { useCallback, useEffect, useState } from "react";
import { Alert, SafeAreaView, StatusBar } from "react-native";
import { AddAlertScreen } from "./src/screens/AddAlertScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import {
  createAlert,
  deleteAlert,
  listAlerts,
  registerDevice,
  toggleAlert,
} from "./src/services/api";
import { registerForPushNotificationsAsync } from "./src/services/notifications";
import { AlertItem, CreateAlertPayload } from "./src/types/alert";

type ScreenName = "home" | "add";

export default function App() {
  const [screen, setScreen] = useState<ScreenName>("home");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await listAlerts();
      setAlerts(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    (async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (!token) return;
        await registerDevice({ expo_push_token: token });
      } catch (e) {
        console.log("Push token registration failed:", e);
      }
    })();
  }, []);

  const handleCreate = async (payload: CreateAlertPayload) => {
    await createAlert(payload);
    setScreen("home");
    await fetchAlerts();
  };

  const handleToggle = async (item: AlertItem, nextEnabled: boolean) => {
    try {
      await toggleAlert(item.id, nextEnabled);
      await fetchAlerts();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to toggle alert.");
    }
  };

  const handleDelete = async (item: AlertItem) => {
    try {
      await deleteAlert(item.id);
      await fetchAlerts();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to delete alert.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      {screen === "home" ? (
        <HomeScreen
          alerts={alerts}
          loading={loading}
          error={error}
          onRefresh={fetchAlerts}
          onAddPress={() => setScreen("add")}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ) : (
        <AddAlertScreen onCancel={() => setScreen("home")} onSubmit={handleCreate} />
      )}
    </SafeAreaView>
  );
}
