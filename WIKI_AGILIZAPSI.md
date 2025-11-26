# 📚 Wiki do AgilizaPSI

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Instalação e Configuração](#instalação-e-configuração)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Funcionalidades](#funcionalidades)
6. [Arquitetura do Sistema](#arquitetura-do-sistema)
7. [API e Endpoints](#api-e-endpoints)
8. [Autenticação e Segurança](#autenticação-e-segurança)
9. [Banco de Dados](#banco-de-dados)
10. [Deploy](#deploy)
11. [Guias de Uso](#guias-de-uso)
12. [Desenvolvimento](#desenvolvimento)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **AgilizaPSI** é uma plataforma web completa para gestão de consultas psicológicas, desenvolvida para atender às necessidades de psicólogos, pacientes e administradores de clínicas. O sistema oferece funcionalidades de agendamento online e presencial, gerenciamento de prontuários eletrônicos, comunicação via chat, sala virtual para consultas online, gestão financeira e controle de disponibilidades.

### Características Principais

- ✅ **Multi-tenant**: Suporte para múltiplas clínicas com isolamento completo de dados
- ✅ **Telepsicologia**: Consultas online com integração de sala virtual
- ✅ **Prontuário Eletrônico**: Registro completo e seguro de informações clínicas
- ✅ **Chat em Tempo Real**: Comunicação direta entre psicólogos e pacientes
- ✅ **Gestão Financeira**: Controle de pagamentos, receitas e saques
- ✅ **Interface Responsiva**: Design moderno com suporte a modo claro/escuro
- ✅ **Segurança**: Criptografia de senhas, autenticação JWT e conformidade com LGPD

### Perfis de Usuário

- **ADMIN**: Acesso total ao sistema, gerenciamento de clínicas e profissionais
- **PSICOLOGO**: Dashboard profissional com todas as ferramentas de gestão
- **USER (Paciente)**: Agendamento de consultas, acesso à sala virtual e chat

---

## 🛠 Tecnologias Utilizadas

### Frontend

- **Next.js 14.2.5**: Framework React com SSR e roteamento
- **React 18.3.1**: Biblioteca para construção de interfaces
- **TypeScript**: Tipagem estática para JavaScript
- **Tailwind CSS 4.1.15**: Framework de estilização utilitária
- **Radix UI**: Componentes acessíveis e customizáveis
- **TanStack Query 5.90.10**: Gerenciamento de estado e cache de dados
- **React Hook Form 7.66.0**: Gerenciamento de formulários
- **NextAuth.js 4.24.13**: Autenticação e autorização

### Backend

- **Next.js API Routes**: Endpoints RESTful
- **Prisma 6.19.0**: ORM para acesso ao banco de dados
- **MongoDB**: Banco de dados NoSQL orientado a documentos
- **NextAuth.js**: Sistema de autenticação
- **Bcryptjs 3.0.3**: Criptografia de senhas

### Outras Bibliotecas

- **React Multi Carousel**: Carrossel de profissionais
- **Date-fns 4.1.0**: Manipulação de datas
- **React Email**: Templates de email
- **Resend 6.4.2**: Envio de emails transacionais
- **Zod 4.1.12**: Validação de schemas

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18.x ou superior
- MongoDB (local ou remoto)
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd AgilizaPSI
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="mongodb://localhost:27017/agilizapsi"
# Ou MongoDB remoto:
# DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/agilizapsi?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta-aqui-gere-uma-string-aleatoria-longa"
NEXTAUTH_URL="http://localhost:3000"
# Em produção:
# NEXTAUTH_URL="http://seu-dominio.com"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
# Em produção:
# NEXT_PUBLIC_BASE_URL="http://seu-dominio.com"

# Email (Resend)
RESEND_API_KEY="sua-chave-api-resend"
EMAIL_FROM="noreply@seu-dominio.com"

# Ambiente
NODE_ENV="development"
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

4. **Configure o Prisma**
```bash
# Gerar o Prisma Client
npx prisma generate

# Fazer push do schema para o banco (primeira vez)
npx prisma db push
```

5. **Criar usuários administradores (opcional)**
```bash
npm run create-admins
```

6. **Iniciar o servidor de desenvolvimento**
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
AgilizaPSI/
├── app/                          # Aplicação Next.js
│   ├── (back)/                   # Rotas do backend (dashboard)
│   │   └── dashboard/            # Dashboard do psicólogo/admin
│   ├── (front)/                  # Rotas do frontend (público)
│   │   ├── login/                # Página de login
│   │   ├── register/             # Página de registro
│   │   ├── appointment/          # Agendamento de consultas
│   │   └── patient-dashboard/    # Dashboard do paciente
│   └── api/                      # API Routes
│       ├── auth/                 # Autenticação
│       ├── appointments/         # Agendamentos
│       ├── chat/                 # Mensagens
│       ├── medical-records/      # Prontuários
│       ├── payments/             # Pagamentos
│       └── ...
├── components/                   # Componentes React
│   ├── Auth/                     # Componentes de autenticação
│   ├── Dashboard/                 # Componentes do dashboard
│   ├── Frontend/                  # Componentes da landing page
│   ├── Patient/                   # Componentes do paciente
│   └── ui/                        # Componentes UI reutilizáveis
├── lib/                          # Bibliotecas e utilitários
│   ├── auth.ts                   # Configuração NextAuth
│   ├── db.ts                     # Cliente Prisma
│   └── utils.ts                  # Funções utilitárias
├── hooks/                        # Custom hooks React
├── actions/                       # Server actions
├── prisma/                       # Schema e migrations
│   └── schema.prisma             # Schema do banco de dados
├── public/                        # Arquivos estáticos
└── types/                        # Definições TypeScript
```

---

## ⚙️ Funcionalidades

### Para Psicólogos

#### Dashboard
- Visão geral com métricas (agendamentos, pacientes, receitas)
- Tabelas com informações recentes
- Acesso rápido às principais funcionalidades

#### Agenda
- Calendário interativo para gerenciar disponibilidades
- Seleção de horários (09:00 às 22:00)
- Visualização e edição de disponibilidades cadastradas

#### Agendamentos
- Lista completa de consultas agendadas
- Filtros por status (Pendente, Confirmado, Cancelado, Completo)
- Filtros por tipo (Online, Presencial)
- Criação, edição e cancelamento de agendamentos
- Visualização de detalhes completos

#### Mensagens (Chat)
- Lista de pacientes com quem há agendamentos
- Chat em tempo real
- Contador de mensagens não lidas
- Suporte a emojis
- Edição e exclusão de mensagens próprias

#### Prontuários Eletrônicos
- Criação e edição de prontuários
- Vinculação a agendamentos específicos
- Campos: queixa principal, diagnóstico, tratamento, observações, evolução, prescrições
- Histórico completo por paciente
- Filtros por paciente

#### Gestão Financeira
- Estatísticas financeiras (total recebido, pendente, cancelado)
- Lista de pagamentos com filtros
- Solicitação de saques (PIX ou Transferência Bancária)
- Cadastro de dados bancários
- Histórico de saques

#### Relatórios
- Análises e estatísticas
- Gráficos e visualizações
- Exportação de dados

#### Sala Virtual
- Acesso direto às consultas online
- Links de videoconferência
- Informações do paciente e agendamento

#### Configurações
- Perfil profissional (nome, email, telefone, CRP, especialização, biografia)
- Horários de trabalho e disponibilidade
- Preços de consulta (online e presencial)
- Alteração de senha

### Para Pacientes

#### Dashboard
- Abas organizadas: Lembretes, Sala Virtual, Chat
- Próximas consultas agendadas
- Acesso rápido às funcionalidades

#### Agendamento de Consultas
- Seleção de psicólogo
- Escolha de data e horário disponível
- Tipo de consulta (Online ou Presencial)
- Preenchimento de dados pessoais
- Confirmação e resumo do agendamento

#### Lembretes
- Lista de consultas agendadas
- Informações de data, horário e psicólogo
- Acesso à sala virtual para consultas online

#### Chat
- Comunicação direta com psicólogo
- Histórico de mensagens
- Indicadores de leitura

### Para Administradores

#### Dashboard Administrativo
- Estatísticas gerais do sistema
- Métricas de usuários, clínicas, agendamentos
- Visão consolidada

#### Gerenciamento de Clínicas
- Criação e edição de clínicas
- Configurações gerais
- Gerenciamento de profissionais

#### Gerenciamento de Profissionais
- Lista de psicólogos cadastrados
- Geração de links de acesso
- Edição de perfis

#### Gerenciamento de Usuários
- Lista de todos os usuários
- Criação e edição de usuários
- Controle de permissões

#### Configurações do Sistema
- Configurações gerais da plataforma
- Parâmetros do sistema

---

## 🏗 Arquitetura do Sistema

### Arquitetura Multi-tenant

O sistema utiliza uma arquitetura multi-tenant onde cada clínica opera de forma isolada:

- Cada profissional está vinculado a uma clínica (`clinicId`)
- Dados são filtrados automaticamente por clínica
- Isolamento completo entre clínicas diferentes

### Padrão de Arquitetura

- **Frontend**: Next.js com App Router (Server Components + Client Components)
- **Backend**: Next.js API Routes
- **Banco de Dados**: MongoDB com Prisma ORM
- **Autenticação**: NextAuth.js com JWT
- **Estado**: TanStack Query para cache e sincronização

### Fluxo de Dados

```
Cliente (Browser)
    ↓
Next.js (Frontend)
    ↓
API Routes (Backend)
    ↓
Prisma ORM
    ↓
MongoDB
```

---

## 🔌 API e Endpoints

### Autenticação

- `POST /api/auth/[...nextauth]` - Autenticação NextAuth
- `POST /api/auth/forgot-password` - Solicitar recuperação de senha
- `POST /api/auth/reset-password` - Redefinir senha
- `POST /api/auth/validate-credentials` - Validar credenciais

### Agendamentos

- `GET /api/appointments` - Listar agendamentos
- `POST /api/appointments` - Criar agendamento
- `GET /api/appointments/[id]` - Obter agendamento específico
- `PUT /api/appointments/[id]` - Atualizar agendamento
- `DELETE /api/appointments/[id]` - Deletar agendamento
- `GET /api/appointments/available` - Horários disponíveis

### Disponibilidade

- `GET /api/availability` - Listar disponibilidades
- `POST /api/availability` - Criar/atualizar disponibilidade

### Chat

- `GET /api/chat` - Listar conversas
- `GET /api/chat/[id]` - Obter mensagens de uma conversa
- `POST /api/chat/[id]` - Enviar mensagem
- `GET /api/chat/unread` - Contagem de mensagens não lidas

### Prontuários

- `GET /api/medical-records` - Listar prontuários
- `POST /api/medical-records` - Criar prontuário
- `GET /api/medical-records/[id]` - Obter prontuário específico
- `PUT /api/medical-records/[id]` - Atualizar prontuário
- `DELETE /api/medical-records/[id]` - Deletar prontuário

### Pagamentos

- `GET /api/payments` - Listar pagamentos
- `POST /api/payments` - Criar pagamento
- `GET /api/payments/[id]` - Obter pagamento específico
- `PUT /api/payments/[id]` - Atualizar pagamento

### Saques

- `GET /api/withdrawals` - Listar saques
- `POST /api/withdrawals` - Solicitar saque
- `GET /api/withdrawals/balance` - Saldo disponível

### Psicólogos

- `GET /api/psychologists` - Listar psicólogos
- `GET /api/psychologists/[id]` - Obter psicólogo específico
- `POST /api/psychologists/[id]/bank-account` - Cadastrar conta bancária

### Análises

- `GET /api/analytics` - Estatísticas gerais
- `GET /api/analytics/financial-stats` - Estatísticas financeiras

### Administração

- `GET /api/admin/users` - Listar usuários
- `POST /api/admin/create-admin` - Criar administrador
- `GET /api/admin/clinics` - Listar clínicas
- `GET /api/admin/stats` - Estatísticas administrativas

---

## 🔐 Autenticação e Segurança

### NextAuth.js

O sistema utiliza NextAuth.js para autenticação com:

- **Provider**: Credentials (email/senha)
- **Adapter**: Prisma Adapter (sessões no banco)
- **JWT**: Tokens para sessões
- **Criptografia**: Bcryptjs para senhas

### Segurança de Dados

- ✅ Senhas criptografadas com bcrypt (salt rounds: 10)
- ✅ Tokens JWT seguros
- ✅ Validação de permissões em todas as rotas
- ✅ Isolamento de dados por clínica
- ✅ Proteção contra SQL Injection (Prisma)
- ✅ Validação de inputs (Zod/Yup)

### Middleware de Proteção

O arquivo `middleware.ts` protege rotas baseado em:
- Autenticação (sessão válida)
- Role do usuário (ADMIN, PSICOLOGO, USER)
- Caminho da rota

---

## 🗄 Banco de Dados

### Schema Prisma

O banco de dados MongoDB é modelado através do Prisma Schema (`prisma/schema.prisma`).

### Principais Modelos

#### User
- Informações do usuário (nome, email, telefone, role)
- Dados profissionais (CRP, especialização, bio)
- Relacionamento com clínica

#### Clinic
- Dados da clínica (nome, email, telefone, CNPJ)
- Configurações (horários, dias de trabalho)
- Token de acesso único

#### Appointment
- Agendamento de consulta
- Relacionamentos com psicólogo e paciente
- Status e tipo (Online/Presencial)

#### MedicalRecord
- Prontuário eletrônico
- Vinculado a agendamento
- Campos clínicos completos

#### Payment
- Pagamento de consulta
- Status e método de pagamento
- Vinculado a agendamento

#### ChatMessage
- Mensagens entre usuários
- Indicadores de leitura
- Timestamps

#### Availability
- Disponibilidade do psicólogo
- Horários disponíveis por data
- Status de disponibilidade

### Comandos Úteis

```bash
# Visualizar schema
cat prisma/schema.prisma

# Gerar Prisma Client
npx prisma generate

# Fazer push do schema
npx prisma db push

# Abrir Prisma Studio (interface visual)
npx prisma studio

# Criar migration (se usar migrations)
npx prisma migrate dev
```

---

## 🚢 Deploy

### Deploy no Linux

Consulte o arquivo `DEPLOY_LINUX.md` para instruções detalhadas.

#### Passos Resumidos

1. **Preparar servidor**
   - Instalar Node.js 18+
   - Instalar MongoDB
   - Instalar PM2

2. **Transferir código**
   - Via Git ou SCP

3. **Configurar variáveis de ambiente**
   - Criar arquivo `.env`
   - Configurar `DATABASE_URL`, `NEXTAUTH_SECRET`, etc.

4. **Instalar e build**
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run build
   ```

5. **Iniciar com PM2**
   ```bash
   pm2 start npm --name "agilizapsi" -- start
   pm2 save
   pm2 startup
   ```

### Deploy na Vercel

1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático

---

## 📖 Guias de Uso

### Para Psicólogos

#### Primeiro Acesso

1. Acesse a plataforma
2. Faça login com suas credenciais
3. Complete seu perfil nas Configurações
4. Configure sua disponibilidade na Agenda
5. Defina preços de consulta

#### Agendar Consulta

1. Acesse "Agendamentos"
2. Clique em "Novo Agendamento"
3. Selecione paciente, data, horário e tipo
4. Preencha informações adicionais
5. Salve o agendamento

#### Criar Prontuário

1. Acesse "Prontuários"
2. Selecione um paciente
3. Clique em "Novo Prontuário"
4. Preencha os campos clínicos
5. Salve o prontuário

### Para Pacientes

#### Agendar Consulta

1. Acesse a página de agendamento
2. Selecione um psicólogo
3. Escolha data e horário disponível
4. Preencha seus dados
5. Confirme o agendamento

#### Acessar Sala Virtual

1. Acesse seu Dashboard
2. Vá para a aba "Sala Virtual"
3. Selecione uma consulta online
4. Clique no link da sala virtual

---

## 💻 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção

# Testes
npm test             # Executa testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Cobertura de testes

# Linting
npm run lint         # Executa ESLint

# Utilitários
npm run create-admins        # Criar usuários administradores
npm run generate-diagram     # Gerar diagrama de casos de uso
```

### Estrutura de Componentes

Os componentes seguem a estrutura:

```typescript
"use client" // Se necessário (interatividade)

import { ... } from "..."

export default function ComponentName() {
  // Lógica do componente
  return (
    // JSX
  )
}
```

### Hooks Customizados

- `useAppointments` - Gerenciamento de agendamentos
- `useMedicalRecords` - Gerenciamento de prontuários
- `useUsers` - Gerenciamento de usuários
- `useTabSession` - Sessão por aba do navegador

### Server Actions

As server actions estão em `actions/` e são utilizadas para operações no servidor:

- `actions/appointments.ts`
- `actions/medical-records.ts`
- `actions/payments.ts`
- `actions/psychologists.ts`
- etc.

---

## 🔧 Troubleshooting

### Erro: "Prisma Client not generated"

```bash
npx prisma generate
```

### Erro: "Database connection failed"

Verifique:
- `DATABASE_URL` no `.env`
- MongoDB está rodando
- Credenciais corretas

### Erro: "NextAuth secret missing"

Adicione `NEXTAUTH_SECRET` no `.env`:
```bash
openssl rand -base64 32
```

### Erro de Hidratação

Verifique componentes com botões aninhados. Use `asChild` em componentes Radix UI quando necessário.

### Build falha

```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

### Mensagens não aparecem

Verifique:
- Conexão com banco de dados
- Query keys do TanStack Query
- Refetch interval configurado

---

## 📝 Notas Adicionais

### Isolamento por Clínica

Todos os dados são automaticamente filtrados por `clinicId`:
- Agendamentos
- Pacientes
- Mensagens
- Prontuários
- Pagamentos

### Sessões Multi-aba

O sistema suporta múltiplas sessões em abas diferentes do navegador através de `sessionStorage`.

### Modo Escuro

O sistema possui suporte completo a modo claro/escuro usando `next-themes`.

### Email Transacional

O sistema utiliza Resend para envio de emails:
- Recuperação de senha
- Confirmação de agendamento
- Notificações

---

## 📞 Suporte

Para questões e suporte:
- Consulte a documentação
- Verifique os arquivos de configuração
- Revise os logs do servidor

---

**Última atualização**: 2025

