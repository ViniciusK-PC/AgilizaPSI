#!/bin/bash

# Script de Deploy Automatizado - AgilizaPSI
# Execute: chmod +x deploy.sh && ./deploy.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do AgilizaPSI..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado. Execute este script no diretório raiz do projeto.${NC}"
    exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado.${NC}"
    echo "Criando arquivo .env a partir do template..."
    
    # Criar .env básico
    cat > .env << EOF
# URL do Banco de Dados MongoDB
DATABASE_URL="mongodb://localhost:27017/agilizapsi"

# NextAuth Secret (gere uma string aleatória com: openssl rand -base64 32)
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
# NEXTAUTH_URL="http://191.5.216.22:3000"

# Configurações de Email (Resend)
RESEND_API_KEY="re_Tx5zPej9_4FCymcMY96n8DMUfqtLi6VeB"
EMAIL_FROM="noreply@exemplo.com"

# Ambiente
NODE_ENV="production"
EOF
    
    echo -e "${YELLOW}⚠️  Por favor, edite o arquivo .env com suas configurações antes de continuar.${NC}"
    echo "Pressione Enter para continuar após editar o .env, ou Ctrl+C para cancelar..."
    read
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js versão 18+ é necessário. Versão atual: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) encontrado${NC}"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# Gerar Prisma Client
echo ""
echo "🔧 Gerando Prisma Client..."
npx prisma generate

# Verificar conexão com banco de dados
echo ""
echo "🔍 Verificando conexão com banco de dados..."
if npx prisma db push --skip-generate 2>&1 | grep -q "Error"; then
    echo -e "${YELLOW}⚠️  Aviso: Erro ao conectar com o banco de dados. Verifique sua DATABASE_URL no .env${NC}"
    echo "Continuando mesmo assim..."
else
    echo -e "${GREEN}✓ Conexão com banco de dados OK${NC}"
fi

# Build da aplicação
echo ""
echo "🏗️  Fazendo build da aplicação..."
npm run build

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo ""
    echo -e "${YELLOW}⚠️  PM2 não encontrado.${NC}"
    echo "Deseja instalar o PM2 globalmente? (s/n)"
    read -r response
    if [[ "$response" =~ ^([sS][iI][mM]|[sS])$ ]]; then
        echo "Instalando PM2..."
        sudo npm install -g pm2
    else
        echo "PM2 não instalado. Você precisará iniciar a aplicação manualmente com: npm start"
        exit 0
    fi
fi

# Criar diretório de logs se não existir
mkdir -p /var/log/agilizapsi 2>/dev/null || sudo mkdir -p /var/log/agilizapsi
sudo chown -R $USER:$USER /var/log/agilizapsi 2>/dev/null || true

# Verificar se já existe processo PM2 rodando
if pm2 list | grep -q "agilizapsi"; then
    echo ""
    echo "🔄 Reiniciando aplicação no PM2..."
    pm2 restart agilizapsi
else
    echo ""
    echo "🚀 Iniciando aplicação no PM2..."
    
    # Criar ecosystem.config.js se não existir
    if [ ! -f "ecosystem.config.js" ]; then
        cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'agilizapsi',
    script: 'npm',
    args: 'start',
    cwd: process.cwd(),
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
EOF
        echo -e "${GREEN}✓ Arquivo ecosystem.config.js criado${NC}"
    fi
    
    pm2 start ecosystem.config.js
    pm2 save
fi

# Mostrar status
echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo "📊 Status da aplicação:"
pm2 status agilizapsi
echo ""
echo "📝 Logs:"
echo "  - Ver logs: pm2 logs agilizapsi"
echo "  - Monitorar: pm2 monit"
echo "  - Reiniciar: pm2 restart agilizapsi"
echo ""
echo "🌐 A aplicação deve estar rodando em: http://191.5.216.22"
echo ""
echo "💡 Próximos passos:"
echo "  1. Configure o Nginx como reverse proxy (veja DEPLOY_LINUX.md)"
echo "  2. Configure SSL com Let's Encrypt (opcional)"
echo "  3. Configure o PM2 para iniciar automaticamente: pm2 startup"

