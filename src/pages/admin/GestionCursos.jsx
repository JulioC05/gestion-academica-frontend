import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import Layout from '../../components/Layout'
import styles from './Admin.module.css'

const VACIO = { codigo_curso: '', nombre: '', creditos: '' }

function GestionCursos() {
  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [form, setForm] = useState(VACIO)
  const [editando, setEditando] = useState(null) // id del curso que se edita
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState(null)

  const cargar = useCallback(() => {
    setCargando(true)
    api.get('/api/cursos')
      .then(({ data }) => setCursos(data.cursos || []))
      .catch(() => setMsg({ tipo: 'error', texto: 'Error al cargar los cursos.' }))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setMsg(null)
  }

  const handleEditar = (curso) => {
    setEditando(curso.curso_id)
    setForm({ codigo_curso: curso.codigo_curso, nombre: curso.nombre, creditos: String(curso.creditos) })
    setMsg(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelar = () => {
    setEditando(null)
    setForm(VACIO)
    setMsg(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.codigo_curso || !form.nombre || form.creditos === '') {
      setMsg({ tipo: 'error', texto: 'Todos los campos son obligatorios.' })
      return
    }
    setEnviando(true)
    try {
      const payload = { ...form, creditos: parseInt(form.creditos) }
      if (editando) {
        const { data } = await api.put(`/api/cursos/${editando}`, payload)
        setMsg({ tipo: 'success', texto: data.message })
      } else {
        const { data } = await api.post('/api/cursos', payload)
        setMsg({ tipo: 'success', texto: data.message })
      }
      setForm(VACIO)
      setEditando(null)
      cargar()
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.response?.data?.message || 'Error al guardar.' })
    } finally {
      setEnviando(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Confirmas la eliminación de este curso?')) return
    try {
      const { data } = await api.delete(`/api/cursos/${id}`)
      setMsg({ tipo: 'success', texto: data.message })
      cargar()
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.response?.data?.message || 'No se pudo eliminar.' })
    }
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className="page-header">
          <h1>📚 Gestión de Cursos</h1>
          <p>Catálogo de asignaturas del sistema académico.</p>
        </div>

        {/* Formulario crear / editar */}
        <div className="card">
          <h2 className={styles.cardTitle}>
            {editando ? '✏️ Editar curso' : '➕ Nuevo curso'}
          </h2>
          <form onSubmit={handleSubmit} className={styles.grid3}>
            <div className="form-group">
              <label>Código</label>
              <input name="codigo_curso" placeholder="Ej: MAT-101" value={form.codigo_curso} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input name="nombre" placeholder="Matemática I" value={form.nombre} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Créditos</label>
              <input name="creditos" type="number" min="1" placeholder="4" value={form.creditos} onChange={handleChange} />
            </div>

            {msg && (
              <div className={`alert ${msg.tipo === 'error' ? 'alert-error' : 'alert-success'}`}
                style={{ gridColumn: '1 / -1' }}>
                {msg.texto}
              </div>
            )}

            <div className={styles.formActions}>
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear curso'}
              </button>
              {editando && (
                <button type="button" className="btn btn-ghost" onClick={handleCancelar}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabla */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Créditos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando
                  ? <tr><td colSpan={5} className={styles.loading}>Cargando...</td></tr>
                  : cursos.length === 0
                  ? <tr><td colSpan={5} className={styles.loading}>No hay cursos registrados.</td></tr>
                  : cursos.map((c) => (
                    <tr key={c.curso_id}>
                      <td><span className="badge badge-info">{c.curso_id}</span></td>
                      <td style={{ fontWeight: 600 }}>{c.codigo_curso}</td>
                      <td>{c.nombre}</td>
                      <td>{c.creditos}</td>
                      <td>
                        <div className={styles.actions}>
                          <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => handleEditar(c)}>
                            Editar
                          </button>
                          <button className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => handleEliminar(c.curso_id)}>
                            Eliminar
                          </button>
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

export default GestionCursos
