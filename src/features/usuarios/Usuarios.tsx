import { almacenToken } from '@/api/token'
import { useSesion } from '@/shared/sesion/SesionContexto'
// @ts-ignore
import CrearUsuarioPage from './CrearUsuarioPage.jsx'

export function Usuarios() {
  const { usuario } = useSesion()
  const token = almacenToken.obtener() ?? ''

  if (!usuario) return null

  // usuario.jurisdiccion es un objeto { ambito, etiqueta, territorioRuta, institucionId }
  const ambito = {
    rutaTerritorial: usuario.rol === 'U5' ? (usuario.jurisdiccion?.territorioRuta ?? '') : '',
    bancoId: usuario.rol === 'U4' ? (usuario.jurisdiccion?.institucionId ?? '') : '',
  }

  return <CrearUsuarioPage rolActual={usuario.rol} token={token} ambito={ambito} />
}
