import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWatchlistStore } from '../store/watchlistStore';
import { useAlertStore } from '../store/alertStore';
import { usePortfolioStore } from '../store/portfolioStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSettingsStore } from '../store/settingsStore';

/**
 * Hydrates all persistent stores from AsyncStorage before the UI renders.
 * Returns `isReady` — false until all stores have loaded.
 */
export function useAppHydration(): boolean {
  const [isReady, setIsReady] = useState(false);
  const hydrateAuth = useAuthStore(s => s.hydrate);
  const hydrateWatchlists = useWatchlistStore(s => s.hydrate);
  const hydrateAlerts = useAlertStore(s => s.hydrate);
  const hydratePortfolio = usePortfolioStore(s => s.hydrate);
  const hydrateNotifications = useNotificationStore(s => s.hydrate);
  const hydrateSettings = useSettingsStore(s => s.hydrate);

  useEffect(() => {
    Promise.all([
      hydrateAuth(),
      hydrateWatchlists(),
      hydrateAlerts(),
      hydratePortfolio(),
      hydrateNotifications(),
      hydrateSettings(),
    ]).finally(() => setIsReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return isReady;
}
