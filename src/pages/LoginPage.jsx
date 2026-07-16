import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

// Credenciales de ejemplo por rol para facilitar las pruebas
const DEMOS = [
  { rol: 'Alumno',        correo: 'maria.gomez@universidad.edu.pe',  contrasena: 'clave123' },
  { rol: 'Profesor',      correo: 'carlos.docente@colegio.edu.pe', contrasena: 'clave123' },
  { rol: 'Administrador', correo: 'admin@colegio.edu.pe',    contrasena: 'clave123' },
]

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Redirige de vuelta a la ruta protegida que intentó visitar, o al dashboard
  const destino = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!correo.trim() || !contrasena.trim()) {
      setError('Por favor completa todos los campos.')
      return
    }

    setCargando(true)
    try {
      await login(correo.trim(), contrasena)
      navigate(destino, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al conectar con el servidor.'
      setError(msg)
    } finally {
      setCargando(false)
    }
  }

  const usarDemo = (demo) => {
    setCorreo(demo.correo)
    setContrasena(demo.contrasena)
    setError('')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo / branding */}
        <div className={styles.header}>
          <div className={styles.logo}>🎓</div>
          <h1>Sistema de Gestión Académica</h1>
          <p>Inicia sesión para continuar</p>
        </div>

        {/* Accesos rápidos demo */}
        <div className={styles.demos}>
          <span className={styles.demosLabel}>Acceso rápido:</span>
          <div className={styles.demosBtns}>
            {DEMOS.map((d) => (
              <button
                key={d.rol}
                type="button"
                className={styles.demoBtn}
                onClick={() => usarDemo(d)}
              >
                {d.rol}
              </button>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className="form-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              autoComplete="email"
              placeholder="usuario@colegio.edu"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              disabled={cargando}
            />
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className={styles.btnSpinner} /> Ingresando...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <p className={styles.footer}>
          Sistema vigesimal peruano · Año Escolar 2026
        </p>
      </div>
    </div>
  )
}

export default LoginPage
