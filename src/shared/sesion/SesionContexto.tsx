import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ROLES } from '@/shared/datos/roles'
import type { Rol, RolId } from '@/shared/tipos'

/**
 * Sesion simulada del prototipo.
 *
 * No hay autenticacion real ni llamadas al gateway: el rol se cambia desde el
 * selector de la barra superior para poder demostrar en la presentacion que
 * cada perfil ve cosas distintas (RNF-02).
 */

interface Sesion {
  rol: Rol
  cambiarRol: (id: RolId) => void
}

const Contexto = createContext<Sesion | null>(null)

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [rolId, setRolId] = useState<RolId>('U3')

  const valor = useMemo<Sesion>(
    () => ({ rol: ROLES[rolId], cambiarRol: setRolId }),
    [rolId],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useSesion(): Sesion {
  const valor = useContext(Contexto)
  if (!valor) {
    throw new Error('useSesion debe usarse dentro de <ProveedorSesion>')
  }
  return valor
}
