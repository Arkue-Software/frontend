import type { Campania, DatosCampania, EstadoCampania } from '@/shared/tipos'
import type { ServicioCampanias } from '../contratos'
import type { ClienteHttp } from './cliente'

/** Adaptador del Servicio de Campañas (DD 15.3). */

interface CampaniaRespuesta {
  id: string
  institucion_id: string
  institucion_nombre: string | null
  territorio_codigo: string
  territorio_ruta: string
  nombre: string
  descripcion: string | null
  sede: string
  inicia_en: string
  termina_en: string
  estado: EstadoCampania
  cupo_total: number | null
  cupo_disponible: number | null
  donaciones_registradas: number | null
}

const aCampania = (c: CampaniaRespuesta): Campania => ({
  id: c.id,
  institucionId: c.institucion_id,
  institucionNombre: c.institucion_nombre ?? null,
  nombre: c.nombre,
  descripcion: c.descripcion,
  sede: c.sede,
  territorioCodigo: c.territorio_codigo,
  territorioRuta: c.territorio_ruta,
  iniciaEn: c.inicia_en,
  terminaEn: c.termina_en,
  estado: c.estado,
  cupoTotal: c.cupo_total,
  cupoDisponible: c.cupo_disponible,
  donacionesRegistradas: c.donaciones_registradas ?? null,
})

const aCuerpo = (d: Partial<DatosCampania>) => ({
  nombre: d.nombre,
  descripcion: d.descripcion,
  sede: d.sede,
  inicia_en: d.iniciaEn,
  termina_en: d.terminaEn,
  cupo_total: d.cupoTotal,
})

export function crearCampaniasHttp(cliente: ClienteHttp): ServicioCampanias {
  return {
    async listar(filtro) {
      const r = await cliente.solicitar<CampaniaRespuesta[]>('GET', '/v1/campanias', {
        consulta: { territorio: filtro?.territorioRuta },
      })
      return r.map(aCampania)
    },
    async crear(datos) {
      return aCampania(await cliente.solicitar<CampaniaRespuesta>('POST', '/v1/campanias', { cuerpo: aCuerpo(datos) }))
    },
    async editar(id, cambio) {
      return aCampania(await cliente.solicitar<CampaniaRespuesta>('PUT', `/v1/campanias/${id}`, { cuerpo: aCuerpo(cambio) }))
    },
    async publicar(id) {
      return aCampania(await cliente.solicitar<CampaniaRespuesta>('POST', `/v1/campanias/${id}/publicacion`))
    },
    async cerrar(id) {
      return aCampania(await cliente.solicitar<CampaniaRespuesta>('POST', `/v1/campanias/${id}/cierre`))
    },
  }
}
