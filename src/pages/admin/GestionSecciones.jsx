import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import Layout from '../../components/Layout'
import styles from './Admin.module.css'

const VACIO = {
  curso_id: '', periodo_id: '', profesor_id: '',
  codigo_seccion: '', cupo_maximo: '', cupos_disponibles: '', horario: '',
}

function GestionSecciones() {
  const [secciones, setSecciones]   = useState([])
  const [cursos, setCursos]         = useState([])
  const [periodos, setPeriodos]     = useState([])
  const [profesores, setProfesores] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [form, setForm]             = useState(VACIO)
  const [editando, setEditando]     = useState(null)
  const [enviando, setEnviando]     = useState(false)
  const [msg, setMsg]               = useState(null)

  const cargarCatalogos = useCallback(async () => {
    try {
      const [secRes, curRes, perRes] = await Promise.all([
        api.get('/api/secciones'),
        api.get('/api/cursos'),
        api.get('/api/periodos'),
      ])
      setSecciones(secRes.data.secciones || [])
      setCursos(curRes.data.cursos || [])
      setPeriodos(perRes.data.periodos || [])

      // Obtener profesores desde mis-secciones o la lista de secciones (extraer únicos)
      const profsRaw = (secRes.data.secciones || []).map((s) => ({
        id: s.seccion_id, // placeholder — en producción habría un endpoint /api/profesores
        nombre: s.profesor,
      }))
      // Como no hay endpoint /api/profesores, dejamos la carga desde secciones existentes
      // El admin puede ingresar el profesor_id manual
    } catch {
      setMsg({ tipo: 'error', texto: 'Error al cargar los catálogos.' })
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarCatalogos() }, [cargarCatalogos])

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setMsg(null)
  }

  const handleEditar = (s) => {
    setEditando(s.seccion_id)
    setForm({
      curso_id: String(s.curso_id || ''),
      periodo_id: String(s.periodo_id || ''),
      profesor_id: String(s.profesor_id || ''),
      codigo_seccion: s.grado_seccion,
      cupo_maximo: String(s.cupo_maximo),
      cupos_disponibles: String(s.cupos_disponibles),
      horario: s.horario,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMsg(null)
  }

  const handleCancelar = () => { setEditando(null); setForm(VACIO); setMsg(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const requeridos = ['curso_id','periodo_id','profesor_id','codigo_seccion','cupo_maximo','horario']
    if (requeridos.some((k) => !form[k])) {
      setMsg({ tipo: 'error', texto: 'Completa todos los campos obligatorios.' })
      return
    }
    setEnviando(true)
    try {
      const payload = {
        ...form,
        curso_id: parseInt(form.curso_id),
        periodo_id: parseInt(form.periodo_id),
        profesor_id: parseInt(form.profesor_id),
        cupo_maximo: parseInt(form.cupo_maximo),
        cupos_disponibles: editando ? parseInt(form.cupos_disponibles) : parseInt(form.cupo_maximo),
      }
      if (editando) {
        const { data } = await api.put(`/api/secciones/${editando}`, payload)
        setMsg({ tipo: 'success', texto: data.message })
      } else {
        const { data } = await api.post('/api/secciones', payload)
        setMsg({ tipo: 'success', texto: data.message })
      }
      setForm(VACIO); setEditando(null); cargarCatalogos()
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.response?.data?.message || 'Error al guardar.' })
    } finally {
      setEnviando(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta sección? Solo es posible si no tiene alumnos matriculados.')) return
    try {
      const { data } = await api.delete(`/api/secciones/${id}`)
      setMsg({ tipo: 'success', texto: data.message }); cargarCatalogos()
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.response?.data?.message || 'No se pudo eliminar.' })
    }
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className="page-header">
          <h1>🏛️ Gestión de Secciones</h1>
          <p>Crea y configura aulas del periodo académico activo.</p>
        </div>

        <div className="card">
          <h2 className={styles.cardTitle}>{editando ? '✏️ Editar sección' : '➕ Nueva sección'}</h2>
          <form onSubmit={handleSubmit} className={styles.grid3}>
            {/* Selects de catálogo */}
            <div className="form-group">
              <label>Curso</label>
              <select name="curso_id" value={form.curso_id} onChange={handleChange}>
                <option value="">Selecciona un curso</option>
                {cursos.map((c) => <option key={c.curso_id} value={c.curso_id}>{c.nombre}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Periodo</label>
              <select name="periodo_id" value={form.periodo_id} onChange={handleChange}>
                <option value="">Selecciona un periodo</option>
                {periodos.map((p) => <option key={p.periodo_id} value={p.periodo_id}>{p.nombre}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>ID del Profesor</label>
              <input
                name="profesor_id" type="number" min="1"
                placeholder="ID numérico del profesor"
                value={form.profesor_id} onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Código de sección</label>
              <input name="codigo_seccion" placeholder="Ej: 5A-MAT" value={form.codigo_seccion} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Cupo máximo</label>
              <input name="cupo_maximo" type="number" min="1" placeholder="30" value={form.cupo_maximo} onChange={handleChange} />
            </div>

            {editando && (
              <div className="form-group">
                <label>Cupos disponibles</label>
                <input name="cupos_disponibles" type="number" min="0" value={form.cupos_disponibles} onChange={handleChange} />
              </div>
            )}

            <div className="form-group" style={{ gridColumn: editando ? 'auto' : '1 / -1' }}>
              <label>Horario</label>
              <input name="horario" placeholder="Ej: Lunes y Miércoles 08:00-10:00" value={form.horario} onChange={handleChange} />
            </div>

            {msg && (
              <div className={`alert ${msg.tipo === 'error' ? 'alert-error' : 'alert-success'}`}
                style={{ gridColumn: '1 / -1' }}>
                {msg.texto}
              </div>
            )}

            <div className={styles.formActions}>
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear sección'}
              </button>
              {editando && (
                <button type="button" className="btn btn-ghost" onClick={handleCancelar}>Cancelar</button>
              )}
            </div>
          </form>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sección</th>
                  <th>Curso</th>
                  <th>Periodo</th>
                  <th>Profesor</th>
                  <th>Horario</th>
                  <th>Cupos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando
                  ? <tr><td colSpan={7} className={styles.loading}>Cargando...</td></tr>
                  : secciones.length === 0
                  ? <tr><td colSpan={7} className={styles.loading}>No hay secciones registradas.</td></tr>
                  : secciones.map((s) => (
                    <tr key={s.seccion_id}>
                      <td style={{ fontWeight: 600 }}>{s.grado_seccion}</td>
                      <td>{s.curso}</td>
                      <td>{s.periodo}</td>
                      <td>{s.profesor}</td>
                      <td><span className="badge badge-info">{s.horario}</span></td>
                      <td>
                        <span className={`badge ${s.cupos_disponibles > 0 ? 'badge-success' : 'badge-danger'}`}>
                          {s.cupos_disponibles}/{s.cupo_maximo}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => handleEditar(s)}>Editar</button>
                          <button className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => handleEliminar(s.seccion_id)}>Eliminar</button>
                        </div>
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

export default GestionSecciones
