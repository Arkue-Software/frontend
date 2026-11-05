import type {
  Alerta,
  Bitacora,
  CambioInstitucion,
  CambioPerfil,
  Campania,
  Consentimiento,
  CuentaDonanteNueva,
  DatosCampania,
  Donacion,
  DonacionPropia,
  DonantePresente,
  Elegibilidad,
  EventoUnidad,
  Existencia,
  FiltroBitacora,
  FiltroIndicadores,
  FiltroInstituciones,
  FiltroUnidades,
  FinalidadConsentimiento,
  Indicadores,
  Institucion,
  Intencion,
  NivelTerritorial,
  NuevaDonacion,
  NuevaInstitucion,
  NuevaIntencion,
  Pagina,
  PerfilDonante,
  Reconocimiento,
  RegistroDonante,
  TerritorioRegistrado,
  TokenEmitido,
  Transicion,
  Umbral,
  Unidad,
  UsuarioSesion,
} from '@/shared/tipos'

/**
 * Contratos de la capa de servicios, uno por servicio de backend.
 *
 * Cada metodo es una operacion de la seccion 15 del DD V3.0, expuesta por el
 * gateway como `/api` seguido de la ruta anotada. Las pantallas solo conocen
 * estas interfaces; `http/` las implementa contra APISIX.
 */

/** Servicio de Identidad — DD 15.1. */
export interface ServicioIdentidad {
  /** POST /v1/sesiones */
  iniciarSesion(correo: string, credencial: string): Promise<TokenEmitido>
  /** POST /v1/sesiones/renovacion (con la cookie de renovacion) */
  renovarSesion(): Promise<TokenEmitido>
  /** DELETE /v1/sesiones/actual */
  cerrarSesion(): Promise<void>
  /** GET /v1/usuarios/me */
  obtenerUsuarioActual(): Promise<UsuarioSesion>
  /** POST /v1/cuentas-donante — publico, idempotente con la clave dada; devuelve el id de la cuenta */
  crearCuentaDonante(cuenta: CuentaDonanteNueva, claveIdempotencia: string): Promise<string>
}

/** Servicio de Donacion, M1 — DD 15.4, Tablas 34 y 35. */
export interface ServicioDonantes {
  /** POST /v1/intenciones — publico, idempotente */
  registrarIntencion(datos: NuevaIntencion): Promise<{ codigo: string; expiraEn: string }>
  /** GET /v1/intenciones/{codigo} — publico; el operador ve ademas grupo y municipio */
  consultarIntencion(codigo: string): Promise<Intencion>
  /** POST /v1/donantes — con la sesion de la cuenta del donante; crea su perfil */
  registrarDonante(datos: RegistroDonante, claveIdempotencia: string): Promise<void>
  /** GET /v1/donantes/me */
  obtenerPerfil(): Promise<PerfilDonante>
  /** PUT /v1/donantes/me — nombre, contacto y municipio */
  actualizarPerfil(cambio: CambioPerfil): Promise<PerfilDonante>
  /** GET /v1/donantes/me/elegibilidad — la web no replica el calculo (EC-21) */
  obtenerElegibilidad(): Promise<Elegibilidad>
  /** GET /v1/donantes/me/donaciones */
  listarMisDonaciones(): Promise<DonacionPropia[]>
  /** GET /v1/donantes/me/reconocimientos */
  listarReconocimientos(): Promise<Reconocimiento[]>
  /** GET /v1/donantes/me/consentimientos */
  listarConsentimientos(): Promise<Consentimiento[]>
  /** POST /v1/donantes/me/consentimientos — una finalidad por peticion */
  registrarConsentimiento(finalidad: FinalidadConsentimiento, otorgado: boolean): Promise<Consentimiento[]>
  /** POST /v1/donantes/busqueda — U3; documento en el cuerpo, nunca en la ruta */
  buscarDonantePresente(documento: string): Promise<DonantePresente>
}

/** Servicio de Campanas, M2 — DD 15.3. */
export interface ServicioCampanias {
  /** GET /v1/campanias — publico; con rol institucional, las de su jurisdiccion */
  listar(filtro?: { territorioRuta?: string }): Promise<Campania[]>
  /** POST /v1/campanias — U4; nace en borrador con el territorio de su institución */
  crear(datos: DatosCampania): Promise<Campania>
  /** PUT /v1/campanias/{id} — U4, solo en borrador */
  editar(id: string, cambio: Partial<DatosCampania>): Promise<Campania>
  /** POST /v1/campanias/{id}/publicacion — U4 */
  publicar(id: string): Promise<Campania>
  /** POST /v1/campanias/{id}/cierre — U4 */
  cerrar(id: string): Promise<Campania>
}

/** Servicio de Donacion, M3 — DD 15.4, Tabla 35. */
export interface ServicioTrazabilidad {
  /** POST /v1/donaciones — U3, idempotente. Una unidad por componente, en captada */
  registrarDonacion(datos: NuevaDonacion): Promise<Donacion>
  /** GET /v1/donaciones/{id} — U3, U4 */
  obtenerDonacion(id: string): Promise<Donacion>
  /** POST /v1/donaciones/{id}/fraccionamiento — U3, idempotente (transicion 1) */
  confirmarFraccionamiento(donacionId: string): Promise<Donacion>
  /** GET /v1/unidades — U3, U4 */
  listarUnidades(filtro?: FiltroUnidades): Promise<Pagina<Unidad>>
  /** GET /v1/unidades/{id} */
  obtenerUnidad(id: string): Promise<Unidad>
  /** GET /v1/unidades/{id}/eventos */
  listarEventosUnidad(id: string): Promise<EventoUnidad[]>
  /** POST /v1/unidades/{id}/ingreso-tamizaje — transicion 2 */
  iniciarTamizaje(id: string): Promise<Transicion>
  /** POST /v1/unidades/{id}/tamizaje — un unico campo `apta` (transiciones 3 y 4) */
  registrarTamizaje(id: string, apta: boolean): Promise<Transicion>
  /** POST /v1/unidades/{id}/reserva — transicion 5 */
  reservarUnidad(id: string): Promise<Transicion>
  /** DELETE /v1/unidades/{id}/reserva — transicion 6 */
  liberarReserva(id: string): Promise<Transicion>
  /** POST /v1/unidades/{id}/despacho — confirmacion obligatoria (transicion 7) */
  despacharUnidad(id: string, confirmacion: string): Promise<Transicion>
  /** POST /v1/unidades/{id}/disposicion-final — confirmacion obligatoria (12 y 13) */
  disponerUnidad(id: string, confirmacion: string): Promise<Transicion>
}

/** Servicio de Donacion, M4 — DD 15.4, Tabla 36. */
export interface ServicioInventario {
  /** GET /v1/inventario — U3, U4 */
  consultarExistencias(): Promise<Existencia[]>
  /** GET /v1/inventario/umbrales — U3, U4 */
  consultarUmbrales(): Promise<Umbral[]>
  /** PUT /v1/inventario/umbrales — U4 */
  guardarUmbrales(umbrales: Umbral[]): Promise<Umbral[]>
  /** GET /v1/alertas — U3, U4 */
  listarAlertas(estado?: 'abierta'): Promise<Alerta[]>
  /** POST /v1/alertas/{id}/atencion — U4 */
  atenderAlerta(id: string): Promise<Alerta>
}

/** Servicio Institucional, M6, M7 y ST2 — DD 15.2, Tabla 32. */
export interface ServicioInstitucional {
  /** GET /v1/territorios — U4 a U7, acotado a la jurisdicción */
  listarTerritorios(filtro?: { nivel?: NivelTerritorial; padreId?: string; tamano?: number }): Promise<Pagina<TerritorioRegistrado>>
  /** POST /v1/territorios — U6; la ruta la calcula el servicio */
  crearTerritorio(codigoDivipola: string, nombre: string): Promise<TerritorioRegistrado>
  /** GET /v1/instituciones — U4 a U7, acotado a la jurisdicción */
  listarInstituciones(filtro?: FiltroInstituciones): Promise<Pagina<Institucion>>
  /** GET /v1/instituciones/{id} — todo perfil con cuenta */
  obtenerInstitucion(id: string): Promise<Institucion>
  /** POST /v1/instituciones — U5 en su jurisdicción, U6 */
  crearInstitucion(datos: NuevaInstitucion): Promise<Institucion>
  /** PUT /v1/instituciones/{id} — U5 en su jurisdicción, U6; el tipo no cambia */
  modificarInstitucion(id: string, cambio: CambioInstitucion): Promise<Institucion>
  /** GET /v1/indicadores — U4, U5, U6 */
  consultarIndicadores(filtro?: FiltroIndicadores): Promise<Indicadores>
  /** GET /v1/auditoria — U7 */
  consultarBitacora(filtro?: FiltroBitacora): Promise<Bitacora>
}

export interface Api {
  identidad: ServicioIdentidad
  donantes: ServicioDonantes
  campanias: ServicioCampanias
  trazabilidad: ServicioTrazabilidad
  inventario: ServicioInventario
  institucional: ServicioInstitucional
}
