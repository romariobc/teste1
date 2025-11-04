#!/bin/bash

# Script para executar TODAS as migrações no Docker
# Uso: ./database/run-all-migrations.sh

set -e

CONTAINER_NAME="receipt-manager-db"
MIGRATIONS_DIR="database/migrations"

echo "🔄 Executando todas as migrações..."
echo ""

# Verificar se o container está rodando
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Erro: Container $CONTAINER_NAME não está rodando"
    echo "Execute: docker-compose up -d"
    exit 1
fi

# Contador
SUCCESS=0
FAILED=0

# Executar cada migração em ordem
for migration in $(ls -1 "$MIGRATIONS_DIR"/*.sql | sort); do
    FILENAME=$(basename "$migration")
    echo "📄 Executando: $FILENAME"

    if docker exec -i "$CONTAINER_NAME" psql -U admin -d receipt_manager < "$migration" 2>&1 | grep -q "ERROR"; then
        echo "⚠️  $FILENAME - Pode já estar aplicada ou teve erro"
        ((FAILED++))
    else
        echo "✅ $FILENAME - OK"
        ((SUCCESS++))
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumo:"
echo "   Sucesso: $SUCCESS"
echo "   Avisos:  $FAILED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Processo concluído!"
