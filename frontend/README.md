# Receipt Manager - Frontend

Gerenciador de Cupons Fiscais - Interface Web

## 🛠️ Stack

- **React** 18.2
- **TypeScript** 5.3
- **Vite** 5.0 - Build tool
- **Tailwind CSS** 3.4 - Estilização
- **React Router** 6.20 - Navegação
- **Axios** - HTTP client
- **Recharts** - Gráficos
- **html5-qrcode** - Scanner QR Code

## 🚀 Como rodar

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo dev
npm run dev
```

Acesse: http://localhost:5173

### Build para produção

```bash
npm run build
npm run preview
```

### Docker

```bash
docker build -t receipt-manager-frontend .
docker run -p 80:80 receipt-manager-frontend
```

## 📁 Estrutura

```
src/
├── components/      # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── contexts/       # Context API (Auth)
├── services/       # Axios + API calls
├── hooks/          # Custom hooks
├── types/          # TypeScript types
└── assets/         # Imagens, etc
```

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```
VITE_API_URL=http://localhost:3000
```

## 📋 Status

- [x] Etapa 1: Setup completo
- [ ] Etapa 2: Axios + Auth Context
- [ ] Etapa 3: Login/Registro
- [ ] Etapa 4: Dashboard
- [ ] Etapa 5: Scanner QR Code
- [ ] Etapa 6: Cupons
- [ ] Etapa 7: Produtos
- [ ] Etapa 8: Analytics
- [ ] Etapa 9: Ajustes finais

**Status Atual**: Etapa 1 ✅ Completa
