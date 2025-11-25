# Guia de Deploy - AgilizaPSI no Servidor Linux

Este guia explica como fazer o deploy da aplicação AgilizaPSI em um servidor Linux.

## 📋 Pré-requisitos

- Servidor Linux (Ubuntu 20.04+ ou Debian 11+ recomendado)
- Acesso SSH ao servidor
- Node.js 18.x ou superior
- MongoDB instalado ou acesso a um MongoDB remoto
- Domínio configurado (opcional, mas recomendado)

## 🔧 Passo 1: Preparar o Servidor

### 1.1 Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar Node.js 18.x

```bash
# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 1.3 Instalar MongoDB (se usar local)

```bash
# Importar chave pública do MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Adicionar repositório
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Instalar MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Iniciar e habilitar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 1.4 Instalar PM2 (Gerenciador de Processos)

```bash
sudo npm install -g pm2
```

### 1.5 Instalar Nginx (Opcional - para reverse proxy)

```bash
sudo apt install -y nginx
```

## 📦 Passo 2: Transferir o Código para o Servidor

### 2.1 Opção A: Via Git (Recomendado)

```bash
# No servidor, criar diretório para a aplicação
sudo mkdir -p /var/www/agilizapsi
sudo chown -R $USER:$USER /var/www/agilizapsi
cd /var/www/agilizapsi

# Clonar o repositório (substitua pela URL do seu repositório)
git clone https://github.com/seu-usuario/agilizapsi.git .

# Ou se já tiver o código local, use SCP:
# scp -r /caminho/local/AgilizaPSI/* usuario@servidor:/var/www/agilizapsi/
```

### 2.2 Opção B: Via SCP (do Windows para Linux)

No PowerShell do Windows:

```powershell
# Compactar o projeto (exceto node_modules)
# Depois transferir:
scp -r C:\Ag\AgilizaPSI usuario@seu-servidor:/var/www/agilizapsi
```

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

### 3.1 Criar arquivo .env

```bash
cd /var/www/agilizapsi
nano .env
```

### 3.2 Adicionar as seguintes variáveis:

```env
# URL do Banco de Dados MongoDB
DATABASE_URL="mongodb://localhost:27017/agilizapsi"
# Ou se usar MongoDB remoto:
# DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/agilizapsi?retryWrites=true&w=majority"

# NextAuth Secret (gere uma string aleatória)
NEXTAUTH_SECRET="sua-chave-secreta-aqui-gere-uma-string-aleatoria-longa"
NEXTAUTH_URL="http://seu-dominio.com"
# Ou se usar IP:
# NEXTAUTH_URL="http://seu-ip:3000"

# Configurações de Email (Resend)
RESEND_API_KEY="sua-chave-api-resend"
EMAIL_FROM="noreply@seu-dominio.com"

# Ambiente
NODE_ENV="production"
```

**Importante:** Para gerar o `NEXTAUTH_SECRET`, execute:

```bash
openssl rand -base64 32
```

### 3.3 Proteger o arquivo .env

```bash
chmod 600 .env
```

## 🔨 Passo 4: Instalar Dependências e Build

### 4.1 Instalar dependências

```bash
cd /var/www/agilizapsi
npm install
```

### 4.2 Gerar Prisma Client

```bash
npx prisma generate
```

### 4.3 Fazer push do schema para o banco (primeira vez)

```bash
npx prisma db push
```

### 4.4 Criar usuários administradores (opcional)

```bash
npm run create-admins
```

### 4.5 Build da aplicação

```bash
npm run build
```

## 🚀 Passo 5: Configurar PM2

### 5.1 Criar arquivo de configuração do PM2

```bash
nano ecosystem.config.js
```

Adicione o seguinte conteúdo:

```javascript
module.exports = {
  apps: [{
    name: 'agilizapsi',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/agilizapsi',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/agilizapsi/error.log',
    out_file: '/var/log/agilizapsi/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

### 5.2 Criar diretório de logs

```bash
sudo mkdir -p /var/log/agilizapsi
sudo chown -R $USER:$USER /var/log/agilizapsi
```

### 5.3 Iniciar aplicação com PM2

```bash
pm2 start ecosystem.config.js
```

### 5.4 Configurar PM2 para iniciar automaticamente

```bash
pm2 startup
# Execute o comando que aparecer (algo como: sudo env PATH=...)
pm2 save
```

### 5.5 Comandos úteis do PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs agilizapsi

# Reiniciar
pm2 restart agilizapsi

# Parar
pm2 stop agilizapsi

# Monitorar
pm2 monit
```

## 🌐 Passo 6: Configurar Nginx (Reverse Proxy)

### 6.1 Criar configuração do Nginx

```bash
sudo nano /etc/nginx/sites-available/agilizapsi
```

Adicione:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    # Ou use o IP do servidor se não tiver domínio:
    # server_name seu-ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.2 Habilitar o site

```bash
sudo ln -s /etc/nginx/sites-available/agilizapsi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6.3 Configurar Firewall (UFW)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 🔒 Passo 7: Configurar SSL com Let's Encrypt (Opcional mas Recomendado)

### 7.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obter certificado SSL

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### 7.3 Renovação automática

O Certbot já configura renovação automática. Teste com:

```bash
sudo certbot renew --dry-run
```

## 🔄 Passo 8: Atualizações Futuras

### 8.1 Script de atualização

Crie um script para facilitar atualizações:

```bash
nano /var/www/agilizapsi/update.sh
```

Adicione:

```bash
#!/bin/bash
cd /var/www/agilizapsi

# Atualizar código
git pull
# Ou se não usar git:
# scp -r usuario@maquina-local:/caminho/projeto/* .

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Fazer push do schema (se houver mudanças)
# npx prisma db push

# Build
npm run build

# Reiniciar aplicação
pm2 restart agilizapsi

echo "Atualização concluída!"
```

Tornar executável:

```bash
chmod +x update.sh
```

## 📊 Passo 9: Monitoramento

### 9.1 Verificar logs

```bash
# Logs da aplicação
pm2 logs agilizapsi

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do MongoDB (se local)
sudo tail -f /var/log/mongodb/mongod.log
```

### 9.2 Verificar status dos serviços

```bash
# Status da aplicação
pm2 status

# Status do Nginx
sudo systemctl status nginx

# Status do MongoDB
sudo systemctl status mongod
```

## 🐛 Troubleshooting

### Problema: Aplicação não inicia

```bash
# Verificar logs
pm2 logs agilizapsi --lines 100

# Verificar se a porta está em uso
sudo netstat -tulpn | grep 3000

# Verificar variáveis de ambiente
pm2 env 0
```

### Problema: Erro de conexão com MongoDB

```bash
# Verificar se MongoDB está rodando
sudo systemctl status mongod

# Testar conexão
mongosh "mongodb://localhost:27017/agilizapsi"

# Verificar firewall
sudo ufw status
```

### Problema: Erro 502 Bad Gateway

```bash
# Verificar se aplicação está rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar configuração do Nginx
sudo nginx -t
```

### Problema: Prisma Client não encontrado

```bash
# Regenerar Prisma Client
npx prisma generate
pm2 restart agilizapsi
```

## 📝 Checklist de Deploy

- [ ] Node.js 18+ instalado
- [ ] MongoDB configurado e rodando
- [ ] Código transferido para o servidor
- [ ] Arquivo `.env` configurado com todas as variáveis
- [ ] Dependências instaladas (`npm install`)
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] Schema do banco atualizado (`npx prisma db push`)
- [ ] Build realizado (`npm run build`)
- [ ] PM2 configurado e aplicação rodando
- [ ] PM2 configurado para iniciar automaticamente
- [ ] Nginx configurado (se usar)
- [ ] Firewall configurado
- [ ] SSL configurado (se usar domínio)
- [ ] Testar acesso à aplicação

## 🔐 Segurança Adicional

### 1. Configurar fail2ban (proteção contra ataques)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Desabilitar login root via SSH

```bash
sudo nano /etc/ssh/sshd_config
# Alterar: PermitRootLogin no
sudo systemctl restart sshd
```

### 3. Atualizar sistema regularmente

```bash
# Adicionar ao crontab
sudo crontab -e
# Adicionar: 0 2 * * 0 apt update && apt upgrade -y
```

## 📞 Suporte

Em caso de problemas, verifique:
1. Logs do PM2: `pm2 logs agilizapsi`
2. Logs do Nginx: `/var/log/nginx/error.log`
3. Status dos serviços: `pm2 status`, `systemctl status nginx`, `systemctl status mongod`

---

**Nota:** Este guia assume um servidor Ubuntu/Debian. Para outras distribuições Linux, ajuste os comandos de instalação de pacotes conforme necessário.

