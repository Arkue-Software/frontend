import type { EstadoUnidad } from '@/shared/tipos'
import { unir } from './Primitivos'

/**
 * RNF-01 — Confidencialidad.
 *
 * Unico lugar del prototipo donde se pinta el estado de una unidad, y admite
 * exactamente cuatro valores. Deliberadamente:
 *
 *  - no recibe ninguna prop de motivo, causa ni diagnostico
 *  - no tiene tooltip: es el escondite tipico de la causa clinica
 *  - no expone variantes "detalladas" del estado
 *
 * Si una pantalla necesitara mostrar por que una unidad no es apta, tendria
 * que modificar este componente, y ese cambio no debe aprobarse.
 *
 * Cada estado lleva ademas una forma propia en el punto indicador, para que
 * se distingan sin depender del color.
 */

const ESTILOS: Record<EstadoUnidad, string> = {
  apta: 'border-exito-600/40 bg-exito-50 text-exito-600',
  'no apta': 'border-vino-400 bg-vino-50 text-vino-700',
  vencida: 'border-aviso-600/40 bg-aviso-50 text-aviso-600',
  desechada: 'border-texto-gris/30 bg-white text-texto-gris',
}

const PUNTOS: Record<EstadoUnidad, string> = {
  apta: 'rounded-full bg-exito-600',
  'no apta': 'rounded-[1px] bg-vino-600',
  vencida: 'rounded-[1px] rotate-45 bg-aviso-600',
  desechada: 'rounded-full border-2 border-texto-gris bg-transparent',
}

const ETIQUETAS: Record<EstadoUnidad, string> = {
  apta: 'Apta',
  'no apta': 'No apta',
  vencida: 'Vencida',
  desechada: 'Desechada',
}

export function InsigniaEstadoUnidad({
  estado,
  tamano = 'normal',
}: {
  estado: EstadoUnidad
  tamano?: 'normal' | 'grande'
}) {
  return (
    <span
      className={unir(
        'inline-flex items-center gap-1.5 rounded-full border font-bold',
        tamano === 'grande'
          ? 'px-3.5 py-1.5 text-sm'
          : 'px-2.5 py-1 text-xs',
        ESTILOS[estado],
      )}
    >
      <span
        aria-hidden="true"
        className={unir('h-2 w-2 shrink-0', PUNTOS[estado])}
      />
      {ETIQUETAS[estado]}
    </span>
  )
}
