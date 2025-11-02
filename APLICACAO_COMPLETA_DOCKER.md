# 🐳 Aplicação Completa no Docker

Guia para rodar **toda a aplicação** (frontend + backend) containerizada com Docker.

## 🎯 Vantagens de usar tudo no Docker

✅ **Não precisa instalar Node.js** na máquina
✅ **Não precisa do Vercel** ou outros serviços externos
✅ **Tudo roda local** de forma isolada
✅ **Fácil de compartilhar** com outros desenvolvedores
✅ **Ambiente consistente** entre dev/prod
✅ **Um único comando** sobe toda a aplicação

## 🚀 Como Rodar

### 1️⃣ Faça pull das últimas alterações

```bash
cd /caminho/para/teste1
git pull origin claude/plan-receipt-manager-app-011CUfMk8dGUJ5L85g1khDyk
```

### 2️⃣ Pare containers antigos (se houver)

```bash
docker-compose down
```

### 3️⃣ Suba toda a aplicação

```bash
docker-compose up -d --build
```

Isso vai construir e iniciar:
- 🗄️ PostgreSQL (porta 5432)
- 🚪 API Gateway (porta 3000)
- 👤 User Service (porta 3004)
- 🧾 Receipt Service (porta 3001)
- 📦 Products Service (porta 3002)
- 📊 Analytics Service (porta 3003)
- 🎨 **Frontend** (porta 80)

### 4️⃣ Acesse a aplicação

Abra o navegador em: **http://localhost**

Pronto! 🎉

## 📊 Verificar Status

```bash
# Ver todos os containers rodando
docker-compose ps

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs apenas do frontend
docker-compose logs -f frontend

# Ver logs apenas do backend
docker-compose logs -f api-gateway
```

## 🛑 Parar a Aplicação

```bash
# Parar todos os serviços
docker-compose down

# Parar e apagar o banco de dados
docker-compose down -v
```

## 🔄 Reiniciar Apenas o Frontend

Se fizer mudanças no código do frontend:

```bash
# Rebuild apenas o frontend
docker-compose up -d --build frontend

# Ou reinicie o container
docker-compose restart frontend
```

## 🔄 Reiniciar Apenas um Serviço do Backend

```bash
# Exemplo: reiniciar user-service
docker-compose restart user-service

# Rebuild de um serviço específico
docker-compose up -d --build user-service
```

## ⚙️ Configuração

### URLs dos Serviços (dentro do Docker)

Quando os containers conversam entre si, usam nomes de serviço:
- Frontend → Backend: `http://api-gateway:3000`
- Backend → Postgres: `postgresql://admin:admin123@postgres:5432/receipt_manager`

### URLs Externas (do seu navegador)

Quando você acessa do navegador:
- Frontend: `http://localhost` (porta 80)
- API Gateway: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

### Variáveis de Ambiente

O frontend está configurado para se comunicar com o backend dentro da rede Docker.

Se precisar mudar a URL da API, edite no `docker-compose.yml`:

```yaml
frontend:
  environment:
    - VITE_API_URL=http://localhost:3000  # Mude aqui se necessário
```

## 🎨 Arquitetura do Frontend

O frontend usa **build em 2 estágios**:

1. **Build Stage**: Compila o React/TypeScript/Vite
2. **Production Stage**: Serve com Nginx otimizado

### Nginx Features

✅ **Gzip compression** - Arquivos menores
✅ **Cache de assets** - JS/CSS ficam em cache por 1 ano
✅ **React Router support** - Todas as rotas funcionam
✅ **Security headers** - X-Frame-Options, XSS-Protection, etc.

## 🧪 Testar a Aplicação

### Fluxo completo:

1. **Acesse:** http://localhost
2. **Clique em:** "Criar conta" (canto superior direito)
3. **Registre-se** com:
   - Nome: Seu Nome
   - Email: teste@example.com
   - Senha: senha123
4. **Faça login** com as credenciais criadas
5. **Adicione um cupom:**
   - Use o código de demonstração: `DEMO_QR_CODE_12345`
6. **Explore:**
   - 📊 Dashboard com resumo financeiro
   - 🧾 Lista de cupons fiscais
   - 📦 Produtos comprados
   - 📈 Analytics com gráficos

## 🐛 Troubleshooting

### Frontend não carrega (ERR_CONNECTION_REFUSED)

```bash
# Verifique se o container está rodando
docker-compose ps frontend

# Se não estiver, inicie
docker-compose up -d frontend

# Veja os logs para identificar erros
docker-compose logs frontend
```

### Frontend carrega mas API não funciona

```bash
# Verifique se o API Gateway está rodando
docker-compose ps api-gateway

# Teste o health check
curl http://localhost:3000/health

# Veja os logs
docker-compose logs api-gateway
```

### Erro "port 80 is already allocated"

Algum serviço está usando a porta 80 (talvez Apache, IIS, outro container).

**Solução 1:** Pare o outro serviço

**Solução 2:** Mude a porta do frontend no `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "8080:80"  # Acesse em http://localhost:8080
```

### Rebuild completo (limpar tudo)

```bash
# Parar e remover tudo
docker-compose down -v

# Remover imagens antigas
docker rmi receipt-manager-frontend receipt-manager-gateway

# Rebuild do zero
docker-compose up -d --build
```

## 📁 Estrutura de Arquivos Relevantes

```
teste1/
├── docker-compose.yml          # Orquestração de todos os serviços
├── frontend/
│   ├── Dockerfile              # Build do frontend
│   ├── nginx.conf              # Configuração Nginx
│   └── .dockerignore           # Arquivos ignorados no build
├── backend/
│   ├── api-gateway/
│   │   └── Dockerfile
│   └── services/
│       ├── user-service/Dockerfile
│       ├── receipt-service/Dockerfile
│       ├── products-service/Dockerfile
│       └── analytics-service/Dockerfile
└── database/
    └── migrations/             # SQL executado na inicialização
```

## 🆚 Docker vs Vercel

| Aspecto | Docker (Local) | Vercel (Nuvem) |
|---------|----------------|----------------|
| **Custo** | Grátis | Grátis (com limites) |
| **Setup** | Um comando | Várias configurações |
| **Velocidade** | Muito rápido (local) | Depende da internet |
| **Backend** | Incluído | Precisa expor com ngrok |
| **Compartilhar** | Não (apenas local) | Sim (URL pública) |
| **Dev Experience** | Excelente | Bom |
| **Produção** | Não recomendado | Recomendado |

### Quando usar cada um?

**Docker (Local):**
- ✅ Desenvolvimento diário
- ✅ Testes completos
- ✅ Demonstrações offline
- ✅ Debugging

**Vercel:**
- ✅ Compartilhar com clientes
- ✅ Testes de QA externos
- ✅ Deploy de produção
- ✅ URLs públicas

## 🎯 Próximos Passos

Agora que tudo está dockerizado, você pode:

1. ✅ Desenvolver localmente sem internet
2. ✅ Compartilhar o projeto (basta rodar `docker-compose up`)
3. ✅ Fazer deploy em qualquer servidor com Docker
4. ✅ Criar CI/CD pipelines
5. ✅ Escalar serviços individualmente

---

## 📝 Comandos Resumidos

```bash
# Subir tudo
docker-compose up -d

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Rebuild
docker-compose up -d --build

# Acessar
http://localhost
```

**Dúvidas?** Verifique os logs: `docker-compose logs -f`
