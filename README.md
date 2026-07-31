# PerceptAI - Sistema de Monitoramento Inteligente para Hospitais

Aplicação React/TypeScript com arquitetura modular profissional.

## 📁 Estrutura do Projeto

```
src/
├── config/              # Configurações globais
│   ├── colors.ts       # Paleta de cores (design tokens)
│   ├── fonts.tsx       # Estilos de fonte
│   └── mockData.ts     # Dados mock da aplicação
│
├── types/              # Tipos TypeScript compartilhados
│   └── index.ts
│
├── modules/            # Módulos da aplicação
│   ├── auth/           # Autenticação
│   │   ├── Login.tsx
│   │   ├── auth.types.ts
│   │   └── index.ts
│   │
│   ├── dashboard/      # Dashboard de pacientes e médicos
│   │   ├── components/
│   │   │   └── BedCard.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DashMedicos.tsx
│   │   ├── dashboard.types.ts
│   │   └── index.ts
│   │
│   ├── estoque/        # Gestão de estoque
│   │   ├── Estoque.tsx
│   │   ├── estoque.types.ts
│   │   └── index.ts
│   │
│   ├── acessibilidade/ # Configurações de acessibilidade
│   │   ├── Acessibilidade.tsx
│   │   └── index.ts
│   │
│   ├── info-ia/        # Análise IA de pacientes
│   │   ├── InfoIA.tsx
│   │   ├── info-ia.types.ts
│   │   └── index.ts
│   │
│   └── placeholder/    # Páginas em desenvolvimento
│       ├── Placeholder.tsx
│       └── index.ts
│
├── shared/            # Componentes compartilhados
│   └── components/
│       ├── TopBar.tsx
│       ├── Sidebar.tsx
│       ├── ToggleRow.tsx
│       └── index.ts
│
├── App.tsx            # Componente principal
└── index.tsx          # Entry point
```

## 🚀 Instalação e Execução

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📦 Dependências Principais

- **React 18**: Framework UI
- **TypeScript**: Type safety
- **Lucide React**: Ícones
- **Recharts**: Gráficos
- **Tailwind CSS**: Estilos (via classes)
- **Vite**: Build tool

## 🎨 Design System

Cores definidas em `src/config/colors.ts`:
- Orange: `#F2652E` (primária)
- Red: `#E14545` (alertas críticos)
- Green: `#2E9E63` (status normal)
- Slate: `#67727E` (texto secundário)

## 📋 Módulos Implementados

### ✅ Auth
Login simples com validação visual.

### ✅ Dashboard
- **Dashboard de Pacientes**: Visão agregada com filtros e busca
- **Dashboard Médicos**: Dados clínicos por paciente
- Cards interativos de leitos

### ✅ Estoque
Gestão de medicamentos e insumos com alertas de estoque baixo.

### ✅ Acessibilidade
- Alto contraste
- Leitor de tela
- Redução de movimento
- Tamanho de fonte customizável

### ✅ Info IA
Análise detalhada de paciente com:
- Gráficos de vitais (FC, SpO2)
- Intensidade de dor
- Eventos neurológicos
- Copilot IA com sugestões

### 🚧 Placeholder
Páginas em desenvolvimento (Medicamentos, Cadastro, Visitas, Calendário, Mapa).

## 🔑 Padrões de Arquitetura

### Por Módulo (Feature-based)
Cada módulo é auto-contido com seus próprios:
- Componentes
- Tipos
- Lógica
- Index file (re-exports)

### Componentes Compartilhados
`src/shared/` para componentes reutilizáveis em múltiplos módulos.

### Configuração Centralizada
`src/config/` para design tokens, dados mock e configurações globais.

## 🔧 Como Adicionar um Novo Módulo

1. Criar pasta: `src/modules/meu-modulo/`
2. Adicionar arquivos:
   ```
   meu-modulo/
   ├── MeuModulo.tsx       # Componente principal
   ├── meu-modulo.types.ts # Tipos
   └── index.ts            # Re-exports
   ```
3. Importar em `App.tsx`
4. Adicionar rota na navegação

## 📝 Credenciais Demo

- **Email**: dr.almeida@hospital.com
- **Senha**: demo123

## 🎯 Próximos Passos

- [ ] Integração com API real
- [ ] Sistema de autenticação completo
- [ ] Persistência de dados (localStorage/DB)
- [ ] Testes unitários
- [ ] Documentação de componentes (Storybook)
- [ ] Internacionalização (i18n)
