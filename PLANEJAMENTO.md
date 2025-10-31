# Receipt Manager - Planejamento da Aplicação

## 📋 Visão Geral

Aplicação web para gerenciar compras de supermercado através da leitura de QR codes de cupons fiscais, com análises de custos, flutuações de preços e estatísticas de consumo.

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: React + TypeScript
- **UI/Styling**: Tailwind CSS + shadcn/ui
- **QR Code Scanner**: html5-qrcode ou react-qr-reader
- **Gráficos**: Recharts ou Chart.js
- **State Management**: React Context API (simples para protótipo)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Validação**: Zod

### Microserviços

#### 1. API Gateway (Port: 3000)
- Ponto de entrada único
- Roteamento de requisições
- Autenticação básica (JWT)

#### 2. Receipt Service (Port: 3001)
- Processamento de QR codes
- Parsing de dados do cupom fiscal
- Armazenamento de cupons

#### 3. Products Service (Port: 3002)
- Catálogo de produtos
- Histórico de preços
- Normalização de nomes de produtos

#### 4. Analytics Service (Port: 3003)
- Cálculos de estatísticas
- Análise de gastos por período
- Produtos mais comprados
- Flutuação de preços

#### 5. User Service (Port: 3004)
- Gerenciamento de usuários
- Autenticação
- Preferências do usuário

### Banco de Dados
- **PostgreSQL**: Dados estruturados (usuários, produtos, compras)
- **Redis**: Cache para analytics (opcional, pode adicionar depois)

### DevOps (Simplificado)
- **Containerização**: Docker + Docker Compose
- **Versionamento**: Git/GitHub

---

## 🏗️ Arquitetura de Microserviços

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                    (React + TypeScript)                     │
│                         Port: 5173                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                            │
│                   (Express + TypeScript)                    │
│                         Port: 3000                          │
│  - Autenticação JWT                                         │
│  - Roteamento                                               │
│  - Rate limiting                                            │
└──────┬──────────┬──────────┬──────────┬─────────────────────┘
       │          │          │          │
       ↓          ↓          ↓          ↓
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  User    │ │ Receipt  │ │ Products │ │Analytics │
│ Service  │ │ Service  │ │ Service  │ │ Service  │
│          │ │          │ │          │ │          │
│Port: 3004│ │Port: 3001│ │Port: 3002│ │Port: 3003│
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │
     └────────────┴────────────┴────────────┘
                  │
                  ↓
         ┌─────────────────┐
         │   PostgreSQL    │
         │    Port: 5432   │
         └─────────────────┘
```

---

## 📊 Modelo de Dados

### Tabela: users
```sql
- id: UUID (PK)
- email: VARCHAR(255) UNIQUE
- password_hash: VARCHAR(255)
- name: VARCHAR(100)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabela: receipts
```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- qr_code_data: TEXT
- store_name: VARCHAR(255)
- store_cnpj: VARCHAR(20)
- total_amount: DECIMAL(10,2)
- purchase_date: TIMESTAMP
- receipt_number: VARCHAR(100)
- created_at: TIMESTAMP
```

### Tabela: products
```sql
- id: UUID (PK)
- name: VARCHAR(255)
- normalized_name: VARCHAR(255) -- para agrupar variações
- category: VARCHAR(100)
- unit: VARCHAR(20) -- kg, un, l, etc
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabela: receipt_items
```sql
- id: UUID (PK)
- receipt_id: UUID (FK -> receipts)
- product_id: UUID (FK -> products)
- product_name_original: VARCHAR(255) -- nome original do cupom
- quantity: DECIMAL(10,3)
- unit_price: DECIMAL(10,2)
- total_price: DECIMAL(10,2)
- created_at: TIMESTAMP
```

### Tabela: price_history
```sql
- id: UUID (PK)
- product_id: UUID (FK -> products)
- store_cnpj: VARCHAR(20)
- price: DECIMAL(10,2)
- recorded_at: TIMESTAMP
```

---

## 🚀 Roadmap de Desenvolvimento - 6 Fases

### **FASE 1: Setup Inicial e Estrutura Base** (2-3 dias)
#### Objetivos:
- Configurar ambiente de desenvolvimento
- Criar estrutura de pastas
- Setup Docker Compose
- Configurar banco de dados

#### Entregas:
- [ ] Estrutura de monorepo criada
- [ ] Docker Compose funcional
- [ ] PostgreSQL configurado com migrations básicas
- [ ] API Gateway básico funcionando

---

### **FASE 2: User Service + Autenticação** (2 dias)
#### Objetivos:
- Implementar CRUD de usuários
- Sistema de autenticação JWT
- Endpoints de login/registro

#### Entregas:
- [ ] Endpoint: POST /api/auth/register
- [ ] Endpoint: POST /api/auth/login
- [ ] Middleware de autenticação JWT
- [ ] Tabela users criada e funcional

---

### **FASE 3: Receipt Service - Upload e Parsing** (3-4 dias)
#### Objetivos:
- Receber dados do QR code
- Parsear informações do cupom fiscal brasileiro (NFC-e/NF-e)
- Salvar cupom no banco

#### Entregas:
- [ ] Endpoint: POST /api/receipts/upload
- [ ] Parser de XML de NFC-e
- [ ] Extração de: loja, CNPJ, data, total, itens
- [ ] Salvar receipt e receipt_items
- [ ] Endpoint: GET /api/receipts (listar cupons do usuário)

#### Notas Técnicas:
- QR Code de cupons fiscais geralmente contém URL para XML da NFC-e
- Precisará fazer request HTTP para obter o XML
- Parsear XML para extrair dados

---

### **FASE 4: Products Service** (2-3 dias)
#### Objetivos:
- Criar catálogo de produtos
- Normalização automática de nomes
- Histórico de preços

#### Entregas:
- [ ] Auto-cadastro de produtos ao processar cupom
- [ ] Algoritmo simples de normalização de nomes
- [ ] Endpoint: GET /api/products (listar produtos do usuário)
- [ ] Endpoint: GET /api/products/:id/price-history
- [ ] Registro automático em price_history

---

### **FASE 5: Analytics Service** (3-4 dias)
#### Objetivos:
- Implementar todas as análises solicitadas
- Calcular estatísticas

#### Entregas:
- [ ] Endpoint: GET /api/analytics/summary
  - Total gasto (dia/semana/mês)
  - Número de compras
  - Ticket médio

- [ ] Endpoint: GET /api/analytics/products/top
  - Produtos mais comprados
  - Quantidade e frequência

- [ ] Endpoint: GET /api/analytics/spending-trend
  - Gastos ao longo do tempo
  - Comparação entre períodos

- [ ] Endpoint: GET /api/analytics/price-fluctuation
  - Variação de preço por produto
  - Melhor momento de compra

---

### **FASE 6: Frontend** (5-6 dias)
#### Objetivos:
- Interface completa e responsiva
- Scanner de QR code
- Dashboards e visualizações

#### Páginas:
1. **Login/Registro**
2. **Dashboard Principal**
   - Cards com resumo: gasto total mês, número de compras, ticket médio
   - Gráfico de gastos ao longo do tempo

3. **Adicionar Cupom**
   - Scanner de QR code (câmera)
   - Upload manual de código
   - Visualização dos dados extraídos

4. **Meus Cupons**
   - Lista de todas as compras
   - Filtros por data, loja
   - Detalhes do cupom (itens, preços)

5. **Produtos**
   - Lista de produtos comprados
   - Histórico de preços (gráfico)
   - Indicador de variação de preço

6. **Análises**
   - Produtos mais comprados (top 10)
   - Gastos por categoria
   - Comparação entre lojas
   - Projeção de gastos mensais

#### Entregas:
- [ ] Todas as páginas implementadas
- [ ] QR Code scanner funcional
- [ ] Gráficos interativos
- [ ] Design responsivo (mobile-first)

---

## 📁 Estrutura de Pastas Sugerida

```
receipt-manager/
├── docker-compose.yml
├── README.md
├── PLANEJAMENTO.md
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── types/
│       └── App.tsx
│
├── backend/
│   ├── api-gateway/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── routes/
│   │       ├── middleware/
│   │       └── index.ts
│   │
│   ├── services/
│   │   ├── user-service/
│   │   │   ├── package.json
│   │   │   ├── Dockerfile
│   │   │   └── src/
│   │   │
│   │   ├── receipt-service/
│   │   │   └── src/
│   │   │
│   │   ├── products-service/
│   │   │   └── src/
│   │   │
│   │   └── analytics-service/
│   │       └── src/
│   │
│   └── shared/
│       └── database/
│           ├── migrations/
│           └── seeds/
│
└── docs/
    ├── api/
    └── architecture/
```

---

## 🎯 Próximos Passos Imediatos

1. **Criar estrutura de pastas**
2. **Configurar Docker Compose** com:
   - PostgreSQL
   - API Gateway
   - Todos os microserviços
3. **Implementar migrations do banco**
4. **Começar Fase 1**

---

## 💡 Considerações Importantes

### Sobre QR Codes de Cupons Fiscais
- No Brasil, QR codes de NFC-e geralmente apontam para URL do XML
- Formato: `https://www.fazenda.sp.gov.br/nfce/consultar?...`
- Precisará fazer scraping/request para obter dados
- Alternativamente, usuário pode copiar URL ou chave de acesso

### Simplificações para Protótipo
- ✅ Sem autenticação OAuth (apenas JWT básico)
- ✅ Sem cache Redis inicialmente
- ✅ Sem testes automatizados
- ✅ Sem CI/CD
- ✅ Validações básicas
- ✅ UI simples mas funcional

### Pode Adicionar Depois
- Sistema de categorização automática com ML
- Alertas de preço
- Comparação entre lojas
- Export de relatórios (PDF/CSV)
- Compartilhamento de listas
- App mobile nativo

---

## 📚 Tecnologias e Bibliotecas Específicas

### Backend
```json
{
  "express": "^4.18.0",
  "typescript": "^5.0.0",
  "pg": "^8.11.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "zod": "^3.22.0",
  "axios": "^1.6.0",
  "xml2js": "^0.6.0",
  "dotenv": "^16.3.0"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "html5-qrcode": "^2.3.0",
  "recharts": "^2.10.0",
  "axios": "^1.6.0",
  "react-router-dom": "^6.20.0",
  "date-fns": "^3.0.0"
}
```

---

## ⏱️ Estimativa Total

**Tempo total estimado: 17-22 dias** (trabalhando sozinho)

Com equipe ou dedicação integral, pode ser reduzido para 2-3 semanas.

---

Pronto para começar! 🚀
