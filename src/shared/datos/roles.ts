import type { Rol, RolId } from '@/shared/tipos'

/**
 * Los siete perfiles del SRS v2.0 (seccion 6) y los modulos que cada uno ve.
 *
 * RNF-02: la lista `modulos` es la unica fuente de la navegacion. Un modulo
 * que no esta aqui NO aparece en el menu, ni deshabilitado ni con candado.
 * Derivado de la matriz de usuarios contra modulos (srs.md seccion 3).
 */
export const ROLES: Record<RolId, Rol> = {
  U1: {
    id: 'U1',
    nombre: 'Donante anonimo',
    descripcion: 'Dona sin entregar datos personales. Sin perfil persistente.',
    jurisdiccion: 'Sin ambito institucional',
    modulos: ['M1', 'M2'],
  },
  U2: {
    id: 'U2',
    nombre: 'Donante registrado',
    descripcion: 'Tiene perfil, historial y consentimiento de datos.',
    jurisdiccion: 'Sus propios datos',
    modulos: ['M1', 'M2'],
  },
  U3: {
    id: 'U3',
    nombre: 'Operador de banco',
    descripcion:
      'Unico perfil que escribe el ciclo de vida de la unidad que custodia.',
    jurisdiccion: 'Banco Distrital de Sangre (sintetico)',
    modulos: ['M1', 'M2', 'M3', 'M4'],
  },
  U4: {
    id: 'U4',
    nombre: 'Administrador de banco',
    descripcion: 'Responsable de la institucion. El panel mas cargado.',
    jurisdiccion: 'Banco Distrital de Sangre (sintetico)',
    modulos: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
  },
  U5: {
    id: 'U5',
    nombre: 'Coordinador territorial',
    descripcion: 'Direccion de salud departamental. Solo su jurisdiccion.',
    jurisdiccion: 'Departamento Ejemplo Norte (sintetico)',
    modulos: ['M2', 'M3', 'M4', 'M5', 'M6'],
  },
  U6: {
    id: 'U6',
    nombre: 'Administrador nacional',
    descripcion: 'Ministerio de Salud. Vista nacional consolidada.',
    jurisdiccion: 'Territorio nacional',
    modulos: ['M2', 'M3', 'M4', 'M5', 'M6'],
  },
  U7: {
    id: 'U7',
    nombre: 'Auditor',
    descripcion: 'Verificacion de cumplimiento. No escribe en ningun modulo.',
    jurisdiccion: 'Bitacora de auditoria',
    modulos: ['M3', 'M4', 'M5'],
  },
}

export const LISTA_ROLES: Rol[] = Object.values(ROLES)
