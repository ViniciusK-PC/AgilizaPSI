# 💰 Sistema de Saques - Instruções

## O que foi implementado:

1. **Modelo `Withdrawal` no Prisma** - Para registrar solicitações de saque
2. **Actions** (`actions/withdrawals.ts`) - Funções para criar, buscar e atualizar saques
3. **API Routes**:
   - `POST /api/withdrawals` - Criar solicitação de saque
   - `GET /api/withdrawals` - Buscar saques
   - `GET /api/withdrawals/balance` - Calcular saldo disponível
4. **Interface** - Botão "Solicitar Saque" no dashboard financeiro com modal

## Como usar:

1. **Regenerar Prisma Client** (IMPORTANTE):
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Reiniciar o servidor**:
   ```bash
   npm run dev
   ```

3. **Acessar o dashboard financeiro**:
   - Vá para `/dashboard/financial` (ou onde estiver o componente `FinancialManagement`)
   - Você verá um card azul mostrando o "Saldo Disponível para Saque"
   - Clique no botão "Solicitar Saque"

4. **Preencher o formulário de saque**:
   - Valor do saque (não pode exceder o saldo disponível)
   - Método de recebimento (PIX ou Transferência Bancária)
   - Observações (opcional)

## Funcionalidades:

- ✅ Calcula saldo disponível automaticamente (Receita Total - Saques já processados)
- ✅ Valida se há saldo suficiente antes de permitir o saque
- ✅ Integra com dados bancários do profissional (se configurados)
- ✅ Registra todos os saques no banco de dados
- ✅ Interface responsiva e intuitiva

## Status dos Saques:

- `PENDING` - Aguardando processamento
- `PROCESSING` - Em processamento
- `COMPLETED` - Concluído
- `CANCELLED` - Cancelado
- `REJECTED` - Rejeitado

## Próximos passos (opcional):

- Adicionar histórico de saques na interface
- Permitir cancelar saques pendentes
- Notificações quando saque for processado
- Dashboard para admin gerenciar saques

