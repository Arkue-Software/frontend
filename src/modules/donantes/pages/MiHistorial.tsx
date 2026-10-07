import { useState } from 'react'
import { HISTORIAL_DONANTE } from '@/shared/datos/sinteticos'
import {
  Aviso,
  Boton,
  CintaSintetica,
  ConmutadorDemo,
  Dato,
  EstadoVacio,
  Tarjeta,
  TituloSeccion,
} from '@/shared/ui/Primitivos'
import { Revelar } from '@/shared/ui/Revelar'
import {
  IconoCorazon,
  IconoGota,
  IconoRegistro,
  IconoUbicacion,
} from '@/shared/ui/Iconos'

/**
 * M1-U2-05 — Mi historial de donaciones.
 * M1-U2-06 — Historial vacio (excepcion).
 *
 * RNF-01 y zona gris 12.3 (h) del inventario de pantallas.
 *
 * Cada entrada muestra fecha, banco y jornada. NO muestra resultado de
 * tamizaje ni destino de las unidades derivadas: el donante ve QUE dono, no
 * que paso con su sangre.
 *
 * Es un supuesto conservador de diseno, no una decision cerrada. El SRS no
 * dice que debe ver el donante sobre el resultado de su propia donacion, y
 * queda pendiente de decision del Product Owner.
 */
export function MiHistorial() {
  const [estado, setEstado] = useState<'con-datos' | 'vacio'>('con-datos')

  return (
    <div className="space-y-6">
      <ConmutadorDemo
        valor={estado}
        onCambio={(id) => setEstado(id as typeof estado)}
        opciones={[
          { id: 'con-datos', etiqueta: 'Con donaciones' },
          { id: 'vacio', etiqueta: 'Primer ingreso' },
        ]}
      />

      <TituloSeccion
        etiqueta="Historial"
        descripcion="Cada vez que donaste, donde y en que jornada."
      >
        Mis donaciones
      </TituloSeccion>

      {estado === 'con-datos' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Revelar>
              <Dato
                etiqueta="Donaciones"
                valor="3"
                destacado
                icono={<IconoCorazon className="h-5 w-5" />}
              />
            </Revelar>
            <Revelar retraso={90}>
              <Dato
                etiqueta="Componentes obtenidos"
                valor="8"
                nota="De tus tres donaciones"
                icono={<IconoGota className="h-5 w-5" />}
              />
            </Revelar>
            <Revelar retraso={180}>
              <Dato
                etiqueta="Primera vez"
                valor="2025"
                nota="Julio de 2025"
                icono={<IconoRegistro className="h-5 w-5" />}
              />
            </Revelar>
          </div>

          <ol className="relative mt-2">
            {HISTORIAL_DONANTE.map((d, i) => (
              <Revelar as="li" key={d.fecha} retraso={i * 110}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      aria-hidden="true"
                      className="mt-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-vino-200 bg-white text-vino-500 shadow-nivel-1"
                    >
                      <IconoGota className="h-5 w-5" />
                    </span>
                    {i < HISTORIAL_DONANTE.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="w-0.5 flex-1 bg-gradient-to-b from-vino-200 to-vino-100"
                      />
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <Tarjeta interactiva>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-lg font-bold text-vino-800">
                          {d.fecha}
                        </p>
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-texto-tenue">
                          Donacion registrada
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm text-texto-gris">
                        <IconoUbicacion className="h-4 w-4 shrink-0 text-vino-400" />
                        {d.banco}
                      </p>
                      <p className="mt-1 text-sm text-texto-tenue">
                        {d.campana ?? 'Donacion espontanea'}
                      </p>
                    </Tarjeta>
                  </div>
                </div>
              </Revelar>
            ))}
          </ol>

          <Revelar>
            <Aviso
              tono="informacion"
              titulo="Gracias por cada una de estas veces"
            >
              Tu sangre se separa en varios componentes que pueden ayudar a
              distintas personas. Si quieres saber algo puntual sobre alguna de
              tus donaciones, comunicate con el banco donde donaste.
            </Aviso>
          </Revelar>
        </>
      ) : (
        <EstadoVacio
          titulo="Todavia no tienes donaciones registradas"
          icono={<IconoGota />}
          accion={<Boton conFlecha>Ver jornadas cercanas</Boton>}
        >
          Cuando dones por primera vez, la donacion aparecera aqui con su fecha
          y el banco donde la hiciste.
        </EstadoVacio>
      )}

      <CintaSintetica />
    </div>
  )
}
