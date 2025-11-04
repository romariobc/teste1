# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Receipt Manager (Gerenciador de Compras)** - Brazilian fiscal receipt management system

A web application that scans QR codes from Brazilian fiscal receipts (NFC-e), automatically extracts purchase data, tracks price history, and provides spending analytics.

**Repository**: https://github.com/romariobc/teste1.git

**Status**: All 6 development phases complete - functional prototype ready

## Development Commands

### Running the Full Stack

```bash
# Start all services with Docker Compose (recommended)
docker-compose up -d

# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f api-gateway
docker-compose logs -f user-service

# Check service health
docker-compose ps

# Stop all services
docker-compose down
```

### Individual Service Development

Each backend service supports these commands:

```bash
# Development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Production mode (requires build first)
npm start
```

Service ports:
- API Gateway: 3000
- Receipt Service: 3001
- Products Service: 3002
- Analytics Service: 3003
- User Service: 3004
- PostgreSQL: 5432
- Frontend: 5173 (dev) / 80 (production)

### Frontend

```bash
cd frontend
npm install
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Operations

```bash
# Run all migrations (for existing database)
./database/run-all-migrations.sh

# Run specific migration
./database/run-migration.sh 003

# Connect to database directly
docker exec -it receipt-manager-db psql -U admin -d receipt_manager

# View database schema
docker exec -it receipt-manager-db psql -U admin -d receipt_manager -c "\dt"
```

**Note**: On first `docker-compose up`, migrations run automatically from `/docker-entrypoint-initdb.d`.

### Testing Endpoints

```bash
# Health checks
curl http://localhost:3000/health        # API Gateway
curl http://localhost:3001/health        # Receipt Service
curl http://localhost:3002/health        # Products Service
curl http://localhost:3003/health        # Analytics Service
curl http://localhost:3004/health        # User Service

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Architecture

### Microservices Pattern

**API Gateway** (backend/api-gateway/):
- Single entry point for all client requests
- Routes requests to appropriate backend services using HTTP proxy pattern
- Centralizes authentication via JWT middleware
- Implements rate limiting (100 requests per 15 minutes by default)
- Service URLs configured via environment variables

**User Service** (backend/services/user-service/):
- User registration, login, authentication
- Password reset with email tokens (optional SMTP, falls back to console logging)
- JWT token generation with 7-day expiry
- bcrypt password hashing (10 rounds)

**Receipt Service** (backend/services/receipt-service/):
- Processes Brazilian NFC-e (Nota Fiscal de Consumidor Eletrônica) XML
- Parses QR code data to extract fiscal receipt information
- Communicates with Products Service for product normalization
- Stores receipts and receipt items
- Currently uses mock XML in development (see `parsers/nfceParser.ts:fetchNFCeXML`)

**Products Service** (backend/services/products-service/):
- Product catalog management with automatic normalization
- Deduplication via normalized names
- Auto-categorization into 9 categories (see Product Normalization below)
- Price history tracking per store (CNPJ)
- Price fluctuation analysis

**Analytics Service** (backend/services/analytics-service/):
- Spending summaries by period (day/week/month)
- Top products by purchase frequency
- Spending trends over time
- Price comparison across stores

### Authentication Flow

1. User sends credentials to `/api/auth/login` (API Gateway)
2. Gateway proxies to User Service
3. User Service validates credentials, generates JWT with `userId` and `email` claims
4. JWT returned to client
5. Client includes JWT in `Authorization: Bearer <token>` header for protected routes
6. API Gateway validates JWT in `authMiddleware` before proxying to backend services
7. Backend services receive `req.user` with decoded JWT data

**Important**: `JWT_SECRET` must match between API Gateway and User Service.

### Service Communication

Services communicate via HTTP (not message queues):

- Receipt Service → Products Service: Auto-creates/finds products during receipt processing
- All services → PostgreSQL: Direct database connections via `pg` pool

Connection pattern in Docker:
- Services use Docker network service names (e.g., `http://products-service:3002`)
- Local development uses `localhost` with different ports

### NFC-e Receipt Processing

**Flow** (backend/services/receipt-service/src/parsers/nfceParser.ts):

1. Client scans QR code from Brazilian fiscal receipt
2. QR code contains 44-digit access key or URL to SEFAZ portal
3. `extractAccessKey` or `extractURL` extracts identifier
4. `fetchNFCeXML` retrieves XML (currently mocked for development)
5. `parseNFCeXML` parses XML structure:
   - `nfeProc > NFe > infNFe` structure
   - Extracts store info (`emit`), totals (`ICMSTot`), date (`ide`), items (`det`)
6. For each item, Receipt Service calls Products Service to normalize/create product
7. Receipt and all items stored in database

**XML Structure** (simplified):
```xml
<nfeProc>
  <NFe>
    <infNFe>
      <ide> <!-- Identification: date, receipt number -->
      <emit> <!-- Store: name, CNPJ -->
      <det> <!-- Item details: product name, quantity, price -->
      <total> <!-- Total amount -->
    </infNFe>
  </NFe>
</nfeProc>
```

### Product Normalization Algorithm

**Goal**: Prevent duplicate products with slight name variations

**Algorithm** (backend/services/products-service/src/services/normalizationService.ts):

1. **Lowercase**: Convert to lowercase
2. **Remove accents**: NFD normalization + accent removal (e.g., "açúcar" → "acucar")
3. **Trim spaces**: Replace multiple spaces with single space
4. **Standardize abbreviations**:
   - kg/kilo/quilo → kg
   - l/lt/litro → l
   - g/gr/grama/gramas → g
   - un/unidade/pc → un
   - pct/pacote → pct

**Example**:
- Original: "ARROZ BRANCO   5KG"
- Normalized: "arroz branco 5kg"

Products with identical normalized names are considered the same product.

### Product Auto-Categorization

**9 Categories** (rule-based keyword matching):

1. **Grãos e Cereais**: arroz, feijao, macarrao, massa
2. **Laticínios**: leite, queijo, iogurte, manteiga
3. **Carnes e Peixes**: carne, frango, peixe, linguica
4. **Frutas e Verduras**: banana, maca, laranja, tomate, alface, batata
5. **Bebidas**: refrigerante, suco, agua, cerveja, vinho
6. **Padaria**: pao, bolo, biscoito, torrada
7. **Limpeza**: sabao, detergente, amaciante, desinfetante
8. **Higiene Pessoal**: shampoo, condicionador, sabonete, creme dental
9. **Outros**: default category

**Note**: This is a simple keyword-based approach. Could be enhanced with ML in production.

## Database Schema

**Key Tables**:

- `users`: User accounts with bcrypt password hashes
- `password_reset_tokens`: Tokens for password reset (SHA256 hashed, 1-hour expiry)
- `receipts`: Fiscal receipts with QR code data, store info, totals
- `receipt_items`: Individual items from receipts (references `products`)
- `products`: Product catalog with `name` and `normalized_name`
- `price_history`: Price snapshots per product per store (CNPJ) over time

**Important Relationships**:

- Receipt → User (CASCADE delete - user deletion removes all receipts)
- Receipt Item → Receipt (CASCADE delete)
- Receipt Item → Product (NO CASCADE - products persist)
- Price History → Product (CASCADE delete)

**Indexes** (002_create_indexes.sql):
- `receipts.user_id`, `receipts.purchase_date` for user's receipt listing
- `products.normalized_name` for fast product lookup during normalization
- `price_history.product_id`, `price_history.recorded_at` for price trend queries

## Important Context

### Brazilian NFC-e Specifics

- **NFC-e**: Nota Fiscal de Consumidor Eletrônica (electronic consumer invoice)
- **CNPJ**: Cadastro Nacional da Pessoa Jurídica (Brazilian company tax ID)
- **SEFAZ**: State tax authority portals that host NFC-e XMLs
- QR codes on receipts contain access keys or URLs to retrieve full XML

### Language and Data

- Application is in **Portuguese (Brazilian)**
- All product categories, error messages, and UI text are in Portuguese
- Product names from receipts are in Portuguese
- Email templates for password reset are in Portuguese

### Development vs Production

**Mock Data**:
- `fetchNFCeXML` currently returns hardcoded mock XML (see nfceParser.ts:124)
- In production, this should fetch real XML from SEFAZ portals
- May require handling CAPTCHA and authentication

**Email Service**:
- User Service includes email functionality for password reset
- If `SMTP_HOST` is empty/not configured, emails are logged to console
- Production requires valid SMTP configuration (Gmail, SendGrid, etc.)

**Frontend API URL**:
- Development: `VITE_API_URL=http://localhost:3000`
- Production: Must point to deployed API Gateway URL
- Configured via environment variable in Vite

## Common Patterns

### Adding a New Microservice

1. Create directory in `backend/services/[service-name]/`
2. Create `package.json` with express, cors, dotenv, pg, typescript dependencies
3. Create `Dockerfile` (copy from existing service)
4. Create `tsconfig.json`
5. Create `src/index.ts` with Express app, health check, CORS
6. Create `src/utils/database.ts` for PostgreSQL connection
7. Add service to `docker-compose.yml` with environment variables
8. Add routes to API Gateway in `backend/api-gateway/src/routes/index.ts`
9. Add service URL to API Gateway environment variables

### Adding a Database Migration

1. Create `database/migrations/00X_description.sql`
2. Number sequentially (001, 002, 003...)
3. Use `CREATE TABLE IF NOT EXISTS` for idempotency
4. For existing database: `./database/run-migration.sh 00X`
5. For fresh database: migration runs automatically on Docker startup

### Adding a Protected Route

1. Add route to appropriate backend service
2. Add route to API Gateway in `src/routes/index.ts`
3. Apply `authMiddleware` before the route handler
4. Access user info via `req.user.userId` and `req.user.email`

### Service-to-Service Communication

When one service needs to call another:

1. Add service URL to environment variables (both Docker Compose and local `.env`)
2. Use `axios` to make HTTP request
3. In Docker: use service name (e.g., `http://products-service:3002`)
4. Locally: use `localhost` with port (e.g., `http://localhost:3002`)
5. Propagate JWT if needed by forwarding `Authorization` header

## Troubleshooting

### Docker Connection Issues

**Problem**: Service can't connect to database
**Solution**: Use service name `postgres` in DATABASE_URL, not `localhost`

**Problem**: Service can't connect to another service
**Solution**: Use Docker network service names (e.g., `user-service`) not `localhost`

### Migration Issues

**Problem**: Migration fails with "relation already exists"
**Solution**: This is fine - it means the table already exists (migrations use `IF NOT EXISTS`)

**Problem**: New migration doesn't run
**Solution**: For existing database, run `./database/run-migration.sh [number]` manually

### Authentication Issues

**Problem**: JWT verification fails across services
**Solution**: Ensure `JWT_SECRET` environment variable matches in API Gateway and User Service

**Problem**: "Invalid token" errors
**Solution**: Check that Authorization header format is `Bearer <token>` (note the space)

### Development Issues

**Problem**: TypeScript compilation errors
**Solution**: Run `npm run build` to see full error messages, check tsconfig.json paths

**Problem**: Port already in use
**Solution**: Check if service is already running, or use `docker-compose down` to stop all containers

## Running Tests

Currently no automated tests. Manual testing via:
- Curl commands (see Testing Endpoints above)
- Frontend UI at http://localhost:5173
- Direct database queries via psql

## Project History

Development completed in 6 phases:
1. Setup Initial - Infrastructure and Docker
2. User Service - Authentication and JWT
3. Receipt Service - NFC-e processing
4. Products Service - Normalization and catalog
5. Analytics Service - Statistics and insights
6. Frontend - React UI with all features

Recent additions:
- Password reset functionality with email tokens
- Database migration scripts for easier management
- Comprehensive documentation (README, database/README)
