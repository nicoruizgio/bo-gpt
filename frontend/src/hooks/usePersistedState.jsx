import { useState, useEffect } from "react";

export function usePersistedState(key, initialValue, useSession = false) {
  const storage = useSession ? sessionStorage : localStorage;

  const [state, setState] = useState(() => {
    const storedValue = storage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    storage.setItem(key, JSON.stringify(state));
  }, [key, state, storage]);

  return [state, setState];
}
