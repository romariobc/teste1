#!/bin/bash

echo "🚀 Setting up Receipt Manager project structure..."

# Frontend structure
echo "📁 Creating frontend structure..."
mkdir -p frontend/src/components
mkdir -p frontend/src/pages
mkdir -p frontend/src/services
mkdir -p frontend/src/hooks
mkdir -p frontend/src/types
mkdir -p frontend/src/utils
mkdir -p frontend/public

# Backend - API Gateway
echo "📁 Creating API Gateway structure..."
mkdir -p backend/api-gateway/src/routes
mkdir -p backend/api-gateway/src/middleware
mkdir -p backend/api-gateway/src/utils

# Backend - User Service
echo "📁 Creating User Service structure..."
mkdir -p backend/services/user-service/src/routes
mkdir -p backend/services/user-service/src/controllers
mkdir -p backend/services/user-service/src/models
mkdir -p backend/services/user-service/src/utils

# Backend - Receipt Service
echo "📁 Creating Receipt Service structure..."
mkdir -p backend/services/receipt-service/src/routes
mkdir -p backend/services/receipt-service/src/controllers
mkdir -p backend/services/receipt-service/src/services
mkdir -p backend/services/receipt-service/src/parsers
mkdir -p backend/services/receipt-service/src/utils

# Backend - Products Service
echo "📁 Creating Products Service structure..."
mkdir -p backend/services/products-service/src/routes
mkdir -p backend/services/products-service/src/controllers
mkdir -p backend/services/products-service/src/services
mkdir -p backend/services/products-service/src/utils

# Backend - Analytics Service
echo "📁 Creating Analytics Service structure..."
mkdir -p backend/services/analytics-service/src/routes
mkdir -p backend/services/analytics-service/src/controllers
mkdir -p backend/services/analytics-service/src/services
mkdir -p backend/services/analytics-service/src/utils

# Database
echo "📁 Creating database structure..."
mkdir -p database/migrations
mkdir -p database/seeds

# Docs
echo "📁 Creating docs structure..."
mkdir -p docs/api
mkdir -p docs/architecture

echo "✅ Project structure created successfully!"
echo ""
echo "📂 Structure:"
tree -L 3 -d 2>/dev/null || find . -type d -maxdepth 3 | grep -v node_modules | grep -v .git

echo ""
echo "🎯 Next steps:"
echo "1. Create docker-compose.yml"
echo "2. Setup package.json for each service"
echo "3. Create database migrations"
echo "4. Start implementing Phase 1!"
echo ""
echo "Run: docker-compose up -d postgres"
