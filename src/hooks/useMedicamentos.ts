import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useMedicamentos() {
  return useQuery({
    queryKey: ['medicamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicamentos')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
}
