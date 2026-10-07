import { Link } from 'react-router-dom'
import { UNIDADES } from '@/shared/datos/sinteticos'
import { useSesion } from '@/shared/sesion/SesionContexto'
import {
  Aviso,
  CintaSintetica,
  Tabla,
  Td,
  Th,
  TituloSeccion,
} from '@/shared/ui/Primitivos'
import { InsigniaEstadoUnidad } from '@/shared/ui/EstadoUnidad'

/**
 * M3-U3-04 — Unidades de mi banco.
 * M3-U4-01 / M3-U5-01 / M3-U6-01 / M3-U7-01 — la misma tabla en solo lectura.
 *
 * RNF-01. La columna de estado admite exactamente cuatro valores. La tabla
 * NO tiene columna de motivo, NO tiene filtro por causa y NO tiene tooltip
 * sobre el estado. Un filtro por causa seria tan grave como mostrarla: por
 * eliminacion permitiria deducirla.
 *
 * RNF-02. El alcance visible siempre se declara arriba, y depende del perfil.
 */
export function ListaUnidades() {
  const { rol } = useSesion()
  const soloLectura = rol.id !== 'U3'

  return (
    <div className="space-y-5">
      <CintaSintetica />

      <TituloSeccion
        descripcion={`Alcance visible: ${rol.jurisdiccion}.${soloLectura ? ' Consulta de solo lectura.' : ''}`}
      >
        Unidades
      </TituloSeccion>

      <Aviso tono="informacion" titulo="Que muestra esta pantalla">
        El estado de cada unidad: apta, no apta, vencida o desechada. El sistema
        no registra ni muestra por que una unidad no es apta.
      </Aviso>

      <Tabla>
        <thead>
          <tr>
            <Th>Codigo</Th>
            <Th>Componente</Th>
            <Th>Tipo</Th>
            <Th>Captacion</Th>
            <Th>Vencimiento</Th>
            <Th>Estado</Th>
            <Th>Trazabilidad</Th>
          </tr>
        </thead>
        <tbody>
          {UNIDADES.map((u) => (
            <tr key={u.codigo}>
              <Td className="whitespace-nowrap font-mono text-xs font-semibold text-vino-800">
                {u.codigo}
              </Td>
              <Td className="whitespace-nowrap">{u.componente}</Td>
              <Td>{u.tipoSangre}</Td>
              <Td className="whitespace-nowrap">{u.fechaCaptacion}</Td>
              <Td className="whitespace-nowrap">{u.fechaVencimiento}</Td>
              <Td>
                {/* Sin tooltip, sin detalle expandible, sin causa. */}
                <InsigniaEstadoUnidad estado={u.estado} />
              </Td>
              <Td>
                <Link
                  to={`/ciclovida/unidades/${u.codigo}`}
                  className="font-medium text-vino-700 underline-offset-4 hover:underline"
                >
                  Ver recorrido
                </Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </Tabla>
    </div>
  )
}
