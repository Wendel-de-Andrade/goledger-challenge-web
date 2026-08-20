# GoLedger Challenge — Web Interface

Solução desenvolvida para um desafio técnico de Front-End da GoLedger. A aplicação oferece uma interface em estilo catálogo para gerenciar **Séries, Temporadas, Episódios e Watchlists**, integrada a uma API baseada em **Hyperledger Fabric**.

## Destaques técnicos

- **React 19 + TypeScript** com tipagem estrita
- CRUD completo para entidades relacionadas
- Camada de serviços isolada com Axios
- Integração com API blockchain e resolução de referências por UUID
- Componentes reutilizáveis e tipos centralizados
- Busca em tempo real
- Simulação de perfis Admin/Viewer
- Tratamento e tradução de erros da API para mensagens amigáveis
- Tailwind CSS v4 e interface responsiva
- GitHub Actions validando `lint` e `build` em pushes e pull requests

## Funcionalidades

### Catálogo de séries
Listagem dinâmica de séries com navegação para temporadas e episódios.

### Busca
Filtragem instantânea por nome enquanto o usuário digita.

### Temporadas e episódios
Visualização estruturada das entidades relacionadas retornadas pela blockchain.

### Watchlists
Gerenciamento de favoritos com persistência por meio da API.

### Perfis de acesso
Alternância entre os modos **Admin**, com operações de CRUD, e **Viewer**, com foco em visualização e watchlists.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Axios
- React Router
- Lucide React
- Hyperledger Fabric API

## Estrutura

```text
src/
├── components/   # Componentes visuais e modais
├── services/     # Integração com a API
├── types/        # Interfaces TypeScript
└── App.tsx       # Orquestração da aplicação
```

## Configuração

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/Wendel-de-Andrade/goledger-challenge-web.git
cd goledger-challenge-web
npm install
```

Crie um arquivo `.env` a partir do `.env.example` e configure as credenciais da API:

```env
VITE_API_URL=http://localhost:3000/api
VITE_API_USER=your-user
VITE_API_PASS=your-password
```

Depois execute:

```bash
npm run dev
```

## Qualidade

O repositório possui integração contínua via GitHub Actions. A cada push ou pull request para `main`, o workflow instala as dependências, executa o ESLint e valida o build TypeScript/Vite.

## Contexto

Projeto desenvolvido por **Wendel de Andrade** como solução de processo seletivo, com foco em integração de sistemas, organização do código, tipagem e experiência do usuário.
