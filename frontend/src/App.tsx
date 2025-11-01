import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AddReceipt from './pages/AddReceipt'
import ReceiptsList from './pages/ReceiptsList'
import ReceiptDetails from './pages/ReceiptDetails'
import ProductsList from './pages/ProductsList'
import Analytics from './pages/Analytics'

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
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/receipts"
              element={
                <ProtectedRoute>
                  <ReceiptsList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receipts/add"
              element={
                <ProtectedRoute>
                  <AddReceipt />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receipts/:id"
              element={
                <ProtectedRoute>
                  <ReceiptDetails />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductsList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
