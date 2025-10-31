# Receipt Manager - Gerenciador de Compras

Aplicação web para gerenciar compras de supermercado através da leitura de QR codes de cupons fiscais (NFC-e), com análises de custos, flutuações de preços e estatísticas de consumo.

## 📚 Documentação

- **[PLANEJAMENTO.md](./PLANEJAMENTO.md)** - Stack, roadmap de 6 fases, modelo de dados e estimativas
- **[ARQUITETURA.md](./ARQUITETURA.md)** - Arquitetura detalhada de microserviços, fluxos e endpoints

---

## 🎯 Objetivo

Protótipo funcional de um webapp que permita:
- ✅ Escanear QR codes de cupons fiscais
- ✅ Armazenar dados de compras automaticamente
- ✅ Analisar custos e flutuação de preços
- ✅ Visualizar gastos por dia/semana/mês
- ✅ Identificar produtos mais comprados
- ✅ Gerar estimativas de custos

---

## 🛠️ Stack Tecnológica

### Frontend
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- html5-qrcode (scanner)
- Recharts (gráficos)

### Backend
- Node.js + Express + TypeScript
- PostgreSQL
- Arquitetura de microserviços (5 serviços)

### DevOps
- Docker + Docker Compose

---

## 🏗️ Arquitetura

```
Frontend (React)
      ↓
API Gateway (:3000)
      ↓
┌─────────────────────────────────────┐
│  User Service       (:3004)         │
│  Receipt Service    (:3001)         │
│  Products Service   (:3002)         │
│  Analytics Service  (:3003)         │
└─────────────────────────────────────┘
      ↓
PostgreSQL (:5432)
```

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone o repositório

```bash
git clone <repository-url>
cd receipt-manager
```

### 2. Estrutura de pastas

O projeto segue esta estrutura:

```
receipt-manager/
├── docker-compose.yml
├── README.md
├── PLANEJAMENTO.md
├── ARQUITETURA.md
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│
├── backend/
│   ├── api-gateway/
│   │   └── src/
│   └── services/
│       ├── user-service/
│       ├── receipt-service/
│       ├── products-service/
│       └── analytics-service/
│
└── database/
    └── migrations/
```

### 3. Criar estrutura inicial

```bash
# Frontend
mkdir -p frontend/src/{components,pages,services,hooks,types}

# Backend
mkdir -p backend/api-gateway/src/{routes,middleware}
mkdir -p backend/services/user-service/src/{routes,controllers,models}
mkdir -p backend/services/receipt-service/src/{routes,controllers,services}
mkdir -p backend/services/products-service/src/{routes,controllers,services}
mkdir -p backend/services/analytics-service/src/{routes,controllers,services}

# Database
mkdir -p database/migrations
```

### 4. Configurar Docker Compose

Ver arquivo `docker-compose.yml` na raiz do projeto.

### 5. Subir ambiente de desenvolvimento

```bash
# Subir PostgreSQL
docker-compose up -d postgres

# Aguardar DB estar pronto
docker-compose logs -f postgres

# Rodar migrations
# (após criar migrations na Fase 1)
```

---

## 📅 Roadmap de Desenvolvimento

### ✅ Planejamento (Concluído)
- Stack definida
- Arquitetura desenhada
- Modelo de dados criado

### 🔜 Fase 1: Setup Inicial (2-3 dias)
- [ ] Criar docker-compose.yml
- [ ] Configurar PostgreSQL
- [ ] Criar migrations do banco
- [ ] Setup API Gateway básico
- [ ] Configurar estrutura de cada microserviço

### 📋 Fase 2: User Service (2 dias)
- [ ] Implementar registro de usuários
- [ ] Implementar login e JWT
- [ ] Criar middleware de autenticação
- [ ] Endpoints CRUD de usuário

### 📋 Fase 3: Receipt Service (3-4 dias)
- [ ] Endpoint de upload de cupom
- [ ] Parser de XML de NFC-e
- [ ] Extração de dados do cupom
- [ ] Integração com Products Service
- [ ] Listagem de cupons

### 📋 Fase 4: Products Service (2-3 dias)
- [ ] CRUD de produtos
- [ ] Algoritmo de normalização
- [ ] Histórico de preços
- [ ] Auto-cadastro de produtos

### 📋 Fase 5: Analytics Service (3-4 dias)
- [ ] Endpoint de summary (gastos totais)
- [ ] Top produtos mais comprados
- [ ] Análise de tendências
- [ ] Flutuação de preços

### 📋 Fase 6: Frontend (5-6 dias)
- [ ] Setup React + Vite + Tailwind
- [ ] Páginas de login/registro
- [ ] Dashboard principal
- [ ] Scanner de QR code
- [ ] Lista de cupons
- [ ] Página de analytics
- [ ] Gráficos e visualizações

---

## 🎯 Próximos Passos Imediatos

1. **Começar Fase 1**: Setup inicial
   ```bash
   # Criar docker-compose.yml
   # Criar migrations SQL
   # Setup package.json de cada serviço
   ```

2. **Testar conexão com banco**
   ```bash
   docker-compose up postgres
   psql -h localhost -U admin -d receipt_manager
   ```

3. **Criar API Gateway básico**
   ```bash
   cd backend/api-gateway
   npm init -y
   npm install express typescript @types/express
   npx tsc --init
   ```

---

## 🧪 Testando Localmente

### Backend

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f api-gateway

# Testar endpoint
curl http://localhost:3000/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Acessar http://localhost:5173
```

---

## 📊 APIs e Endpoints

### API Gateway: `http://localhost:3000`

#### Auth
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login

#### Receipts
- `POST /api/receipts/upload` - Processar cupom
- `GET /api/receipts` - Listar cupons
- `GET /api/receipts/:id` - Detalhes do cupom

#### Products
- `GET /api/products` - Listar produtos
- `GET /api/products/:id/history` - Histórico de preços

#### Analytics
- `GET /api/analytics/summary?period=month` - Resumo de gastos
- `GET /api/analytics/products/top` - Top produtos
- `GET /api/analytics/spending-trend` - Tendência de gastos
- `GET /api/analytics/price-fluctuation/:id` - Flutuação de preços

---

## 🗃️ Banco de Dados

### Conexão
```
Host: localhost
Port: 5432
Database: receipt_manager
User: admin
Password: admin123
```

### Tabelas Principais
- `users` - Usuários do sistema
- `receipts` - Cupons fiscais
- `receipt_items` - Itens dos cupons
- `products` - Catálogo de produtos
- `price_history` - Histórico de preços

Ver schema completo em [ARQUITETURA.md](./ARQUITETURA.md)

---

## 🔐 Variáveis de Ambiente

Cada serviço precisa de um `.env`:

### API Gateway
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
USER_SERVICE_URL=http://localhost:3004
RECEIPT_SERVICE_URL=http://localhost:3001
PRODUCTS_SERVICE_URL=http://localhost:3002
ANALYTICS_SERVICE_URL=http://localhost:3003
```

### Services (exemplo User Service)
```env
NODE_ENV=development
PORT=3004
DATABASE_URL=postgresql://admin:admin123@localhost:5432/receipt_manager
JWT_SECRET=your-secret-key-change-in-production
```

### Frontend
```env
VITE_API_URL=http://localhost:3000
```

---

## 📝 Convenções de Código

### Commits
```
feat: adiciona endpoint de upload de cupom
fix: corrige parser de XML da NFC-e
docs: atualiza README com novos endpoints
refactor: melhora normalização de produtos
```

### Branches
- `main` - produção
- `develop` - desenvolvimento
- `feature/*` - novas features
- `fix/*` - correções

---

## 🐛 Troubleshooting

### Porta já em uso
```bash
# Verificar processos usando a porta
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Banco não conecta
```bash
# Verificar se container está rodando
docker-compose ps

# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

### Erros de CORS
- Verificar configuração de CORS no API Gateway
- Garantir que `VITE_API_URL` está correto no frontend

---

## 📖 Recursos Úteis

### NFC-e e Cupons Fiscais
- [Portal da NFC-e](https://www.nfce.fazenda.sp.gov.br/)
- Estrutura do QR code NFC-e
- Documentação da SEFAZ

### Tecnologias
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Docker](https://docs.docker.com/)

---

## 🤝 Contribuindo

Este é um protótipo inicial. Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## ⏱️ Estimativa de Tempo

- **Setup inicial**: 2-3 dias
- **Backend completo**: 9-12 dias
- **Frontend completo**: 5-6 dias
- **Total**: ~17-22 dias de desenvolvimento

---

## 📄 Licença

MIT

---

## 👨‍💻 Autor

Desenvolvido como protótipo de sistema de gerenciamento de compras.

---

## 🎯 Status do Projeto

🟡 **Em Planejamento** - Fase de setup inicial

Próximo passo: Implementar Fase 1 (Setup e Infraestrutura)

---

**Vamos começar a desenvolver!** 🚀

Para iniciar, execute:
```bash
# Criar estrutura de pastas
chmod +x setup.sh
./setup.sh

# Ou manualmente seguir os passos do Quick Start
```
