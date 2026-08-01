import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useCalendario() {
  return useQuery({
    queryKey: ['calendario_eventos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendario_eventos')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
}
