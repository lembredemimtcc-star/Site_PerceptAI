import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useLeitos() {
  return useQuery({
    queryKey: ['leitos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leitos')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
}
