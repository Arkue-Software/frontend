import { useMemo, useState } from 'react'
import { useConsulta } from '@/shared/consulta/useConsulta'
import { ErrorDeServicio } from '@/shared/consulta/EstadoDeConsulta'
import { ETIQUETA_COMPONENTE } from '@/shared/datos/catalogos'
import { fecha, fechaHora, hoy, jurisdiccionEnFrase } from '@/shared/formato'
import { NombreInstitucion } from '@/shared/institucional/NombreInstitucion'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { CargandoRedVital } from '@/shared/ui/Cargando'
import { IconoInventario } from '@/shared/ui/Iconos'
import { Aviso, Dato, EstadoVacio, Selector, Tabla, Tarjeta, Td, Th, TituloSeccion } from '@/shared/ui/Primitivos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { AgrupacionIndicadores, ExistenciaAgregada, Indicadores as DatosIndicadores } from '@/shared/tipos'

/**
 * M7 — Tablero de indicadores (GET /v1/indicadores, RF-13). Solo lectura
 * (RI-03): captación, existencias y cobertura territorial, agregadas a la
 * jurisdicción del usuario. Las cifras de captación e inventario las calcula
 * Donación; si no responde, la pantalla lo declara y no muestra cifras.
 */

const AGRUPACIONES: { valor: AgrupacionIndicadores; texto: string }[] = [
  { valor: 'dia', texto: 'Por día' },
  { valor: 'semana', texto: 'Por semana' },
  { valor: 'mes', texto: 'Por mes' },
]

function haceDias(dias: number): string {
  const [a, m, d] = hoy().split('-').map(Number)
  const f = new Date(Date.UTC(a, m - 1, d - dias))
  return f.toISOString().slice(0, 10)
}

export function Indicadores() {
  useTituloPagina('Indicadores')
  const { rol, usuario } = useSesion()
  const territorial = rol.id === 'U5' || rol.id === 'U6'
  const [desde, setDesde] = useState(() => haceDias(89))
  const [hasta, setHasta] = useState(() => hoy())
  const [agrupar, setAgrupar] = useState<AgrupacionIndicadores>('mes')
  const [ambito, setAmbito] = useState('')

  const departamentos = useConsulta(
    (api) => (territorial ? api.institucional.listarTerritorios({ nivel: 'departamental', tamano: 500 }) : Promise.resolve(null)),
    [territorial],
  )
  const fechasValidas = Boolean(desde && hasta && desde <= hasta)
  const consulta = useConsulta(
    (api) =>
      fechasValidas
        ? api.institucional.consultarIndicadores({ desde, hasta, agruparPor: agrupar, territorioRuta: ambito || undefined })
        : Promise.resolve(null),
    [desde, hasta, agrupar, ambito, fechasValidas],
  )

  const opcionesAmbito = useMemo(
    () =>
      [...(departamentos.datos?.elementos ?? [])]
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
        .map((d) => ({ valor: d.ruta, texto: d.nombre })),
    [departamentos.datos],
  )

  return (
    <div className="space-y-5">
      <TituloSeccion
        etiqueta="Analítica"
        descripcion={`Captación, existencias y cobertura de ${jurisdiccionEnFrase(usuario?.jurisdiccion)}. Solo lectura.`}
      >
        Indicadores
      </TituloSeccion>

      <div className="grid gap-4 sm:grid-cols-4">
        <CampoFecha id="ind-desde" etiqueta="Desde" valor={desde} onCambio={setDesde} />
        <CampoFecha id="ind-hasta" etiqueta="Hasta" valor={hasta} onCambio={setHasta} />
        <Selector
          id="ind-agrupar"
          etiqueta="Agrupación"
          valor={agrupar}
          onCambio={(v) => setAgrupar(v as AgrupacionIndicadores)}
          opciones={AGRUPACIONES}
        />
        {territorial && opcionesAmbito.length > 1 && (
          <Selector id="ind-ambito" etiqueta="Departamento" valor={ambito} onCambio={setAmbito} vacio="Toda mi jurisdicción" opciones={opcionesAmbito} />
        )}
      </div>
      {!fechasValidas && <Aviso tono="operativo" titulo="Revisa el periodo">La fecha inicial no puede ser posterior a la final.</Aviso>}

      {consulta.estado === 'error' ? (
        <ErrorDeServicio error={consulta.error} onReintentar={consulta.recargar} />
      ) : consulta.datos === undefined ? (
        <CargandoRedVital />
      ) : consulta.datos === null ? null : (
        <Tablero datos={consulta.datos} multiplesBancos={territorial} />
      )}
    </div>
  )
}

function Tablero({ datos, multiplesBancos }: { datos: DatosIndicadores; multiplesBancos: boolean }) {
  const totales = datos.captacion.reduce(
    (t, p) => ({ donaciones: t.donaciones + p.donaciones, unidades: t.unidades + p.unidadesGeneradas, vencidas: t.vencidas + p.unidadesVencidas }),
    { donaciones: 0, unidades: 0, vencidas: 0 },
  )
  const maximo = Math.max(1, ...datos.captacion.map((p) => p.donaciones))
  const bajoUmbral = datos.inventario.filter((e) => e.bajoUmbral)

  return (
    <div className="space-y-6">
      <p className="text-xs text-texto-tenue">
        Del {fecha(datos.filtro.desde)} al {fecha(datos.filtro.hasta)}.{' '}
        {datos.actualizadoEn
          ? `Cifras de Donación al ${fechaHora(datos.actualizadoEn)}; se actualizan cada minuto.`
          : 'Donación todavía no ha enviado cifras de lo elegido.'}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Dato etiqueta="Donaciones captadas" valor={totales.donaciones} destacado />
        <Dato etiqueta="Unidades generadas" valor={totales.unidades} />
        <Dato etiqueta="Unidades vencidas" valor={totales.vencidas} />
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-vino-800">Captación</h2>
        {datos.captacion.length === 0 ? (
          <EstadoVacio titulo="Sin donaciones en el periodo" icono={<IconoInventario />}>
            No hay donaciones captadas en el periodo y el ámbito elegidos.
          </EstadoVacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Periodo</Th>
                <Th>Donaciones</Th>
                <Th>Unidades</Th>
                <Th>No aptas</Th>
                <Th>Vencidas</Th>
              </tr>
            </thead>
            <tbody>
              {datos.captacion.map((p) => (
                <tr key={p.periodo}>
                  <Td className="font-mono text-xs">{p.periodo}</Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-right font-bold">{p.donaciones}</span>
                      <span aria-hidden className="h-2 rounded-full bg-vino-500" style={{ width: `${(p.donaciones / maximo) * 8}rem` }} />
                    </div>
                  </Td>
                  <Td>{p.unidadesGeneradas}</Td>
                  <Td>{p.suprimidoPorAgregacion ? <span className="text-xs text-texto-tenue">Suprimido</span> : p.unidadesNoAptas}</Td>
                  <Td>{p.unidadesVencidas}</Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
        <Aviso tono="informacion" titulo="Supresión por agregación">
          En un periodo con menos de cinco donaciones no se muestra el conteo de unidades no aptas: con tan pocos
          casos, la cifra podría revelar el resultado de una persona.
        </Aviso>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-vino-800">Existencias</h2>
        <Existencias filas={datos.inventario} />
        {bajoUmbral.length > 0 && (
          <Aviso tono="operativo" titulo={bajoUmbral.length === 1 ? 'Una combinación bajo el umbral' : `${bajoUmbral.length} combinaciones bajo el umbral`}>
            <ul className="mt-1 space-y-1">
              {bajoUmbral.map((e) => (
                <li key={`${e.institucionId}-${e.componente}-${e.grupo}`}>
                  {ETIQUETA_COMPONENTE[e.componente]} {e.grupo}: {e.disponibles} disponibles
                  {multiplesBancos && (
                    <>
                      {' '}
                      en <NombreInstitucion id={e.institucionId} />
                    </>
                  )}
                </li>
              ))}
            </ul>
          </Aviso>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-vino-800">Cobertura territorial</h2>
        <Tabla>
          <thead>
            <tr>
              <Th>Departamento</Th>
              <Th>Municipios con banco</Th>
              <Th>Bancos de sangre</Th>
              <Th>Servicios de transfusión</Th>
            </tr>
          </thead>
          <tbody>
            {datos.cobertura.map((c) => (
              <tr key={c.territorioCodigo}>
                <Td className="font-bold text-vino-800">{c.nombre}</Td>
                <Td>
                  {c.municipiosConBanco} de {c.municipios}
                  {c.municipios > 0 && (
                    <span className="ml-2 text-xs text-texto-tenue">{Math.round((c.municipiosConBanco / c.municipios) * 100)} %</span>
                  )}
                </Td>
                <Td>{c.bancosDeSangre}</Td>
                <Td>{c.serviciosTransfusion}</Td>
              </tr>
            ))}
          </tbody>
        </Tabla>
        <p className="text-xs text-texto-tenue">
          {datos.filtro.institucionId
            ? 'Cobertura del municipio de tu banco: si cuenta con al menos un banco de sangre vigente.'
            : 'Municipios registrados en la red territorial con al menos un banco de sangre vigente.'}
        </p>
      </section>
    </div>
  )
}

/** Existencias sumadas por componente y grupo en todo el ámbito consultado. */
function Existencias({ filas }: { filas: ExistenciaAgregada[] }) {
  const sumas = useMemo(() => {
    const mapa = new Map<string, { componente: ExistenciaAgregada['componente']; grupo: string; disponibles: number; porVencer: number }>()
    for (const f of filas) {
      const clave = `${f.componente}|${f.grupo}`
      const actual = mapa.get(clave) ?? { componente: f.componente, grupo: f.grupo, disponibles: 0, porVencer: 0 }
      actual.disponibles += f.disponibles
      actual.porVencer += f.porVencer
      mapa.set(clave, actual)
    }
    return [...mapa.values()].sort((a, b) => a.componente.localeCompare(b.componente) || a.grupo.localeCompare(b.grupo))
  }, [filas])

  if (sumas.length === 0) {
    return (
      <EstadoVacio titulo="Sin existencias" icono={<IconoInventario />}>
        No hay unidades disponibles ni umbrales configurados en el ámbito elegido.
      </EstadoVacio>
    )
  }
  return (
    <Tarjeta>
      <Tabla>
        <thead>
          <tr>
            <Th>Componente</Th>
            <Th>Grupo</Th>
            <Th>Disponibles</Th>
            <Th>Por vencer</Th>
          </tr>
        </thead>
        <tbody>
          {sumas.map((s) => (
            <tr key={`${s.componente}|${s.grupo}`}>
              <Td>{ETIQUETA_COMPONENTE[s.componente]}</Td>
              <Td className="font-bold">{s.grupo}</Td>
              <Td>{s.disponibles}</Td>
              <Td>{s.porVencer}</Td>
            </tr>
          ))}
        </tbody>
      </Tabla>
    </Tarjeta>
  )
}

function CampoFecha({ id, etiqueta, valor, onCambio }: { id: string; etiqueta: string; valor: string; onCambio: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-vino-800">
        {etiqueta}
      </label>
      <input
        id={id}
        type="date"
        value={valor}
        max={hoy()}
        onChange={(e) => onCambio(e.target.value)}
        className="mt-2 min-h-11 w-full rounded-suave border border-vino-200 bg-white px-4 text-sm text-vino-800 focus:border-vino-500"
      />
    </div>
  )
}
