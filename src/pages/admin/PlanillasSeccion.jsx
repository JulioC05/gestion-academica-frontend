import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'
import api from '../../services/api'
import styles from './PlanillasSeccion.module.css'


function PlanillasSeccion() {
  const [secciones, setSecciones] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [seccionSeleccionada, setSeccionSeleccionada] = useState(null)
  const [loadingSecciones, setLoadingSecciones] = useState(true)
  const [loadingAlumnos, setLoadingAlumnos] = useState(false)
  const [error, setError] = useState('')

  // 1. Cargar todas las secciones al montar el componente
  useEffect(() => {
    const obtenerSecciones = async () => {
      try {
        setLoadingSecciones(true)
        const { data } = await api.get('/api/secciones') 
        
        // Extraemos directamente el arreglo de 'secciones' de tu JSON
        if (data && Array.isArray(data.secciones)) {
          setSecciones(data.secciones)
        } else {
          setSecciones([])
          console.error("No se encontró el arreglo 'secciones' en la respuesta:", data)
        }
      } catch (err) {
        setError('Error al cargar la lista de secciones.')
        setSecciones([])
      } finally {
        setLoadingSecciones(false)
      }
    }
    obtenerSecciones()
  }, [])

  // 2. Cargar alumnos de una sección específica al hacer clic
  // 2. Cargar alumnos de una sección específica al hacer clic
  const verDetallesSeccion = async (seccionId, gradoSeccion) => {
    setLoadingAlumnos(true)
    setSeccionSeleccionada(gradoSeccion)
    setError('')
    setAlumnos([]) // Limpiamos la lista anterior para evitar confusiones
    
    try {
      const token = localStorage.getItem('token')
      const { data } = await api.get(`/api/evaluaciones/profesor/secciones/${seccionId}/alumnos`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (data && Array.isArray(data.planilla)) {
        setAlumnos(data.planilla)
      } else {
        setAlumnos([])
      }
    } catch (err) {
      // --- CAPTURAMOS EL MENSAJE REAL DEL BACKEND ---
      // Si el servidor respondió con un error controlado (ej: 404 sin alumnos)
      const mensajeServidor = err.response?.data?.message;
      
      if (mensajeServidor) {
        setError(mensajeServidor) // Muestra "No se encontraron alumnos inscritos..."
      } else {
        setError('Error de conexión o problema interno al obtener la lista de alumnos.')
      }
      setAlumnos([])
    } finally {
      setLoadingAlumnos(false)
    }
  }

if (loadingSecciones) {
    return (
      <Layout>
        <div className="skeleton" style={{ height: '200px', padding: '20px' }}>Cargando secciones...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={styles.page}> 
        <div className="page-header">
          <h2>📋 Revisar Planillas de Alumnos por Sección</h2>
          <p>Consulta la lista oficial de estudiantes inscritos en cada aula.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className={styles.splitLayout}>
          
          {/* Columna Izquierda: Secciones */}
          <div className="card" style={{ padding: 0 }}>
            <h3 className={styles.cardHeaderTitle}>Secciones Disponibles</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Grado / Sección</th>
                    <th>Curso</th>
                    <th>Profesor</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {secciones.length > 0 ? (
                    secciones.map((sec) => (
                      <tr key={sec.seccion_id}>
                        <td style={{ fontWeight: 600 }}>{sec.grado_seccion}</td>
                        <td>{sec.curso}</td>
                        <td>{sec.profesor}</td>
                        <td>
                          <button 
                            className="btn btn-primary"
                            style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
                            onClick={() => verDetallesSeccion(sec.seccion_id, sec.grado_seccion)}
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className={styles.loadingPlaceholder}>
                        No se encontraron secciones disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Columna Derecha: Alumnos */}
          <div className="card" style={{ padding: 0 }}>
            {seccionSeleccionada ? (
              <>
                <h3 className={styles.cardHeaderTitle}>Alumnos en: {seccionSeleccionada}</h3>
                {loadingAlumnos ? (
                  <div className={styles.loadingPlaceholder}>Cargando lista de alumnos...</div>
                ) : alumnos.length === 0 ? (
                  <div className={styles.loadingPlaceholder}>No hay alumnos matriculados en esta sección.</div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Nombre Completo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumnos.map((alum) => (
                          <tr key={alum.alumno_id}>
                            <td>
                              <span className="badge badge-info">{alum.codigo}</span>
                            </td>
                            <td style={{ fontWeight: 500 }}>{alum.estudiante}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.placeholderCard}>
                <span style={{ fontSize: '2rem', marginBottom: '8px' }}>📂</span>
                <p>Selecciona una sección a la izquierda para visualizar su planilla de alumnos inscritos.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  )
}

export default PlanillasSeccion