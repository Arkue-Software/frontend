import type {
  Banco,
  ConsolidadoDepartamento,
  Campana,
  Donacion,
  DonacionHistorial,
  EventoBitacora,
  ExistenciaInventario,
  Reconocimiento,
  Transferencia,
  Unidad,
} from '@/shared/tipos'

/**
 * DATOS SINTETICOS.
 *
 * Todo lo que hay aqui es inventado y debe verse como inventado:
 *  - los codigos de unidad llevan el prefijo DEMO-
 *  - los bancos tienen nombres genericos, no instituciones reales
 *  - los departamentos y municipios son ficticios
 *  - los donantes son codigos, nunca nombres de personas
 *
 * Restriccion 5 de ui-prototipos.md: los datos de ejemplo deben ser
 * evidentemente sinteticos.
 */

export const BANCOS: Banco[] = [
  {
    id: 'BS-01',
    nombre: 'Banco Distrital de Sangre',
    municipio: 'Ciudad Ejemplo',
    departamento: 'Ejemplo Norte',
  },
  {
    id: 'BS-02',
    nombre: 'Banco Hospital Central',
    municipio: 'Ciudad Ejemplo',
    departamento: 'Ejemplo Norte',
  },
  {
    id: 'BS-03',
    nombre: 'Banco Regional Norte',
    municipio: 'Villa Sintetica',
    departamento: 'Ejemplo Norte',
  },
  {
    id: 'BS-04',
    nombre: 'Banco Municipal del Valle Ficticio',
    municipio: 'Pueblo Demo',
    departamento: 'Ejemplo Norte',
  },
]

export const BANCO_ACTUAL = BANCOS[0]

export const INVENTARIO: ExistenciaInventario[] = [
  { componente: 'Globulos rojos', tipoSangre: 'O+', disponibles: 42, umbralMinimo: 30, proximasAVencer: 6 },
  { componente: 'Globulos rojos', tipoSangre: 'O-', disponibles: 8, umbralMinimo: 20, proximasAVencer: 3 },
  { componente: 'Globulos rojos', tipoSangre: 'A+', disponibles: 31, umbralMinimo: 25, proximasAVencer: 2 },
  { componente: 'Globulos rojos', tipoSangre: 'A-', disponibles: 12, umbralMinimo: 10, proximasAVencer: 0 },
  { componente: 'Globulos rojos', tipoSangre: 'B+', disponibles: 19, umbralMinimo: 15, proximasAVencer: 1 },
  { componente: 'Globulos rojos', tipoSangre: 'B-', disponibles: 4, umbralMinimo: 8, proximasAVencer: 0 },
  { componente: 'Globulos rojos', tipoSangre: 'AB+', disponibles: 7, umbralMinimo: 5, proximasAVencer: 0 },
  { componente: 'Globulos rojos', tipoSangre: 'AB-', disponibles: 0, umbralMinimo: 4, proximasAVencer: 0 },
  { componente: 'Plaquetas', tipoSangre: 'O+', disponibles: 11, umbralMinimo: 18, proximasAVencer: 5 },
  { componente: 'Plaquetas', tipoSangre: 'O-', disponibles: 3, umbralMinimo: 10, proximasAVencer: 2 },
  { componente: 'Plaquetas', tipoSangre: 'A+', disponibles: 14, umbralMinimo: 12, proximasAVencer: 4 },
  { componente: 'Plaquetas', tipoSangre: 'B+', disponibles: 9, umbralMinimo: 8, proximasAVencer: 1 },
  { componente: 'Plasma', tipoSangre: 'O+', disponibles: 55, umbralMinimo: 25, proximasAVencer: 0 },
  { componente: 'Plasma', tipoSangre: 'A+', disponibles: 48, umbralMinimo: 25, proximasAVencer: 1 },
  { componente: 'Plasma', tipoSangre: 'B+', disponibles: 22, umbralMinimo: 15, proximasAVencer: 0 },
  { componente: 'Plasma', tipoSangre: 'AB+', disponibles: 16, umbralMinimo: 10, proximasAVencer: 0 },
]

export const UNIDADES: Unidad[] = [
  {
    codigo: 'DEMO-U-004821',
    componente: 'Globulos rojos',
    tipoSangre: 'O+',
    estado: 'apta',
    bancoId: 'BS-01',
    donacionId: 'DEMO-D-1204',
    fechaCaptacion: '2026-08-14',
    fechaVencimiento: '2026-09-18',
    trazabilidad: [
      { fecha: '2026-08-14 09:12', evento: 'Captacion registrada', responsable: 'Operador 07', detalle: 'Donacion DEMO-D-1204 recibida en el banco.' },
      { fecha: '2026-08-14 10:40', evento: 'Fraccionamiento', responsable: 'Operador 07', detalle: 'La donacion genero 3 unidades trazables.' },
      { fecha: '2026-08-15 08:05', evento: 'Resultado de tamizaje', responsable: 'Laboratorio 02', detalle: 'Resultado registrado: apta.' },
      { fecha: '2026-08-15 08:30', evento: 'Ingreso a inventario', responsable: 'Sistema', detalle: 'Disponible para transfusion o transferencia.' },
    ],
  },
  {
    codigo: 'DEMO-U-004822',
    componente: 'Plaquetas',
    tipoSangre: 'O+',
    estado: 'no apta',
    bancoId: 'BS-01',
    donacionId: 'DEMO-D-1204',
    fechaCaptacion: '2026-08-14',
    fechaVencimiento: '2026-08-19',
    trazabilidad: [
      { fecha: '2026-08-14 09:12', evento: 'Captacion registrada', responsable: 'Operador 07', detalle: 'Donacion DEMO-D-1204 recibida en el banco.' },
      { fecha: '2026-08-14 10:40', evento: 'Fraccionamiento', responsable: 'Operador 07', detalle: 'La donacion genero 3 unidades trazables.' },
      // RNF-01: el evento registra el resultado, nunca el motivo.
      { fecha: '2026-08-15 08:05', evento: 'Resultado de tamizaje', responsable: 'Laboratorio 02', detalle: 'Resultado registrado: no apta.' },
      { fecha: '2026-08-15 09:00', evento: 'Excluida del inventario disponible', responsable: 'Sistema', detalle: 'Pasa al protocolo de disposicion final.' },
    ],
  },
  {
    codigo: 'DEMO-U-004823',
    componente: 'Plasma',
    tipoSangre: 'O+',
    estado: 'apta',
    bancoId: 'BS-01',
    donacionId: 'DEMO-D-1204',
    fechaCaptacion: '2026-08-14',
    fechaVencimiento: '2027-08-14',
    trazabilidad: [
      { fecha: '2026-08-14 09:12', evento: 'Captacion registrada', responsable: 'Operador 07', detalle: 'Donacion DEMO-D-1204 recibida en el banco.' },
      { fecha: '2026-08-14 10:40', evento: 'Fraccionamiento', responsable: 'Operador 07', detalle: 'La donacion genero 3 unidades trazables.' },
      { fecha: '2026-08-15 08:05', evento: 'Resultado de tamizaje', responsable: 'Laboratorio 02', detalle: 'Resultado registrado: apta.' },
      { fecha: '2026-08-15 08:30', evento: 'Ingreso a inventario', responsable: 'Sistema', detalle: 'Disponible para transfusion o transferencia.' },
    ],
  },
  {
    codigo: 'DEMO-U-004790',
    componente: 'Plaquetas',
    tipoSangre: 'A+',
    estado: 'vencida',
    bancoId: 'BS-01',
    donacionId: 'DEMO-D-1188',
    fechaCaptacion: '2026-08-08',
    fechaVencimiento: '2026-08-13',
    trazabilidad: [
      { fecha: '2026-08-08 11:20', evento: 'Captacion registrada', responsable: 'Operador 03', detalle: 'Donacion DEMO-D-1188 recibida en el banco.' },
      { fecha: '2026-08-08 12:15', evento: 'Fraccionamiento', responsable: 'Operador 03', detalle: 'La donacion genero 2 unidades trazables.' },
      { fecha: '2026-08-09 07:50', evento: 'Resultado de tamizaje', responsable: 'Laboratorio 01', detalle: 'Resultado registrado: apta.' },
      { fecha: '2026-08-13 00:01', evento: 'Exclusion automatica por vencimiento', responsable: 'Sistema', detalle: 'RNF-08: retirada del inventario disponible sin intervencion manual.' },
    ],
  },
  {
    codigo: 'DEMO-U-004755',
    componente: 'Globulos rojos',
    tipoSangre: 'B-',
    estado: 'desechada',
    bancoId: 'BS-01',
    donacionId: 'DEMO-D-1170',
    fechaCaptacion: '2026-07-30',
    fechaVencimiento: '2026-09-03',
    trazabilidad: [
      { fecha: '2026-07-30 14:05', evento: 'Captacion registrada', responsable: 'Operador 05', detalle: 'Donacion DEMO-D-1170 recibida en el banco.' },
      { fecha: '2026-07-30 15:00', evento: 'Fraccionamiento', responsable: 'Operador 05', detalle: 'La donacion genero 3 unidades trazables.' },
      { fecha: '2026-07-31 08:10', evento: 'Resultado de tamizaje', responsable: 'Laboratorio 02', detalle: 'Resultado registrado: no apta.' },
      { fecha: '2026-08-01 10:30', evento: 'Disposicion final ejecutada', responsable: 'Operador 05', detalle: 'Protocolo completado. Constancia DEMO-C-0912.' },
    ],
  },
  {
    codigo: 'DEMO-U-004801',
    componente: 'Globulos rojos',
    tipoSangre: 'O-',
    estado: 'apta',
    bancoId: 'BS-01',
    donacionId: 'DEMO-D-1195',
    fechaCaptacion: '2026-08-11',
    fechaVencimiento: '2026-09-15',
    trazabilidad: [
      { fecha: '2026-08-11 08:40', evento: 'Captacion registrada', responsable: 'Operador 07', detalle: 'Donacion DEMO-D-1195 recibida en el banco.' },
      { fecha: '2026-08-11 09:30', evento: 'Fraccionamiento', responsable: 'Operador 07', detalle: 'La donacion genero 2 unidades trazables.' },
      { fecha: '2026-08-12 07:55', evento: 'Resultado de tamizaje', responsable: 'Laboratorio 01', detalle: 'Resultado registrado: apta.' },
      { fecha: '2026-08-12 08:20', evento: 'Ingreso a inventario', responsable: 'Sistema', detalle: 'Disponible para transfusion o transferencia.' },
    ],
  },
]

export const DONACIONES: Donacion[] = [
  { id: 'DEMO-D-1204', donante: 'DEMO-AN-77Q4', bancoId: 'BS-01', campana: 'Jornada Universidad Ficticia', fecha: '2026-08-14', unidadesGeneradas: 3 },
  { id: 'DEMO-D-1195', donante: 'DEMO-REG-0042', bancoId: 'BS-01', campana: null, fecha: '2026-08-11', unidadesGeneradas: 2 },
  { id: 'DEMO-D-1188', donante: 'DEMO-AN-31KZ', bancoId: 'BS-01', campana: 'Jornada Plaza Central', fecha: '2026-08-08', unidadesGeneradas: 2 },
]

export const TRANSFERENCIAS: Transferencia[] = [
  { id: 'DEMO-T-0431', origen: 'BS-02', destino: 'BS-01', componente: 'Globulos rojos', tipoSangre: 'O-', unidades: 10, estado: 'sugerida', fecha: '2026-08-27' },
  { id: 'DEMO-T-0430', origen: 'BS-01', destino: 'BS-03', componente: 'Plasma', tipoSangre: 'O+', unidades: 12, estado: 'aprobada', fecha: '2026-08-25' },
  { id: 'DEMO-T-0428', origen: 'BS-04', destino: 'BS-01', componente: 'Plaquetas', tipoSangre: 'O-', unidades: 6, estado: 'rechazada', fecha: '2026-08-23' },
  { id: 'DEMO-T-0425', origen: 'BS-03', destino: 'BS-01', componente: 'Globulos rojos', tipoSangre: 'B-', unidades: 4, estado: 'en transito', fecha: '2026-08-21' },
]

export const HISTORIAL_DONANTE: DonacionHistorial[] = [
  { fecha: '2026-05-02', banco: 'Banco Distrital de Sangre', campana: 'Jornada Plaza Central' },
  { fecha: '2025-12-18', banco: 'Banco Hospital Central', campana: null },
  { fecha: '2025-07-09', banco: 'Banco Distrital de Sangre', campana: 'Jornada Universidad Ficticia' },
]

export const RECONOCIMIENTOS: Reconocimiento[] = [
  { id: 'R1', nombre: 'Primera donacion', descripcion: 'Gracias por dar el primer paso.', obtenido: true, fecha: '2025-07-09' },
  { id: 'R2', nombre: 'Tres donaciones', descripcion: 'Has donado tres veces. Gracias por volver.', obtenido: true, fecha: '2026-05-02' },
  { id: 'R3', nombre: 'Donante habitual', descripcion: 'Se otorga al donar con regularidad durante un ano.', obtenido: false },
  { id: 'R4', nombre: 'Acompanante de jornada', descripcion: 'Se otorga al asistir a una jornada de donacion organizada.', obtenido: false },
]

export const CAMPANAS: Campana[] = [
  { id: 'DEMO-C-01', nombre: 'Jornada Plaza Central', banco: 'Banco Distrital de Sangre', municipio: 'Ciudad Ejemplo', fecha: '2026-09-05', cuposTotales: 80, cuposDisponibles: 23 },
  { id: 'DEMO-C-02', nombre: 'Jornada Universidad Ficticia', banco: 'Banco Hospital Central', municipio: 'Ciudad Ejemplo', fecha: '2026-09-12', cuposTotales: 120, cuposDisponibles: 0 },
  { id: 'DEMO-C-03', nombre: 'Jornada Villa Sintetica', banco: 'Banco Regional Norte', municipio: 'Villa Sintetica', fecha: '2026-09-19', cuposTotales: 60, cuposDisponibles: 41 },
]

export const BITACORA: EventoBitacora[] = [
  { id: 'DEMO-B-9021', fecha: '2026-08-27 10:14', actor: 'Coordinador Ejemplo Norte', accion: 'Consulta de inventario', resultado: 'denegado', recurso: 'Banco fuera de la jurisdiccion' },
  { id: 'DEMO-B-9020', fecha: '2026-08-27 09:02', actor: 'Operador 07', accion: 'Registro de resultado de tamizaje', resultado: 'permitido', recurso: 'DEMO-U-004822' },
  { id: 'DEMO-B-9019', fecha: '2026-08-26 16:41', actor: 'Operador 05', accion: 'Disposicion final ejecutada', resultado: 'permitido', recurso: 'DEMO-U-004755' },
  { id: 'DEMO-B-9018', fecha: '2026-08-26 11:20', actor: 'Sistema', accion: 'Exclusion automatica por vencimiento', resultado: 'permitido', recurso: 'DEMO-U-004790' },
  { id: 'DEMO-B-9017', fecha: '2026-08-25 08:33', actor: 'Administrador BS-01', accion: 'Aprobacion de transferencia', resultado: 'permitido', recurso: 'DEMO-T-0430' },
]

/**
 * Consolidado nacional por departamento (M4-U6-01).
 *
 * Los cuatro bancos de arriba pertenecen todos a Ejemplo Norte, que es la
 * jurisdiccion del coordinador territorial. Esta tabla existe porque la vista
 * del administrador nacional agrega por departamento y no por banco: sin
 * varios departamentos no hay consolidacion que mostrar.
 *
 * Los nombres son inequivocamente ficticios, como el resto del archivo.
 */
export const DEPARTAMENTOS: ConsolidadoDepartamento[] = [
  { departamento: 'Ejemplo Norte', bancosActivos: 4, unidadesDisponibles: 779, combinacionesBajoUmbral: 5, tasaNoAptas: 4.1 },
  { departamento: 'Ejemplo Sur', bancosActivos: 3, unidadesDisponibles: 612, combinacionesBajoUmbral: 2, tasaNoAptas: 3.6 },
  { departamento: 'Valle Ficticio', bancosActivos: 2, unidadesDisponibles: 341, combinacionesBajoUmbral: 7, tasaNoAptas: 5.2 },
  { departamento: 'Sierra Demo', bancosActivos: 2, unidadesDisponibles: 288, combinacionesBajoUmbral: 3, tasaNoAptas: 3.9 },
  { departamento: 'Llano Sintetico', bancosActivos: 1, unidadesDisponibles: 96, combinacionesBajoUmbral: 9, tasaNoAptas: 4.8 },
  { departamento: 'Isla Muestra', bancosActivos: 0, unidadesDisponibles: 0, combinacionesBajoUmbral: 0, tasaNoAptas: 0 },
]
