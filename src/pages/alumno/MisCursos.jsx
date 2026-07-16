import { useState, useEffect } from 'react'
import api from '../../services/api'
import Layout from '../../components/Layout'
import styles from './MisCursos.module.css'

function MisCursos() {
  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const obtenerMisCursos = async () => {
      try {
        const token = localStorage.getItem('token')
        const { data } = await api.get('/api/matricula/mis-cursos', {
          headers: { Authorization: `Bearer ${token}` }
        })

        // Mapeamos de forma segura la propiedad 'cursos_matriculados' de tu JSON
        if (data && Array.isArray(data.cursos_matriculados)) {
          setCursos(data.cursos_matriculados)
        } else {
          setCursos([])
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar tus cursos matriculados.')
      } finally {
        setCargando(false)
      }
    }

    obtenerMisCursos()
  }, [])

  return (
    <Layout>
      <div className={styles.page}>
        <div className="page-header">
          <h1>📚 Mis Cursos Matriculados</h1>
          <p>Asignaturas inscritas oficialmente para tu periodo académico activo.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {cargando ? (
          <div className={styles.loadingPlaceholder}>
            <div className="skeleton" style={{ height: '150px', borderRadius: '8px' }}></div>
          </div>
        ) : cursos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <span>📭</span>
            <p style={{ marginTop: '10px' }}>No registras matrículas de cursos en este periodo.</p>
          </div>
        ) : (
          <div className={styles.gridCursos}>
            {cursos.map((c, idx) => (
              <div key={c.matricula_id || idx} className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: '1.15rem', 
                  color: 'var(--primary-color, #5a9ce7)', 
                  fontWeight: '600',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '0.5rem'
                }}>
                  {c.curso}
                </h3>
                
                <div className={styles.detalles}>
                  <div className={styles.infoRow}>
                    <span>Grado / Sección:</span>
                    <strong>{c.grado_seccion}</strong>
                  </div>
                  
                  <div className={styles.infoRow}>
                    <span>Profesor:</span>
                    <strong>{c.profesor || 'Por asignar'}</strong>
                  </div>

                  <div className={styles.infoRow} style={{ marginTop: '0.75rem' }}>
                    <span className="badge badge-info" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                      ⏱️ {c.horario}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default MisCursos