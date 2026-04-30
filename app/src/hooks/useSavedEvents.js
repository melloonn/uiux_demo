import { useState, useCallback } from 'react';

export function useSavedEvents() {
  const [saved, setSaved] = useState(new Set());
  const [planned, setPlanned] = useState(new Set());
  const [planSchedule, setPlanSchedule] = useState(new Map()); // Map<id, { dateKey, timeSlot }>

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
      if (next.has(id)) {
        next.delete(id);
        setPlanSchedule(sched => {
          const ns = new Map(sched);
          ns.delete(id);
          return ns;
        });
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Add event to plan with an explicit schedule entry
  const addToPlanScheduled = useCallback((id, scheduleEntry) => {
    setPlanned(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setPlanSchedule(prev => {
      const next = new Map(prev);
      next.set(id, scheduleEntry);
      return next;
    });
  }, []);

  return { saved, planned, toggleSave, togglePlan, planSchedule, setPlanSchedule, addToPlanScheduled };
}
