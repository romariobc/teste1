# 🚀 Guia: Rodando o Backend Localmente

Este guia mostra como executar todo o backend do Receipt Manager localmente usando Docker Desktop.

## 📋 Pré-requisitos

- ✅ Docker Desktop instalado e rodando
- ✅ Portas disponíveis: 3000, 3001, 3002, 3003, 3004, 5432

## 🔧 Passo 1: Iniciar os Serviços

Abra o terminal na raiz do projeto e execute:

```bash
cd /home/user/teste1

# Inicia todos os serviços em background
docker-compose up -d
```

O Docker vai:
1. Baixar as imagens necessárias (primeira vez)
2. Construir os containers dos serviços
3. Criar o banco de dados PostgreSQL
4. Executar as migrações automaticamente
5. Iniciar todos os 5 serviços

**Serviços que serão iniciados:**
- 🗄️ PostgreSQL (porta 5432)
- 🚪 API Gateway (porta 3000)
- 👤 User Service (porta 3004)
- 🧾 Receipt Service (porta 3001)
- 📦 Products Service (porta 3002)
- 📊 Analytics Service (porta 3003)

## ✅ Passo 2: Verificar se os Serviços Estão Rodando

```bash
# Ver status dos containers
docker-compose ps
```

Você deve ver algo como:
```
NAME                                  STATUS
receipt-manager-analytics-service     Up
receipt-manager-db                    Up (healthy)
receipt-manager-gateway               Up
receipt-manager-products-service      Up
receipt-manager-receipt-service       Up
receipt-manager-user-service          Up
```

## 🔍 Passo 3: Testar os Endpoints

```bash
# Testar API Gateway
curl http://localhost:3000/health

# Testar User Service
curl http://localhost:3004/health

# Testar Receipt Service
curl http://localhost:3001/health

# Testar Products Service
curl http://localhost:3002/health

# Testar Analytics Service
curl http://localhost:3003/health
```

Todos devem retornar status "OK".

## 📝 Passo 4: Ver os Logs (Opcional)

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api-gateway
docker-compose logs -f user-service
```

Pressione `Ctrl+C` para sair dos logs.

## ⚠️ IMPORTANTE: Conectando o Frontend no Vercel

O frontend está hospedado no Vercel, mas o backend está rodando localmente (`localhost`).

**Problema:** O navegador não consegue acessar `localhost` de uma aplicação hospedada na internet por questões de segurança.

### 🔧 Solução 1: Usar ngrok (Recomendado para Teste)

O ngrok cria um túnel seguro que expõe seu backend local para a internet.

#### Instalando ngrok:

**Windows/Mac:**
```bash
# Instalar via Chocolatey (Windows)
choco install ngrok

# Ou baixar de: https://ngrok.com/download
```

**Linux:**
```bash
# Baixar e instalar
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

#### Usando ngrok:

```bash
# Expor a porta 3000 (API Gateway) para a internet
ngrok http 3000
```

O ngrok vai mostrar uma URL pública, algo como:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

#### Configurar o Frontend no Vercel:

1. Acesse o dashboard do Vercel
2. Vá em Settings → Environment Variables
3. Adicione uma nova variável:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://abc123.ngrok.io` (a URL do ngrok)
4. Faça um novo deploy do frontend

**⚠️ Nota:** A URL do ngrok muda cada vez que você reinicia. Para URL fixa, você precisa de uma conta paga do ngrok.

### 🔧 Solução 2: Rodar Frontend Localmente Também

Se preferir, pode rodar o frontend localmente junto com o backend:

```bash
cd frontend

# Instalar dependências (se ainda não instalou)
npm install

# Rodar em modo desenvolvimento
npm run dev
```

O frontend vai rodar em `http://localhost:5173` e se conectará automaticamente ao backend em `http://localhost:3000`.

## 🧪 Testando a Aplicação Completa

### 1. Criar um Usuário

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

### 2. Fazer Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

Isso retornará um token JWT que você pode usar nas próximas requisições.

### 3. Acessar o Frontend

- **Local:** http://localhost:5173
- **Vercel:** [sua-url].vercel.app (com ngrok configurado)

### 4. Fluxo de Teste Completo

1. Acesse a página de registro
2. Crie uma conta nova
3. Faça login
4. Adicione um cupom fiscal usando o código de demonstração: `DEMO_QR_CODE_12345`
5. Veja o dashboard com os dados
6. Explore a lista de cupons
7. Veja detalhes de um cupom
8. Acesse a página de produtos
9. Visualize as analytics

## 🛑 Parar os Serviços

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (apaga o banco de dados)
docker-compose down -v
```

## 🔄 Reiniciar os Serviços

```bash
# Parar
docker-compose down

# Iniciar novamente
docker-compose up -d
```

## 🐛 Troubleshooting

### Erro: "port is already allocated"

Algum serviço já está usando uma das portas. Identifique e pare:

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Erro: "database connection failed"

Aguarde alguns segundos para o PostgreSQL inicializar completamente:

```bash
# Verificar logs do postgres
docker-compose logs postgres
```

### Containers não iniciam

```bash
# Rebuild dos containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Ver erro detalhado de um serviço

```bash
docker-compose logs [nome-do-serviço]

# Exemplos:
docker-compose logs api-gateway
docker-compose logs user-service
```

## 📊 Informações Úteis

### Credenciais do Banco de Dados

- **Host:** localhost
- **Port:** 5432
- **Database:** receipt_manager
- **User:** admin
- **Password:** admin123

### URLs dos Serviços

- API Gateway: http://localhost:3000
- User Service: http://localhost:3004
- Receipt Service: http://localhost:3001
- Products Service: http://localhost:3002
- Analytics Service: http://localhost:3003

### Endpoints Principais

**Auth:**
- POST `/api/users/register` - Criar conta
- POST `/api/users/login` - Login
- GET `/api/users/profile` - Ver perfil (requer token)

**Cupons:**
- GET `/api/receipts` - Listar cupons
- POST `/api/receipts` - Adicionar cupom
- GET `/api/receipts/:id` - Detalhes do cupom
- DELETE `/api/receipts/:id` - Deletar cupom

**Produtos:**
- GET `/api/products` - Listar produtos
- GET `/api/products/:id` - Detalhes do produto

**Analytics:**
- GET `/api/analytics/summary` - Resumo geral
- GET `/api/analytics/products/top` - Top produtos
- GET `/api/analytics/spending-trend` - Tendência de gastos

## 🎯 Próximos Passos

1. ✅ Inicie o backend: `docker-compose up -d`
2. ✅ Verifique os serviços: `docker-compose ps`
3. ✅ Escolha uma das soluções para conectar o frontend
4. ✅ Teste a aplicação completa

---

**Dúvidas?** Verifique os logs com `docker-compose logs -f`
