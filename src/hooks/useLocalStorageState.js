import { useState, useEffect, useRef } from "react";

export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return initialValue;
      const parsed = JSON.parse(stored);
      if (typeof initialValue === "object" && initialValue !== null && !Array.isArray(initialValue)) {
        return { ...initialValue, ...parsed };
      }
      return parsed;
    } catch {
      return initialValue;
    }
  });

  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // storage full or private mode
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [key, state]);

  return [state, setState];
}
