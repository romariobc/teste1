import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public route - redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes - will be implemented in next steps */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPlaceholder />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/receipts" 
              element={
                <ProtectedRoute>
                  <ReceiptsPlaceholder />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <ProductsPlaceholder />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsPlaceholder />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

// Temporary placeholder components (will be replaced in next steps)
function DashboardPlaceholder() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-96">
        <div className="card max-w-md text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-4">
            Dashboard
          </h1>
          <p className="text-gray-600 mb-4">
            Será implementado na Etapa 4
          </p>
          <div className="space-y-2 text-sm text-left bg-gray-50 p-4 rounded">
            <p className="text-green-600">✅ Etapa 1: Setup</p>
            <p className="text-green-600">✅ Etapa 2: Axios e Auth</p>
            <p className="text-green-600">✅ Etapa 3: Login e Registro</p>
            <p className="text-blue-600">⏳ Etapa 4: Dashboard (próxima)</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function ReceiptsPlaceholder() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-96">
        <div className="card max-w-md text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-4">
            Cupons Fiscais
          </h1>
          <p className="text-gray-600">
            Será implementado nas Etapas 5 e 6
          </p>
        </div>
      </div>
    </Layout>
  )
}

function ProductsPlaceholder() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-96">
        <div className="card max-w-md text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-4">
            Produtos
          </h1>
          <p className="text-gray-600">
            Será implementado na Etapa 7
          </p>
        </div>
      </div>
    </Layout>
  )
}

function AnalyticsPlaceholder() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-96">
        <div className="card max-w-md text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-4">
            Análises
          </h1>
          <p className="text-gray-600">
            Será implementado na Etapa 8
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default App
