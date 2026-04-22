export type ConditionType = "ma" | "price";
export type MAWindow = 5 | 10 | 20 | 30 | 60;

export interface AlertItem {
  id: number;
  ticker: string;
  condition_type: ConditionType;
  ma_window: MAWindow | null;
  target_price: number | null;
  monitor_premarket: boolean;
  monitor_regular: boolean;
  monitor_afterhours: boolean;
  is_enabled: boolean;
  last_triggered_at: string | null;
  last_triggered_price: number | null;
  cooldown_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAlertPayload {
  ticker: string;
  condition_type: ConditionType;
  ma_window?: MAWindow;
  target_price?: number;
  monitor_premarket: boolean;
  monitor_regular: boolean;
  monitor_afterhours: boolean;
  is_enabled: boolean;
}
