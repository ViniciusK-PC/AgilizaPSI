# 🔐 Super Administrador - Credenciais

## Credenciais do Super Admin

Este é o usuário **Super Administrador** responsável por gerenciar todo o dashboard administrativo do sistema.

### 📧 Email
```
superadmin@agilizapsi.com
```

### 🔑 Senha
```
SuperAdmin@2024!
```

### 👤 Nome
```
Super Administrador
```

### 🛡️ Role
```
ADMIN
```

---

## 📋 Como Criar o Super Admin

### Opção 1: Via Script NPM
```bash
npm run create-super-admin
```

### Opção 2: Via API
```bash
GET /api/admin/create-super-admin
```

### Opção 3: Via Script Node
```bash
node scripts/create-super-admin.js
```

---

## 🔄 Como Atualizar a Senha do Super Admin

### Via Script NPM
```bash
npm run update-super-admin-password
```

### Via Script Node
```bash
node scripts/update-super-admin-password.js
```

---

## ⚠️ Importante

1. **Segurança**: Mantenha estas credenciais em local seguro
2. **Primeiro Login**: Altere a senha após o primeiro login
3. **Acesso Total**: Este usuário tem acesso completo ao dashboard administrativo
4. **Único Super Admin**: Apenas um super admin deve existir no sistema

---

## 🎯 Funcionalidades do Super Admin

O Super Administrador tem acesso a:
- ✅ Gerenciar todos os usuários
- ✅ Gerenciar agendamentos
- ✅ Gerenciar prontuários médicos
- ✅ Gerenciar pagamentos
- ✅ Visualizar estatísticas do sistema
- ✅ Configurar clínica
- ✅ Acessar todas as funcionalidades administrativas

---

## 📝 Notas

- O Super Admin é criado com `isVerfied: true` (conta verificada)
- O email é normalizado automaticamente (lowercase)
- A senha é hasheada com bcrypt antes de ser salva
- O token de verificação é gerado automaticamente


