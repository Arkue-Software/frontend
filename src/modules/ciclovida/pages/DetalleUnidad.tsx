import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { UNIDADES } from '@/shared/datos/sinteticos'
import { useSesion } from '@/shared/sesion/SesionContexto'
import {
  Aviso,
  Boton,
  CintaSintetica,
  Tarjeta,
  TituloSeccion,
  unir,
} from '@/shared/ui/Primitivos'
import { InsigniaEstadoUnidad } from '@/shared/ui/EstadoUnidad'
import type { EstadoUnidad } from '@/shared/tipos'

/**
 * M3-U3-05 — Detalle de unidad y trazabilidad.
 * M3-U3-06 — Registro de resultado de tamizaje.
 * M3-U3-07 — Unidad marcada como no apta.
 * M3-U3-09 / M3-U3-10 — Protocolo de disposicion final y constancia.
 * M3-U3-11 — Accion no permitida sobre unidad desechada.
 *
 * ---------------------------------------------------------------------------
 * RNF-01, punto critico de todo el prototipo.
 *
 * El formulario de tamizaje ofrece DOS opciones y ningun campo de texto. No
 * existe un campo donde escribir el motivo, y por eso ninguna pantalla
 * posterior puede mostrarlo: la restriccion se aplica en la captura, no en la
 * visualizacion. Lo que no se registra no se puede exponer por descuido.
 *
 * El protocolo de disposicion final es identico para unidades no aptas y para
 * vencidas. Si fuera distinto, el propio protocolo delataria el origen del
 * descarte.
 * ---------------------------------------------------------------------------
 */
export function DetalleUnidad() {
  const { codigo } = useParams()
  const { rol } = useSesion()
  const base = UNIDADES.find((u) => u.codigo === codigo)

  const [estado, setEstado] = useState<EstadoUnidad | null>(
    base?.estado ?? null,
  )
  const [eventos, setEventos] = useState(base?.trazabilidad ?? [])
  const [constancia, setConstancia] = useState<string | null>(
    base?.estado === 'desechada' ? 'DEMO-C-0912' : null,
  )

  if (!base || !estado) {
    return (
      <Tarjeta>
        <h1 className="text-xl font-bold text-vino-800">
          No encontramos esta unidad
        </h1>
        <p className="mt-2 text-sm text-texto-gris">
          Revisa el codigo o vuelve al listado.
        </p>
        <div className="mt-4">
          <Link
            to="/ciclovida/unidades"
            className="font-medium text-vino-700 underline-offset-4 hover:underline"
          >
            Volver a unidades
          </Link>
        </div>
      </Tarjeta>
    )
  }

  const puedeEscribir = rol.id === 'U3'
  const esDesechada = estado === 'desechada'
  const requiereDisposicion = estado === 'no apta' || estado === 'vencida'

  function registrarTamizaje(resultado: 'apta' | 'no apta') {
    setEstado(resultado)
    setEventos((actual) => [
      ...actual,
      {
        fecha: '2026-08-27 11:05',
        evento: 'Resultado de tamizaje',
        responsable: 'Operador 07',
        detalle: `Resultado registrado: ${resultado}.`,
      },
    ])
  }

  function ejecutarDisposicion() {
    setEstado('desechada')
    setConstancia('DEMO-C-0940')
    setEventos((actual) => [
      ...actual,
      {
        fecha: '2026-08-27 11:20',
        evento: 'Disposicion final ejecutada',
        responsable: 'Operador 07',
        detalle: 'Protocolo completado. Constancia DEMO-C-0940.',
      },
    ])
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <CintaSintetica />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <TituloSeccion
          descripcion={`Donacion de origen ${base.donacionId} · ${base.componente} · ${base.tipoSangre}`}
        >
          <span className="font-mono">{base.codigo}</span>
        </TituloSeccion>
        <InsigniaEstadoUnidad estado={estado} />
      </div>

      {/* RNF-01 declarado en la propia pantalla, no solo en la documentacion. */}
      <Aviso tono="informacion" titulo="Confidencialidad del resultado">
        Esta pantalla muestra el estado de la unidad y quien lo registro. No
        muestra el resultado clinico del tamizaje ni ningun diagnostico, porque
        el sistema no lo almacena en ninguna parte.
      </Aviso>

      <Tabs.Root defaultValue="recorrido">
        <Tabs.List
          aria-label="Secciones de la unidad"
          className="flex gap-1 border-b border-vino-100"
        >
          <Pestana valor="recorrido">Recorrido completo</Pestana>
          <Pestana valor="datos">Datos de la unidad</Pestana>
        </Tabs.List>

        <Tabs.Content value="recorrido" className="pt-5">
          <ol className="space-y-0">
            {eventos.map((e, i) => (
              <li key={`${e.fecha}-${i}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-vino-600 bg-white" />
                  {i < eventos.length - 1 && (
                    <span className="w-0.5 flex-1 bg-vino-200" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-bold text-vino-800">{e.evento}</p>
                  <p className="text-xs text-texto-gris">
                    {e.fecha} · {e.responsable}
                  </p>
                  <p className="mt-1 text-sm text-texto-gris">{e.detalle}</p>
                </div>
              </li>
            ))}
          </ol>
        </Tabs.Content>

        <Tabs.Content value="datos" className="pt-5">
          <Tarjeta>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Fila etiqueta="Codigo" valor={base.codigo} />
              <Fila etiqueta="Componente" valor={base.componente} />
              <Fila etiqueta="Tipo de sangre" valor={base.tipoSangre} />
              <Fila etiqueta="Donacion de origen" valor={base.donacionId} />
              <Fila etiqueta="Fecha de captacion" valor={base.fechaCaptacion} />
              <Fila etiqueta="Fecha de vencimiento" valor={base.fechaVencimiento} />
            </dl>
            {/*
              Aqui NO hay campo de motivo, ni "ver mas", ni nota clinica.
              Es la ausencia deliberada que exige RNF-01.
            */}
          </Tarjeta>
        </Tabs.Content>
      </Tabs.Root>

      {/* ------------------------------------------------------- acciones */}

      {puedeEscribir && (
        <Tarjeta>
          <h2 className="text-lg font-bold text-vino-800">Acciones</h2>

          {esDesechada ? (
            /* M3-U3-11 — el ciclo de vida no retrocede. */
            <div className="mt-3">
              <Aviso tono="operativo" titulo="Esta unidad ya fue desechada">
                El ciclo de vida de una unidad no retrocede. No es posible
                modificar su estado ni volver a registrar tamizaje. Si necesitas
                dejar constancia de algo, hazlo en el reporte del turno.
              </Aviso>
              {constancia && (
                <p className="mt-3 text-sm text-texto-gris">
                  Constancia de disposicion final:{' '}
                  <strong className="font-mono text-vino-700">
                    {constancia}
                  </strong>
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <Boton deshabilitado>Registrar tamizaje</Boton>
                <Boton variante="secundario" deshabilitado>
                  Ejecutar disposicion final
                </Boton>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              <DialogoTamizaje onRegistrar={registrarTamizaje} />
              {requiereDisposicion && (
                <DialogoDisposicion
                  estado={estado}
                  onEjecutar={ejecutarDisposicion}
                />
              )}
            </div>
          )}
        </Tarjeta>
      )}

      {!puedeEscribir && (
        <Aviso tono="informacion" titulo="Consulta de solo lectura">
          Tu perfil ({rol.nombre}) puede consultar la trazabilidad, pero no
          modificar el ciclo de vida de la unidad. Solo el operador que la
          custodia lo escribe.
        </Aviso>
      )}

      <Link
        to="/ciclovida/unidades"
        className="inline-block text-sm font-medium text-vino-700 underline-offset-4 hover:underline"
      >
        Volver a unidades
      </Link>
    </div>
  )
}

/* ---------------------------------------------------------- subcomponentes */

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

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-texto-gris">
        {etiqueta}
      </dt>
      <dd className="mt-1 text-sm font-medium text-vino-800">{valor}</dd>
    </div>
  )
}

function Superposicion() {
  return (
    <Dialog.Overlay className="fixed inset-0 z-40 bg-vino-900/40 backdrop-blur-[1px]" />
  )
}

const CONTENIDO_MODAL =
  'fixed left-1/2 top-1/2 z-50 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-vino-100 bg-white p-6 shadow-xl'

/**
 * M3-U3-06 — Registro de resultado de tamizaje.
 *
 * Dos opciones. Ningun campo de motivo. Esta ausencia es el mecanismo por el
 * que RNF-01 se sostiene en todo el resto del sistema.
 */
function DialogoTamizaje({
  onRegistrar,
}: {
  onRegistrar: (r: 'apta' | 'no apta') => void
}) {
  const [abierto, setAbierto] = useState(false)

  return (
    <Dialog.Root open={abierto} onOpenChange={setAbierto}>
      <Dialog.Trigger asChild>
        <Boton>Registrar resultado de tamizaje</Boton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Superposicion />
        <Dialog.Content className={CONTENIDO_MODAL}>
          <Dialog.Title className="text-lg font-bold text-vino-800">
            Resultado de tamizaje
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-texto-gris">
            Registra unicamente si la unidad es apta o no apta para transfusion.
            El sistema no guarda el motivo, y esta es la unica informacion que
            se conservara.
          </Dialog.Description>

          <div className="mt-5 grid gap-3">
            <Boton
              ancho
              onClick={() => {
                onRegistrar('apta')
                setAbierto(false)
              }}
            >
              La unidad es apta
            </Boton>
            <Boton
              ancho
              variante="secundario"
              onClick={() => {
                onRegistrar('no apta')
                setAbierto(false)
              }}
            >
              La unidad no es apta
            </Boton>
          </div>

          <p className="mt-4 rounded-md border border-vino-100 bg-vino-50 p-3 text-xs text-vino-800">
            No hay campo para escribir la causa. Es intencional: la Ley 1581
            clasifica los datos de salud como sensibles, y el sistema identifica
            unidades no aptas sin comunicar diagnosticos.
          </p>

          <div className="mt-4 flex justify-end">
            <Dialog.Close asChild>
              <Boton variante="texto">Cancelar</Boton>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/**
 * M3-U3-09 / M3-U3-10 — Protocolo de disposicion final y constancia.
 * El protocolo es identico para no aptas y para vencidas.
 */
function DialogoDisposicion({
  estado,
  onEjecutar,
}: {
  estado: EstadoUnidad
  onEjecutar: () => void
}) {
  const [abierto, setAbierto] = useState(false)

  return (
    <Dialog.Root open={abierto} onOpenChange={setAbierto}>
      <Dialog.Trigger asChild>
        <Boton variante="secundario">Ejecutar disposicion final</Boton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Superposicion />
        <Dialog.Content className={CONTENIDO_MODAL}>
          <Dialog.Title className="text-lg font-bold text-vino-800">
            Protocolo de disposicion final
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-texto-gris">
            Esta unidad esta marcada como <strong>{estado}</strong>. El
            procedimiento es el mismo en ambos casos.
          </Dialog.Description>

          <ol className="mt-4 space-y-2 text-sm text-texto-gris">
            <li>1. Separar la unidad del area de inventario disponible.</li>
            <li>2. Registrar el retiro en la planilla del turno.</li>
            <li>3. Entregar al procedimiento de residuos biosanitarios.</li>
            <li>4. Confirmar aqui para generar la constancia auditable.</li>
          </ol>

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <Dialog.Close asChild>
              <Boton variante="texto">Cancelar</Boton>
            </Dialog.Close>
            <Boton
              onClick={() => {
                onEjecutar()
                setAbierto(false)
              }}
            >
              Confirmar disposicion final
            </Boton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
