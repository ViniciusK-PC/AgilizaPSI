# Configuração do Prisma - Modelo Availability

Após adicionar o novo modelo `Availability` ao schema do Prisma, você precisa executar os seguintes comandos:

## 1. Gerar o Prisma Client

Execute no terminal (PowerShell ou CMD):

```bash
npx prisma generate
```

Ou se estiver usando npm scripts:

```bash
npm run postinstall
```

## 2. Aplicar as mudanças no banco de dados

Execute um dos seguintes comandos:

### Opção A: Push direto (desenvolvimento)
```bash
npx prisma db push
```

### Opção B: Criar migração (produção)
```bash
npx prisma migrate dev --name add_availability_model
```

## 3. Reiniciar o servidor de desenvolvimento

Após executar os comandos acima, reinicie o servidor Next.js:

```bash
npm run dev
```

## Nota

Se você encontrar erros como "Cannot read properties of undefined (reading 'upsert')", isso significa que o Prisma Client ainda não foi regenerado com o novo modelo. Execute o passo 1 acima.

