import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al montar, restaurar sesión desde localStorage
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token')
    const usuarioGuardado = localStorage.getItem('usuario')

    if (tokenGuardado && usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
      }
    }
    setCargando(false)
  }, [])

  /**
   * login: autentica al usuario y luego llama a /perfil para obtener
   * el id_entidad (alumno_id / profesor_id) que el JWT no incluye.
   */
  const login = useCallback(async (correo, contrasena) => {
    const { data } = await api.post('/api/auth/login', { correo, contrasena })

    // Guardar token primero para que el interceptor lo adjunte en la siguiente llamada
    localStorage.setItem('token', data.token)

    // Obtener perfil completo para tener el id_entidad del rol
    let id_entidad = null
    try {
      const perfilRes = await api.get('/api/auth/perfil')
      const datos = perfilRes.data.datos
      const rol = data.usuario.rol.toUpperCase()

      if (rol === 'ALUMNO') id_entidad = datos.alumno_id
      else if (rol === 'PROFESOR') id_entidad = datos.profesor_id
      else if (rol === 'ADMIN' || rol === 'ADMINISTRADOR') id_entidad = datos.admin_id
    } catch {
      // Si falla el perfil no bloqueamos el login, id_entidad queda null
    }

    const usuarioCompleto = {
      ...data.usuario,
      rol: data.usuario.rol.toUpperCase(),
      id_entidad,
    }

    localStorage.setItem('usuario', JSON.stringify(usuarioCompleto))
    setUsuario(usuarioCompleto)

    return usuarioCompleto
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }, [])

  const value = { usuario, cargando, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook de consumo — más cómodo que importar useContext + AuthContext
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
