import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function usePacientes() {
  return useQuery({
    queryKey: ['pacientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
}
