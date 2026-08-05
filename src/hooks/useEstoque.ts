import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useEstoque() {
  return useQuery({
    queryKey: ['estoque'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estoque')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
}
