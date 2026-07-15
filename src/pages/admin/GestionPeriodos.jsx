import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import Layout from '../../components/Layout'
import styles from './Admin.module.css'

const VACIO = { nombre: '', fecha_inicio: '', fecha_fin: '', estado: false }

function GestionPeriodos() {
  const [periodos, setPeriodos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [form, setForm] = useState(VACIO)
  const [editando, setEditando] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState(null)

  const cargar = useCallback(() => {
    setCargando(true)
    api.get('/api/periodos')
      .then(({ data }) => setPeriodos(data.periodos || []))
      .catch(() => setMsg({ tipo: 'error', texto: 'Error al cargar periodos.' }))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    setMsg(null)
  }

  const handleEditar = (p) => {
    setEditando(p.periodo_id)
    setForm({
      nombre: p.nombre,
      fecha_inicio: p.fecha_inicio?.split('T')[0] || '',
      fecha_fin: p.fecha_fin?.split('T')[0] || '',
      estado: p.estado === true || p.estado === 1,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMsg(null)
  }

  const handleCancelar = () => { setEditando(null); setForm(VACIO); setMsg(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.fecha_inicio || !form.fecha_fin) {
      setMsg({ tipo: 'error', texto: 'Nombre y fechas son obligatorios.' })
      return
    }
    setEnviando(true)
    try {
      const payload = { ...form, estado: form.estado ? 1 : 0 }
      if (editando) {
        const { data } = await api.put(`/api/periodos/${editando}`, payload)
        setMsg({ tipo: 'success', texto: data.message })
      } else {
        const { data } = await api.post('/api/periodos', payload)
        setMsg({ tipo: 'success', texto: data.message })
      }
      setForm(VACIO); setEditando(null); cargar()
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.response?.data?.message || 'Error al guardar.' })
    } finally {
      setEnviando(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este periodo? Solo es posible si no tiene secciones ni matrículas asociadas.')) return
    try {
      const { data } = await api.delete(`/api/periodos/${id}`)
      setMsg({ tipo: 'success', texto: data.message }); cargar()
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.response?.data?.message || 'No se pudo eliminar.' })
    }
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className="page-header">
          <h1>🗓️ Gestión de Periodos</h1>
          <p>Administra los años o semestres académicos. Solo un periodo puede estar activo a la vez.</p>
        </div>

        <div className="card">
          <h2 className={styles.cardTitle}>{editando ? '✏️ Editar periodo' : '➕ Nuevo periodo'}</h2>
          <form onSubmit={handleSubmit} className={styles.grid3}>
            <div className="form-group">
              <label>Nombre</label>
              <input name="nombre" placeholder="Ej: Año Escolar 2026" value={form.nombre} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Fecha inicio</label>
              <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Fecha fin</label>
              <input name="fecha_fin" type="date" value={form.fecha_fin} onChange={handleChange} />
            </div>

            <div className={styles.checkGroup} style={{ gridColumn: '1 / -1' }}>
              <input id="estado" name="estado" type="checkbox" checked={form.estado} onChange={handleChange} />
              <label htmlFor="estado">
                Marcar como periodo <strong>activo</strong>
                <span className={styles.checkHint}> (desactivará el periodo actual)</span>
              </label>
            </div>

            {msg && (
              <div className={`alert ${msg.tipo === 'error' ? 'alert-error' : 'alert-success'}`}
                style={{ gridColumn: '1 / -1' }}>
                {msg.texto}
              </div>
            )}

            <div className={styles.formActions}>
              <button type="submit" className="btn btn-primary" disabled={enviando}>
                {enviando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear periodo'}
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
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando
                  ? <tr><td colSpan={6} className={styles.loading}>Cargando...</td></tr>
                  : periodos.length === 0
                  ? <tr><td colSpan={6} className={styles.loading}>No hay periodos registrados.</td></tr>
                  : periodos.map((p) => (
                    <tr key={p.periodo_id}>
                      <td><span className="badge badge-info">{p.periodo_id}</span></td>
                      <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                      <td>{p.fecha_inicio?.split('T')[0]}</td>
                      <td>{p.fecha_fin?.split('T')[0]}</td>
                      <td>
                        {p.estado
                          ? <span className="badge badge-success">Activo</span>
                          : <span className="badge badge-danger">Inactivo</span>
                        }
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => handleEditar(p)}>Editar</button>
                          <button className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => handleEliminar(p.periodo_id)}>Eliminar</button>
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

export default GestionPeriodos
