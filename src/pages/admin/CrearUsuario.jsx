import { useState } from 'react'
import api from '../../services/api'
import Layout from '../../components/Layout'
import styles from './Admin.module.css'

const TIPOS = ['ALUMNO', 'PROFESOR']

const CAMPOS_ALUMNO = [
  { name: 'codigo_alumno', label: 'Código de alumno', placeholder: 'Ej: A2026001' },
  { name: 'nombres',       label: 'Nombres',           placeholder: 'Juan Carlos' },
  { name: 'apellidos',     label: 'Apellidos',          placeholder: 'García López' },
  { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', placeholder: '', type: 'date' },
]

const CAMPOS_PROFESOR = [
  { name: 'codigo_empleado', label: 'Código de empleado', placeholder: 'Ej: P2026001' },
  { name: 'nombres',         label: 'Nombres',             placeholder: 'María' },
  { name: 'apellidos',       label: 'Apellidos',            placeholder: 'Torres' },
  { name: 'telefono',        label: 'Teléfono',             placeholder: '987654321' },
]

function CrearUsuario() {
  const [form, setForm] = useState({
    correo: '',
    contrasena: '',
    rol_id: '2',      // 2 = alumno por defecto según el backend
    tipo_persona: 'ALUMNO',
    datos_perfil: {},
  })
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState(null)

  const handleBase = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setMsg(null)
    // Sincronizar rol_id con tipo_persona
    if (name === 'tipo_persona') {
      setForm((prev) => ({
        ...prev,
        tipo_persona: value,
        rol_id: value === 'ALUMNO' ? '2' : '3',
        datos_perfil: {},
      }))
    }
  }

  const handlePerfil = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      datos_perfil: { ...prev.datos_perfil, [name]: value },
    }))
    setMsg(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.correo || !form.contrasena) {
      setMsg({ tipo: 'error', texto: 'Correo y contraseña son obligatorios.' })
      return
    }
    setEnviando(true)
    try {
      const { data } = await api.post('/api/usuarios/admin/crear', {
        correo: form.correo,
        contrasena: form.contrasena,
        rol_id: parseInt(form.rol_id),
        tipo_persona: form.tipo_persona,
        datos_perfil: form.datos_perfil,
      })
      setMsg({ tipo: 'success', texto: data.message })
      setForm({ correo: '', contrasena: '', rol_id: '2', tipo_persona: 'ALUMNO', datos_perfil: {} })
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.response?.data?.message || 'Error al crear el usuario.' })
    } finally {
      setEnviando(false)
    }
  }

  const camposPerfil = form.tipo_persona === 'ALUMNO' ? CAMPOS_ALUMNO : CAMPOS_PROFESOR

  return (
    <Layout>
      <div className={styles.page}>
        <div className="page-header">
          <h1>👤 Crear Usuario</h1>
          <p>Registra alumnos o profesores con sus perfiles en una sola operación.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className={styles.formWrap}>
            {/* Cuenta */}
            <fieldset className={styles.fieldset}>
              <legend>Cuenta de acceso</legend>
              <div className={styles.grid2}>
                <div className="form-group">
                  <label htmlFor="correo">Correo electrónico</label>
                  <input
                    id="correo" name="correo" type="email"
                    placeholder="usuario@colegio.edu"
                    value={form.correo} onChange={handleBase}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contrasena">Contraseña</label>
                  <input
                    id="contrasena" name="contrasena" type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={form.contrasena} onChange={handleBase}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tipo_persona">Tipo de persona</label>
                  <select id="tipo_persona" name="tipo_persona" value={form.tipo_persona} onChange={handleBase}>
                    {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Perfil dinámico */}
            <fieldset className={styles.fieldset}>
              <legend>Datos del perfil — {form.tipo_persona}</legend>
              <div className={styles.grid2}>
                {camposPerfil.map((c) => (
                  <div className="form-group" key={c.name}>
                    <label htmlFor={c.name}>{c.label}</label>
                    <input
                      id={c.name} name={c.name}
                      type={c.type || 'text'}
                      placeholder={c.placeholder}
                      value={form.datos_perfil[c.name] || ''}
                      onChange={handlePerfil}
                    />
                  </div>
                ))}
              </div>
            </fieldset>

            {msg && (
              <div className={`alert ${msg.tipo === 'error' ? 'alert-error' : 'alert-success'}`}>
                {msg.texto}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Creando...' : 'Crear usuario y perfil'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default CrearUsuario
