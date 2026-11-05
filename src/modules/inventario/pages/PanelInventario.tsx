import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Api } from '@/api/contratos'
import { useAccion, useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { useRecargaPeriodica } from '@/shared/consulta/useRecargaPeriodica'
import { COMPONENTES, ETIQUETA_COMPONENTE, GRUPOS_SANGUINEOS } from '@/shared/datos/catalogos'
import { fechaCorta, hoy, jurisdiccionEnFrase } from '@/shared/formato'
import { NombreInstitucion } from '@/shared/institucional/NombreInstitucion'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { DialogoConfirmacion } from '@/shared/ui/DialogoConfirmacion'
import { Boton, Dato, Tabla, Td, Th, TituloSeccion, unir } from '@/shared/ui/Primitivos'
import { IconoAlerta, IconoCerrar, IconoInventario, IconoReloj } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { Alerta, ComponenteSanguineo, Existencia, GrupoSanguineo, RolId, Umbral } from '@/shared/tipos'

/**
 * M4-U3-01 / M4-U4-01 — Inventario del banco (GET /v1/inventario).
 * M4-U4-02 — Umbrales de escasez y vencimiento (GET/PUT /v1/inventario/umbrales).
 * M4-U5-01 / M4-U6-01 — Inventario de los bancos de la jurisdicción, en
 * lectura: la matriz suma los bancos y una tabla los desglosa. Los umbrales
 * son de cada banco y solo los ven su operador y su administrador.
 *
 * La matriz cruza componente y grupo. Una celda se marca cuando queda por
 * debajo de su umbral o cuando su unidad más próxima vence dentro del plazo
 * configurado. El umbral de un grupo concreto prevalece sobre el general.
 *
 * Las existencias cambian con lo que hacen todos los operadores del banco: la
 * pantalla se vuelve a pedir sola. Al guardar un umbral, Donación reevalúa las
 * alertas en la misma operación, así que se recargan también.
 */

interface DatosInventario {
  existencias: Existencia[]
  umbrales: Umbral[]
  alertasAbiertas: Alerta[]
}

/** Lo que cada perfil puede leer (DD 15.5, grupos 7 y 8): U6 no ve alertas; U5 y U6 no ven umbrales. */
const cargar = async (api: Api, rol: RolId): Promise<DatosInventario> => {
  const deBanco = rol === 'U3' || rol === 'U4'
  const [existencias, umbrales, alertasAbiertas] = await Promise.all([
    api.inventario.consultarExistencias(),
    deBanco ? api.inventario.consultarUmbrales() : Promise.resolve([]),
    rol === 'U6' ? Promise.resolve([]) : api.inventario.listarAlertas('abierta'),
  ])
  return { existencias, umbrales, alertasAbiertas }
}

export function PanelInventario() {
  useTituloPagina('Inventario')
  const { rol, usuario } = useSesion()
  const consulta = useConsulta((api) => cargar(api, rol.id), [rol.id])
  useRecargaPeriodica(consulta.recargar)
  const administra = rol.id === 'U4'
  const territorial = rol.id === 'U5' || rol.id === 'U6'

  return (
    <div className="space-y-6">
      <TituloSeccion
        etiqueta="Inventario"
        descripcion={
          territorial
            ? `Unidades disponibles en los bancos de ${jurisdiccionEnFrase(usuario?.jurisdiccion)}, por componente y grupo sanguíneo.`
            : 'Unidades disponibles de tu banco por componente y grupo sanguíneo.'
        }
      >
        Inventario
      </TituloSeccion>
      <EstadoDeConsulta consulta={consulta}>
        {(datos) => (
          <Panel
            datos={datos}
            administra={administra}
            territorial={territorial}
            conAlertas={rol.id !== 'U6'}
            onUmbrales={(umbrales) => {
              consulta.establecer({ ...datos, umbrales })
              consulta.recargar()
            }}
          />
        )}
      </EstadoDeConsulta>
    </div>
  )
}

function umbralDe(umbrales: Umbral[], componente: ComponenteSanguineo, grupo: GrupoSanguineo): Umbral | undefined {
  return (
    umbrales.find((u) => u.componente === componente && u.grupo === grupo) ??
    umbrales.find((u) => u.componente === componente && u.grupo === null)
  )
}

function diasHasta(fechaIso: string): number {
  const [a, m, d] = hoy().split('-').map(Number)
  const [a2, m2, d2] = fechaIso.slice(0, 10).split('-').map(Number)
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a, m - 1, d)) / 86_400_000)
}

function Panel({
  datos,
  administra,
  territorial,
  conAlertas,
  onUmbrales,
}: {
  datos: DatosInventario
  administra: boolean
  territorial: boolean
  conAlertas: boolean
  onUmbrales: (u: Umbral[]) => void
}) {
  const [editando, setEditando] = useState(false)
  // Con varios bancos, cada celda suma sus existencias y toma el vencimiento más próximo.
  const celda = (c: ComponenteSanguineo, g: GrupoSanguineo): Pick<Existencia, 'disponibles' | 'vencimientoMasProximo'> | undefined => {
    const filas = datos.existencias.filter((e) => e.componente === c && e.grupo === g)
    if (filas.length === 0) return undefined
    const vencimientos = filas.map((e) => e.vencimientoMasProximo).filter((v): v is string => v !== null).sort()
    return { disponibles: filas.reduce((s, e) => s + e.disponibles, 0), vencimientoMasProximo: vencimientos[0] ?? null }
  }
  const total = datos.existencias.reduce((s, e) => s + e.disponibles, 0)
  const escasez = datos.alertasAbiertas.filter((a) => a.tipo === 'escasez').length
  const vencimiento = datos.alertasAbiertas.filter((a) => a.tipo === 'vencimiento_proximo').length

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Dato etiqueta="Unidades disponibles" valor={total} destacado icono={<IconoInventario className="h-5 w-5" />} />
        {conAlertas && (
          <>
            <Dato etiqueta="Alertas de escasez" valor={escasez} nota="Abiertas" icono={<IconoAlerta className="h-5 w-5" />} />
            <Dato etiqueta="Vencimientos próximos" valor={vencimiento} nota="Abiertas" icono={<IconoReloj className="h-5 w-5" />} />
          </>
        )}
      </div>

      <Tabla>
        <thead>
          <tr>
            <Th>Componente</Th>
            {GRUPOS_SANGUINEOS.map((g) => (
              <Th key={g}>{g}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPONENTES.map((c) => (
            <tr key={c}>
              <Td className="font-bold text-vino-800">{ETIQUETA_COMPONENTE[c]}</Td>
              {GRUPOS_SANGUINEOS.map((g) => {
                const e = celda(c, g)
                const disponibles = e?.disponibles ?? 0
                const u = umbralDe(datos.umbrales, c, g)
                const bajo = u !== undefined && disponibles < u.minimoUnidades
                const vence = u !== undefined && e?.vencimientoMasProximo != null && diasHasta(e.vencimientoMasProximo) <= u.diasPreviosVencimiento
                return (
                  <Td key={g} className={unir('tabular-nums', bajo && 'bg-vino-50')}>
                    <span className={unir('text-base font-bold', bajo ? 'text-vino-700' : 'text-vino-800')}>{disponibles}</span>
                    {bajo && <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-vino-600">bajo</span>}
                    {e?.vencimientoMasProximo && (
                      <span className={unir('block text-[11px]', vence ? 'font-bold text-aviso-600' : 'text-texto-tenue')}>
                        vence {fechaCorta(e.vencimientoMasProximo)}
                      </span>
                    )}
                  </Td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </Tabla>
      <p className="text-xs text-texto-tenue">
        {territorial
          ? 'Suma de los bancos de tu jurisdicción. La fecha es la del vencimiento más próximo entre todas sus unidades disponibles.'
          : '«Bajo» marca las celdas por debajo de su umbral mínimo. La fecha es la del vencimiento más próximo entre las unidades disponibles.'}{' '}
        {conAlertas && (
          <Link to="/inventario/alertas" className="font-bold text-vino-700 underline-offset-4 hover:underline">
            Ver alertas
          </Link>
        )}
      </p>

      {territorial && <PorBanco existencias={datos.existencias} />}

      {!territorial && (
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-vino-800">Umbrales</h2>
          {administra && (
            <Boton variante="secundario" onClick={() => setEditando(true)}>
              Configurar umbrales
            </Boton>
          )}
        </div>
        {datos.umbrales.length === 0 ? (
          <p className="text-sm text-texto-gris">
            {administra ? 'Aún no hay umbrales: sin ellos no se generan alertas.' : 'El administrador del banco aún no configuró umbrales.'}
          </p>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Componente</Th>
                <Th>Grupo</Th>
                <Th>Mínimo de unidades</Th>
                <Th>Aviso de vencimiento</Th>
              </tr>
            </thead>
            <tbody>
              {ordenar(datos.umbrales).map((u) => (
                <tr key={`${u.componente}|${u.grupo}`}>
                  <Td>{ETIQUETA_COMPONENTE[u.componente]}</Td>
                  <Td>{u.grupo ?? 'Cualquier grupo'}</Td>
                  <Td className="tabular-nums">{u.minimoUnidades}</Td>
                  <Td className="tabular-nums">{u.diasPreviosVencimiento} días antes</Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </section>
      )}

      {editando && (
        <EditorUmbrales
          iniciales={datos.umbrales}
          onCerrar={() => setEditando(false)}
          onGuardado={(u) => {
            onUmbrales(u)
            setEditando(false)
          }}
        />
      )}
    </>
  )
}

/** Desglose por banco de la jurisdicción (U5, U6). */
function PorBanco({ existencias }: { existencias: Existencia[] }) {
  const bancos = [...new Set(existencias.map((e) => e.institucionId))]
  if (bancos.length === 0) return null
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-vino-800">Por banco</h2>
      <Tabla>
        <thead>
          <tr>
            <Th>Banco</Th>
            {COMPONENTES.map((c) => (
              <Th key={c}>{ETIQUETA_COMPONENTE[c]}</Th>
            ))}
            <Th>Total</Th>
          </tr>
        </thead>
        <tbody>
          {bancos.map((b) => {
            const suyas = existencias.filter((e) => e.institucionId === b)
            const de = (c: ComponenteSanguineo) => suyas.filter((e) => e.componente === c).reduce((s, e) => s + e.disponibles, 0)
            return (
              <tr key={b}>
                <Td className="font-bold text-vino-800">
                  <NombreInstitucion id={b} conMunicipio />
                </Td>
                {COMPONENTES.map((c) => (
                  <Td key={c} className="tabular-nums">
                    {de(c)}
                  </Td>
                ))}
                <Td className="font-bold tabular-nums">{suyas.reduce((s, e) => s + e.disponibles, 0)}</Td>
              </tr>
            )
          })}
        </tbody>
      </Tabla>
    </section>
  )
}

function ordenar(umbrales: Umbral[]): Umbral[] {
  return [...umbrales].sort(
    (a, b) =>
      COMPONENTES.indexOf(a.componente) - COMPONENTES.indexOf(b.componente) ||
      (a.grupo === null ? -1 : b.grupo === null ? 1 : GRUPOS_SANGUINEOS.indexOf(a.grupo) - GRUPOS_SANGUINEOS.indexOf(b.grupo)),
  )
}

interface FilaUmbral {
  componente: ComponenteSanguineo
  grupo: GrupoSanguineo | ''
  minimo: string
  dias: string
}

/** M4-U4-02 — Edición de umbrales. El PUT reemplaza el conjunto completo. */
function EditorUmbrales({ iniciales, onCerrar, onGuardado }: { iniciales: Umbral[]; onCerrar: () => void; onGuardado: (u: Umbral[]) => void }) {
  const [filas, setFilas] = useState<FilaUmbral[]>(() =>
    iniciales.length > 0
      ? ordenar(iniciales).map((u) => ({ componente: u.componente, grupo: u.grupo ?? '', minimo: String(u.minimoUnidades), dias: String(u.diasPreviosVencimiento) }))
      : COMPONENTES.map((c) => ({ componente: c, grupo: '', minimo: '', dias: '' })),
  )
  const guardar = useAccion((api) =>
    api.inventario.guardarUmbrales(
      filas.map((f) => ({
        componente: f.componente,
        grupo: f.grupo || null,
        minimoUnidades: Number(f.minimo),
        diasPreviosVencimiento: Number(f.dias),
      })),
    ),
  )

  const entero = (v: string, max: number) => /^\d+$/.test(v) && Number(v) > 0 && Number(v) <= max
  const claves = filas.map((f) => `${f.componente}|${f.grupo}`)
  const duplicada = claves.some((k, i) => claves.indexOf(k) !== i)
  const valido = filas.length > 0 && filas.length <= 50 && !duplicada && filas.every((f) => entero(f.minimo, 10_000) && entero(f.dias, 365))

  function cambiar(i: number, cambio: Partial<FilaUmbral>) {
    setFilas(filas.map((f, j) => (j === i ? { ...f, ...cambio } : f)))
  }

  async function confirmar() {
    const r = await guardar.ejecutar()
    if (r) onGuardado(r)
  }

  const claseCampo = 'min-h-10 w-full rounded-suave border border-vino-200 bg-white px-2.5 text-sm text-vino-800'

  return (
    <DialogoConfirmacion
      abierto
      titulo="Configurar umbrales"
      descripcion="Mínimo de unidades disponibles antes de alertar escasez y días de anticipación para alertar un vencimiento. El umbral de un grupo concreto prevalece sobre el de «cualquier grupo»."
      textoConfirmar="Guardar umbrales"
      onConfirmar={confirmar}
      onCerrar={onCerrar}
      cargando={guardar.enCurso}
      confirmarDeshabilitado={!valido}
      error={
        guardar.error
          ? 'No pudimos guardar los umbrales. Revisa los valores e inténtalo de nuevo.'
          : duplicada
            ? 'Cada combinación de componente y grupo puede aparecer una sola vez.'
            : null
      }
    >
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_5rem_5rem_2.5rem] gap-2 text-[11px] font-bold uppercase tracking-wider text-texto-tenue">
          <span>Componente</span>
          <span>Grupo</span>
          <span>Mínimo</span>
          <span>Días</span>
          <span />
        </div>
        {filas.map((f, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_5rem_5rem_2.5rem] items-center gap-2">
            <select aria-label="Componente" className={claseCampo} value={f.componente} onChange={(e) => cambiar(i, { componente: e.target.value as ComponenteSanguineo })}>
              {COMPONENTES.map((c) => (
                <option key={c} value={c}>
                  {ETIQUETA_COMPONENTE[c]}
                </option>
              ))}
            </select>
            <select aria-label="Grupo" className={claseCampo} value={f.grupo} onChange={(e) => cambiar(i, { grupo: e.target.value as GrupoSanguineo | '' })}>
              <option value="">Cualquiera</option>
              {GRUPOS_SANGUINEOS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <input aria-label="Mínimo de unidades" inputMode="numeric" className={claseCampo} value={f.minimo} onChange={(e) => cambiar(i, { minimo: e.target.value.trim() })} />
            <input aria-label="Días de anticipación" inputMode="numeric" className={claseCampo} value={f.dias} onChange={(e) => cambiar(i, { dias: e.target.value.trim() })} />
            <button
              type="button"
              aria-label="Quitar umbral"
              onClick={() => setFilas(filas.filter((_, j) => j !== i))}
              className="flex h-10 w-10 items-center justify-center rounded-full text-texto-tenue hover:bg-vino-50 hover:text-vino-700"
            >
              <IconoCerrar className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Boton variante="texto" onClick={() => setFilas([...filas, { componente: 'globulos_rojos', grupo: '', minimo: '', dias: '' }])} deshabilitado={filas.length >= 50}>
          Agregar umbral
        </Boton>
      </div>
    </DialogoConfirmacion>
  )
}
