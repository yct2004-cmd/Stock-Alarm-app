import { AlertItem, CreateAlertPayload } from "../types/alert";
import { DeviceResponse, RegisterDevicePayload } from "../types/device";
import Constants from "expo-constants";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  ((Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
    'http://127.0.0.1:8000/api/v1');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function listAlerts(): Promise<AlertItem[]> {
  return request<AlertItem[]>("/alerts");
}

export async function createAlert(payload: CreateAlertPayload): Promise<AlertItem> {
  return request<AlertItem>("/alerts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function toggleAlert(id: number, isEnabled: boolean): Promise<AlertItem> {
  return request<AlertItem>(`/alerts/${id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ is_enabled: isEnabled }),
  });
}

export async function deleteAlert(id: number): Promise<void> {
  return request<void>(`/alerts/${id}`, { method: "DELETE" });
}

export async function registerDevice(
  payload: RegisterDevicePayload
): Promise<DeviceResponse> {
  return request<DeviceResponse>("/devices/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
