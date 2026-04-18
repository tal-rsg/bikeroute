import { useState, useEffect } from 'react';
import { onSyncStatus, getSyncStatus } from '../lib/sync';

export function useSyncStatus() {
  const [status, setStatus] = useState<string>(getSyncStatus());
  const [pending, setPending] = useState(0);

  useEffect(() => {
    return onSyncStatus((s, p) => {
      setStatus(s);
      setPending(p);
    });
  }, []);

  return { status, pending };
}
