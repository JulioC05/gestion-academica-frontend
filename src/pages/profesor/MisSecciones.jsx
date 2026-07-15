import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import styles from './MisSecciones.module.css'

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4].map((i) => (
        <td key={i}>
          <div className={`skeleton ${styles.skCell}`} />
        </td>
      ))}
    </tr>
  )
}

function MisSecciones() {
  const [secciones, setSecciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/evaluaciones/profesor/mis-secciones')
      .then(({ data }) => setSecciones(data.secciones || []))
      .catch((err) => {
        setError(err.response?.data?.message || 'Error al cargar las secciones.')
      })
      .finally(() => setCargando(false))
  }, [])

  return (
    <Layout>
      <div className={styles.page}>
        <div className="page-header">
          <h1>🏫 Mis Secciones</h1>
          <p>Aulas asignadas a tu cargo en el periodo activo.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sección</th>
                  <th>Curso</th>
                  <th>Horario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando
                  ? [1, 2, 3].map((i) => <SkeletonRow key={i} />)
                  : secciones.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No tienes secciones asignadas en el periodo activo.
                      </td>
                    </tr>
                  )
                  : secciones.map((s) => (
                    <tr key={s.seccion_id}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{s.grado_seccion}</span>
                      </td>
                      <td>{s.curso}</td>
                      <td>
                        <span className="badge badge-info">{s.horario}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
                          onClick={() => navigate(`/secciones/${s.seccion_id}/planilla`)}
                        >
                          Ver planilla
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MisSecciones
