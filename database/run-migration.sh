#!/bin/bash

# Script para executar migrações manualmente no Docker
# Uso: ./database/run-migration.sh [numero_da_migracao]
# Exemplo: ./database/run-migration.sh 003

set -e

MIGRATION_FILE=$1
CONTAINER_NAME="receipt-manager-db"

if [ -z "$MIGRATION_FILE" ]; then
    echo "❌ Erro: Especifique o número da migração"
    echo "Uso: ./database/run-migration.sh [numero]"
    echo "Exemplo: ./database/run-migration.sh 003"
    echo ""
    echo "Migrações disponíveis:"
    ls -1 database/migrations/*.sql | sed 's/.*\///' | sed 's/\.sql$//'
    exit 1
fi

# Adicionar extensão .sql se não foi fornecida
if [[ ! "$MIGRATION_FILE" =~ \.sql$ ]]; then
    MIGRATION_FILE="${MIGRATION_FILE}_*.sql"
fi

# Encontrar arquivo de migração
MIGRATION_PATH=$(ls database/migrations/${MIGRATION_FILE} 2>/dev/null | head -1)

if [ -z "$MIGRATION_PATH" ]; then
    echo "❌ Erro: Migração não encontrada: $MIGRATION_FILE"
    echo ""
    echo "Migrações disponíveis:"
    ls -1 database/migrations/*.sql | sed 's/.*\///' | sed 's/\.sql$//'
    exit 1
fi

echo "🔄 Executando migração: $MIGRATION_PATH"
echo ""

# Verificar se o container está rodando
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Erro: Container $CONTAINER_NAME não está rodando"
    echo "Execute: docker-compose up -d"
    exit 1
fi

# Executar migração
docker exec -i "$CONTAINER_NAME" psql -U admin -d receipt_manager < "$MIGRATION_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migração executada com sucesso!"
else
    echo ""
    echo "❌ Erro ao executar migração"
    exit 1
fi
