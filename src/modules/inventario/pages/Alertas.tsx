import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { INVENTARIO, UNIDADES } from '@/shared/datos/sinteticos'
import {
  Aviso,
  Boton,
  CintaSintetica,
  ConmutadorDemo,
  EstadoVacio,
  Tabla,
  Td,
  Th,
  TituloSeccion,
  unir,
} from '@/shared/ui/Primitivos'
import { InsigniaEstadoUnidad } from '@/shared/ui/EstadoUnidad'

/**
 * M4-U3-04 — Alertas de escasez.
 * M4-U3-05 — Alertas de vencimiento proximo.
 * M4-U3-06 — Unidades excluidas automaticamente por vencimiento (RNF-08).
 * M4-U3-07 — Sin alertas activas (excepcion).
 *
 * RNF-08: la exclusion de vencidas es automatica. En la pestana de excluidas
 * NO hay ninguna accion de reingreso al inventario disponible: el operador no
 * puede deshacer lo que el sistema retiro solo.
 */
export function Alertas() {
  const [conAlertas, setConAlertas] = useState(true)

  const escasez = INVENTARIO.filter((e) => e.disponibles < e.umbralMinimo)
  const porVencer = INVENTARIO.filter((e) => e.proximasAVencer > 0)
  const excluidas = UNIDADES.filter((u) => u.estado === 'vencida')

  return (
    <div className="space-y-5">
      <CintaSintetica />

      <TituloSeccion descripcion="Escasez, vencimiento proximo y unidades que el sistema retiro solo.">
        Alertas
      </TituloSeccion>

      <ConmutadorDemo
        valor={conAlertas ? 'con' : 'sin'}
        onCambio={(id) => setConAlertas(id === 'con')}
        opciones={[
          { id: 'con', etiqueta: 'Con alertas activas' },
          { id: 'sin', etiqueta: 'Sin alertas' },
        ]}
      />

      {!conAlertas ? (
        <EstadoVacio titulo="No hay alertas activas">
          Todas las combinaciones de componente y tipo estan por encima de su
          umbral, y ninguna unidad vence en los proximos siete dias. Ultima
          evaluacion: 27 de agosto de 2026, 11:00.
        </EstadoVacio>
      ) : (
        <Tabs.Root defaultValue="escasez">
          <Tabs.List
            aria-label="Tipos de alerta"
            className="flex flex-wrap gap-1 border-b border-vino-100"
          >
            <Pestana valor="escasez">Escasez ({escasez.length})</Pestana>
            <Pestana valor="vencimiento">
              Vencimiento proximo ({porVencer.length})
            </Pestana>
            <Pestana valor="excluidas">
              Excluidas automaticamente ({excluidas.length})
            </Pestana>
          </Tabs.List>

          <Tabs.Content value="escasez" className="space-y-4 pt-5">
            <Aviso tono="operativo" titulo="Estas combinaciones estan bajo el umbral">
              La primera respuesta es redistribuir entre bancos de la red. Solo
              si no hay excedente se convoca a donantes.
            </Aviso>
            <Tabla>
              <thead>
                <tr>
                  <Th>Componente</Th>
                  <Th>Tipo</Th>
                  <Th>Disponibles</Th>
                  <Th>Umbral</Th>
                  <Th>Faltante</Th>
                  <Th>Accion</Th>
                </tr>
              </thead>
              <tbody>
                {escasez.map((e) => (
                  <tr key={`${e.componente}-${e.tipoSangre}`}>
                    <Td className="whitespace-nowrap">{e.componente}</Td>
                    <Td className="font-semibold">{e.tipoSangre}</Td>
                    <Td className="font-bold text-vino-700">{e.disponibles}</Td>
                    <Td>{e.umbralMinimo}</Td>
                    <Td className="font-semibold text-vino-700">
                      {e.umbralMinimo - e.disponibles}
                    </Td>
                    <Td>
                      <Boton variante="texto">Buscar transferencia</Boton>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          </Tabs.Content>

          <Tabs.Content value="vencimiento" className="space-y-4 pt-5">
            <Aviso tono="operativo" titulo="Unidades que vencen pronto">
              Transferir a un banco con demanda antes del vencimiento evita
              perder la unidad.
            </Aviso>
            <Tabla>
              <thead>
                <tr>
                  <Th>Componente</Th>
                  <Th>Tipo</Th>
                  <Th>Vencen en 7 dias</Th>
                  <Th>Accion</Th>
                </tr>
              </thead>
              <tbody>
                {porVencer.map((e) => (
                  <tr key={`${e.componente}-${e.tipoSangre}`}>
                    <Td className="whitespace-nowrap">{e.componente}</Td>
                    <Td className="font-semibold">{e.tipoSangre}</Td>
                    <Td className="font-bold text-vino-700">
                      {e.proximasAVencer}
                    </Td>
                    <Td>
                      <Boton variante="texto">Ofrecer a la red</Boton>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          </Tabs.Content>

          <Tabs.Content value="excluidas" className="space-y-4 pt-5">
            <Aviso
              tono="informacion"
              titulo="RNF-08: exclusion sin intervencion manual"
            >
              El sistema retiro estas unidades del inventario disponible por si
              solo, al llegar su fecha de vencimiento. Esta vista es
              informativa: no existe accion para devolverlas al disponible.
            </Aviso>
            <Tabla>
              <thead>
                <tr>
                  <Th>Codigo</Th>
                  <Th>Componente</Th>
                  <Th>Tipo</Th>
                  <Th>Vencio el</Th>
                  <Th>Estado</Th>
                </tr>
              </thead>
              <tbody>
                {excluidas.map((u) => (
                  <tr key={u.codigo}>
                    <Td className="font-mono text-xs font-semibold text-vino-800">
                      {u.codigo}
                    </Td>
                    <Td>{u.componente}</Td>
                    <Td>{u.tipoSangre}</Td>
                    <Td>{u.fechaVencimiento}</Td>
                    <Td>
                      <InsigniaEstadoUnidad estado={u.estado} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          </Tabs.Content>
        </Tabs.Root>
      )}
    </div>
  )
}

function Pestana({
  valor,
  children,
}: {
  valor: string
  children: React.ReactNode
}) {
  return (
    <Tabs.Trigger
      value={valor}
      className={unir(
        'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
        'border-transparent text-texto-gris hover:text-vino-700',
        'data-[state=active]:border-vino-600 data-[state=active]:text-vino-800',
      )}
    >
      {children}
    </Tabs.Trigger>
  )
}
