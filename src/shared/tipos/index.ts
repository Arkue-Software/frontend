/**
 * Tipos compartidos del prototipo de RedVital.
 *
 * Restriccion RNF-01: en ninguna parte de este archivo existe un campo que
 * pueda almacenar la causa clinica de una unidad no apta. La restriccion se
 * aplica en el modelo, no solo en la pantalla: lo que no se modela no se
 * puede exponer despues por descuido.
 */

export type RolId = 'U1' | 'U2' | 'U3' | 'U4' | 'U5' | 'U6' | 'U7'

export interface Rol {
  id: RolId
  nombre: string
  descripcion: string
  /** Ambito de datos que le corresponde. Alimenta RNF-02. */
  jurisdiccion: string
  /** Modulos visibles en la navegacion, segun la matriz del SRS. */
  modulos: ModuloId[]
}

export type ModuloId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'TR'

/** Los cuatro unicos estados que una unidad puede mostrar. Sin causa. */
export type EstadoUnidad = 'apta' | 'no apta' | 'vencida' | 'desechada'

export type ComponenteSanguineo = 'Globulos rojos' | 'Plasma' | 'Plaquetas'

export type TipoSangre =
  | 'O+'
  | 'O-'
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'

export interface EventoTrazabilidad {
  fecha: string
  evento: string
  responsable: string
  /**
   * Nota operativa del evento. NUNCA contiene resultado de tamizaje ni
   * diagnostico: el formulario de tamizaje no captura motivo (ver M3-U3-06).
   */
  detalle: string
}

export interface Unidad {
  codigo: string
  componente: ComponenteSanguineo
  tipoSangre: TipoSangre
  estado: EstadoUnidad
  bancoId: string
  donacionId: string
  fechaCaptacion: string
  fechaVencimiento: string
  trazabilidad: EventoTrazabilidad[]
}

export interface Donacion {
  id: string
  /** Codigo anonimo o identificador sintetico del donante. */
  donante: string
  bancoId: string
  campana: string | null
  fecha: string
  unidadesGeneradas: number
}

export interface Banco {
  id: string
  nombre: string
  municipio: string
  departamento: string
}

/**
 * Consolidado de un departamento. Solo aparece en la vista del administrador
 * nacional: su jurisdiccion es el pais, asi que para el no hay ambito ajeno.
 *
 * RNF-01 sigue vigente aqui. `tasaNoAptas` es un porcentaje agregado y no hay
 * ningun campo que lo desglose por causa, del mismo modo que en el resto del
 * modelo.
 */
export interface ConsolidadoDepartamento {
  departamento: string
  bancosActivos: number
  unidadesDisponibles: number
  combinacionesBajoUmbral: number
  /** Porcentaje agregado de unidades no aptas. Sin desglose posible. */
  tasaNoAptas: number
}

export interface ExistenciaInventario {
  componente: ComponenteSanguineo
  tipoSangre: TipoSangre
  disponibles: number
  umbralMinimo: number
  proximasAVencer: number
}

export interface Transferencia {
  id: string
  origen: string
  destino: string
  componente: ComponenteSanguineo
  tipoSangre: TipoSangre
  unidades: number
  estado: 'sugerida' | 'solicitada' | 'aprobada' | 'rechazada' | 'en transito'
  fecha: string
}

export interface DonacionHistorial {
  fecha: string
  banco: string
  campana: string | null
  /**
   * Deliberadamente NO existe un campo de resultado de tamizaje.
   * Ver zona gris 12.3 (h) del inventario de pantallas: el donante ve que
   * dono, no que paso con su sangre. Decision pendiente del Product Owner.
   */
}

export interface Reconocimiento {
  id: string
  nombre: string
  descripcion: string
  obtenido: boolean
  fecha?: string
}

export interface Campana {
  id: string
  nombre: string
  banco: string
  municipio: string
  fecha: string
  cuposTotales: number
  cuposDisponibles: number
}

export interface EventoBitacora {
  id: string
  fecha: string
  actor: string
  accion: string
  resultado: 'permitido' | 'denegado'
  recurso: string
}
