import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccion, useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { fechaHora, idCorto } from '@/shared/formato'
import { IconoBuscar, IconoEscudo } from '@/shared/ui/Iconos'
import { Aviso, Boton, CampoTexto, EstadoVacio, Selector, Tabla, Td, Th, TituloSeccion, unir } from '@/shared/ui/Primitivos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { Bitacora as DatosBitacora, ContextoBitacora, FiltroBitacora, RegistroBitacora } from '@/shared/tipos'

/**
 * ST2 — Consulta de la bitácora (GET /v1/auditoria, RF-21). Solo el auditor,
 * y sin ninguna operación de escritura (RI-04). La componen las cuatro series
 * de auditoría —Identidad, Campañas, Donación e Institucional—, que llegan a
 * Institucional por Kafka; la pantalla dice hasta cuándo está al día cada
 * una, porque un registro reciente puede ir todavía en camino. Los registros
 * de una misma petición comparten el identificador de correlación y se
 * presentan juntos. La propia consulta también queda auditada.
 */

export const ETIQUETA_CONTEXTO: Record<ContextoBitacora, string> = {
  identidad: 'Identidad',
  campanias: 'Campañas',
  donacion: 'Donación',
  institucional: 'Institucional',
}

const RECURSOS = ['unidad', 'donacion', 'donante', 'intencion', 'campania', 'institucion', 'territorio', 'sesion', 'usuario', 'alerta', 'umbral', 'inventario', 'indicador', 'bitacora']

/** Palabras de los códigos de operación y de recurso, escritas sin tilde en los servicios. */
const TILDES: Record<string, string> = {
  auditoria: 'auditoría',
  bitacora: 'bitácora',
  campania: 'campaña',
  campanias: 'campañas',
  captacion: 'captación',
  denegacion: 'denegación',
  donacion: 'donación',
  donaciones: 'donaciones',
  disposicion: 'disposición',
  institucion: 'institución',
  intencion: 'intención',
  jurisdiccion: 'jurisdicción',
  publicacion: 'publicación',
  renovacion: 'renovación',
  rotacion: 'rotación',
  sesion: 'sesión',
  transicion: 'transición',
  atencion: 'atención',
  cancelacion: 'cancelación',
  exclusion: 'exclusión',
}

/** «crear_institucion» → «Crear institución»; «campanias:GET» → «Campañas: GET». */
function legible(codigo: string): string {
  const texto = codigo
    .replace(':', ' : ')
    .split(/[_\s]+/)
    .map((p) => TILDES[p] ?? p)
    .join(' ')
    .replace(' : ', ': ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const vacio: FiltroBitacora = {}

export function Bitacora() {
  useTituloPagina('Bitácora')
  const [borrador, setBorrador] = useState<FiltroBitacora>(vacio)
  const [filtro, setFiltro] = useState<FiltroBitacora>(vacio)
  const consulta = useConsulta((api) => api.institucional.consultarBitacora({ ...filtro, tamano: 50 }), [filtro])
  const mas = useAccion((api, antesDe: string) => api.institucional.consultarBitacora({ ...filtro, tamano: 50, antesDe }))

  function aplicar() {
    const limpio = Object.fromEntries(
      Object.entries(borrador).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || undefined : v]),
    ) as FiltroBitacora
    setFiltro({
      ...limpio,
      desde: limpio.desde ? new Date(`${limpio.desde}T00:00:00-05:00`).toISOString() : undefined,
      hasta: limpio.hasta ? new Date(`${limpio.hasta}T23:59:59-05:00`).toISOString() : undefined,
    })
  }

  async function cargarMas(datos: DatosBitacora) {
    if (!datos.siguiente) return
    const siguiente = await mas.ejecutar(datos.siguiente)
    if (siguiente) {
      consulta.establecer({
        registros: [...datos.registros, ...siguiente.registros],
        siguiente: siguiente.siguiente,
        series: siguiente.series,
      })
    }
  }

  const campo = (clave: keyof FiltroBitacora) => ({
    valor: (borrador[clave] as string | undefined) ?? '',
    onCambio: (v: string) => setBorrador({ ...borrador, [clave]: v }),
  })

  return (
    <div className="space-y-5">
      <TituloSeccion etiqueta="Auditoría" descripcion="Registro inmutable de las acciones sensibles y de los accesos denegados en los cuatro contextos del sistema. Solo lectura.">
        Bitácora
      </TituloSeccion>

      <form
        className="grid gap-4 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault()
          aplicar()
        }}
      >
        <CampoTexto id="bit-correlacion" etiqueta="Correlación" opcional maxLength={36} {...campo('correlacionId')} />
        <Selector
          id="bit-recurso"
          etiqueta="Tipo de recurso"
          vacio="Todos"
          opciones={RECURSOS.map((r) => ({ valor: r, texto: legible(r) }))}
          {...campo('recursoTipo')}
        />
        <CampoTexto id="bit-recurso-id" etiqueta="Identificador del recurso" opcional maxLength={36} {...campo('recursoId')} />
        <CampoTexto id="bit-actor" etiqueta="Actor" opcional maxLength={64} {...campo('actorId')} />
        <CampoTexto id="bit-desde" etiqueta="Desde" tipo="date" opcional {...campo('desde')} />
        <CampoTexto id="bit-hasta" etiqueta="Hasta" tipo="date" opcional {...campo('hasta')} />
        <div className="flex flex-wrap gap-3 sm:col-span-3">
          <Boton tipo="submit" icono={<IconoBuscar />}>
            Consultar
          </Boton>
          <Boton
            variante="texto"
            onClick={() => {
              setBorrador(vacio)
              setFiltro(vacio)
            }}
          >
            Limpiar filtros
          </Boton>
        </div>
      </form>

      <EstadoDeConsulta consulta={consulta} noEncontrado="El recurso indicado no tiene registros.">
        {(datos) => (
          <div className="space-y-4">
            <SeriesAlDia series={datos.series} />
            {datos.registros.length === 0 ? (
              <EstadoVacio titulo="Sin registros" icono={<IconoEscudo />}>
                Ningún registro coincide con los filtros.
              </EstadoVacio>
            ) : (
              <Registros registros={datos.registros} onCorrelacion={(c) => {
                setBorrador({ correlacionId: c })
                setFiltro({ correlacionId: c })
              }} />
            )}
            {datos.siguiente && (
              <div className="flex justify-center">
                <Boton variante="secundario" onClick={() => cargarMas(datos)} cargando={mas.enCurso}>
                  Cargar registros anteriores
                </Boton>
              </div>
            )}
            {mas.error && <Aviso tono="error" titulo="No se pudieron cargar más registros">Inténtalo de nuevo en unos momentos.</Aviso>}
          </div>
        )}
      </EstadoDeConsulta>
    </div>
  )
}

/** Registros en orden de fecha, con los de una misma petición juntos bajo su correlación. */
function Registros({ registros, onCorrelacion }: { registros: RegistroBitacora[]; onCorrelacion: (c: string) => void }) {
  const grupos = useMemo(() => {
    const orden: { correlacion: string; registros: RegistroBitacora[] }[] = []
    const indice = new Map<string, number>()
    for (const r of registros) {
      const i = indice.get(r.correlacionId)
      if (i === undefined) {
        indice.set(r.correlacionId, orden.length)
        orden.push({ correlacion: r.correlacionId, registros: [r] })
      } else {
        orden[i].registros.push(r)
      }
    }
    return orden
  }, [registros])

  return (
    <Tabla>
      <thead>
        <tr>
          <Th>Fecha</Th>
          <Th>Contexto</Th>
          <Th>Operación</Th>
          <Th>Recurso</Th>
          <Th>Actor</Th>
          <Th>Resultado</Th>
        </tr>
      </thead>
      {grupos.map((g) => (
        <tbody key={g.correlacion} className="border-t-2 border-vino-100">
          <tr>
            <td colSpan={6} className="px-4 pt-3 text-[11px] text-texto-tenue">
              Correlación{' '}
              <button type="button" className="font-mono underline decoration-dotted hover:text-vino-700" onClick={() => onCorrelacion(g.correlacion)}>
                {g.correlacion}
              </button>
            </td>
          </tr>
          {g.registros.map((r) => (
            <tr key={`${r.contexto}-${r.id}`}>
              <Td className="whitespace-nowrap text-xs">{fechaHora(r.ocurridoEn)}</Td>
              <Td>{ETIQUETA_CONTEXTO[r.contexto]}</Td>
              <Td>
                {legible(r.operacion)}
                {r.jurisdiccionSolicitada && <span className="block text-xs text-texto-tenue">Pidió {r.jurisdiccionSolicitada}</span>}
              </Td>
              <Td>
                {legible(r.recursoTipo)}
                {r.recursoId &&
                  (r.recursoTipo === 'unidad' ? (
                    <Link to={`/ciclovida/unidades/${r.recursoId}`} className="block font-mono text-xs text-vino-600 underline">
                      {idCorto(r.recursoId)}
                    </Link>
                  ) : (
                    <span className="block font-mono text-xs text-texto-tenue">{idCorto(r.recursoId)}</span>
                  ))}
              </Td>
              <Td className="text-xs">
                {r.actorTipo === 'anonimo' ? 'Anónimo' : r.actorTipo === 'sistema' ? `Sistema (${r.actorId ?? '—'})` : r.rol ?? 'Usuario'}
                {r.actorTipo === 'usuario' && r.actorId && <span className="block font-mono text-texto-tenue">{idCorto(r.actorId)}</span>}
                {r.origen && <span className="block text-texto-tenue">{r.origen}</span>}
              </Td>
              <Td>
                <span
                  className={unir(
                    'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold',
                    r.resultado === 'permitido' ? 'border-exito-600/40 bg-exito-50 text-exito-600' : 'border-error-500/40 bg-white text-error-500',
                  )}
                >
                  {r.resultado === 'permitido' ? 'Permitido' : 'Denegado'}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      ))}
    </Tabla>
  )
}

/** Hasta cuándo llegaron los registros de cada serie. */
function SeriesAlDia({ series }: { series: DatosBitacora['series'] }) {
  const remotas = series.filter((s) => s.contexto !== 'institucional')
  if (remotas.length === 0) return null
  return (
    <p className="text-xs leading-relaxed text-texto-tenue">
      Último registro recibido:{' '}
      {remotas
        .map((s) => `${ETIQUETA_CONTEXTO[s.contexto]}, ${s.alDiaHasta ? fechaHora(s.alDiaHasta) : 'ninguno todavía'}`)
        .join(' · ')}
      . Lo más reciente puede tardar unos segundos en aparecer.
    </p>
  )
}
