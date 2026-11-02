import type { RolId } from '@/shared/tipos'

export type IconoNav =
  | 'gota'
  | 'corazon'
  | 'persona'
  | 'registro'
  | 'medalla'
  | 'buscar'
  | 'inventario'
  | 'alerta'
  | 'calendario'
  | 'ubicacion'
  | 'institucion'
  | 'grafica'
  | 'escudo'

export interface EntradaNav {
  etiqueta: string
  ruta: string
  icono: IconoNav
  /** Perfiles que ven esta entrada (matriz del SRS V4.0, sección 4). */
  roles: RolId[]
}

/**
 * Única fuente de la navegación (TR-03, RNF-02). Una entrada cuyo perfil no
 * está en `roles` no se dibuja: no aparece deshabilitada ni con candado.
 *
 * Los perfiles salen de la matriz normativa del DD V3.0 (sección 15.5).
 * Transferencias y convocatorias (M5) no se ofrecen: dependen del proceso de
 * escalamiento, que no forma parte de esta versión.
 */
export const NAVEGACION: EntradaNav[] = [
  // Visitante sin sesión (U1)
  { etiqueta: 'Inicio', ruta: '/', icono: 'corazon', roles: ['U1'] },
  { etiqueta: 'Quiero donar', ruta: '/donar', icono: 'gota', roles: ['U1'] },
  { etiqueta: 'Jornadas', ruta: '/jornadas', icono: 'calendario', roles: ['U1', 'U2'] },
  { etiqueta: 'Consultar mi registro', ruta: '/donar/consulta', icono: 'buscar', roles: ['U1'] },

  // M1 — Donante registrado (U2)
  { etiqueta: 'Mi perfil', ruta: '/donantes/perfil', icono: 'persona', roles: ['U2'] },
  { etiqueta: 'Mi historial', ruta: '/donantes/historial', icono: 'registro', roles: ['U2'] },
  { etiqueta: 'Mis reconocimientos', ruta: '/donantes/reconocimientos', icono: 'medalla', roles: ['U2'] },

  // M3 — Trazabilidad (U3 escribe; U4, U5 y U6 consultan; U7 llega por la bitácora)
  { etiqueta: 'Registrar donación', ruta: '/ciclovida/registro-donacion', icono: 'gota', roles: ['U3'] },
  { etiqueta: 'Unidades', ruta: '/ciclovida/unidades', icono: 'registro', roles: ['U3', 'U4', 'U5', 'U6'] },
  // M1 — Solo el operador busca al donante presente
  { etiqueta: 'Consultar donante', ruta: '/donantes/consulta', icono: 'buscar', roles: ['U3'] },

  // M4 — Inventario (U5 y U6 en lectura) y alertas (U5 en lectura)
  { etiqueta: 'Inventario', ruta: '/inventario', icono: 'inventario', roles: ['U3', 'U4', 'U5', 'U6'] },
  { etiqueta: 'Alertas', ruta: '/inventario/alertas', icono: 'alerta', roles: ['U3', 'U4', 'U5'] },

  // M2 — Campañas de la jurisdicción
  { etiqueta: 'Campañas', ruta: '/campanias', icono: 'calendario', roles: ['U3', 'U4', 'U5', 'U6'] },

  // M7 — Indicadores, solo lectura
  { etiqueta: 'Indicadores', ruta: '/indicadores', icono: 'grafica', roles: ['U4', 'U5', 'U6'] },

  // M6 — Red territorial e institucional (U5 y U6 escriben; U4 y U7 consultan)
  { etiqueta: 'Instituciones', ruta: '/instituciones', icono: 'institucion', roles: ['U4', 'U5', 'U6', 'U7'] },
  { etiqueta: 'Territorios', ruta: '/territorios', icono: 'ubicacion', roles: ['U4', 'U5', 'U6', 'U7'] },

  // ST2 — Bitácora, solo el auditor
  { etiqueta: 'Bitácora', ruta: '/auditoria', icono: 'escudo', roles: ['U7'] },
]

export function navegacionDe(rol: RolId): EntradaNav[] {
  return NAVEGACION.filter((entrada) => entrada.roles.includes(rol))
}

/** Primera pantalla con sentido para cada perfil al entrar. */
export const RUTA_INICIAL: Record<RolId, string> = {
  U1: '/',
  U2: '/donantes/perfil',
  U3: '/ciclovida/unidades',
  U4: '/inventario',
  U5: '/indicadores',
  U6: '/indicadores',
  U7: '/auditoria',
}

/** Rutas a las que puede volver un perfil después de iniciar sesión. */
export function rutaPermitida(rol: RolId, ruta: string): boolean {
  if (ruta === '/ingresar' || ruta === '/registro') return false
  return NAVEGACION.some(
    (e) => e.roles.includes(rol) && e.ruta !== '/' && (ruta === e.ruta || ruta.startsWith(e.ruta + '/')),
  )
}
