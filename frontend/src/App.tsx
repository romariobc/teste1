import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  )
}

// Temporary HomePage component
function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card max-w-md text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">
          Receipt Manager
        </h1>
        <p className="text-gray-600 mb-6">
          Gerenciador de Cupons Fiscais
        </p>
        <div className="space-y-2 text-sm text-left">
          <p className="text-green-600">✅ React + TypeScript</p>
          <p className="text-green-600">✅ Vite</p>
          <p className="text-green-600">✅ Tailwind CSS</p>
          <p className="text-green-600">✅ React Router</p>
        </div>
        <p className="mt-6 text-gray-500 text-sm">
          Etapa 1 - Setup Completo!
        </p>
      </div>
    </div>
  )
}

export default App
