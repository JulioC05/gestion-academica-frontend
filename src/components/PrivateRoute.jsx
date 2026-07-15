import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * PrivateRoute — protege rutas por autenticación y opcionalmente por rol.
 * @param {string[]} roles  Lista de roles permitidos (vacío = cualquier autenticado)
 */
function PrivateRoute({ children, roles = [] }) {
  const { usuario, cargando } = useAuth()
  const location = useLocation()

  // Mientras se restaura la sesión desde localStorage, no hacer nada
  if (cargando) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Cargando sesión...</p>
      </div>
    )
  }

  // No autenticado → login (guardamos la ruta para redirect post-login)
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Autenticado pero sin el rol necesario → dashboard (no 401, es UX amigable)
  if (roles.length > 0 && !roles.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PrivateRoute
