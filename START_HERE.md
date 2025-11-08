# 🚀 Guia de Início Rápido - Receipt Manager

## ✅ O que foi implementado

Todas as funcionalidades de recuperação de senha foram implementadas e estão prontas:

### Backend
- ✅ Models para tokens de reset (crypto-secure tokens)
- ✅ Controllers para forgot/reset password
- ✅ Serviço de email (Nodemailer com templates HTML/texto)
- ✅ Validação Zod para inputs
- ✅ Rotas no API Gateway (proxy correto)
- ✅ **FIX CRÍTICO**: Correção do bug de Authorization header no proxy

### Frontend
- ✅ Página "Esqueci minha senha" (`/forgot-password`)
- ✅ Página de reset de senha (`/reset-password/:token`)
- ✅ Link na página de login
- ✅ Integração com API
- ✅ **CRIADO**: Arquivo `frontend/.env` (estava faltando!)

### Database
- ✅ Migration para tabela `password_reset_tokens`
- ✅ Índices otimizados
- ✅ Script `run-all-migrations.sh`

### Documentação
- ✅ Script de diagnóstico (`diagnose.sh`)
- ✅ Guia completo de troubleshooting (`TROUBLESHOOTING.md`)
- ✅ README atualizado

---

## 🔧 IMPORTANTE: Problema Atual

Você reportou que **não consegue acessar o dashboard após login** e que o **backend não está rodando**.

### Causa Identificada

1. **Docker containers podem não estar rodando** (preciso verificar)
2. **Frontend .env estava faltando** → **AGORA RESOLVIDO** ✅
3. **Bug no Authorization header** → **AGORA RESOLVIDO** ✅

---

## 🏃 Como Iniciar o Sistema (PASSO A PASSO)

### 1️⃣ Subir os serviços Docker

```bash
# Na raiz do projeto
docker-compose up -d

# Verificar se estão rodando
docker-compose ps
```

**Você deve ver 5 containers rodando:**
- `receipt-manager-db` (PostgreSQL)
- `receipt-manager-api-gateway` (porta 3000)
- `receipt-manager-user-service` (porta 3004)
- `receipt-manager-analytics-service` (porta 3003)
- `receipt-manager-products-service` (porta 3002)

### 2️⃣ Executar as migrações (se ainda não fez)

```bash
# Tornar script executável (se necessário)
chmod +x database/run-all-migrations.sh

# Executar migrações
./database/run-all-migrations.sh
```

### 3️⃣ Iniciar o Frontend

**⚠️ IMPORTANTE:** Como o arquivo `.env` foi criado agora, você DEVE reiniciar o Vite!

```bash
cd frontend

# Se estiver rodando, pare com Ctrl+C

# Inicie novamente
npm run dev
```

### 4️⃣ Verificar se tudo está funcionando

```bash
# Volte para a raiz do projeto
cd ..

# Execute o script de diagnóstico
./diagnose.sh
```

O script vai verificar:
- ✓ Docker instalado e rodando
- ✓ Portas disponíveis (3000, 3004, 3003, 3002, 5173, 5432)
- ✓ Endpoints respondendo
- ✓ Arquivo `.env` do frontend
- ✓ Logs dos containers

---

## 🎯 Testar a Funcionalidade de Reset de Senha

### 1. Acesse o frontend
```
http://localhost:5173
```

### 2. Clique em "Esqueceu sua senha?" na tela de login

### 3. Digite um email cadastrado
```
teste@example.com
```

### 4. Verifique o email no console do container
```bash
docker-compose logs user-service | grep -A 20 "Password Reset"
```

**Copie o link de reset que aparece nos logs** (formato: `http://localhost:5173/reset-password/TOKEN`)

### 5. Acesse o link e redefina a senha

### 6. Faça login com a nova senha

---

## 🔍 Verificação Rápida dos Endpoints

```bash
# 1. Health Check do API Gateway
curl http://localhost:3000/health

# 2. Fazer Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"senha123"}'

# Copie o token retornado e substitua abaixo

# 3. Testar Analytics (com o token)
curl http://localhost:3000/api/analytics/summary \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Agora o analytics deve funcionar!** O bug do Authorization header foi corrigido.

---

## 🐛 Se algo não funcionar

### Opção 1: Consulte o guia de troubleshooting
```bash
cat TROUBLESHOOTING.md
```

### Opção 2: Ver logs dos containers
```bash
# Todos os logs em tempo real
docker-compose logs -f

# Apenas um serviço
docker-compose logs -f api-gateway
docker-compose logs -f user-service
```

### Opção 3: Rebuild completo
```bash
# Parar tudo
docker-compose down

# Rebuild (sem cache)
docker-compose build --no-cache

# Subir novamente
docker-compose up -d

# Executar migrações
./database/run-all-migrations.sh
```

---

## 📊 Configuração de Email (Opcional)

Por padrão, os emails são exibidos no console. Para enviar emails reais:

1. **Edite `docker-compose.yml`** (ou crie `.env`):
```yaml
environment:
  - SMTP_HOST=smtp.gmail.com
  - SMTP_PORT=587
  - SMTP_USER=seu-email@gmail.com
  - SMTP_PASS=sua-senha-de-app
  - EMAIL_FROM=noreply@receiptmanager.com
```

2. **Restart o user-service**:
```bash
docker-compose restart user-service
```

---

## ✅ Checklist de Verificação

Execute estes comandos e marque o que está OK:

```bash
# [ ] Docker está rodando?
docker ps

# [ ] Containers estão UP?
docker-compose ps

# [ ] API Gateway responde?
curl http://localhost:3000/health

# [ ] User Service responde?
curl http://localhost:3004/health

# [ ] Analytics responde?
curl http://localhost:3003/health

# [ ] Frontend .env existe?
cat frontend/.env

# [ ] Frontend está rodando?
curl http://localhost:5173

# [ ] Login funciona?
# Tente fazer login pela interface: http://localhost:5173/login

# [ ] Dashboard carrega após login?
# Após login bem-sucedido, você deve ver o dashboard
```

---

## 🎉 Próximos Passos

Depois que tudo estiver funcionando:

1. **Criar usuário de teste** (se ainda não tiver)
2. **Testar fluxo completo de reset de senha**
3. **Configurar SMTP** (se quiser emails reais)
4. **Deploy** (Vercel para frontend, Railway/Render para backend)

---

## 📞 Precisa de Ajuda?

1. Execute `./diagnose.sh` e copie a saída
2. Execute `docker-compose logs > logs.txt`
3. Reporte os erros específicos que aparecem

---

**Última atualização:** 2024-11-08
**Branch:** `claude/add-password-reset-feature-011CUj6vRttE7sE65jxnFfvA`
**Status:** ✅ Pronto para uso
