export interface RegisterDevicePayload {
  expo_push_token: string;
}

export interface DeviceResponse {
  id: number;
  expo_push_token: string;
  is_active: boolean;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}
