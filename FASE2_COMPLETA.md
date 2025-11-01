# ✅ FASE 2 - USER SERVICE + AUTENTICAÇÃO - COMPLETA!

## 🎉 O que foi implementado

### 1. Database Connection
- ✅ `utils/database.ts` - Connection pool do PostgreSQL
- ✅ Query helper com logging
- ✅ Error handling
- ✅ Connection events

### 2. Authentication Utilities
- ✅ `utils/jwt.ts` - JWT generation e verification
- ✅ `utils/password.ts` - Bcrypt hash e compare
- ✅ `utils/authMiddleware.ts` - Middleware de autenticação
- ✅ `utils/validation.ts` - Schemas Zod para validação

### 3. User Model
- ✅ `models/User.ts` - Operações de banco de dados:
  - `createUser()` - Criar usuário com hash de senha
  - `findUserByEmail()` - Buscar por email
  - `findUserById()` - Buscar por ID
  - `updateUser()` - Atualizar dados
  - `deleteUser()` - Deletar usuário
  - `emailExists()` - Verificar email existente

### 4. Controllers
- ✅ `controllers/authController.ts`:
  - `register()` - POST /register
  - `login()` - POST /login
- ✅ `controllers/userController.ts`:
  - `getProfile()` - GET /profile
  - `updateProfile()` - PUT /profile

### 5. Routes
- ✅ `routes/authRoutes.ts` - Rotas públicas (register, login)
- ✅ `routes/userRoutes.ts` - Rotas protegidas (profile)

### 6. Main Application
- ✅ `src/index.ts` atualizado com:
  - Importação de todas as rotas
  - Health check com verificação de DB
  - Error handlers
  - Graceful shutdown

---

## 📡 Endpoints Implementados

### 🔓 Públicos (Sem Autenticação)

#### POST /register
Registrar novo usuário

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "João Silva"
}
```

**Response 201:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "João Silva",
    "created_at": "2025-10-31T...",
    "updated_at": "2025-10-31T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validações:**
- Email: formato válido, 5-255 caracteres
- Password: mínimo 6 caracteres
- Name: 2-100 caracteres, apenas letras e espaços

#### POST /login
Autenticar usuário

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response 200:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "João Silva",
    "created_at": "2025-10-31T...",
    "updated_at": "2025-10-31T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 🔒 Protegidos (Requerem Token JWT)

#### GET /profile
Obter perfil do usuário logado

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "João Silva",
    "created_at": "2025-10-31T...",
    "updated_at": "2025-10-31T..."
  }
}
```

#### PUT /profile
Atualizar perfil do usuário logado

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "João Silva Atualizado",
  "email": "novoemail@exemplo.com"
}
```

**Response 200:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "novoemail@exemplo.com",
    "name": "João Silva Atualizado",
    "created_at": "2025-10-31T...",
    "updated_at": "2025-10-31T..."
  }
}
```

---

## 🧪 Como Testar

### Pré-requisitos
```bash
# Certifique-se que o PostgreSQL está rodando
docker-compose up -d postgres

# Verificar que as tabelas foram criadas
docker-compose exec postgres psql -U admin -d receipt_manager -c "\dt"
```

### Teste 1: Health Check

```bash
curl http://localhost:3004/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "service": "User Service",
  "database": "Connected",
  "timestamp": "2025-10-31T..."
}
```

### Teste 2: Registrar Usuário

```bash
curl -X POST http://localhost:3004/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@receiptmanager.com",
    "password": "senha123",
    "name": "Usuario Teste"
  }'
```

**Resposta esperada (201):**
- Usuário criado
- Token JWT retornado
- Senha **não** retornada

**Salve o token retornado para os próximos testes!**

### Teste 3: Login

```bash
curl -X POST http://localhost:3004/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@receiptmanager.com",
    "password": "senha123"
  }'
```

**Resposta esperada (200):**
- Usuário retornado
- Novo token JWT gerado

### Teste 4: Obter Perfil (Autenticado)

```bash
# Substitua <TOKEN> pelo token recebido no registro ou login
curl http://localhost:3004/profile \
  -H "Authorization: Bearer <TOKEN>"
```

**Resposta esperada (200):**
- Dados do usuário logado

### Teste 5: Atualizar Perfil (Autenticado)

```bash
curl -X PUT http://localhost:3004/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Nome Atualizado"
  }'
```

**Resposta esperada (200):**
- Dados atualizados

### Teste 6: Validações (Erros Esperados)

**Email duplicado:**
```bash
# Registrar mesmo email duas vezes
curl -X POST http://localhost:3004/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@receiptmanager.com",
    "password": "senha123",
    "name": "Outro Usuario"
  }'
```
**Resposta esperada (400):** "Email already registered"

**Senha incorreta:**
```bash
curl -X POST http://localhost:3004/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@receiptmanager.com",
    "password": "senhaerrada"
  }'
```
**Resposta esperada (401):** "Invalid email or password"

**Sem token:**
```bash
curl http://localhost:3004/profile
```
**Resposta esperada (401):** "No token provided"

**Token inválido:**
```bash
curl http://localhost:3004/profile \
  -H "Authorization: Bearer token-invalido"
```
**Resposta esperada (401):** "Invalid or expired token"

---

## 🧪 Teste via API Gateway

Todos os endpoints também funcionam através do API Gateway:

```bash
# Registro via Gateway
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gateway@test.com",
    "password": "senha123",
    "name": "Gateway User"
  }'

# Login via Gateway
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gateway@test.com",
    "password": "senha123"
  }'

# Profile via Gateway (requer token)
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 📁 Estrutura de Arquivos Criados

```
backend/services/user-service/src/
├── controllers/
│   ├── authController.ts       ✅ Register, Login
│   └── userController.ts       ✅ Get/Update Profile
│
├── models/
│   └── User.ts                 ✅ CRUD operations
│
├── routes/
│   ├── authRoutes.ts           ✅ Public routes
│   └── userRoutes.ts           ✅ Protected routes
│
├── utils/
│   ├── database.ts             ✅ PostgreSQL connection
│   ├── jwt.ts                  ✅ JWT utilities
│   ├── password.ts             ✅ Bcrypt utilities
│   ├── authMiddleware.ts       ✅ Auth middleware
│   └── validation.ts           ✅ Zod schemas
│
└── index.ts                    ✅ Main app (updated)
```

**Total: 11 arquivos (10 novos + 1 atualizado)**

---

## 🔐 Segurança Implementada

### 1. Hash de Senhas
- ✅ Bcrypt com 10 rounds (configur ável via .env)
- ✅ Senhas **nunca** retornadas nas respostas
- ✅ Hash antes de salvar no banco

### 2. JWT Tokens
- ✅ Assinatura com secret key (configurável via .env)
- ✅ Expiração de 7 dias (configurável)
- ✅ Payload contém apenas userId e email
- ✅ Verificação em todas rotas protegidas

### 3. Validações
- ✅ Zod schemas para todos inputs
- ✅ Email formato válido
- ✅ Senha mínimo 6 caracteres
- ✅ Nome apenas letras e espaços
- ✅ Limites de tamanho

### 4. Database
- ✅ Prepared statements (proteção contra SQL injection)
- ✅ Connection pool
- ✅ Error handling
- ✅ Unique constraint no email

---

## 🎯 Fluxo de Autenticação

```
1. REGISTRO
   User -> POST /register -> Validate -> Hash password -> Save DB -> Generate JWT -> Return token

2. LOGIN
   User -> POST /login -> Find user -> Compare password -> Generate JWT -> Return token

3. ACESSO PROTEGIDO
   User -> Request + Token -> Verify JWT -> Extract userId -> Execute operation
```

---

## 🐛 Troubleshooting

### Erro: "Connection refused" no banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Erro: "Table users does not exist"

```bash
# Verificar migrations
docker-compose exec postgres psql -U admin -d receipt_manager -c "\dt"

# Se não existir, recriar banco
docker-compose down -v
docker-compose up -d postgres
```

### Erro: "Module not found"

```bash
# Reinstalar dependências
cd backend/services/user-service
npm install

# Ou via Docker
docker-compose build user-service
docker-compose up -d user-service
```

### Token expira muito rápido

```bash
# Editar .env do user-service
JWT_EXPIRES_IN=30d  # 30 dias

# Reiniciar serviço
docker-compose restart user-service
```

---

## 📊 Validação da Fase 2

### Checklist

- [x] Conexão com PostgreSQL funcional
- [x] Health check verifica DB
- [x] Endpoint POST /register funcional
- [x] Endpoint POST /login funcional
- [x] Endpoint GET /profile funcional (protegido)
- [x] Endpoint PUT /profile funcional (protegido)
- [x] Senhas hasheadas com bcrypt
- [x] JWT tokens gerados e validados
- [x] Middleware de autenticação funcional
- [x] Validações Zod implementadas
- [x] Email único enforçado
- [x] Error handling completo
- [x] Rotas funcionam via API Gateway
- [x] Senha nunca retornada nas respostas

---

## 🚀 Comandos Úteis

```bash
# Subir apenas User Service
docker-compose up -d postgres user-service

# Ver logs do User Service
docker-compose logs -f user-service

# Reiniciar User Service
docker-compose restart user-service

# Rebuild User Service
docker-compose up -d --build user-service

# Acessar bash do container
docker-compose exec user-service sh

# Testar conexão com banco (dentro do container)
docker-compose exec postgres psql -U admin -d receipt_manager

# Ver todos os usuários
docker-compose exec postgres psql -U admin -d receipt_manager -c "SELECT id, email, name FROM users;"
```

---

## 📈 Estatísticas

- **Arquivos criados:** 11
- **Linhas de código:** ~800
- **Endpoints:** 4 (2 públicos + 2 protegidos)
- **Tempo estimado:** 2 dias
- **Status:** ✅ Completa

---

## 🎯 Próximos Passos

### **FASE 3: Receipt Service - Upload e Parsing** (3-4 dias)

Implementar:
- [ ] Endpoint POST `/upload` - Processar QR code de cupom
- [ ] Parser de XML de NFC-e brasileira
- [ ] Extração de dados: loja, itens, preços, data
- [ ] Integração com Products Service
- [ ] Endpoint GET `/` - Listar cupons do usuário
- [ ] Endpoint GET `/:id` - Detalhes de um cupom

---

## 🎉 FASE 2 COMPLETA!

Sistema de autenticação completo e funcional, pronto para ser usado pelos outros microserviços!

**User Service:** ✅ 100% Implementado
**Próximo:** Fase 3 - Receipt Service
