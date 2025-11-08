#!/bin/bash

# Receipt Manager - Script de Diagnóstico Completo
# Execute este script para verificar o estado de todos os serviços

echo "======================================"
echo "🔍 Receipt Manager - Diagnóstico"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para testar porta
test_port() {
    local port=$1
    local name=$2

    if command_exists nc; then
        if nc -z localhost $port 2>/dev/null; then
            echo -e "${GREEN}✅ $name (porta $port) - RODANDO${NC}"
            return 0
        else
            echo -e "${RED}❌ $name (porta $port) - NÃO ACESSÍVEL${NC}"
            return 1
        fi
    elif command_exists curl; then
        if curl -s --connect-timeout 2 http://localhost:$port >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $name (porta $port) - RODANDO${NC}"
            return 0
        else
            echo -e "${RED}❌ $name (porta $port) - NÃO ACESSÍVEL${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  $name (porta $port) - NÃO FOI POSSÍVEL VERIFICAR${NC}"
        return 2
    fi
}

# 1. Verificar Docker
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Verificando Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command_exists docker; then
    echo -e "${GREEN}✅ Docker instalado${NC}"

    if docker ps >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker daemon rodando${NC}"

        echo ""
        echo "Containers ativos:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "receipt-manager|NAME"

    else
        echo -e "${RED}❌ Docker daemon não está rodando${NC}"
        echo "   Solução: Execute 'sudo systemctl start docker' ou inicie o Docker Desktop"
    fi
else
    echo -e "${RED}❌ Docker não instalado${NC}"
    echo "   Solução: Instale o Docker em https://docker.com/get-started"
fi

echo ""

# 2. Verificar portas
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Verificando Portas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PORTS_OK=0
PORTS_FAIL=0

test_port 3000 "API Gateway" && ((PORTS_OK++)) || ((PORTS_FAIL++))
test_port 3004 "User Service" && ((PORTS_OK++)) || ((PORTS_FAIL++))
test_port 3001 "Receipt Service" && ((PORTS_OK++)) || ((PORTS_FAIL++))
test_port 3002 "Products Service" && ((PORTS_OK++)) || ((PORTS_FAIL++))
test_port 3003 "Analytics Service" && ((PORTS_OK++)) || ((PORTS_FAIL++))
test_port 5432 "PostgreSQL" && ((PORTS_OK++)) || ((PORTS_FAIL++))
test_port 5173 "Frontend (Vite)" && ((PORTS_OK++)) || ((PORTS_FAIL++))

echo ""
echo "Resumo: $PORTS_OK serviços rodando, $PORTS_FAIL serviços inacessíveis"

echo ""

# 3. Testar endpoints HTTP
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Testando Endpoints HTTP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command_exists curl; then

    # API Gateway Health
    echo -n "API Gateway /health: "
    if curl -s --connect-timeout 2 http://localhost:3000/health | grep -q "OK"; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FALHOU${NC}"
    fi

    # User Service Health
    echo -n "User Service /health: "
    if curl -s --connect-timeout 2 http://localhost:3004/health | grep -q "OK"; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FALHOU${NC}"
    fi

    # Analytics Service Health
    echo -n "Analytics Service /health: "
    if curl -s --connect-timeout 2 http://localhost:3003/health | grep -q "OK"; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FALHOU${NC}"
    fi

else
    echo -e "${YELLOW}⚠️  curl não disponível - não foi possível testar endpoints${NC}"
fi

echo ""

# 4. Verificar variáveis de ambiente do frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Configuração do Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✅ Arquivo frontend/.env existe${NC}"
    echo "Conteúdo:"
    cat frontend/.env
else
    echo -e "${YELLOW}⚠️  Arquivo frontend/.env não encontrado${NC}"
    echo "   Solução: Copie frontend/.env.example para frontend/.env"
    if [ -f "frontend/.env.example" ]; then
        echo ""
        echo "Execute: cp frontend/.env.example frontend/.env"
    fi
fi

echo ""

# 5. Verificar logs recentes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  Logs Recentes dos Serviços"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command_exists docker && docker ps >/dev/null 2>&1; then
    echo "Últimas 5 linhas do API Gateway:"
    docker logs --tail 5 receipt-manager-gateway 2>/dev/null || echo "Container não encontrado"

    echo ""
    echo "Últimas 5 linhas do User Service:"
    docker logs --tail 5 receipt-manager-user-service 2>/dev/null || echo "Container não encontrado"
else
    echo -e "${YELLOW}⚠️  Docker não disponível - não foi possível verificar logs${NC}"
fi

echo ""

# 6. Resumo e recomendações
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 RESUMO E RECOMENDAÇÕES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $PORTS_FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os serviços parecem estar rodando!${NC}"
    echo ""
    echo "Acesse:"
    echo "  Frontend: http://localhost:5173"
    echo "  API: http://localhost:3000/health"
else
    echo -e "${RED}❌ Alguns serviços não estão rodando${NC}"
    echo ""
    echo "Passos para resolver:"
    echo ""
    echo "1. Subir os containers Docker:"
    echo "   docker-compose up -d"
    echo ""
    echo "2. Verificar logs de erros:"
    echo "   docker-compose logs -f"
    echo ""
    echo "3. Rebuild se necessário:"
    echo "   docker-compose down"
    echo "   docker-compose build"
    echo "   docker-compose up -d"
    echo ""
    echo "4. Verificar se as portas estão em uso:"
    echo "   lsof -i :3000"
    echo "   lsof -i :5173"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Para mais ajuda, consulte: README.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
