import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import styles from './Navbar.module.css'

function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  // Estados para controlar el modal del perfil
  const [mostrarModal, setMostrarModal] = useState(false)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [errorPerfil, setErrorPerfil] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Función para obtener los datos desde el backend
  const handleAbrirPerfil = async () => {
    setMostrarModal(true)
    setCargando(true)
    setErrorPerfil('')
    try {
      const token = localStorage.getItem('token')
      const { data } = await api.get('/api/auth/perfil', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPerfil(data)
    } catch (err) {
      setErrorPerfil('No se pudo cargar la información del perfil.')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  if (!usuario) return null

  const rol = usuario.rol

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <Link to="/dashboard">🎓 GestAcad</Link>
        </div>

        <ul className={styles.links}>
          {/* Alumno */}
          {(rol === 'ALUMNO') && (
            <>
            <li><Link to="/mis-notas">Mis Notas</Link></li>
            <li><Link to="/mis-cursos">Mis Cursos</Link></li>
            </>
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
              <li><Link to="/planillas">Secciones</Link></li>
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
          {/* BOTÓN DE VER PERFIL */}
          <button 
            onClick={handleAbrirPerfil} 
            className={styles.perfilBtn} 
            title="Ver mi perfil"
          >
            👤
          </button>
          <span className={styles.rolBadge}>{rol}</span>
          <span className={styles.correo}>{usuario.correo}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* MODAL DE PERFIL */}
      {mostrarModal && (
        <div className={styles.modalOverlay} onClick={() => setMostrarModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>👤 Mi Perfil</h3>
              <button className={styles.closeBtn} onClick={() => setMostrarModal(false)}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              {cargando ? (
                <div className={styles.loading}>Cargando datos...</div>
              ) : errorPerfil ? (
                <div className="alert alert-error">{errorPerfil}</div>
              ) : perfil ? (
                <div className={styles.profileDetails}>
                  <div className={styles.profileRow}>
                    <strong>Rol:</strong> 
                    <span className={styles.rolBadge} style={{ marginLeft: '10px' }}>
                      {perfil.rol}
                    </span>
                  </div>
                  <hr className={styles.divider} />
                  
                  {/* Nombre y Apellidos (Común para todos los roles, dentro de 'datos') */}
                  {perfil.datos ? (
                    <>
                      <div className={styles.profileRow}>
                        <strong>Nombres:</strong> 
                        <span>{perfil.datos.nombres || '—'}</span>
                      </div>
                      <div className={styles.profileRow}>
                        <strong>Apellidos:</strong> 
                        <span>{perfil.datos.apellidos || '—'}</span>
                      </div>

                      {/* Campos exclusivos para ALUMNO */}
                      {perfil.rol === 'ALUMNO' && (
                        <>
                          <div className={styles.profileRow}>
                            <strong>Código Alumno:</strong> 
                            <span>{perfil.datos.codigo_alumno || '—'}</span>
                          </div>
                          <div className={styles.profileRow}>
                            <strong>F. Nacimiento:</strong> 
                            <span>
                              {perfil.datos.fecha_nacimiento 
                                ? new Date(perfil.datos.fecha_nacimiento).toLocaleDateString('es-PE') 
                                : '—'}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Campos exclusivos para ADMINISTRADOR / PERSONAL */}
                      {(perfil.rol === 'ADMINISTRADOR' || perfil.rol === 'ADMIN') && (
                        <>
                          {/* <div className={styles.profileRow}>
                            <strong>ID Admin:</strong> 
                            <span>{perfil.datos.admin_id || '—'}</span>
                          </div> */}
                          {perfil.datos.correo && (
                            <div className={styles.profileRow}>
                              <strong>Correo Contacto:</strong> 
                              <span>{perfil.datos.correo}</span>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className={styles.loading}>No se encontraron datos asociados a este perfil.</div>
                  )}
                </div>
              ) : null}
            </div>

            <div className={styles.modalFooter}>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setMostrarModal(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar