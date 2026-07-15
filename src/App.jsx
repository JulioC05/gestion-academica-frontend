import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

// Páginas públicas
import LoginPage from './pages/LoginPage'

// Páginas autenticadas
import Dashboard from './pages/Dashboard'

// Alumno
import MisNotas from './pages/alumno/MisNotas'

// Profesor / Admin
import MisSecciones from './pages/profesor/MisSecciones'
import Planilla from './pages/profesor/Planilla'
import RegistrarEvaluacion from './pages/profesor/RegistrarEvaluacion'

// Admin
import CrearUsuario from './pages/admin/CrearUsuario'
import GestionCursos from './pages/admin/GestionCursos'
import GestionPeriodos from './pages/admin/GestionPeriodos'
import GestionSecciones from './pages/admin/GestionSecciones'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Redirige raíz al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard para todos los roles autenticados */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={['ALUMNO', 'PROFESOR', 'ADMIN', 'ADMINISTRADOR']}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* ===== MÓDULO ALUMNO ===== */}
          <Route
            path="/mis-notas"
            element={
              <PrivateRoute roles={['ALUMNO', 'ADMIN', 'ADMINISTRADOR']}>
                <MisNotas />
              </PrivateRoute>
            }
          />

          {/* ===== MÓDULO PROFESOR ===== */}
          <Route
            path="/mis-secciones"
            element={
              <PrivateRoute roles={['PROFESOR', 'ADMIN', 'ADMINISTRADOR']}>
                <MisSecciones />
              </PrivateRoute>
            }
          />
          <Route
            path="/secciones/:id/planilla"
            element={
              <PrivateRoute roles={['PROFESOR', 'ADMIN', 'ADMINISTRADOR']}>
                <Planilla />
              </PrivateRoute>
            }
          />
          <Route
            path="/evaluar"
            element={
              <PrivateRoute roles={['PROFESOR', 'ADMIN', 'ADMINISTRADOR']}>
                <RegistrarEvaluacion />
              </PrivateRoute>
            }
          />

          {/* ===== MÓDULO ADMIN ===== */}
          <Route
            path="/admin/usuarios"
            element={
              <PrivateRoute roles={['ADMIN', 'ADMINISTRADOR']}>
                <CrearUsuario />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/cursos"
            element={
              <PrivateRoute roles={['ADMIN', 'ADMINISTRADOR']}>
                <GestionCursos />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/periodos"
            element={
              <PrivateRoute roles={['ADMIN', 'ADMINISTRADOR']}>
                <GestionPeriodos />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/secciones"
            element={
              <PrivateRoute roles={['ADMIN', 'ADMINISTRADOR']}>
                <GestionSecciones />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
