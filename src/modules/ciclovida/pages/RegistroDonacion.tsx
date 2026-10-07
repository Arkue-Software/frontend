import { useState } from 'react'
import {
  Aviso,
  Boton,
  CintaSintetica,
  Tarjeta,
  Tabla,
  Td,
  Th,
  TituloSeccion,
  unir,
} from '@/shared/ui/Primitivos'
import { InsigniaEstadoUnidad } from '@/shared/ui/EstadoUnidad'

/**
 * M3-U3-01 — Registro de una donacion.
 * M3-U3-03 — Fraccionamiento de la donacion en unidades.
 *
 * Es el inicio del Flujo A del inventario: una donacion se fracciona en varias
 * unidades trazables por separado, cada una con su propio codigo y su propio
 * ciclo de vida. Aqui todavia no hay tamizaje: las unidades nacen sin estado
 * definitivo y esperan el resultado.
 */

const COMPONENTES = [
  { nombre: 'Globulos rojos', dias: 35 },
  { nombre: 'Plasma', dias: 365 },
  { nombre: 'Plaquetas', dias: 5 },
] as const

export function RegistroDonacion() {
  const [etapa, setEtapa] = useState<'registro' | 'fraccionamiento' | 'listo'>(
    'registro',
  )
  const [seleccion, setSeleccion] = useState<string[]>([
    'Globulos rojos',
    'Plasma',
  ])

  function alternar(nombre: string) {
    setSeleccion((actual) =>
      actual.includes(nombre)
        ? actual.filter((c) => c !== nombre)
        : [...actual, nombre],
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <CintaSintetica />

      <TituloSeccion descripcion="Banco Distrital de Sangre. Solo el operador que custodia la unidad registra su ciclo de vida.">
        Registrar donacion
      </TituloSeccion>

      {etapa === 'registro' && (
        <Tarjeta>
          <h2 className="text-lg font-bold text-vino-800">
            Paso 1: datos de la donacion
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Codigo del donante" valor="DEMO-AN-77Q4" />
            <Campo etiqueta="Banco" valor="Banco Distrital de Sangre" />
            <Campo etiqueta="Fecha de captacion" valor="2026-08-27" />
            <Campo etiqueta="Jornada asociada" valor="Jornada Plaza Central" />
          </div>

          <div className="mt-5">
            <Aviso tono="informacion" titulo="Donante verificado como elegible">
              Si el donante no fuera elegible, el sistema bloquearia este
              registro e indicaria la fecha, sin mostrar ningun motivo.
            </Aviso>
          </div>

          <div className="mt-5">
            <Boton onClick={() => setEtapa('fraccionamiento')}>
              Registrar y continuar al fraccionamiento
            </Boton>
          </div>
        </Tarjeta>
      )}

      {etapa === 'fraccionamiento' && (
        <Tarjeta>
          <h2 className="text-lg font-bold text-vino-800">
            Paso 2: fraccionamiento en unidades
          </h2>
          <p className="mt-2 text-sm text-texto-gris">
            La donacion <strong className="font-mono">DEMO-D-1210</strong> se
            separa en componentes. Cada componente genera una unidad con codigo
            propio y vencimiento propio.
          </p>

          <div className="mt-5 space-y-2">
            {COMPONENTES.map((c) => (
              <button
                key={c.nombre}
                type="button"
                onClick={() => alternar(c.nombre)}
                aria-pressed={seleccion.includes(c.nombre)}
                className={unir(
                  'flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors',
                  seleccion.includes(c.nombre)
                    ? 'border-vino-600 bg-vino-50'
                    : 'border-vino-200 bg-white hover:border-vino-400',
                )}
              >
                <span className="font-semibold text-vino-800">{c.nombre}</span>
                <span className="text-xs text-texto-gris">
                  Vence a los {c.dias} dias
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            <Boton variante="secundario" onClick={() => setEtapa('registro')}>
              Atras
            </Boton>
            <Boton
              onClick={() => setEtapa('listo')}
              deshabilitado={seleccion.length === 0}
            >
              Generar {seleccion.length}{' '}
              {seleccion.length === 1 ? 'unidad' : 'unidades'}
            </Boton>
          </div>
        </Tarjeta>
      )}

      {etapa === 'listo' && (
        <>
          <Aviso tono="exito" titulo="Donacion registrada y fraccionada">
            Se generaron {seleccion.length} unidades trazables. Todas quedan a
            la espera del resultado de tamizaje antes de entrar al inventario.
          </Aviso>

          <Tabla>
            <thead>
              <tr>
                <Th>Codigo de unidad</Th>
                <Th>Componente</Th>
                <Th>Tipo</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {seleccion.map((c, i) => (
                <tr key={c}>
                  <Td className="font-mono text-xs font-semibold text-vino-800">
                    DEMO-U-0049{30 + i}
                  </Td>
                  <Td>{c}</Td>
                  <Td>O+</Td>
                  <Td>
                    <span className="inline-flex rounded-full border border-vino-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-texto-gris">
                      En espera de tamizaje
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>

          <div className="flex flex-wrap gap-3">
            <Boton onClick={() => setEtapa('registro')}>
              Registrar otra donacion
            </Boton>
          </div>
        </>
      )}

      <Tarjeta className="bg-vino-50">
        <p className="text-xs font-semibold uppercase tracking-wide text-vino-700">
          Estados posibles de una unidad
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <InsigniaEstadoUnidad estado="apta" />
          <InsigniaEstadoUnidad estado="no apta" />
          <InsigniaEstadoUnidad estado="vencida" />
          <InsigniaEstadoUnidad estado="desechada" />
        </div>
        <p className="mt-3 text-xs text-texto-gris">
          Son los cuatro unicos estados que el sistema muestra. Ninguno viene
          acompanado de una causa.
        </p>
      </Tarjeta>
    </div>
  )
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-texto-gris">
        {etiqueta}
      </p>
      <p className="mt-1 rounded-md border border-vino-100 bg-vino-50 px-3 py-2 text-sm font-medium text-vino-800">
        {valor}
      </p>
    </div>
  )
}
