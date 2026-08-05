import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useInternacoes() {
  return useQuery({
    queryKey: ['internacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internacoes')
        .select(`
          *,
          paciente:pacientes(nome, cpf),
          leito:leitos(numero, status),
          medico:usuarios(nome)
        `)
        .eq('ativo', true);
      
      if (error) throw error;
      return data;
    },
  });
}
