import { INVENTARIO, BANCO_ACTUAL } from '@/shared/datos/sinteticos'
import {
  Aviso,
  CintaSintetica,
  Dato,
  Tabla,
  Td,
  Th,
  TituloSeccion,
  unir,
} from '@/shared/ui/Primitivos'
import type { ComponenteSanguineo, TipoSangre } from '@/shared/tipos'

/**
 * M4-U3-01 — Panel de inventario del banco.
 * M4-U3-03 — Existencia en cero (excepcion, visible en la celda AB-).
 *
 * RNF-01: la matriz cuenta unidades DISPONIBLES. Las no aptas no aparecen
 * desglosadas por causa en ninguna celda, ni existe un total de "no aptas por
 * motivo". Un desglose asi permitiria inferir diagnosticos por poblacion.
 *
 * Marca: la escasez se pinta en vinotinto, no en rojo brillante. Es una
 * alerta operativa del negocio, no un fallo del sistema.
 */

const COMPONENTES: ComponenteSanguineo[] = [
  'Globulos rojos',
  'Plaquetas',
  'Plasma',
]
const TIPOS: TipoSangre[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

export function PanelInventario() {
  const total = INVENTARIO.reduce((s, e) => s + e.disponibles, 0)
  const enEscasez = INVENTARIO.filter((e) => e.disponibles < e.umbralMinimo)
  const porVencer = INVENTARIO.reduce((s, e) => s + e.proximasAVencer, 0)

  function celda(componente: ComponenteSanguineo, tipo: TipoSangre) {
    return INVENTARIO.find(
      (e) => e.componente === componente && e.tipoSangre === tipo,
    )
  }

  return (
    <div className="space-y-5">
      <CintaSintetica />

      <TituloSeccion descripcion={`${BANCO_ACTUAL.nombre} · ${BANCO_ACTUAL.municipio}, ${BANCO_ACTUAL.departamento}`}>
        Inventario
      </TituloSeccion>

      <div className="grid gap-4 sm:grid-cols-3">
        <Dato etiqueta="Unidades disponibles" valor={total} />
        <Dato
          etiqueta="Combinaciones bajo umbral"
          valor={enEscasez.length}
          nota="Requieren transferencia o convocatoria"
        />
        <Dato
          etiqueta="Proximas a vencer"
          valor={porVencer}
          nota="En los proximos 7 dias"
        />
      </div>

      <Aviso tono="informacion" titulo="Que cuenta esta matriz">
        Solo unidades disponibles para transfusion o transferencia. Las
        unidades vencidas salen solas del disponible, y las no aptas no se
        contabilizan aqui ni se desglosan por ningun motivo.
      </Aviso>

      <Tabla>
        <thead>
          <tr>
            <Th>Componente</Th>
            {TIPOS.map((t) => (
              <Th key={t}>{t}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPONENTES.map((c) => (
            <tr key={c}>
              <Td className="whitespace-nowrap font-semibold text-vino-800">
                {c}
              </Td>
              {TIPOS.map((t) => {
                const e = celda(c, t)
                if (!e) {
                  return (
                    <Td key={t} className="text-center text-texto-gris">
                      —
                    </Td>
                  )
                }
                const bajo = e.disponibles < e.umbralMinimo
                const cero = e.disponibles === 0
                const resumen = `${c} ${t}: ${e.disponibles} unidades disponibles. Umbral minimo ${e.umbralMinimo}.${bajo ? ' Por debajo del umbral.' : ''}`
                return (
                  <Td key={t} className="text-center">
                    {/*
                      Dos numeros apilados no se leen solos en un lector de
                      pantalla, y el segundo se abrevia por falta de sitio en
                      una tabla de ocho columnas. La frase completa va en un
                      texto para lectores, y el `title` la deja al alcance del
                      raton.
                    */}
                    <span className="sr-only">{resumen}</span>
                    <span
                      title={resumen}
                      className={unir(
                        'inline-flex min-w-10 flex-col rounded-md px-2 py-1',
                        bajo
                          ? 'border border-vino-400 bg-vino-50'
                          : 'bg-transparent',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={unir(
                          'text-sm font-bold',
                          bajo ? 'text-vino-700' : 'text-vino-800',
                        )}
                      >
                        {e.disponibles}
                      </span>
                      {/*
                        "umbral" y no "min": es la palabra que ya usan el
                        indicador de arriba y el pie de tabla, asi que la
                        etiqueta se explica sola por concordancia.
                      */}
                      <span
                        aria-hidden="true"
                        className="text-[10px] text-texto-gris"
                      >
                        umbral {e.umbralMinimo}
                      </span>
                      {cero && (
                        <span
                          aria-hidden="true"
                          className="text-[10px] font-semibold text-vino-700"
                        >
                          sin existencia
                        </span>
                      )}
                    </span>
                  </Td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </Tabla>

      <p className="text-xs leading-relaxed text-texto-gris">
        El <strong className="font-semibold text-vino-700">umbral</strong> es
        la existencia minima que el banco debe mantener de esa combinacion de
        componente y tipo. Cuando las unidades disponibles quedan por debajo,
        la celda se enmarca, la combinacion suma al indicador de arriba y
        aparece en Alertas con una transferencia propuesta.
      </p>
      <p className="text-xs text-texto-gris">
        El vinotinto de las celdas enmarcadas es institucional a proposito: es
        una alerta operativa, no un error del sistema.
      </p>
    </div>
  )
}
