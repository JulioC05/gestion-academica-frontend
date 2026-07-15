import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import Layout from '../../components/Layout'
import styles from './MisNotas.module.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Devuelve la clase de color según la nota en el sistema vigesimal peruano */
function clasificarNota(nota) {
  if (nota === null || nota === undefined) return 'pending'
  if (nota >= 14) return 'aprobado'
  if (nota >= 11) return 'regular'
  return 'desaprobado'
}

/** Etiqueta textual de la clasificación */
const ETIQUETA = {
  aprobado:     { texto: 'Aprobado',     badge: 'badge-success' },
  regular:      { texto: 'Regular',      badge: 'badge-warning' },
  desaprobado:  { texto: 'Desaprobado',  badge: 'badge-danger'  },
  pending:      { texto: 'Sin nota',     badge: 'badge-info'    },
}

// ── Skeleton de carga ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className={styles.cursoCard}>
      <div className={styles.cursoHeader}>
        <div className={`skeleton ${styles.skLine}`} style={{ width: '60%', height: '1.1rem' }} />
        <div className={`skeleton ${styles.skLine}`} style={{ width: '25%', height: '1.1rem' }} />
      </div>
      <div className={styles.tableWrapper}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skRow}>
            <div className={`skeleton ${styles.skLine}`} style={{ width: '40%' }} />
            <div className={`skeleton ${styles.skLine}`} style={{ width: '15%' }} />
            <div className={`skeleton ${styles.skLine}`} style={{ width: '15%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tarjeta de un curso con tabla de evaluaciones ────────────────────────────

function CursoCard({ curso }) {
  const [expandido, setExpandido] = useState(true)
  const clasif = clasificarNota(curso.promedio_parcial)
  const { texto, badge } = ETIQUETA[clasif]

  return (
    <div className={styles.cursoCard}>
      <button
        className={styles.cursoHeader}
        onClick={() => setExpandido((v) => !v)}
        aria-expanded={expandido}
      >
        <div className={styles.cursoInfo}>
          <span className={styles.cursoNombre}>{curso.curso}</span>
          <span className={styles.cursoSeccion}>Sección: {curso.seccion}</span>
        </div>

        <div className={styles.cursoResumen}>
          <div className={styles.promedioBox}>
            <span className={styles.promedioLabel}>Promedio parcial</span>
            <span
              className={`${styles.promedioValor} ${styles[clasif]}`}
            >
              {curso.promedio_parcial > 0 ? curso.promedio_parcial.toFixed(2) : '—'}
            </span>
          </div>
          <span className={`badge ${badge}`}>{texto}</span>
          <span className={styles.toggle}>{expandido ? '▲' : '▼'}</span>
        </div>
      </button>

      {expandido && (
        <div className={styles.tableWrapper}>
          <table aria-label={`Notas de ${curso.curso}`}>
            <thead>
              <tr>
                <th>Evaluación</th>
                <th>Peso (%)</th>
                <th>Nota</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {curso.evaluaciones.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyRow}>
                    No hay evaluaciones configuradas para este curso.
                  </td>
                </tr>
              ) : (
                curso.evaluaciones.map((ev, idx) => {
                  const c = clasificarNota(ev.nota)
                  const { texto: t, badge: b } = ETIQUETA[c]
                  return (
                    <tr key={idx}>
                      <td>{ev.evaluacion}</td>
                      <td>
                        <span className={`badge badge-info`}>{ev.peso_porcentaje}%</span>
                      </td>
                      <td>
                        <span className={`${styles.notaValor} ${styles[c]}`}>
                          {ev.nota !== null ? ev.nota.toFixed(2) : '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${b}`}>{t}</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Resumen estadístico ───────────────────────────────────────────────────────

function ResumenStats({ libreta }) {
  if (!libreta.length) return null

  const total = libreta.length
  const aprobados = libreta.filter((c) => c.promedio_parcial >= 11).length
  const desaprobados = libreta.filter(
    (c) => c.promedio_parcial > 0 && c.promedio_parcial < 11
  ).length
  const sinNotas = libreta.filter((c) => c.promedio_parcial === 0).length
  const promedioGeneral =
    libreta.filter((c) => c.promedio_parcial > 0).reduce((acc, c) => acc + c.promedio_parcial, 0) /
    (libreta.filter((c) => c.promedio_parcial > 0).length || 1)

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <span className={styles.statValue}>{total}</span>
        <span className={styles.statLabel}>Cursos inscritos</span>
      </div>
      <div className={styles.statCard}>
        <span className={`${styles.statValue} ${styles.aprobado}`}>{aprobados}</span>
        <span className={styles.statLabel}>Aprobados</span>
      </div>
      <div className={styles.statCard}>
        <span className={`${styles.statValue} ${styles.desaprobado}`}>{desaprobados}</span>
        <span className={styles.statLabel}>Desaprobados</span>
      </div>
      <div className={styles.statCard}>
        <span className={`${styles.statValue} ${styles.regular}`}>
          {promedioGeneral > 0 ? promedioGeneral.toFixed(2) : '—'}
        </span>
        <span className={styles.statLabel}>Promedio general</span>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

function MisNotas() {
  const { usuario } = useAuth()
  const [libreta, setLibreta] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [periodo, setPeriodo] = useState('')
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)

  // Admin puede consultar cualquier alumno vía query param ?alumno_id=X
  const [alumnoIdAdmin, setAlumnoIdAdmin] = useState('')
  const esAdmin = usuario?.rol === 'ADMIN' || usuario?.rol === 'ADMINISTRADOR'

  const cargarLibreta = useCallback(
    async (alumno_id_override) => {
      setCargando(true)
      setError('')
      try {
        // Alumno usa su id_entidad del contexto; Admin envía ?alumno_id=X
        const params = esAdmin && alumno_id_override
          ? { alumno_id: alumno_id_override }
          : {}

        const { data } = await api.get('/api/academico/libreta', { params })
        setLibreta(data.libreta || [])
        setPeriodo(data.periodo_evaluado || '')
        setUltimaActualizacion(new Date())
      } catch (err) {
        const msg = err.response?.data?.message || 'Error al cargar las notas.'
        setError(msg)
      } finally {
        setCargando(false)
      }
    },
    [esAdmin]
  )

  // Carga inicial para ALUMNO (el backend lee el token directamente)
  useEffect(() => {
    if (!esAdmin) {
      cargarLibreta()
    } else {
      setCargando(false)
    }
  }, [cargarLibreta, esAdmin])

  const handleAdminBuscar = (e) => {
    e.preventDefault()
    if (!alumnoIdAdmin.trim()) return
    cargarLibreta(alumnoIdAdmin.trim())
  }

  return (
    <Layout>
      <div className={styles.page}>
        {/* Encabezado */}
        <div className="page-header">
          <h1>📊 {esAdmin ? 'Notas de Alumno' : 'Mis Notas'}</h1>
          <p>
            {periodo
              ? `Periodo: ${periodo}`
              : 'Libreta de calificaciones — Sistema vigesimal (0–20)'}
          </p>
        </div>

        {/* Búsqueda admin por alumno_id */}
        {esAdmin && (
          <form onSubmit={handleAdminBuscar} className={styles.adminSearch}>
            <div className="form-group">
              <label htmlFor="alumno_id">ID de Alumno</label>
              <input
                id="alumno_id"
                type="number"
                min="1"
                placeholder="Ej: 3"
                value={alumnoIdAdmin}
                onChange={(e) => setAlumnoIdAdmin(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={cargando}>
              {cargando ? 'Buscando...' : 'Consultar'}
            </button>
          </form>
        )}

        {/* Indicador de última actualización */}
        {ultimaActualizacion && !cargando && (
          <div className={styles.metaBar}>
            <span>
              Actualizado: {ultimaActualizacion.toLocaleTimeString('es-PE')}
            </span>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
              onClick={() => cargarLibreta(esAdmin ? alumnoIdAdmin : undefined)}
            >
              ↻ Recargar
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {/* Skeleton */}
        {cargando && (
          <div className={styles.list}>
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Sin datos */}
        {!cargando && !error && libreta.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📭</span>
            <p>
              {esAdmin
                ? 'Ingresa un ID de alumno para consultar su libreta.'
                : 'Aún no tienes cursos inscritos o evaluaciones registradas.'}
            </p>
          </div>
        )}

        {/* Contenido */}
        {!cargando && libreta.length > 0 && (
          <>
            <ResumenStats libreta={libreta} />
            <div className={styles.list}>
              {libreta.map((curso, idx) => (
                <CursoCard key={`${curso.curso_id}-${idx}`} curso={curso} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default MisNotas
