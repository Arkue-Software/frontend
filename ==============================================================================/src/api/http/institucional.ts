import type {
  AgrupacionIndicadores,
  Bitacora,
  ComponenteSanguineo,
  ContextoBitacora,
  GrupoSanguineo,
  Institucion,
  NivelTerritorial,
  Pagina,
  RegistroBitacora,
  TerritorioRegistrado,
  TipoInstitucion,
} from '@/shared/tipos'
import type { ServicioInstitucional } from '../contratos'
import type { ClienteHttp } from './cliente'

/** Adaptador del Servicio Institucional (DD 15.2 y 13.2). */

interface PaginaRespuesta<T> {
  elementos: T[]
  total: number
  pagina: number
  tamano: number
}

interface TerritorioRespuesta {
  id: string
  codigo_divipola: string
  nombre: string
  nivel: NivelTerritorial
  padre_id: string | null
  ruta: string
  vigente: boolean
}

interface InstitucionRespuesta {
  id: string
  codigo: string
  nombre: string
  tipo: TipoInstitucion
  territorio_id: string
  territorio_codigo: string
  territorio_ruta: string
  territorio_nombre: string
  direccion: string | null
  vigente: boolean
  creado_en: string
}

interface IndicadoresRespuesta {
  actualizado_en: string | null
  filtro: {
    desde: string
    hasta: string
    agrupar_por: AgrupacionIndicadores
    institucion_id: string | null
    territorio_ruta: string | null
  }
  captacion: {
    periodo: string
    donaciones: number
    unidades_generadas: number
    unidades_no_aptas: number | null
    unidades_vencidas: number
    suprimido_por_agregacion: boolean
  }[]
  inventario: {
    institucion_id: string
    componente: ComponenteSanguineo
    grupo_sanguineo: GrupoSanguineo
    unidades_disponibles: number
    unidades_por_vencer: number
    bajo_umbral: boolean
  }[]
  cobertura: {
    territorio_codigo: string
    nombre: string
    ruta: string
    municipios: number
    municipios_con_banco: number
    bancos_de_sangre: number
    servicios_transfusion: number
  }[]
}

interface RegistroRespuesta {
  contexto: ContextoBitacora
  id: string
  actor_tipo: RegistroBitacora['actorTipo']
  actor_id: string | null
  rol: string | null
  jurisdiccion_solicitada: string | null
  operacion: string
  recurso_tipo: string
  recurso_id: string | null
  resultado: RegistroBitacora['resultado']
  correlacion_id: string
  origen: string | null
  ocurrido_en: string
}

const aPagina = <R, T>(p: PaginaRespuesta<R>, f: (r: R) => T): Pagina<T> => ({
  elementos: p.elementos.map(f),
  total: p.total,
  pagina: p.pagina,
  tamano: p.tamano,
})

const aTerritorio = (t: TerritorioRespuesta): TerritorioRegistrado => ({
  id: t.id,
  codigoDivipola: t.codigo_divipola,
  nombre: t.nombre,
  nivel: t.nivel,
  padreId: t.padre_id,
  ruta: t.ruta,
  vigente: t.vigente,
})

const aInstitucion = (i: InstitucionRespuesta): Institucion => ({
  id: i.id,
  codigo: i.codigo,
  nombre: i.nombre,
  tipo: i.tipo,
  territorioId: i.territorio_id,
  territorioCodigo: i.territorio_codigo,
  territorioRuta: i.territorio_ruta,
  territorioNombre: i.territorio_nombre,
  direccion: i.direccion,
  vigente: i.vigente,
  creadoEn: i.creado_en,
})

const aRegistro = (r: RegistroRespuesta): RegistroBitacora => ({
  contexto: r.contexto,
  id: r.id,
  actorTipo: r.actor_tipo,
  actorId: r.actor_id,
  rol: r.rol,
  jurisdiccionSolicitada: r.jurisdiccion_solicitada,
  operacion: r.operacion,
  recursoTipo: r.recurso_tipo,
  recursoId: r.recurso_id,
  resultado: r.resultado,
  correlacionId: r.correlacion_id,
  origen: r.origen,
  ocurridoEn: r.ocurrido_en,
})

const texto = (n: number | undefined) => (n === undefined ? undefined : String(n))

export function crearInstitucionalHttp(cliente: ClienteHttp): ServicioInstitucional {
  return {
    async listarTerritorios(filtro) {
      const r = await cliente.solicitar<PaginaRespuesta<TerritorioRespuesta>>('GET', '/v1/territorios', {
        consulta: { nivel: filtro?.nivel, padre_id: filtro?.padreId, tamano: texto(filtro?.tamano) },
      })
      return aPagina(r, aTerritorio)
    },
    async crearTerritorio(codigoDivipola, nombre) {
      return aTerritorio(
        await cliente.solicitar<TerritorioRespuesta>('POST', '/v1/territorios', {
          cuerpo: { codigo_divipola: codigoDivipola, nombre },
        }),
      )
    },
    async listarInstituciones(filtro) {
      const r = await cliente.solicitar<PaginaRespuesta<InstitucionRespuesta>>('GET', '/v1/instituciones', {
        consulta: {
          territorio_ruta: filtro?.territorioRuta,
          tipo: filtro?.tipo,
          incluir_bajas: filtro?.incluirBajas ? 'true' : undefined,
          pagina: texto(filtro?.pagina),
          tamano: texto(filtro?.tamano),
        },
      })
      return aPagina(r, aInstitucion)
    },
    async obtenerInstitucion(id) {
      return aInstitucion(await cliente.solicitar<InstitucionRespuesta>('GET', `/v1/instituciones/${id}`))
    },
    async crearInstitucion(d) {
      return aInstitucion(
        await cliente.solicitar<InstitucionRespuesta>('POST', '/v1/instituciones', {
          cuerpo: { codigo: d.codigo, nombre: d.nombre, tipo: d.tipo, territorio_id: d.territorioId, direccion: d.direccion },
        }),
      )
    },
    async modificarInstitucion(id, c) {
      return aInstitucion(
        await cliente.solicitar<InstitucionRespuesta>('PUT', `/v1/instituciones/${id}`, {
          cuerpo: { nombre: c.nombre, direccion: c.direccion, vigente: c.vigente },
        }),
      )
    },
    async consultarIndicadores(filtro) {
      const r = await cliente.solicitar<IndicadoresRespuesta>('GET', '/v1/indicadores', {
        consulta: {
          desde: filtro?.desde,
          hasta: filtro?.hasta,
          agrupar_por: filtro?.agruparPor,
          institucion_id: filtro?.institucionId,
          territorio_ruta: filtro?.territorioRuta,
        },
      })
      return {
        filtro: {
          desde: r.filtro.desde,
          hasta: r.filtro.hasta,
          agruparPor: r.filtro.agrupar_por,
          institucionId: r.filtro.institucion_id,
          territorioRuta: r.filtro.territorio_ruta,
        },
        actualizadoEn: r.actualizado_en,
        captacion: r.captacion.map((p) => ({
          periodo: p.periodo,
          donaciones: p.donaciones,
          unidadesGeneradas: p.unidades_generadas,
          unidadesNoAptas: p.unidades_no_aptas,
          unidadesVencidas: p.unidades_vencidas,
          suprimidoPorAgregacion: p.suprimido_por_agregacion,
        })),
        inventario: r.inventario.map((e) => ({
          institucionId: e.institucion_id,
          componente: e.componente,
          grupo: e.grupo_sanguineo,
          disponibles: e.unidades_disponibles,
          porVencer: e.unidades_por_vencer,
          bajoUmbral: e.bajo_umbral,
        })),
        cobertura: r.cobertura.map((c) => ({
          territorioCodigo: c.territorio_codigo,
          nombre: c.nombre,
          ruta: c.ruta,
          municipios: c.municipios,
          municipiosConBanco: c.municipios_con_banco,
          bancosDeSangre: c.bancos_de_sangre,
          serviciosTransfusion: c.servicios_transfusion,
        })),
      }
    },
    async consultarBitacora(filtro) {
      const r = await cliente.solicitar<{
        registros: RegistroRespuesta[]
        siguiente: string | null
        series: { contexto: ContextoBitacora; al_dia_hasta: string | null }[]
      }>('GET', '/v1/auditoria', {
        consulta: {
          recurso_tipo: filtro?.recursoTipo,
          recurso_id: filtro?.recursoId,
          correlacion_id: filtro?.correlacionId,
          actor_id: filtro?.actorId,
          desde: filtro?.desde,
          hasta: filtro?.hasta,
          tamano: texto(filtro?.tamano),
          antes_de: filtro?.antesDe,
        },
      })
      const bitacora: Bitacora = {
        registros: r.registros.map(aRegistro),
        siguiente: r.siguiente,
        series: r.series.map((x) => ({ contexto: x.contexto, alDiaHasta: x.al_dia_hasta })),
      }
      return bitacora
    },
  }
}
