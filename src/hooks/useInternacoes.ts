import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInternacoesRows, internacaoToBed } from "../lib/db";

export function useInternacoes(onlyActive = true) {
  return useQuery({
    queryKey: ["internacoes", onlyActive],
    queryFn: () => fetchInternacoesRows(onlyActive),
    retry: false,
  });
}

export function useBeds(onlyActive = true) {
  const query = useInternacoes(onlyActive);
  const data = useMemo(
    () => (query.data ?? []).map(internacaoToBed),
    [query.data]
  );
  return { ...query, data };
}
