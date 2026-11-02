import { useEffect, useState } from 'react'
import { useApi } from '@/api'
import type { Api } from '@/api/contratos'
import type { Institucion } from '@/shared/tipos'

/**
 * Nombre de una institución a partir del identificador que guardan Donación y
 * Campañas (GET /v1/instituciones/{id}, común a todo perfil con cuenta). El
 * registro institucional cambia poco: cada id se pide una sola vez por sesión
 * del navegador. Si el servicio no responde, se declara, sin inventar nombres.
 */

const cache = new Map<string, Promise<Institucion | null>>()

function resolver(api: Api, id: string): Promise<Institucion | null> {
  let pendiente = cache.get(id)
  if (!pendiente) {
    pendiente = api.institucional.obtenerInstitucion(id).catch(() => {
      cache.delete(id) // un fallo pasajero no queda guardado
      return null
    })
    cache.set(id, pendiente)
  }
  return pendiente
}

export function useInstitucion(id: string | null | undefined): { institucion: Institucion | null; cargando: boolean } {
  const api = useApi()
  const [estado, setEstado] = useState<{ id: string | null; institucion: Institucion | null; cargando: boolean }>({
    id: null,
    institucion: null,
    cargando: Boolean(id),
  })
  useEffect(() => {
    if (!id) return
    let vigente = true
    setEstado({ id, institucion: null, cargando: true })
    resolver(api, id).then((institucion) => vigente && setEstado({ id, institucion, cargando: false }))
    return () => {
      vigente = false
    }
  }, [api, id])
  return estado.id === id ? estado : { institucion: null, cargando: Boolean(id) }
}

export function NombreInstitucion({ id, conMunicipio = false }: { id: string | null | undefined; conMunicipio?: boolean }) {
  const { institucion, cargando } = useInstitucion(id)
  if (!id) return <>—</>
  if (cargando) return <span className="text-texto-tenue">Cargando…</span>
  if (!institucion) return <span className="text-texto-tenue">Institución no disponible</span>
  return (
    <>
      {institucion.nombre}
      {!institucion.vigente && <span className="text-texto-tenue"> (dada de baja)</span>}
      {conMunicipio && <span className="block text-xs text-texto-tenue">{institucion.territorioNombre}</span>}
    </>
  )
}
