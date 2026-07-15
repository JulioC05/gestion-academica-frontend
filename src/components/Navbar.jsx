import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!usuario) return null

  const rol = usuario.rol

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link to="/dashboard">🎓 GestAcad</Link>
      </div>

      <ul className={styles.links}>
        {/* Alumno */}
        {(rol === 'ALUMNO') && (
          <li><Link to="/mis-notas">Mis Notas</Link></li>
        )}

        {/* Profesor */}
        {(rol === 'PROFESOR') && (
          <>
            <li><Link to="/mis-secciones">Mis Secciones</Link></li>
            <li><Link to="/evaluar">Registrar Evaluación</Link></li>
          </>
        )}

        {/* Admin ve todo */}
        {(rol === 'ADMIN' || rol === 'ADMINISTRADOR') && (
          <>
            <li><Link to="/mis-notas">Notas Alumno</Link></li>
            <li><Link to="/mis-secciones">Secciones</Link></li>
            <li><Link to="/evaluar">Evaluaciones</Link></li>
            <li className={styles.dropdown}>
              <span>Administración ▾</span>
              <ul className={styles.dropdownMenu}>
                <li><Link to="/admin/usuarios">Usuarios</Link></li>
                <li><Link to="/admin/cursos">Cursos</Link></li>
                <li><Link to="/admin/periodos">Periodos</Link></li>
                <li><Link to="/admin/secciones">Secciones</Link></li>
              </ul>
            </li>
          </>
        )}
      </ul>

      <div className={styles.userInfo}>
        <span className={styles.rolBadge}>{rol}</span>
        <span className={styles.correo}>{usuario.correo}</span>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}

export default Navbar
