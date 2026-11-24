import { useEffect } from 'react'

/**
 * Vuelve a pedir los datos de una pantalla que otros cambian mientras se mira
 * (el inventario y sus alertas los mueven el registro, el tamizaje y la
 * distribución de cualquier operador del banco). Recarga cada `intervaloMs`
 * mientras la pestaña está visible, y enseguida al volver a ella.
 */
export function useRecargaPeriodica(recargar: () => void, intervaloMs = 30_000) {
  useEffect(() => {
    const visible = () => document.visibilityState === 'visible'
    const temporizador = window.setInterval(() => {
      if (visible()) recargar()
    }, intervaloMs)
    const alVolver = () => {
      if (visible()) recargar()
    }
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      window.clearInterval(temporizador)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [recargar, intervaloMs])
}
