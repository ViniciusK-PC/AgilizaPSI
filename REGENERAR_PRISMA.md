# ⚠️ IMPORTANTE: Regenerar Prisma Client

Este arquivo contém instruções para regenerar o Prisma Client após mudanças no schema.

**Última atualização:** Modelo `Withdrawal` adicionado para sistema de saques.

## Execute os seguintes comandos:

### 1. Regenerar Prisma Client
```bash
npx prisma generate
```

### 2. Aplicar mudanças no banco de dados
```bash
npx prisma db push
```

### 3. Reiniciar o servidor
Pare o servidor (Ctrl+C) e reinicie:
```bash
npm run dev
```

## Alternativa (se o PowerShell bloquear)

Use o CMD (Prompt de Comando) em vez do PowerShell:
1. Abra o CMD
2. Navegue até a pasta do projeto: `cd C:\Ag\AgilizaPSI`
3. Execute: `npx prisma generate`
4. Execute: `npx prisma db push`
5. Reinicie o servidor

## Verificação

Após executar os comandos, o erro "Unknown argument `paymentMethod`" deve desaparecer.

