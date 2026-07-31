export interface EstoqueItem {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  minimo: number;
  unidade: string;
  validade?: string;
  preco?: number;
}

export interface EstoqueCategory {
  nome: string;
  items: EstoqueItem[];
}
