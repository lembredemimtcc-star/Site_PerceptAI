import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useUsuarios() {
  return useQuery({
    queryKey: ["usuarios"],
    retry: false,
    queryFn: async () => {
      const all = await supabase.from("usuarios").select("*");
      if (all.error) throw all.error;
      const rows = all.data ?? [];
      const staff = rows.filter((u: any) => {
        const role = String(u.funcao ?? u.role ?? u.cargo ?? u.tipo ?? "").toLowerCase();
        if (!role) return true;
        return ["medico", "enfermeiro", "admin", "médico"].includes(role);
      });
      return staff.length ? staff : rows;
    },
  });
}
