import { useState, useCallback } from 'react';

export function useSavedEvents() {
  const [saved, setSaved] = useState(new Set());
  const [planned, setPlanned] = useState(new Set());

  const toggleSave = useCallback((id) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const togglePlan = useCallback((id) => {
    setPlanned(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return { saved, planned, toggleSave, togglePlan };
}
