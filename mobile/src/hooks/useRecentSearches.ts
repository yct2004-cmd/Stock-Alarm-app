import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS } from '../constants';

const MAX_RECENT = 10;

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(ASYNC_STORAGE_KEYS.RECENT_SEARCHES).then(raw => {
      if (raw) setRecent(JSON.parse(raw));
    });
  }, []);

  const add = useCallback((symbol: string) => {
    setRecent(prev => {
      const next = [symbol, ...prev.filter(s => s !== symbol)].slice(0, MAX_RECENT);
      AsyncStorage.setItem(ASYNC_STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((symbol: string) => {
    setRecent(prev => {
      const next = prev.filter(s => s !== symbol);
      AsyncStorage.setItem(ASYNC_STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.RECENT_SEARCHES);
  }, []);

  return { recent, add, remove, clear };
}
