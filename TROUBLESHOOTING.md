# 🔧 Troubleshooting - Receipt Manager

Guia completo para resolver problemas comuns do sistema.

---

## 🚨 Problema: "Backend não está rodando" ou "Erro 401 após login"

### Sintomas
- ❌ Não consegue acessar o dashboard após login
- ❌ Erro: `Failed to fetch` ou `Network Error`
- ❌ API retorna 401 (Unauthorized)
- ❌ Requisições para `/api/analytics/*` falham

### Diagnóstico Rápido

Execute o script de diagnóstico:
```bash
./diagnose.sh
```

---

## ✅ Solução 1: Verificar se Docker está rodando

### Verificar Docker
```bash
# Verificar se Docker está instalado
docker --version

# Verificar se daemon está rodando
docker ps
```

### Se Docker não está rodando:

**Linux:**
```bash
sudo systemctl start docker
```

**macOS/Windows:**
- Abra o Docker Desktop
- Aguarde até o ícone ficar verde

---

## ✅ Solução 2: Subir os serviços

### Opção A: Subir tudo de uma vez (Recomendado)
```bash
# Na raiz do projeto
docker-compose up -d

# Ver status
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f
```

### Opção B: Subir serviços individuais
```bash
# Apenas banco
docker-compose up -d postgres

# Depois os serviços
docker-compose up -d user-service
docker-compose up -d api-gateway

# Frontend (sem Docker)
cd frontend
npm run dev
```

---

## ✅ Solução 3: Verificar arquivo .env do Frontend

### Verificar se existe
```bash
ls frontend/.env
```

### Se não existir, criar:
```bash
# Copiar do exemplo
cp frontend/.env.example frontend/.env

# Ou criar manualmente
echo "VITE_API_URL=http://localhost:3000" > frontend/.env
```

### ⚠️ IMPORTANTE
Após criar/modificar `.env`, **reinicie o frontend**:
```bash
cd frontend
# Ctrl+C para parar o Vite
npm run dev
```

---

## ✅ Solução 4: Rebuild dos containers

Se os containers estão com problemas:

```bash
# Parar tudo
docker-compose down

# Rebuild (força recompilação)
docker-compose build --no-cache

# Subir novamente
docker-compose up -d

# Ver logs
docker-compose logs -f api-gateway
```

---

## ✅ Solução 5: Limpar e recomeçar

**⚠️ ATENÇÃO: Isso apaga o banco de dados!**

```bash
# Parar e remover containers
docker-compose down

# Remover volumes (APAGA DADOS!)
docker volume rm receipt-manager-postgres-data

# Rebuild tudo
docker-compose build

# Subir novamente
docker-compose up -d

# Executar migrações
./database/run-all-migrations.sh
```

---

## ✅ Solução 6: Portas em uso

Se alguma porta já está em uso:

### Encontrar processo
```bash
# Porta 3000 (API Gateway)
lsof -ti:3000

# Porta 5173 (Frontend)
lsof -ti:5173

# Porta 5432 (PostgreSQL)
lsof -ti:5432
```

### Matar processo
```bash
# Substituir 3000 pela porta que quer liberar
kill -9 $(lsof -ti:3000)
```

---

## 🔍 Verificar Endpoints Manualmente

### 1. Health Check do API Gateway
```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "service": "API Gateway",
  "timestamp": "2024-11-02T..."
}
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Login successful",
  "user": {...},
  "token": "eyJhbGc..."
}
```

### 3. Testar Analytics (com token)
```bash
# Substitua SEU_TOKEN pelo token recebido no login
curl http://localhost:3000/api/analytics/summary \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🐛 Problema: Login funciona mas Dashboard dá erro

### Causa Provável
Frontend não está enviando o token ou o token não está sendo repassado corretamente.

### Solução

1. **Verificar localStorage:**
   - Abra DevTools (F12)
   - Vá em Application > Local Storage
   - Verifique se existe `token` e `user`

2. **Limpar cache e fazer novo login:**
   ```javascript
   // No console do navegador
   localStorage.clear()
   location.reload()
   ```

3. **Verificar Network tab:**
   - Abra DevTools > Network
   - Faça login novamente
   - Verifique se requisições para `/api/*` têm header `Authorization`

---

## 🌐 Problema: Deploy na Vercel não funciona

### Causa
Frontend na Vercel está tentando acessar `localhost:3000` que só existe no seu computador!

### Solução

1. **Deploy do backend primeiro** (Render, Railway, Heroku, etc.)

2. **Atualizar variável de ambiente na Vercel:**
   ```
   VITE_API_URL=https://seu-backend.render.com
   ```

3. **Re-deploy do frontend**

---

## 📊 Ver Logs dos Containers

```bash
# Todos os logs
docker-compose logs

# Logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f api-gateway
docker-compose logs -f user-service
docker-compose logs -f analytics-service

# Últimas 50 linhas
docker-compose logs --tail=50 api-gateway
```

---

## 🔐 Problema: Token inválido / Expirado

### Sintomas
- ❌ Erro 401 após alguns dias
- ❌ "Token expired" nas requisições

### Solução
Fazer login novamente - tokens JWT expiram após 7 dias (configurável).

Para aumentar expiração:
```bash
# No docker-compose.yml ou .env
JWT_EXPIRES_IN=30d  # 30 dias
```

---

## 🗄️ Conectar ao PostgreSQL

### Via Docker
```bash
docker exec -it receipt-manager-db psql -U admin -d receipt_manager
```

### Via psql local
```bash
psql -h localhost -U admin -d receipt_manager
# Senha: admin123
```

### Comandos úteis:
```sql
-- Listar tabelas
\dt

-- Ver usuários
SELECT * FROM users;

-- Ver tokens de reset
SELECT * FROM password_reset_tokens;

-- Sair
\q
```

---

## 🔄 Resetar apenas o banco de dados

```bash
# Parar apenas o PostgreSQL
docker-compose stop postgres

# Remover volume do banco
docker volume rm receipt-manager-postgres-data

# Subir banco novamente
docker-compose up -d postgres

# Executar migrações
./database/run-all-migrations.sh
```

---

## 📱 Verificar se tudo está funcionando

### Checklist completo:

```bash
# 1. Docker rodando?
docker ps

# 2. Portas acessíveis?
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3004/health  # User Service
curl http://localhost:3003/health  # Analytics

# 3. Frontend configurado?
cat frontend/.env

# 4. Frontend rodando?
curl http://localhost:5173

# 5. Fazer login de teste
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"senha123"}'
```

---

## 🚀 Script de Start Rápido

Crie um arquivo `start.sh`:

```bash
#!/bin/bash

echo "🚀 Iniciando Receipt Manager..."

# Subir backend
docker-compose up -d

echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# Verificar se está tudo OK
./diagnose.sh

echo ""
echo "✅ Pronto!"
echo "Frontend: http://localhost:5173"
echo "API: http://localhost:3000"
```

```bash
chmod +x start.sh
./start.sh
```

---

## 📞 Ainda com problemas?

1. **Execute o script de diagnóstico:**
   ```bash
   ./diagnose.sh
   ```

2. **Copie a saída completa do script**

3. **Verifique os logs:**
   ```bash
   docker-compose logs > logs.txt
   ```

4. **Abra uma issue no GitHub** com:
   - Saída do `diagnose.sh`
   - Conteúdo de `logs.txt`
   - Passos que você já tentou

---

## 🎯 Problemas Comuns e Soluções Rápidas

| Problema | Solução Rápida |
|----------|---------------|
| Backend não responde | `docker-compose restart` |
| Erro 401 após login | Limpar localStorage e fazer login novamente |
| Frontend não carrega | Verificar `frontend/.env` e reiniciar Vite |
| Porta em uso | `kill -9 $(lsof -ti:3000)` |
| Containers não sobem | `docker-compose down && docker-compose up -d` |
| Erro de migração | `./database/run-all-migrations.sh` |

---

**Última atualização:** Novembro 2024
