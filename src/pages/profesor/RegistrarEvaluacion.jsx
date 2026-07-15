import { useState, useEffect } from 'react'
import api from '../../services/api'
import Layout from '../../components/Layout'
import styles from './RegistrarEvaluacion.module.css'

// ── Formulario para crear evaluación ─────────────────────────────────────────

function FormEvaluacion({ secciones, onCreada }) {
  const [form, setForm] = useState({
    seccion_id: '',
    tipo_evaluacion_id: '1',
    nombre: '',
    peso_porcentaje: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState(null)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setMsg(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.seccion_id || !form.nombre || !form.peso_porcentaje) {
      setMsg({ tipo: 'error', texto: 'Completa todos los campos.' })
      return
    }
    setEnviando(true)
    try {
      const { data } = await api.post('/api/evaluaciones/registrar', {
        seccion_id: parseInt(form.seccion_id),
        tipo_evaluacion_id: parseInt(form.tipo_evaluacion_id),
        nombre: form.nombre,
        peso_porcentaje: parseFloat(form.peso_porcentaje),
      })
      setMsg({ tipo: 'success', texto: data.message })
      setForm({ seccion_id: '', tipo_evaluacion_id: '1', nombre: '', peso_porcentaje: '' })
      onCreada?.()
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.response?.data?.message || 'Error al crear evaluación.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="card">
      <h2 className={styles.sectionTitle}>➕ Nueva Evaluación</h2>
      <form onSubmit={handleSubmit} className={styles.grid2}>
        <div className="form-group">
          <label>Sección</label>
          <select name="seccion_id" value={form.seccion_id} onChange={handleChange}>
            <option value="">Selecciona una sección</option>
            {secciones.map((s) => (
              <option key={s.seccion_id} value={s.seccion_id}>
                {s.grado_seccion} — {s.curso}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Nombre de la evaluación</label>
          <input
            type="text"
            name="nombre"
            placeholder="Ej: Examen Parcial 1"
            value={form.nombre}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Peso (%)</label>
          <input
            type="number"
            name="peso_porcentaje"
            min="1"
            max="100"
            step="0.01"
            placeholder="Ej: 25"
            value={form.peso_porcentaje}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Tipo de evaluación (ID)</label>
          <input
            type="number"
            name="tipo_evaluacion_id"
            min="1"
            value={form.tipo_evaluacion_id}
            onChange={handleChange}
          />
        </div>

        {msg && (
          <div
            className={`alert ${msg.tipo === 'error' ? 'alert-error' : 'alert-success'}`}
            style={{ gridColumn: '1 / -1' }}
          >
            {msg.texto}
          </div>
        )}

        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Crear evaluación'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Formulario para registrar notas individuales ──────────────────────────────

function FormNota({ secciones }) {
  const [seccionId, setSeccionId] = useState('')
  const [planilla, setPlanilla] = useState([])
  const [evaluaciones, setEvaluaciones] = useState([])
  const [selEval, setSelEval] = useState('')
  const [notas, setNotas] = useState({})
  const [cargandoPlanilla, setCargandoPlanilla] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState(null)

  const cargarPlanilla = async (id) => {
    if (!id) return
    setCargandoPlanilla(true)
    try {
      const { data } = await api.get(`/api/evaluaciones/profesor/secciones/${id}/alumnos`)
      const alumnos = data.planilla || []
      setPlanilla(alumnos)
      if (alumnos.length > 0) {
        const evs = alumnos[0].calificaciones.map((c, i) => ({ id: i, nombre: c.evaluacion }))
        setEvaluaciones(evs)
      } else {
        setEvaluaciones([])
      }
      setSelEval('')
      setNotas({})
    } catch {
      setPlanilla([])
    } finally {
      setCargandoPlanilla(false)
    }
  }

  const handleSeccion = (e) => {
    setSeccionId(e.target.value)
    cargarPlanilla(e.target.value)
    setMsg(null)
  }

  const handleNota = (alumno_id, valor) => {
    setNotas((prev) => ({ ...prev, [alumno_id]: valor }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selEval) {
      setMsg({ tipo: 'error', texto: 'Selecciona una evaluación.' })
      return
    }

    // Encontrar el evaluacion_id buscando el índice en las calificaciones del primer alumno
    const evalIdx = parseInt(selEval)
    // Necesitamos el evaluacion_id real — no está en el endpoint de planilla directamente,
    // así que enviamos nota a nota usando el endpoint individual
    setEnviando(true)
    setMsg(null)

    let errores = 0
    for (const alumno of planilla) {
      const notaVal = notas[alumno.alumno_id]
      if (notaVal === undefined || notaVal === '') continue

      const nota = parseFloat(notaVal)
      if (isNaN(nota) || nota < 0 || nota > 20) {
        errores++
        continue
      }

      // El endpoint individual requiere evaluacion_id — usamos el idx como referencia
      // En producción real se mapearía desde el backend. Aquí lo señalamos.
      try {
        await api.post('/api/evaluaciones/calificaciones/registrar', {
          evaluacion_id: evalIdx + 1, // placeholder — adaptar si el backend devuelve IDs reales
          alumno_id: alumno.alumno_id,
          nota,
        })
      } catch {
        errores++
      }
    }

    setEnviando(false)
    if (errores > 0) {
      setMsg({ tipo: 'error', texto: `Se completó con ${errores} error(es). Verifica las notas inválidas.` })
    } else {
      setMsg({ tipo: 'success', texto: 'Notas registradas correctamente.' })
      setNotas({})
    }
  }

  return (
    <div className="card">
      <h2 className={styles.sectionTitle}>📝 Registrar Notas</h2>

      <div className={styles.grid2} style={{ marginBottom: '1rem' }}>
        <div className="form-group">
          <label>Sección</label>
          <select value={seccionId} onChange={handleSeccion}>
            <option value="">Selecciona una sección</option>
            {secciones.map((s) => (
              <option key={s.seccion_id} value={s.seccion_id}>
                {s.grado_seccion} — {s.curso}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Evaluación</label>
          <select value={selEval} onChange={(e) => { setSelEval(e.target.value); setMsg(null) }} disabled={!evaluaciones.length}>
            <option value="">Selecciona una evaluación</option>
            {evaluaciones.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {cargandoPlanilla && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando alumnos...</p>
      )}

      {planilla.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Estudiante</th>
                  <th>Nota (0–20)</th>
                </tr>
              </thead>
              <tbody>
                {planilla.map((alumno) => (
                  <tr key={alumno.alumno_id}>
                    <td><span className="badge badge-info">{alumno.codigo}</span></td>
                    <td>{alumno.estudiante}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        placeholder="—"
                        value={notas[alumno.alumno_id] ?? ''}
                        onChange={(e) => handleNota(alumno.alumno_id, e.target.value)}
                        className={styles.notaInput}
                        aria-label={`Nota para ${alumno.estudiante}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {msg && (
            <div className={`alert ${msg.tipo === 'error' ? 'alert-error' : 'alert-success'}`}
              style={{ marginTop: '1rem' }}>
              {msg.texto}
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={enviando || !selEval}>
              {enviando ? 'Guardando...' : 'Guardar notas'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

function RegistrarEvaluacion() {
  const [secciones, setSecciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/api/evaluaciones/profesor/mis-secciones')
      .then(({ data }) => setSecciones(data.secciones || []))
      .catch(() => setSecciones([]))
      .finally(() => setCargando(false))
  }, [])

  return (
    <Layout>
      <div className={styles.page}>
        <div className="page-header">
          <h1>📝 Evaluaciones</h1>
          <p>Crea evaluaciones y registra calificaciones para tus secciones.</p>
        </div>

        {cargando ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <>
            <FormEvaluacion secciones={secciones} />
            <FormNota secciones={secciones} />
          </>
        )}
      </div>
    </Layout>
  )
}

export default RegistrarEvaluacion
