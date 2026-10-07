import { useSesion } from '@/shared/sesion/SesionContexto'
import { Tarjeta, Boton } from '@/shared/ui/Primitivos'
import { useNavigate } from 'react-router-dom'

/**
 * TR-04 / M5-U5-03 — Denegacion de acceso por jurisdiccion.
 *
 * RNF-02. Esta pantalla existe porque el escenario de calidad exige una
 * DENEGACION, no un error generico. Reglas que cumple:
 *
 *  1. Nombra la jurisdiccion PROPIA del usuario, nunca la ajena.
 *  2. No confirma que el recurso solicitado exista: confirmarlo ya seria
 *     filtrar informacion de otra jurisdiccion.
 *  3. Informa que el intento quedo registrado en la bitacora de auditoria.
 *  4. Dice que hacer, no solo que fallo (tono de ui-prototipos.md).
 */
export function Denegacion() {
  const { rol } = useSesion()
  const navegar = useNavigate()

  return (
    <div className="mx-auto max-w-2xl">
      <Tarjeta>
        <p className="text-xs font-semibold uppercase tracking-wide text-vino-600">
          Acceso denegado
        </p>
        <h1 className="mt-2 text-2xl font-bold text-vino-800">
          Esta consulta esta fuera de tu jurisdiccion
        </h1>

        <p className="mt-4 text-sm text-texto-gris">
          Tu jurisdiccion asignada es{' '}
          <strong className="text-vino-700">{rol.jurisdiccion}</strong>. La
          informacion que solicitaste pertenece a otro ambito territorial, y por
          eso no se muestra.
        </p>

        <p className="mt-3 text-sm text-texto-gris">
          Si necesitas estos datos para tu trabajo, solicitalos al
          administrador nacional a traves de tu direccion de salud. No los pidas
          directamente al banco: la asignacion de jurisdiccion se administra de
          forma centralizada.
        </p>

        <div className="mt-5 rounded-md border border-vino-200 bg-vino-50 p-3 text-xs text-vino-800">
          Este intento quedo registrado en la bitacora de auditoria con tu
          usuario y la fecha. Es un registro normal de control, no una sancion.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Boton onClick={() => navegar(-1)}>Volver a la pantalla anterior</Boton>
          <Boton variante="secundario" onClick={() => navegar('/inventario/jurisdiccion')}>
            Ir a mi jurisdiccion
          </Boton>
        </div>
      </Tarjeta>
    </div>
  )
}
