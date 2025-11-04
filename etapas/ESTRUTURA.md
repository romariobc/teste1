# Estrutura de Pastas - Receipt Manager

```
receipt-manager/
│
├── frontend/                           # Aplicação React
│   ├── public/                        # Arquivos públicos estáticos
│   └── src/
│       ├── components/                # Componentes reutilizáveis
│       ├── pages/                     # Páginas da aplicação
│       ├── services/                  # Serviços de API
│       ├── hooks/                     # Custom React hooks
│       ├── types/                     # TypeScript types/interfaces
│       └── utils/                     # Funções utilitárias
│
├── backend/
│   ├── api-gateway/                   # API Gateway (Port 3000)
│   │   └── src/
│   │       ├── routes/               # Definição de rotas
│   │       ├── middleware/           # Middlewares (auth, cors, etc)
│   │       └── utils/                # Utilitários
│   │
│   └── services/
│       ├── user-service/             # User Service (Port 3004)
│       │   └── src/
│       │       ├── routes/
│       │       ├── controllers/
│       │       ├── models/
│       │       └── utils/
│       │
│       ├── receipt-service/          # Receipt Service (Port 3001)
│       │   └── src/
│       │       ├── routes/
│       │       ├── controllers/
│       │       ├── services/
│       │       ├── parsers/          # XML parsers para NFC-e
│       │       └── utils/
│       │
│       ├── products-service/         # Products Service (Port 3002)
│       │   └── src/
│       │       ├── routes/
│       │       ├── controllers/
│       │       ├── services/         # Normalização de produtos
│       │       └── utils/
│       │
│       └── analytics-service/        # Analytics Service (Port 3003)
│           └── src/
│               ├── routes/
│               ├── controllers/
│               ├── services/         # Cálculos de analytics
│               └── utils/
│
├── database/
│   ├── migrations/                    # SQL migrations
│   └── seeds/                         # Dados iniciais
│
├── docs/
│   ├── api/                          # Documentação de APIs
│   └── architecture/                 # Diagramas de arquitetura
│
├── docker-compose.yml                 # (a criar) Orquestração de containers
├── .gitignore
├── README.md
├── PLANEJAMENTO.md
├── ARQUITETURA.md
└── setup.sh
```

## 📦 Totais

- **Frontend**: 1 aplicação React
- **Backend**: 5 microserviços (1 gateway + 4 services)
- **Database**: PostgreSQL
- **Total de pastas criadas**: 48

## ✅ Status

Estrutura completa criada com sucesso!

## 🎯 Próximos arquivos a criar

### Fase 1 - Setup Inicial

1. **Docker Compose**
   - `docker-compose.yml` (raiz)

2. **Database**
   - `database/migrations/001_create_tables.sql`
   - `database/migrations/002_create_indexes.sql`

3. **API Gateway**
   - `backend/api-gateway/package.json`
   - `backend/api-gateway/tsconfig.json`
   - `backend/api-gateway/Dockerfile`
   - `backend/api-gateway/.env.example`
   - `backend/api-gateway/src/index.ts`

4. **Cada Microserviço** (user, receipt, products, analytics)
   - `package.json`
   - `tsconfig.json`
   - `Dockerfile`
   - `.env.example`
   - `src/index.ts`

5. **Frontend**
   - `frontend/package.json`
   - `frontend/tsconfig.json`
   - `frontend/vite.config.ts`
   - `frontend/.env.example`
   - `frontend/src/App.tsx`
   - `frontend/index.html`
