# PerceptAI - Painel de Monitoramento Hospitalar

Painel de controle e monitoramento de leitos de UTI, com integração à Inteligência Artificial (Visão Computacional) para análise de dor e expressões faciais, além do monitoramento em tempo real de sinais vitais.

## 🚀 Tecnologias Utilizadas

- **Front-end:** React, TypeScript, Vite, TailwindCSS
- **Gerenciamento de Estado/Cache:** React Query (`@tanstack/react-query`)
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Backend/Database:** Supabase (Autenticação, Banco de Dados PostgreSQL e Realtime)

## 📦 Estrutura do Projeto

O projeto foi organizado de forma modular para facilitar a manutenção e escalabilidade:

- `src/components/`: Componentes genéricos (modais, inputs, alertas).
- `src/config/`: Arquivos de configuração, cores e mock data legado.
- `src/hooks/`: Hooks customizados (`useInternacoes`, `usePacientes`, `useSinaisVitais`, etc.) conectados ao Supabase.
- `src/lib/`: Configurações de serviços externos (`supabase.ts`, `auth.ts`, `queryClient.ts`).
- `src/modules/`: Módulos de negócio da aplicação:
  - `auth/`: Tela de Login
  - `cadastro/`: Admissão de pacientes e vinculação aos leitos
  - `calendario/`: Agendamento de eventos, plantões e procedimentos
  - `dashboard/`: Visão geral dos leitos ativos e painel do paciente (BedCard)
  - `estoque/`: Gestão de medicamentos, EPIs e equipamentos
  - `info-ia/`: Painel detalhado do paciente com gráficos Realtime e Copilot IA
  - `medicamentos/`: Controle e checagem da prescrição médica
  - `visitas/`: Controle de visitantes
- `src/shared/`: Layout principal e barra de navegação (Sidebar, Topbar).
- `src/types/`: Definições de tipagem global (TypeScript) refletindo as tabelas do banco de dados.

## ⚙️ Como Rodar o Projeto (Localmente)

### 1. Pré-requisitos
- Node.js instalado (versão 18+ recomendada)
- Projeto Supabase criado

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as chaves do seu Supabase:

```env
VITE_SUPABASE_URL=https://jhoepxcrnyxytwjodjfv.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_public_aqui
```
*(Nota: A `VITE_SUPABASE_ANON_KEY` deve ser a chave JWT `anon public` gerada nas configurações de API do Supabase).*

### 3. Instalar Dependências
```bash
npm install
```

### 4. Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` (ou a porta indicada no terminal, como 3001).

## 🔐 Autenticação de Teste (Demo)

Para testar o sistema localmente, crie o usuário abaixo no seu painel do Supabase (**Authentication -> Users**):
- **E-mail:** `dr.almeida@hospital.com`
- **Senha:** `demo123`

*(Certifique-se de marcar a opção "Auto Confirm User" ao criar o usuário pelo painel).*

## 📡 Integração com IA e Hardware (Próximos Passos)

- **Realtime (Sinais Vitais):** Os gráficos na tela `InfoIA` estão preparados para reagir instantaneamente quando um novo registro cai no Supabase. Para isso, vá em `Database > Replication` no Supabase e ative a replicação para as tabelas `sinais_vitais` e `expressoes_faciais`.
- **Copilot (Chatbot IA):** A interface do chatbot está pronta, porém comentada no arquivo `src/modules/info-ia/InfoIA.tsx`. Descomente-a após finalizar o treinamento do seu modelo e conecte-o via API (Fetch/Axios) na função `handleSendQuestion`.
- **Câmera/Visão Computacional:** O processamento da imagem deve rodar em um script Python/Backend e enviar as predições (confiança e estado emocional) via requisição `INSERT` diretamente para a tabela `expressoes_faciais` no Supabase. O front-end absorverá isso automaticamente.
