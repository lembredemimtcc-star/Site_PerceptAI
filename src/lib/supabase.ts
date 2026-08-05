import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'];
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'];

/** Indica se as credenciais do Supabase estão configuradas neste ambiente. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Atenção: Variáveis de ambiente do Supabase não encontradas. Rodando em modo demonstração (dados mock).',
  );
}

// Inicializa o cliente do Supabase (usa placeholders quando não configurado,
// para que a interface continue funcionando em modo demonstração)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
);
