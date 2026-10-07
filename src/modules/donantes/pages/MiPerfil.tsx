import { useState } from 'react'
import {
  Aviso,
  Boton,
  CintaSintetica,
  ConmutadorDemo,
  Dato,
  Etiqueta,
  Tarjeta,
  unir,
} from '@/shared/ui/Primitivos'
import { Revelar } from '@/shared/ui/Revelar'
import {
  IconoCalendario,
  IconoCorazon,
  IconoGota,
  IconoMedalla,
} from '@/shared/ui/Iconos'

/**
 * M1-U2-03 — Mi perfil: tipo de sangre y elegibilidad.
 * M1-U2-04 — Aun no eres elegible (excepcion, conmutable en pantalla).
 *
 * RNF-01: cuando el donante NO es elegible, la pantalla muestra la fecha en
 * que recupera la elegibilidad y remite al banco. Nunca nombra una causa
 * clinica, ni siquiera de forma indirecta o con eufemismos. Si el bloqueo
 * fuera clinico, esta pantalla se veria exactamente igual.
 */
export function MiPerfil() {
  const [estado, setEstado] = useState<'elegible' | 'espera'>('elegible')
  const elegible = estado === 'elegible'

  return (
    <div className="space-y-6">
      <ConmutadorDemo
        valor={estado}
        onCambio={(id) => setEstado(id as typeof estado)}
        opciones={[
          { id: 'elegible', etiqueta: 'Puede donar' },
          { id: 'espera', etiqueta: 'Aun no elegible' },
        ]}
      />

      {/* -------------------------------------------------------- Portada */}
      <Revelar>
        <section className="relative overflow-hidden rounded-panel border border-vino-100 bg-white p-6 shadow-nivel-3 sm:p-10">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-vino-50 blur-3xl"
          />

          <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-center">
            <AnilloElegibilidad elegible={elegible} />

            <div className="flex-1 text-center sm:text-left">
              <Etiqueta tono={elegible ? 'exito' : 'marca'}>
                {elegible ? 'Puedes donar hoy' : 'En periodo de espera'}
              </Etiqueta>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-vino-800 sm:text-4xl">
                {elegible ? 'Estas listo para donar' : 'Aun no puedes donar'}
              </h1>
              <p className="mt-3 max-w-lg leading-relaxed text-texto-gris">
                {elegible
                  ? 'Ya paso el tiempo necesario desde tu ultima donacion del 2 de mayo de 2026. Puedes acercarte a cualquier punto o inscribirte en una jornada.'
                  : 'Podras donar de nuevo a partir del 4 de noviembre de 2026. Entre una donacion y la siguiente debe pasar un tiempo minimo para que tu cuerpo se recupere.'}
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3 sm:justify-start">
                {elegible ? (
                  <>
                    <Boton conFlecha>Ver jornadas cercanas</Boton>
                    <Boton variante="secundario" icono={<IconoCalendario />}>
                      Reservar un cupo
                    </Boton>
                  </>
                ) : (
                  <Boton variante="secundario" icono={<IconoCalendario />}>
                    Avisarme cuando pueda donar
                  </Boton>
                )}
              </div>
            </div>
          </div>
        </section>
      </Revelar>

      {/* ---------------------------------------------------------- Cifras */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Revelar retraso={0}>
          <Dato
            etiqueta="Tipo de sangre"
            valor="O+"
            nota="El mas frecuente en Colombia"
            icono={<IconoGota className="h-5 w-5" />}
          />
        </Revelar>
        <Revelar retraso={90}>
          <Dato
            etiqueta="Donaciones"
            valor="3"
            nota="Desde julio de 2025"
            icono={<IconoCorazon className="h-5 w-5" />}
          />
        </Revelar>
        <Revelar retraso={180}>
          <Dato
            etiqueta="Reconocimientos"
            valor="2"
            nota="Sin valor economico"
            icono={<IconoMedalla className="h-5 w-5" />}
          />
        </Revelar>
      </div>

      {!elegible && (
        <Revelar>
          {/*
            RNF-01: la pantalla remite al banco y no nombra ninguna causa.
            No hay campo, tooltip ni enlace que lleve a un motivo clinico.
          */}
          <Aviso tono="informacion" titulo="Si tienes dudas sobre tu caso">
            Comunicate directamente con el banco de sangre donde donaste. Ellos
            pueden orientarte de forma personal; esta plataforma no maneja
            informacion sobre tu salud.
          </Aviso>
        </Revelar>
      )}

      <Revelar>
        <Tarjeta interactiva>
          <h2 className="text-lg font-bold text-vino-800">
            Que pasa con lo que donas
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-texto-gris">
            Tu donacion se separa en globulos rojos, plasma y plaquetas. Cada
            componente tiene un uso distinto y una duracion distinta, y puede
            llegar a personas diferentes.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {COMPONENTES.map((c) => (
              <div
                key={c.nombre}
                className="rounded-suave border border-vino-100 bg-vino-50/50 p-4"
              >
                <p className="text-sm font-bold text-vino-800">{c.nombre}</p>
                <p className="mt-1 text-xs text-texto-tenue">{c.duracion}</p>
              </div>
            ))}
          </div>
        </Tarjeta>
      </Revelar>

      <CintaSintetica />
    </div>
  )
}

const COMPONENTES = [
  { nombre: 'Globulos rojos', duracion: 'Duran unos 35 dias' },
  { nombre: 'Plaquetas', duracion: 'Duran apenas 5 dias' },
  { nombre: 'Plasma', duracion: 'Se puede congelar un ano' },
]

/**
 * Anillo de elegibilidad.
 *
 * El progreso se dibuja con `stroke-dashoffset` sobre un circulo, que el
 * navegador resuelve sin rehacer el diseno de la pagina. El valor tambien va
 * en texto: el anillo por si solo no comunica nada a quien usa lector de
 * pantalla ni a quien no distingue los colores.
 */
function AnilloElegibilidad({ elegible }: { elegible: boolean }) {
  const porcentaje = elegible ? 100 : 62
  const radio = 52
  const circunferencia = 2 * Math.PI * radio

  return (
    <div className="relative shrink-0">
      <svg
        viewBox="0 0 128 128"
        className="h-36 w-36 -rotate-90"
        role="img"
        aria-label={
          elegible
            ? 'Periodo de espera completo. Puedes donar.'
            : 'Periodo de espera al 62 por ciento.'
        }
      >
        <circle
          cx="64"
          cy="64"
          r={radio}
          fill="none"
          stroke="var(--color-vino-100)"
          strokeWidth="10"
        />
        <circle
          cx="64"
          cy="64"
          r={radio}
          fill="none"
          stroke={
            elegible ? 'var(--color-exito-500)' : 'var(--color-vino-500)'
          }
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia - (porcentaje / 100) * circunferencia}
          className="transition-[stroke-dashoffset,stroke] duration-[900ms] ease-salida"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={unir(
            'text-4xl font-bold tracking-tight',
            elegible ? 'text-exito-600' : 'text-vino-700',
          )}
        >
          O+
        </span>
        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-texto-tenue">
          {elegible ? 'Habilitado' : '62 dias'}
        </span>
      </div>
    </div>
  )
}
