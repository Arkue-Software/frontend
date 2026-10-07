import { useNavigate } from 'react-router-dom'
import { Boton, Tarjeta } from '@/shared/ui/Primitivos'

/**
 * TR-09 — Recurso no encontrado.
 *
 * Se distingue a proposito de TR-04 (denegacion por jurisdiccion): "no existe"
 * y "existe pero no te corresponde" son respuestas distintas, y confundirlas
 * filtra informacion. Por eso este texto nunca menciona jurisdicciones.
 */
export function NoEncontrado() {
  const navegar = useNavigate()
  return (
    <div className="mx-auto max-w-xl">
      <Tarjeta>
        <h1 className="text-2xl font-bold text-vino-800">
          No encontramos esta pagina
        </h1>
        <p className="mt-3 text-sm text-texto-gris">
          La direccion que abriste no corresponde a ninguna pantalla del
          sistema. Puede que el enlace este desactualizado.
        </p>
        <div className="mt-6">
          <Boton onClick={() => navegar('/')}>Volver al inicio</Boton>
        </div>
      </Tarjeta>
    </div>
  )
}
