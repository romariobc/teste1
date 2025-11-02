# 🔧 Resolvendo Merge e Atualizando Main

## 📋 Situação Atual

Você está na branch `main` com um merge incompleto (MERGE_HEAD exists).

## 🚀 Passos para Resolver

### 1️⃣ Verificar o status atual

```bash
cd ~/Documents/dev/teste1/teste1
git status
```

Isso vai mostrar quais arquivos estão em conflito ou pendentes.

### 2️⃣ Abortar o merge incompleto

Como queremos puxar tudo limpo da branch do Claude, vamos abortar o merge atual:

```bash
git merge --abort
```

### 3️⃣ Garantir que main está limpa

```bash
# Ver se há mudanças locais
git status

# Se houver mudanças não commitadas, faça stash (guarda temporariamente)
git stash

# Ou se não precisar das mudanças locais, descarte
git reset --hard HEAD
```

### 4️⃣ Atualizar a branch do Claude

```bash
# Buscar todas as atualizações
git fetch origin

# Verificar se a branch existe
git branch -r | grep claude
```

### 5️⃣ Fazer merge da branch Claude para Main

**Opção A - Merge direto (mantém histórico):**

```bash
# Certificar que está na main
git checkout main

# Fazer merge da branch do Claude
git merge origin/claude/plan-receipt-manager-app-011CUfMk8dGUJ5L85g1khDyk

# Se houver conflitos, resolva e depois:
git add .
git commit -m "Merge: integra funcionalidades do Receipt Manager"
```

**Opção B - Reset para a branch Claude (RECOMENDADO - mais limpo):**

Se você quer que a main fique exatamente igual à branch do Claude:

```bash
# Certificar que está na main
git checkout main

# Resetar main para ficar igual à branch Claude
git reset --hard origin/claude/plan-receipt-manager-app-011CUfMk8dGUJ5L85g1khDyk

# Forçar push para atualizar o remote (cuidado! sobrescreve a main remota)
git push origin main --force
```

### 6️⃣ Verificar se está tudo ok

```bash
# Ver últimos commits
git log --oneline -10

# Verificar status
git status
```

## ⚠️ IMPORTANTE: Qual opção escolher?

### Use Opção A (Merge) se:
- Há commits importantes na main que não estão na branch Claude
- Quer manter todo o histórico de commits
- Está trabalhando em equipe

### Use Opção B (Reset) se:
- A branch Claude tem todo o trabalho que você precisa
- A main está desatualizada ou com problemas
- Quer começar limpo
- É só você no projeto

## 🐳 Depois de resolver o Git

### 7️⃣ Subir a aplicação Docker

```bash
# Parar containers antigos
docker-compose down

# Subir tudo (backend + frontend)
docker-compose up -d --build

# Ver status
docker-compose ps

# Acessar: http://localhost
```

---

## 🆘 Se algo der errado

### Cancelar tudo e voltar ao estado anterior

```bash
# Abortar merge
git merge --abort

# Voltar para o último commit
git reset --hard HEAD

# Limpar arquivos não rastreados
git clean -fd
```

### Começar do zero (CUIDADO!)

```bash
# Fazer backup primeiro!
cd ~/Documents/dev/teste1
cp -r teste1 teste1-backup

# Dentro do projeto
cd teste1
git fetch origin
git checkout main
git reset --hard origin/main
```

---

## 📞 Me avise

Depois de executar, me diga:

1. Qual opção você escolheu? (A ou B)
2. O que `git status` retorna?
3. O `docker-compose up -d --build` funcionou?

Qualquer erro, copie e cole aqui que eu te ajudo! 🚀
