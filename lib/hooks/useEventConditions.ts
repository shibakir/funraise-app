import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/api';
import { ConditionGroup } from './useEventDetails';

export const useEventConditions = (eventId: string | null) => {
  const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventConditions = useCallback(async () => {
    if (!eventId) {
      setConditionGroups([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl('EVENT_CONDITIONS', eventId));

      if (!response.ok) {
        throw new Error('Failed to load event conditions');
      }

      const data = await response.json();
      
      // Преобразуем данные из API в нужный формат
      const formattedConditionGroups: ConditionGroup[] = data.map((group: any) => ({
        id: group.id,
        conditions: group.conditions || [],
        progress: group.progress || 0
      }));

      setConditionGroups(formattedConditionGroups);
    } catch (err) {
      console.error('Error fetching event conditions:', err);
      setError('Failed to load event conditions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventConditions();
  }, [fetchEventConditions]);

  const refresh = useCallback(() => {
    fetchEventConditions();
  }, [fetchEventConditions]);

  return { conditionGroups, loading, error, refresh };
}; 