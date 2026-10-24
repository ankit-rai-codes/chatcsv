"use client";

import { useCallback, useEffect, useState } from "react";

/** useState backed by localStorage. Hydrates after mount to avoid SSR mismatches. */
export function usePersistentState<T>(key: string, initial: T): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* storage unavailable or corrupt: keep initial */
    }
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        if (next === null || next === undefined) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore quota / privacy-mode errors */
      }
    },
    [key],
  );

  return [value, update, hydrated];
}
