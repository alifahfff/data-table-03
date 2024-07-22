import { useEffect } from "react";

export default function useAutoSave(storageId, data, delay = 1000) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('saving');
      localStorage.setItem(storageId, JSON.stringify(data));
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, data, storageId]);
}