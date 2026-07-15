import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import styles from './Dashboard.module.css'

// Tarjetas de acceso rápido por rol
const CARDS_ALUMNO = [
  {
    icon: '📊',
    title: 'Mis Notas',
    desc: 'Consulta tu libreta de calificaciones y promedios por curso.',
    ruta: '/mis-notas',
    color: '#3b82f6',
  },
]

const CARDS_PROFESOR = [
  {
    icon: '🏫',
    title: 'Mis Secciones',
    desc: 'Ver las aulas asignadas a tu cargo en el periodo activo.',
    ruta: '/mis-secciones',
    color: '#8b5cf6',
  },
  {
    icon: '📝',
    title: 'Registrar Evaluación',
    desc: 'Crear evaluaciones y registrar notas para tus alumnos.',
    ruta: '/evaluar',
    color: '#06b6d4',
  },
]

const CARDS_ADMIN = [
  {
    icon: '📊',
    title: 'Notas de Alumno',
    desc: 'Consultar libreta de cualquier estudiante del sistema.',
    ruta: '/mis-notas',
    color: '#3b82f6',
  },
  {
    icon: '🏫',
    title: 'Secciones',
    desc: 'Revisar planillas de alumnos inscritos por sección.',
    ruta: '/mis-secciones',
    color: '#8b5cf6',
  },
  {
    icon: '📝',
    title: 'Evaluaciones',
    desc: 'Configurar evaluaciones y registrar calificaciones.',
    ruta: '/evaluar',
    color: '#06b6d4',
  },
  {
    icon: '👤',
    title: 'Usuarios',
    desc: 'Crear cuentas de alumnos y profesores.',
    ruta: '/admin/usuarios',
    color: '#f59e0b',
  },
  {
    icon: '📚',
    title: 'Cursos',
    desc: 'Gestionar el catálogo de asignaturas.',
    ruta: '/admin/cursos',
    color: '#10b981',
  },
  {
    icon: '🗓️',
    title: 'Periodos',
    desc: 'Administrar los años o semestres académicos.',
    ruta: '/admin/periodos',
    color: '#ef4444',
  },
  {
    icon: '🏛️',
    title: 'Secciones',
    desc: 'Crear y configurar aulas del periodo.',
    ruta: '/admin/secciones',
    color: '#ec4899',
  },
]

const GREETING = {
  ALUMNO:        { saludo: 'Bienvenido, estudiante', sub: 'Revisa tu rendimiento académico.' },
  PROFESOR:      { saludo: 'Hola, docente', sub: 'Gestiona tus aulas y calificaciones.' },
  ADMIN:         { saludo: 'Panel de Administración', sub: 'Control total del sistema académico.' },
  ADMINISTRADOR: { saludo: 'Panel de Administración', sub: 'Control total del sistema académico.' },
}

function Dashboard() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const rol = usuario?.rol || 'ALUMNO'

  const info = GREETING[rol] || GREETING.ALUMNO
  const cards =
    rol === 'ALUMNO'
      ? CARDS_ALUMNO
      : rol === 'PROFESOR'
      ? CARDS_PROFESOR
      : CARDS_ADMIN

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.welcome}>
          <h1>{info.saludo}</h1>
          <p>{info.sub}</p>
          <span className={styles.tag}>{rol}</span>
        </div>

        <div className={styles.grid}>
          {cards.map((card) => (
            <button
              key={card.ruta}
              className={styles.card}
              style={{ '--card-color': card.color }}
              onClick={() => navigate(card.ruta)}
            >
              <span className={styles.cardIcon}>{card.icon}</span>
              <div className={styles.cardBody}>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
              <span className={styles.cardArrow}>→</span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
