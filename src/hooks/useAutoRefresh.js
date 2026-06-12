import { useEffect, useRef } from 'react';

const DEFAULT_INTERVAL_MS = 15000;

export const useAutoRefresh = (refresh, intervalMs = DEFAULT_INTERVAL_MS) => {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    const runRefresh = () => {
      if (document.visibilityState === 'visible') {
        refreshRef.current();
      }
    };

    const intervalId = window.setInterval(runRefresh, intervalMs);
    window.addEventListener('focus', runRefresh);
    document.addEventListener('visibilitychange', runRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', runRefresh);
      document.removeEventListener('visibilitychange', runRefresh);
    };
  }, [intervalMs]);
};
