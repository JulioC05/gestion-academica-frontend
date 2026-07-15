import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Layout from '../../components/Layout'
import styles from './Planilla.module.css'

function clasificarNota(nota) {
  if (nota === null || nota === undefined) return 'pending'
  if (nota >= 14) return 'aprobado'
  if (nota >= 11) return 'regular'
  return 'desaprobado'
}

const COLOR = {
  aprobado:    '#4ade80',
  regular:     '#fbbf24',
  desaprobado: '#f87171',
  pending:     '#64748b',
}

function Planilla() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [planilla, setPlanilla] = useState([])
  const [evaluaciones, setEvaluaciones] = useState([])
  const [totalAlumnos, setTotalAlumnos] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/api/evaluaciones/profesor/secciones/${id}/alumnos`)
      .then(({ data }) => {
        setTotalAlumnos(data.total_estudiantes || 0)
        const alumnos = data.planilla || []
        setPlanilla(alumnos)

        // Extraer encabezados de evaluaciones del primer alumno
        if (alumnos.length > 0 && alumnos[0].calificaciones.length > 0) {
          const evs = alumnos[0].calificaciones.map((c) => ({
            nombre: c.evaluacion,
            peso: c.peso_porcentaje,
          }))
          setEvaluaciones(evs)
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Error al cargar la planilla.')
      })
      .finally(() => setCargando(false))
  }, [id])

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.topBar}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>📋 Planilla de Sección #{id}</h1>
            {!cargando && (
              <p>{totalAlumnos} estudiante{totalAlumnos !== 1 ? 's' : ''} inscrito{totalAlumnos !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {cargando && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando planilla...</p>
          </div>
        )}

        {!cargando && planilla.length === 0 && !error && (
          <div className="alert alert-warning">
            No hay alumnos inscritos o evaluaciones configuradas en esta sección.
          </div>
        )}

        {!cargando && planilla.length > 0 && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Estudiante</th>
                    {evaluaciones.map((ev, i) => (
                      <th key={i}>
                        {ev.nombre}
                        <br />
                        <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                          {ev.peso}%
                        </span>
                      </th>
                    ))}
                    <th>Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {planilla.map((alumno) => {
                    // Calcular promedio ponderado del alumno
                    const notasConPeso = alumno.calificaciones.filter((c) => c.nota !== null)
                    const totalPeso = notasConPeso.reduce((acc, c) => acc + c.peso_porcentaje, 0)
                    const sumaVal = notasConPeso.reduce(
                      (acc, c) => acc + c.nota * (c.peso_porcentaje / 100),
                      0
                    )
                    const promedio = totalPeso > 0
                      ? (sumaVal * (100 / totalPeso)).toFixed(2)
                      : null
                    const clasif = clasificarNota(promedio ? parseFloat(promedio) : null)

                    return (
                      <tr key={alumno.alumno_id}>
                        <td>
                          <span className="badge badge-info">{alumno.codigo}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{alumno.estudiante}</td>
                        {alumno.calificaciones.map((cal, i) => {
                          const c = clasificarNota(cal.nota)
                          return (
                            <td key={i}>
                              <span
                                className={styles.notaCell}
                                style={{ color: COLOR[c] }}
                              >
                                {cal.nota !== null ? cal.nota.toFixed(2) : '—'}
                              </span>
                            </td>
                          )
                        })}
                        <td>
                          <span
                            className={styles.promedioCell}
                            style={{ color: COLOR[clasif] }}
                          >
                            {promedio ?? '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Planilla
