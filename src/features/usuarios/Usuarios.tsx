import { almacenToken } from '@/api/token'
import { useSesion } from '@/shared/sesion/SesionContexto'
// @ts-ignore — componente JS de creación jerárquica
import CrearUsuarioPage from './CrearUsuarioPage.jsx'

export function Usuarios() {
  const { usuario } = useSesion()
  const token = almacenToken.obtener() ?? ''
  const claims = almacenToken.reivindicaciones()

  if (!usuario) return null

  const u = usuario as unknown as Record<string, string | undefined>
  const jurisdiccion = u.jurisdiccion ?? claims?.jurisdiction ?? ''
  const esUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(jurisdiccion)

  const ambito = {
    rutaTerritorial: u.rutaTerritorial ?? (!esUuid ? jurisdiccion : ''),
    bancoId: u.bancoId ?? (esUuid ? jurisdiccion : ''),
  }

  return <CrearUsuarioPage rolActual={usuario.rol} token={token} ambito={ambito} />
}
