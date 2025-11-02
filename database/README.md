# Database Migrations - Receipt Manager

Este diretório contém as migrações SQL para o banco de dados PostgreSQL.

## 📋 Migrações Disponíveis

| Migração | Descrição |
|----------|-----------|
| `001_create_tables.sql` | Cria as tabelas principais (users, receipts, etc) |
| `002_create_indexes.sql` | Cria índices para otimização de queries |
| `003_create_password_reset_tokens.sql` | Cria tabela para tokens de recuperação de senha |

## 🚀 Como Funciona

### Primeira Inicialização (Banco Novo)

Quando você roda `docker-compose up` pela primeira vez, o PostgreSQL executa **automaticamente** todas as migrações em ordem alfabética.

Isso acontece porque o `docker-compose.yml` monta o diretório `migrations` em `/docker-entrypoint-initdb.d`:

```yaml
volumes:
  - ./database/migrations:/docker-entrypoint-initdb.d
```

✅ **Neste caso, você não precisa fazer nada!** As migrações rodam automaticamente.

### Banco Já Existente (Nova Migração)

Se você já tem o banco rodando e precisa aplicar uma nova migração (como a `003_create_password_reset_tokens.sql`), você tem 3 opções:

#### Opção 1: Script Automatizado (Recomendado)

Execute todas as migrações de uma vez:

```bash
./database/run-all-migrations.sh
```

Ou execute uma migração específica:

```bash
./database/run-migration.sh 003
```

#### Opção 2: Manualmente via Docker Exec

```bash
docker exec -i receipt-manager-db psql -U admin -d receipt_manager < database/migrations/003_create_password_reset_tokens.sql
```

#### Opção 3: Resetar o Banco Completamente

⚠️ **ATENÇÃO**: Isso apaga TODOS os dados!

```bash
# Parar containers
docker-compose down

# Remover volume do banco
docker volume rm receipt-manager-postgres-data

# Subir tudo novamente (migrações rodam automaticamente)
docker-compose up -d
```

## 🛠️ Scripts Auxiliares

### `run-migration.sh`

Executa uma migração específica no container Docker.

**Uso:**
```bash
./database/run-migration.sh [numero]
```

**Exemplos:**
```bash
./database/run-migration.sh 003
./database/run-migration.sh 001_create_tables
```

### `run-all-migrations.sh`

Executa TODAS as migrações em ordem.

**Uso:**
```bash
./database/run-all-migrations.sh
```

## 📝 Como Criar uma Nova Migração

1. Crie um arquivo com numeração sequencial:
   ```bash
   touch database/migrations/004_minha_nova_feature.sql
   ```

2. Escreva o SQL:
   ```sql
   -- Descrição da migração
   CREATE TABLE IF NOT EXISTS minha_tabela (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       -- seus campos...
   );
   ```

3. Execute a migração:
   ```bash
   ./database/run-migration.sh 004
   ```

## 🔍 Verificar Status do Banco

Conectar ao PostgreSQL no container:

```bash
docker exec -it receipt-manager-db psql -U admin -d receipt_manager
```

Listar tabelas:
```sql
\dt
```

Verificar se tabela de password reset existe:
```sql
\d password_reset_tokens
```

Sair:
```sql
\q
```

## ⚙️ Troubleshooting

### Migração falhou com erro "relation already exists"

Isso significa que a tabela já existe. Tudo certo! ✅

### Container não está rodando

```bash
# Verificar status
docker-compose ps

# Subir containers
docker-compose up -d
```

### Erro de conexão com banco

```bash
# Ver logs do PostgreSQL
docker-compose logs postgres

# Verificar health do container
docker inspect receipt-manager-db | grep -A 10 Health
```

### Ver logs em tempo real

```bash
# Todos os serviços
docker-compose logs -f

# Apenas PostgreSQL
docker-compose logs -f postgres

# Apenas User Service
docker-compose logs -f user-service
```

## 📚 Referências

- PostgreSQL Docker Hub: https://hub.docker.com/_/postgres
- Docker Entrypoint Init DB: https://github.com/docker-library/docs/blob/master/postgres/README.md#initialization-scripts
