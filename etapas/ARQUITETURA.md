# Arquitetura Detalhada - Receipt Manager

## 🏛️ Visão Geral da Arquitetura

A aplicação segue o padrão de **microserviços** com um **API Gateway** como ponto de entrada único. Cada serviço é responsável por um domínio específico e se comunica através de APIs REST.

---

## 🔄 Fluxos Principais

### 1. Fluxo de Cadastro/Login

```
┌─────────┐      ┌────────────┐      ┌──────────────┐
│ Frontend│─────>│API Gateway │─────>│ User Service │
│         │      │            │      │              │
│         │      │ - Valida   │      │ - Cria user  │
│         │      │   request  │      │ - Hash senha │
│         │      │            │      │ - Salva DB   │
│         │<─────│            │<─────│              │
│         │      │ - Retorna  │      │              │
│         │      │   JWT      │      │              │
└─────────┘      └────────────┘      └──────────────┘
```

**Endpoints:**
- POST `/api/auth/register` → User Service
- POST `/api/auth/login` → User Service

---

### 2. Fluxo de Upload de Cupom Fiscal

```
┌──────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────────┐
│ Frontend │───>│ API Gateway │───>│   Receipt   │───>│   Products   │
│          │    │             │    │   Service   │    │   Service    │
│ QR Code  │    │ - Valida    │    │             │    │              │
│ Scanner  │    │   JWT       │    │ 1. Busca    │    │ 4. Normaliza │
│          │    │ - Auth      │    │    XML      │    │    produtos  │
│          │    │             │    │ 2. Parse    │    │ 5. Cria se   │
│          │    │             │    │    dados    │    │    não existe│
│          │    │             │    │ 3. Salva    │    │ 6. Registra  │
│          │    │             │    │    receipt  │    │    preço     │
│          │<───│             │<───│             │<───│              │
│ Exibe    │    │ Retorna     │    │ Retorna     │    │              │
│ dados    │    │ cupom       │    │ cupom com   │    │              │
│          │    │             │    │ itens       │    │              │
└──────────┘    └─────────────┘    └─────────────┘    └──────────────┘
                                           │
                                           v
                                    ┌──────────────┐
                                    │  PostgreSQL  │
                                    │              │
                                    │ - receipts   │
                                    │ - items      │
                                    │ - products   │
                                    │ - prices     │
                                    └──────────────┘
```

**Passo a passo:**
1. Frontend escaneia QR code e envia dados
2. API Gateway valida JWT e roteia para Receipt Service
3. Receipt Service:
   - Extrai URL do XML do QR code
   - Faz request para obter XML da NFC-e
   - Parse do XML (dados da loja, itens, preços, data)
   - Chama Products Service para cada item
4. Products Service:
   - Normaliza nome do produto
   - Verifica se produto já existe
   - Cria novo produto se necessário
   - Registra preço em price_history
5. Receipt Service salva cupom completo
6. Retorna dados estruturados para frontend

**Endpoints:**
- POST `/api/receipts/upload` → Receipt Service
- GET `/api/receipts` → Receipt Service
- GET `/api/receipts/:id` → Receipt Service

---

### 3. Fluxo de Visualização de Analytics

```
┌──────────┐    ┌─────────────┐    ┌──────────────┐
│ Frontend │───>│ API Gateway │───>│  Analytics   │
│          │    │             │    │   Service    │
│ Dashboard│    │ - Valida    │    │              │
│          │    │   JWT       │    │ 1. Consulta  │
│          │    │             │    │    DB com    │
│          │    │             │    │    agregações│
│          │    │             │    │              │
│          │    │             │    │ 2. Calcula:  │
│          │    │             │    │   - Total    │
│          │    │             │    │   - Média    │
│          │    │             │    │   - Trends   │
│          │    │             │    │   - Top      │
│          │<───│             │<───│   products   │
│ Renderiza│    │ Retorna     │    │              │
│ gráficos │    │ analytics   │    │ 3. Formata   │
│          │    │             │    │    resposta  │
└──────────┘    └─────────────┘    └──────────────┘
                                           │
                                           v
                                    ┌──────────────┐
                                    │  PostgreSQL  │
                                    │              │
                                    │ Queries com: │
                                    │ - GROUP BY   │
                                    │ - SUM()      │
                                    │ - AVG()      │
                                    │ - COUNT()    │
                                    └──────────────┘
```

**Endpoints:**
- GET `/api/analytics/summary?period=month` → Analytics Service
- GET `/api/analytics/products/top?limit=10` → Analytics Service
- GET `/api/analytics/spending-trend?days=30` → Analytics Service
- GET `/api/analytics/price-fluctuation/:productId` → Analytics Service

---

## 🔌 Detalhamento dos Serviços

### API Gateway (Port 3000)

**Responsabilidades:**
- Autenticação JWT
- Roteamento para microserviços
- Rate limiting (opcional)
- Logs centralizados
- CORS

**Rotas:**
```
/api/auth/*           → User Service (3004)
/api/users/*          → User Service (3004)
/api/receipts/*       → Receipt Service (3001)
/api/products/*       → Products Service (3002)
/api/analytics/*      → Analytics Service (3003)
```

**Tecnologias:**
- Express.js
- jsonwebtoken
- express-rate-limit (opcional)

---

### User Service (Port 3004)

**Responsabilidades:**
- CRUD de usuários
- Autenticação (login/registro)
- Geração de tokens JWT
- Hash de senhas (bcrypt)

**Endpoints:**
```
POST   /register        - Criar novo usuário
POST   /login           - Autenticar e retornar JWT
GET    /profile         - Obter dados do usuário logado
PUT    /profile         - Atualizar dados do usuário
```

**Tabelas:**
- users

**Tecnologias:**
- Express.js
- bcrypt
- jsonwebtoken
- Zod (validação)

---

### Receipt Service (Port 3001)

**Responsabilidades:**
- Processar QR codes de NFC-e
- Buscar e parsear XML de cupons fiscais
- Salvar cupons e itens
- Listar cupons do usuário
- Integração com Products Service

**Endpoints:**
```
POST   /upload         - Processar novo cupom (QR code data)
GET    /               - Listar cupons do usuário (paginado)
GET    /:id            - Detalhes de um cupom específico
GET    /search         - Buscar cupons (por data, loja, etc)
DELETE /:id            - Deletar cupom
```

**Tabelas:**
- receipts
- receipt_items

**Tecnologias:**
- Express.js
- axios (para buscar XML)
- xml2js (parser XML)
- Zod

**Formato do QR Code NFC-e:**
```
URL típica:
https://www.fazenda.sp.gov.br/nfce/consultar?p=35XXXXXX|2|1|1|XXXX

Partes:
- Chave de acesso da nota (44 dígitos)
- Informações adicionais

O serviço faz request para essa URL e obtém o XML
```

---

### Products Service (Port 3002)

**Responsabilidades:**
- Catálogo de produtos
- Normalização de nomes de produtos
- Histórico de preços
- Categorização básica

**Endpoints:**
```
GET    /               - Listar produtos do usuário
GET    /:id            - Detalhes de um produto
GET    /:id/history    - Histórico de preços
POST   /normalize      - Normalizar nome de produto (interno)
GET    /search         - Buscar produtos
```

**Tabelas:**
- products
- price_history

**Tecnologias:**
- Express.js
- Algoritmo de normalização (remover acentos, espaços extras, etc)

**Normalização de Produtos:**
```javascript
// Exemplo:
"LEITE INTEGRAL 1L"
"Leite Integral 1l"
"LEITE INTEGR 1LT"
↓
"leite integral 1l" (normalized_name)
```

---

### Analytics Service (Port 3003)

**Responsabilidades:**
- Calcular estatísticas de gastos
- Análise de tendências
- Produtos mais comprados
- Flutuação de preços
- Comparações entre períodos

**Endpoints:**
```
GET /summary
  Query params: period (day|week|month|year)
  Retorna:
  {
    totalSpent: number,
    numberOfPurchases: number,
    averageTicket: number,
    comparedToLastPeriod: {
      spent: "+15%",
      purchases: "+3"
    }
  }

GET /products/top
  Query params: limit, period
  Retorna: Top N produtos mais comprados

GET /spending-trend
  Query params: days, groupBy (day|week|month)
  Retorna: Array com gastos agrupados

GET /price-fluctuation/:productId
  Retorna: Histórico de variação de preço
  {
    productId,
    productName,
    currentPrice,
    lowestPrice,
    highestPrice,
    averagePrice,
    priceHistory: [{date, price, store}]
  }

GET /stores/compare
  Retorna: Comparação de preços entre lojas
```

**Consultas SQL Complexas:**
```sql
-- Exemplo: Total gasto no mês
SELECT
  SUM(total_amount) as total,
  COUNT(*) as purchases,
  AVG(total_amount) as average
FROM receipts
WHERE user_id = $1
  AND purchase_date >= date_trunc('month', CURRENT_DATE)
  AND purchase_date < date_trunc('month', CURRENT_DATE) + interval '1 month';

-- Produtos mais comprados
SELECT
  p.id,
  p.name,
  COUNT(ri.id) as purchase_count,
  SUM(ri.quantity) as total_quantity,
  AVG(ri.unit_price) as avg_price
FROM products p
JOIN receipt_items ri ON p.id = ri.product_id
JOIN receipts r ON ri.receipt_id = r.id
WHERE r.user_id = $1
GROUP BY p.id, p.name
ORDER BY purchase_count DESC
LIMIT 10;
```

---

## 🗄️ Banco de Dados - Schema Completo

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- Receipts
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL,
  store_name VARCHAR(255),
  store_cnpj VARCHAR(20),
  total_amount DECIMAL(10,2) NOT NULL,
  purchase_date TIMESTAMP NOT NULL,
  receipt_number VARCHAR(100),
  xml_data TEXT, -- armazenar XML completo (opcional)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_purchase_date ON receipts(purchase_date);
CREATE INDEX idx_receipts_store_cnpj ON receipts(store_cnpj);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  normalized_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(20), -- kg, un, l, g, ml
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_normalized_name ON products(normalized_name);
CREATE INDEX idx_products_category ON products(category);

-- Receipt Items
CREATE TABLE receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name_original VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX idx_receipt_items_product_id ON receipt_items(product_id);

-- Price History
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_cnpj VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at);
```

---

## 🐳 Docker Compose Configuration

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: receipt_manager
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  api-gateway:
    build: ./backend/api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - JWT_SECRET=your-secret-key-change-in-production
      - USER_SERVICE_URL=http://user-service:3004
      - RECEIPT_SERVICE_URL=http://receipt-service:3001
      - PRODUCTS_SERVICE_URL=http://products-service:3002
      - ANALYTICS_SERVICE_URL=http://analytics-service:3003
    depends_on:
      - user-service
      - receipt-service
      - products-service
      - analytics-service

  user-service:
    build: ./backend/services/user-service
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://admin:admin123@postgres:5432/receipt_manager
      - JWT_SECRET=your-secret-key-change-in-production
    depends_on:
      postgres:
        condition: service_healthy

  receipt-service:
    build: ./backend/services/receipt-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://admin:admin123@postgres:5432/receipt_manager
      - PRODUCTS_SERVICE_URL=http://products-service:3002
    depends_on:
      postgres:
        condition: service_healthy

  products-service:
    build: ./backend/services/products-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://admin:admin123@postgres:5432/receipt_manager
    depends_on:
      postgres:
        condition: service_healthy

  analytics-service:
    build: ./backend/services/analytics-service
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://admin:admin123@postgres:5432/receipt_manager
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - api-gateway

volumes:
  postgres_data:
```

---

## 🔐 Segurança

### Autenticação JWT
```javascript
// Token payload
{
  userId: "uuid",
  email: "user@example.com",
  iat: 1234567890,
  exp: 1234567890
}

// Headers
Authorization: Bearer <token>
```

### Validações
- Zod schemas em todos os endpoints
- Sanitização de inputs
- Rate limiting no API Gateway
- CORS configurado

---

## 📱 Frontend - Estrutura de Páginas

### 1. `/login` - Login Page
- Form de email/senha
- Link para registro
- Validação client-side

### 2. `/register` - Registro
- Form de cadastro
- Validações de senha forte

### 3. `/dashboard` - Dashboard Principal
```
┌─────────────────────────────────────────┐
│  Receipt Manager                   👤   │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ R$   │  │ 🛒   │  │ 📊   │         │
│  │ 2.5k │  │  15  │  │ R$167│         │
│  │ Mês  │  │Compras│  │Média │         │
│  └──────┘  └──────┘  └──────┘         │
│                                         │
│  Gastos ao longo do tempo              │
│  ┌───────────────────────────────────┐ │
│  │     [Gráfico de linha]            │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Últimos cupons                        │
│  ┌─────────────────────────────────┐  │
│  │ 🏪 Supermercado X  R$ 234,50    │  │
│  │ 📅 31/10/2025                   │  │
│  └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### 4. `/receipts/add` - Adicionar Cupom
- QR code scanner (câmera)
- Input manual de URL/código
- Preview dos dados extraídos
- Confirmação

### 5. `/receipts` - Lista de Cupons
- Lista com filtros (data, loja)
- Busca
- Cards clicáveis para detalhes

### 6. `/receipts/:id` - Detalhes do Cupom
- Info da loja
- Data e hora
- Lista de itens com preços
- Total

### 7. `/products` - Produtos
- Lista de todos produtos comprados
- Busca e filtros
- Link para histórico de preço

### 8. `/products/:id` - Detalhes do Produto
- Nome e categoria
- Gráfico de variação de preço
- Histórico de compras
- Lojas onde foi comprado

### 9. `/analytics` - Análises
- Top 10 produtos
- Gastos por categoria
- Comparação entre lojas
- Projeções

---

## 🚀 Comandos Úteis

```bash
# Subir toda aplicação
docker-compose up -d

# Ver logs
docker-compose logs -f [service-name]

# Rebuild
docker-compose up --build

# Parar tudo
docker-compose down

# Parar e limpar volumes
docker-compose down -v

# Rodar migrations
docker-compose exec user-service npm run migrate
```

---

## 📊 Métricas de Performance (Metas)

- Tempo de resposta API: < 500ms
- Upload e processamento de cupom: < 3s
- Carregamento dashboard: < 2s
- Scanner QR code: detecção < 1s

---

## 🎨 Design System (Sugestões)

### Cores
```css
--primary: #10b981 (green)
--secondary: #3b82f6 (blue)
--danger: #ef4444 (red)
--warning: #f59e0b (amber)
--background: #f9fafb
--text: #111827
```

### Componentes (shadcn/ui)
- Button
- Card
- Input
- Select
- Dialog
- Toast
- Chart (recharts)

---

Arquitetura completa definida! Pronta para implementação. 🎯
