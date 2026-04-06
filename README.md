# GoLedger Challenge — Web Interface

Solução para o desafio de frontend da GoLedger. O projeto é uma interface moderna estilo catálogo (IMDb/Netflix) para gerenciamento completo de Séries, Temporadas, Episódios e Watchlists, integrada a uma API Blockchain baseada em Hyperledger Fabric.

---

## 🚀 Destaques da Implementação

- **CRUD Completo e Relacional** — Operações de Criar, Ler, Atualizar e Deletar para todas as entidades (TV Shows, Seasons, Episodes e Watchlists), com resolução correta de chaves UUID geradas pela blockchain.
- **Arquitetura Escalável** — Projeto organizado em componentes reutilizáveis (`cards.tsx`, `modals.tsx`), camada de serviço isolada e tipos globais TypeScript.
- **TypeScript Estrito** — Código 100% tipado sem uso de `any`, garantindo segurança no tratamento dos dados vindos da blockchain.
- **UI/UX Premium** — Estilização com **Tailwind CSS v4**, tema Ciano/Dark inspirado na identidade GoLedger, busca flutuante na Navbar e modais de confirmação customizados.
- **Integração Robusta com a Blockchain** — Resolução de referências via `@key` UUID (padrão real da API GoLedger/CouchDB), com delays estratégicos para respeitar o tempo de indexação após criação de assets.
- **Mensagens de Erro em Português** — Todos os erros retornados pela blockchain são traduzidos para o usuário de forma clara.

---

## 📋 Funcionalidades Implementadas

1. **Catálogo de Séries** — Listagem dinâmica com posters gerados por seed baseada no título da série.
2. **Busca em Tempo Real** — Filtragem instantânea por nome enquanto o usuário digita.
3. **Gestão de Temporadas e Episódios** — Visualização detalhada com banner de herói, gradientes e listagem de episódios por temporada.
4. **Watchlists** — Sistema de favoritos com atualização real na rede blockchain via `updateAsset`.
5. **Simulação de RBAC** — Toggle no cabeçalho para alternar entre perfil **Admin** (CRUD completo) e **Viewer** (apenas visualização e watchlists).

---

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js v18 ou superior
- npm ou yarn

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/goledger-challenge-web.git
cd goledger-challenge-web
```

### 2. Configure o ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais da API:

```env
VITE_API_URL=http://ec2-50-19-36-138.compute-1.amazonaws.com/api
VITE_API_USER=goledger
VITE_API_PASS=SUA_SENHA_AQUI
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse **http://localhost:5173** no navegador.

---

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── cards.tsx       # Componentes visuais de listagem (TvShowCard, WatchlistCard)
│   └── modals.tsx      # Todos os modais: formulários, alertas e confirmações
├── services/
│   └── api.ts          # Camada Axios para comunicação com a blockchain
├── types/
│   └── index.ts        # Interfaces TypeScript de todos os assets da rede
└── App.tsx             # Orquestrador principal: rotas, estados e lógica de negócio
```

---

## 🔗 Tecnologias Utilizadas

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [Lucide React](https://lucide.dev/)

---

Desenvolvido por **Wendel** para o processo seletivo GoLedger.
