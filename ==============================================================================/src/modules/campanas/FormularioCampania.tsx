import { useState } from 'react'
import { useAccion } from '@/shared/consulta/useConsulta'
import { DialogoConfirmacion } from '@/shared/ui/DialogoConfirmacion'
import { CampoTexto } from '@/shared/ui/Primitivos'
import type { Campania, DatosCampania } from '@/shared/tipos'

/**
 * Crear una campaña (POST /v1/campanias) o editar un borrador (PUT
 * /v1/campanias/{id}). La campaña nace en borrador con la institución del
 * administrador; el municipio lo fija el Servicio Institucional, no el
 * formulario. Las mismas reglas que el servicio: nombre, sede, fechas en
 * orden y en el futuro, cupo positivo o sin límite.
 */

/** «2026-11-03T13:00» en la hora local del navegador, para un <input type="datetime-local">. */
function aLocal(iso: string): string {
  const d = new Date(iso)
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`
}

export function FormularioCampania({
  campania,
  onCerrar,
  onGuardada,
}: {
  campania: Campania | null
  onCerrar: () => void
  onGuardada: (c: Campania) => void
}) {
  const [nombre, setNombre] = useState(campania?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(campania?.descripcion ?? '')
  const [sede, setSede] = useState(campania?.sede ?? '')
  const [inicia, setInicia] = useState(campania ? aLocal(campania.iniciaEn) : '')
  const [termina, setTermina] = useState(campania ? aLocal(campania.terminaEn) : '')
  const [cupo, setCupo] = useState(campania?.cupoTotal ? String(campania.cupoTotal) : '')

  const datos = (): DatosCampania => ({
    nombre: nombre.trim(),
    descripcion: descripcion.trim() || null,
    sede: sede.trim(),
    iniciaEn: new Date(inicia).toISOString(),
    terminaEn: new Date(termina).toISOString(),
    cupoTotal: cupo ? Number(cupo) : null,
  })
  const guardar = useAccion((api) => (campania ? api.campanias.editar(campania.id, datos()) : api.campanias.crear(datos())))

  const errorFechas =
    inicia && termina && new Date(termina) <= new Date(inicia)
      ? 'La campaña debe terminar después de empezar.'
      : termina && new Date(termina) <= new Date()
        ? 'La campaña no puede terminar en el pasado.'
        : null
  const errorCupo = cupo && !(/^\d+$/.test(cupo) && Number(cupo) > 0) ? 'Escribe un número mayor que cero, o deja el campo vacío.' : null
  const valido =
    nombre.trim().length > 0 && nombre.trim().length <= 160 && sede.trim().length > 0 && sede.trim().length <= 200 &&
    descripcion.length <= 500 && Boolean(inicia) && Boolean(termina) && !errorFechas && !errorCupo

  async function confirmar() {
    const r = await guardar.ejecutar()
    if (r) onGuardada(r)
  }

  return (
    <DialogoConfirmacion
      abierto
      titulo={campania ? 'Editar campaña' : 'Nueva campaña'}
      descripcion={
        campania
          ? 'Solo se edita mientras está en borrador. Al publicarla, los datos quedan fijos.'
          : 'Nace en borrador: no la ve ningún donante hasta que la publiques. El municipio es el de tu banco.'
      }
      textoConfirmar={campania ? 'Guardar cambios' : 'Crear borrador'}
      onConfirmar={confirmar}
      onCerrar={onCerrar}
      cargando={guardar.enCurso}
      confirmarDeshabilitado={!valido}
      error={
        guardar.error
          ? guardar.error.estado === 503
            ? 'No es posible crearla en este momento: falta la ubicación de tu banco. Inténtalo en unos minutos.'
            : guardar.error.estado === 409
              ? guardar.error.detalle ?? 'La campaña ya no está en borrador.'
              : guardar.error.estado === 400
                ? guardar.error.detalle ?? 'Revisa los datos de la campaña.'
                : 'No fue posible guardar la campaña. Inténtalo de nuevo.'
          : null
      }
    >
      <div className="space-y-4">
        <CampoTexto id="campania-nombre" etiqueta="Nombre" valor={nombre} onCambio={setNombre} maxLength={160} />
        <CampoTexto
          id="campania-sede"
          etiqueta="Sede"
          ayuda="Lugar físico de la jornada; puede no ser la sede del banco."
          valor={sede}
          onCambio={setSede}
          maxLength={200}
        />
        <CampoTexto
          id="campania-descripcion"
          etiqueta="Descripción"
          opcional
          valor={descripcion}
          onCambio={setDescripcion}
          maxLength={500}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoFechaHora id="campania-inicia" etiqueta="Empieza" valor={inicia} onCambio={setInicia} />
          <CampoFechaHora id="campania-termina" etiqueta="Termina" valor={termina} onCambio={setTermina} error={errorFechas} />
        </div>
        <CampoTexto
          id="campania-cupo"
          etiqueta="Cupo"
          opcional
          ayuda="Vacío significa sin límite de cupo."
          inputMode="numeric"
          valor={cupo}
          onCambio={(v) => setCupo(v.trim())}
          error={errorCupo}
        />
      </div>
    </DialogoConfirmacion>
  )
}

function CampoFechaHora({
  id,
  etiqueta,
  valor,
  onCambio,
  error,
}: {
  id: string
  etiqueta: string
  valor: string
  onCambio: (v: string) => void
  error?: string | null
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-vino-800">
        {etiqueta}
      </label>
      <input
        id={id}
        type="datetime-local"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 min-h-11 w-full rounded-suave border border-vino-200 bg-white px-4 text-sm text-vino-800 focus:border-vino-500"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-bold text-error-500">
          {error}
        </p>
      )}
    </div>
  )
}
