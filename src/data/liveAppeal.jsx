import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { fallbackAppeal, mergeLiveAppeal } from './appealModel.js';

const AppealContext = createContext({ appeal: fallbackAppeal, source: 'loading', refresh: async () => {} });

export function AppealProvider({ children }) {
  const [value, setValue] = useState({ appeal: fallbackAppeal, source: 'loading' });
  const refresh = useCallback(async () => {
    if (!supabase) {
      setValue({ appeal: fallbackAppeal, source: 'fallback' });
      return;
    }
    try {
      const results = await Promise.all([
        supabase.from('campaign_content').select('content').eq('id', 1).single(),
        supabase.from('campaign_metrics').select('*').eq('id', 1).single(),
        supabase.from('account_upi_status').select('*'),
        supabase.from('timeline_events').select('*').eq('published', true).order('event_date').order('position'),
        supabase.from('daily_collections').select('*').order('report_date', { ascending: false }).limit(31),
      ]);
      const failure = results.find((result) => result.error);
      if (failure) throw failure.error;
      setValue({
        appeal: mergeLiveAppeal(results[0].data.content, results[1].data, results[2].data, results[3].data, results[4].data),
        source: 'live',
      });
    } catch (error) {
      console.error('Live appeal data unavailable:', error);
      setValue({ appeal: fallbackAppeal, source: 'fallback' });
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [refresh]);

  return <AppealContext.Provider value={{ ...value, refresh }}>{children}</AppealContext.Provider>;
}

export const useAppeal = () => useContext(AppealContext);
