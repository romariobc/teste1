# 🚀 Deploy do Frontend no Vercel

## ⚠️ IMPORTANTE: Configuração do Projeto

O erro **NOT_FOUND** no Vercel acontece quando o projeto não está configurado corretamente. Siga EXATAMENTE estas instruções:

---

## 📋 Passo a Passo para Deploy

### 1. Acesse o Vercel
- Vá para https://vercel.com
- Faça login com sua conta GitHub

### 2. Importe o Projeto
- Clique em **"Add New Project"**
- Selecione o repositório **`romariobc/teste1`**
- Clique em **"Import"**

### 3. ⚠️ CONFIGURAÇÃO CRÍTICA - Root Directory

**ATENÇÃO**: O projeto frontend está em uma subpasta!

Na tela de configuração, você DEVE configurar:

#### ✅ Root Directory
```
frontend
```

**IMPORTANTE**: Clique em **"Edit"** ao lado de "Root Directory" e digite **`frontend`**

### 4. Framework Detection

O Vercel deve detectar automaticamente:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Se não detectar automaticamente, configure manualmente:

#### Build & Development Settings:
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 5. Environment Variables

Adicione a variável de ambiente:

```
VITE_API_URL=<URL_DO_SEU_BACKEND>
```

**Exemplos:**
- Local: `http://localhost:3000`
- Produção: `https://seu-backend.herokuapp.com`
- API Gateway: `https://api.seudominio.com`

### 6. Deploy

Clique em **"Deploy"**

O Vercel vai:
1. ✅ Detectar o framework (Vite)
2. ✅ Instalar dependências (`npm install`)
3. ✅ Buildar o projeto (`npm run build`)
4. ✅ Fazer deploy da pasta `dist`

---

## 🔧 Arquivos de Configuração Criados

Os seguintes arquivos foram adicionados ao projeto:

### 1. `frontend/vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Propósito**: 
- Define comandos de build
- Configura output directory
- Adiciona rewrite rules para React Router funcionar

### 2. `frontend/.vercelignore`
```
node_modules
.git
.env
.env.local
dist
npm-debug.log
```

**Propósito**: Ignora arquivos desnecessários no deploy

---

## ✅ Checklist de Configuração

Antes de fazer deploy, verifique:

- [ ] Root Directory configurado para **`frontend`**
- [ ] Framework detectado como **Vite**
- [ ] Build Command: **`npm run build`**
- [ ] Output Directory: **`dist`**
- [ ] Install Command: **`npm install`**
- [ ] Environment Variable **`VITE_API_URL`** configurada
- [ ] Arquivos `vercel.json` e `.vercelignore` existem

---

## 🐛 Soluções para Erros Comuns

### Erro: "NOT_FOUND"

**Causa**: Root directory não configurado

**Solução**:
1. Vá em Project Settings
2. Em "General" → "Root Directory"
3. Clique em "Edit"
4. Digite: `frontend`
5. Salve e redeploy

### Erro: "Build Failed"

**Causa**: Dependências não instaladas

**Solução**:
1. Verifique se `package.json` existe em `frontend/`
2. Verifique se Install Command está: `npm install`
3. Limpe cache: Settings → "Clear Build Cache"
4. Redeploy

### Erro: "404 on routes"

**Causa**: React Router não configurado

**Solução**: O arquivo `vercel.json` já resolve isso com rewrites

### Erro: "Failed to compile"

**Causa**: Erro de TypeScript ou ESLint

**Solução**:
1. Localmente, rode: `npm run build`
2. Corrija os erros
3. Commit e push
4. Redeploy

---

## 🔗 Backend Connection

### Desenvolvimento Local
```env
VITE_API_URL=http://localhost:3000
```

### Produção
```env
VITE_API_URL=https://seu-api-gateway.herokuapp.com
```

**IMPORTANTE**: 
- Certifique-se que o backend aceita requests do domínio do Vercel
- Configure CORS no backend para permitir o domínio Vercel
- Exemplo: `https://seu-projeto.vercel.app`

---

## 📸 Screenshots de Configuração

### 1. Root Directory
```
Project Settings → General → Root Directory
┌─────────────────────────────────┐
│ Root Directory:  [Edit]         │
│ frontend                        │
└─────────────────────────────────┘
```

### 2. Build Settings
```
Build & Development Settings
┌─────────────────────────────────┐
│ Framework Preset: Vite          │
│ Build Command: npm run build    │
│ Output Directory: dist           │
│ Install Command: npm install     │
└─────────────────────────────────┘
```

### 3. Environment Variables
```
Environment Variables
┌─────────────────────────────────┐
│ Name: VITE_API_URL              │
│ Value: https://api.example.com  │
└─────────────────────────────────┘
```

---

## 🎯 Estrutura do Projeto

```
teste1/                          ← Repositório raiz
├── backend/                     ← Backend (não usar)
├── database/                    ← Database (não usar)
└── frontend/                    ← ✅ ROOT DIRECTORY para Vercel
    ├── src/                     ← Código fonte
    ├── public/                  ← Assets estáticos
    ├── dist/                    ← Build output (gerado)
    ├── package.json             ← Dependências
    ├── vite.config.ts          ← Config Vite
    ├── vercel.json             ← Config Vercel
    └── .vercelignore           ← Arquivos ignorados
```

---

## 🔄 Redeploy

Para fazer redeploy após mudanças:

1. Faça commit e push das mudanças
2. Vercel detecta automaticamente e redeploy
3. Ou manualmente: Vercel Dashboard → Project → "Redeploy"

---

## 📝 Comandos Úteis

### Testar build localmente
```bash
cd frontend
npm install
npm run build
npm run preview
```

### Verificar variáveis
```bash
# No código:
console.log(import.meta.env.VITE_API_URL)
```

---

## ✅ Validação Final

Após o deploy, teste:

1. ✅ Página inicial carrega
2. ✅ Login funciona
3. ✅ Rotas funcionam (não dá 404)
4. ✅ API calls funcionam
5. ✅ Dashboard carrega dados
6. ✅ Todas páginas acessíveis

---

## 🆘 Suporte

Se ainda tiver problemas:

1. Verifique logs no Vercel Dashboard
2. Vá em Deployments → Latest → Logs
3. Procure por erros específicos
4. Compartilhe o erro para mais ajuda

---

## 🎉 Deploy com Sucesso!

Após seguir todos os passos, seu frontend estará disponível em:
```
https://seu-projeto.vercel.app
```

**IMPORTANTE**: Configure o backend para aceitar requests desse domínio (CORS)!

---

**Última atualização**: Novembro 2025
