import type { ModuloId, RolId } from '@/shared/tipos'

export type IconoNav =
  | 'gota'
  | 'corazon'
  | 'persona'
  | 'registro'
  | 'medalla'
  | 'buscar'
  | 'inventario'
  | 'alerta'
  | 'transferencia'
  | 'hospital'
  | 'bitacora'

export interface EntradaNav {
  etiqueta: string
  ruta: string
  modulo: ModuloId
  icono: IconoNav
  /** Roles que ven esta entrada. Derivado de la matriz del SRS. */
  roles: RolId[]
}

/**
 * RNF-02 y matriz de usuarios contra modulos.
 *
 * Esta lista es la unica fuente de la navegacion. Una entrada cuyo rol no
 * este en `roles` NO se renderiza: no aparece deshabilitada ni con candado,
 * porque la interfaz no debe insinuar que existe lo que no corresponde.
 */
export const NAVEGACION: EntradaNav[] = [
  // M1 — Gestion de Donantes
  { etiqueta: 'Inicio', ruta: '/donantes/bienvenida', modulo: 'M1', icono: 'corazon', roles: ['U1'] },
  { etiqueta: 'Quiero donar', ruta: '/donantes/registro-anonimo', modulo: 'M1', icono: 'gota', roles: ['U1'] },
  // Solo U1: quien ya tiene perfil no vuelve a crearlo.
  { etiqueta: 'Crear mi perfil', ruta: '/donantes/registro-perfil', modulo: 'M1', icono: 'persona', roles: ['U1'] },
  { etiqueta: 'Mi perfil', ruta: '/donantes/perfil', modulo: 'M1', icono: 'persona', roles: ['U2'] },
  { etiqueta: 'Mi historial', ruta: '/donantes/historial', modulo: 'M1', icono: 'registro', roles: ['U2'] },
  { etiqueta: 'Mis reconocimientos', ruta: '/donantes/reconocimientos', modulo: 'M1', icono: 'medalla', roles: ['U2'] },
  { etiqueta: 'Consultar donante', ruta: '/donantes/consulta', modulo: 'M1', icono: 'buscar', roles: ['U3', 'U4'] },

  // M3 — Ciclo de Vida de la Unidad
  { etiqueta: 'Registrar donacion', ruta: '/ciclovida/registro-donacion', modulo: 'M3', icono: 'gota', roles: ['U3'] },
  { etiqueta: 'Unidades', ruta: '/ciclovida/unidades', modulo: 'M3', icono: 'registro', roles: ['U3', 'U4', 'U5', 'U6', 'U7'] },

  // M4 — Inventario y Distribucion
  { etiqueta: 'Inventario', ruta: '/inventario', modulo: 'M4', icono: 'inventario', roles: ['U3', 'U4'] },
  { etiqueta: 'Alertas', ruta: '/inventario/alertas', modulo: 'M4', icono: 'alerta', roles: ['U3', 'U4'] },
  { etiqueta: 'Transferencias', ruta: '/inventario/transferencias', modulo: 'M4', icono: 'transferencia', roles: ['U4'] },
  /*
    Dos entradas y no una: el coordinador territorial agrega los bancos de su
    departamento, y el administrador nacional agrega departamentos. RNF-02
    restringe al primero y no al segundo, porque su jurisdiccion es el pais.
    El auditor sigue en la vista territorial — pendiente de M4-U7-01.
  */
  { etiqueta: 'Inventario de mi jurisdiccion', ruta: '/inventario/jurisdiccion', modulo: 'M4', icono: 'hospital', roles: ['U5', 'U7'] },
  { etiqueta: 'Inventario nacional', ruta: '/inventario/nacional', modulo: 'M4', icono: 'hospital', roles: ['U6'] },

  // Transversal
  { etiqueta: 'Bitacora de auditoria', ruta: '/bitacora', modulo: 'TR', icono: 'bitacora', roles: ['U7'] },
]

export function navegacionDe(rol: RolId): EntradaNav[] {
  return NAVEGACION.filter((entrada) => entrada.roles.includes(rol))
}

/** Primera ruta con sentido para cada perfil al entrar. */
export const RUTA_INICIAL: Record<RolId, string> = {
  U1: '/donantes/bienvenida',
  U2: '/donantes/perfil',
  U3: '/inventario',
  U4: '/inventario',
  U5: '/inventario/jurisdiccion',
  U6: '/inventario/nacional',
  U7: '/bitacora',
}
