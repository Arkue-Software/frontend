import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Aviso,
  Boton,
  CintaSintetica,
  Etiqueta,
  Tarjeta,
  unir,
} from '@/shared/ui/Primitivos'
import { IndicadorPasos } from '@/shared/ui/Pasos'
import { Isotipo } from '@/shared/layout/Isotipo'
import { IconoEscudo, IconoReloj, IconoUbicacion } from '@/shared/ui/Iconos'

/**
 * M1-U1-01 a M1-U1-04 — Registro anonimo del donante.
 *
 * RNF-03 — Capacidad de interaccion. El registro se completa en un maximo de
 * TRES pasos y no tiene ningun campo obligatorio de identificacion personal:
 * sin cedula, sin nombre completo, sin correo obligatorio.
 *
 * La pantalla de codigo entregado (M1-U1-04) es el RESULTADO del registro, no
 * un cuarto paso: cuando aparece, el registro ya se completo.
 *
 * El unico campo de contacto es un correo marcado como opcional en su propia
 * etiqueta, no solo por la ausencia de asterisco.
 */

const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const
const MUNICIPIOS = ['Ciudad Ejemplo', 'Villa Sintetica', 'Pueblo Demo'] as const
const FRANJAS = ['Manana', 'Tarde'] as const

const TOTAL_PASOS = 3

export function RegistroAnonimo() {
  const [paso, setPaso] = useState(1)
  const [tipoSangre, setTipoSangre] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [franja, setFranja] = useState('')
  const [correo, setCorreo] = useState('')
  const [terminado, setTerminado] = useState(false)

  if (terminado) return <CodigoEntregado />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <IndicadorPasos actual={paso} total={TOTAL_PASOS} />

      {/*
        La clave por paso reinicia la animacion de entrada, de modo que cada
        paso se desliza en lugar de reemplazarse de golpe. El contenedor
        conserva su altura minima para que el boton no salte entre pasos.
      */}
      <Tarjeta enmarcada>
        <div key={paso} className="animate-entrar-panel min-h-[26rem]">
          {paso === 1 && (
            <section aria-labelledby="paso1">
              <Etiqueta>Paso 1 de 3</Etiqueta>
              <h1
                id="paso1"
                className="mt-4 text-3xl font-bold tracking-tight text-vino-800"
              >
                Tu tipo de sangre
              </h1>
              <p className="mt-2 text-texto-gris">
                Si no lo sabes, no hay problema. En el banco te lo confirman
                antes de donar.
              </p>

              <div className="mt-7 grid grid-cols-4 gap-2.5">
                {TIPOS_SANGRE.map((t) => (
                  <OpcionBoton
                    key={t}
                    activa={tipoSangre === t}
                    onClick={() => setTipoSangre(t)}
                    grande
                  >
                    {t}
                  </OpcionBoton>
                ))}
              </div>
              <div className="mt-2.5">
                <OpcionBoton
                  activa={tipoSangre === 'No lo se'}
                  onClick={() => setTipoSangre('No lo se')}
                >
                  No lo se
                </OpcionBoton>
              </div>

              <div className="mt-8">
                <Boton
                  onClick={() => setPaso(2)}
                  deshabilitado={!tipoSangre}
                  conFlecha
                  ancho
                >
                  Continuar
                </Boton>
              </div>
            </section>
          )}

          {paso === 2 && (
            <section aria-labelledby="paso2">
              <Etiqueta>Paso 2 de 3</Etiqueta>
              <h1
                id="paso2"
                className="mt-4 text-3xl font-bold tracking-tight text-vino-800"
              >
                Donde y cuando puedes
              </h1>
              <p className="mt-2 text-texto-gris">
                Solo para mostrarte los puntos de donacion mas cercanos. No
                necesitamos tu direccion.
              </p>

              <fieldset className="mt-7">
                <legend className="flex items-center gap-2 text-sm font-bold text-vino-800">
                  <IconoUbicacion className="h-4 w-4 text-vino-400" />
                  Municipio
                </legend>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                  {MUNICIPIOS.map((m) => (
                    <OpcionBoton
                      key={m}
                      activa={municipio === m}
                      onClick={() => setMunicipio(m)}
                    >
                      {m}
                    </OpcionBoton>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="flex items-center gap-2 text-sm font-bold text-vino-800">
                  <IconoReloj className="h-4 w-4 text-vino-400" />
                  Franja horaria
                </legend>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {FRANJAS.map((f) => (
                    <OpcionBoton
                      key={f}
                      activa={franja === f}
                      onClick={() => setFranja(f)}
                    >
                      {f}
                    </OpcionBoton>
                  ))}
                </div>
              </fieldset>

              <div className="mt-8 flex gap-3">
                <Boton variante="secundario" onClick={() => setPaso(1)}>
                  Atras
                </Boton>
                <Boton
                  onClick={() => setPaso(3)}
                  deshabilitado={!municipio || !franja}
                  conFlecha
                >
                  Continuar
                </Boton>
              </div>
            </section>
          )}

          {paso === 3 && (
            <section aria-labelledby="paso3">
              <Etiqueta>Paso 3 de 3</Etiqueta>
              <h1
                id="paso3"
                className="mt-4 text-3xl font-bold tracking-tight text-vino-800"
              >
                Confirma y listo
              </h1>
              <p className="mt-2 text-texto-gris">
                Revisa lo que registraste. No pedimos tu nombre ni tu documento.
              </p>

              <dl className="mt-6 divide-y divide-vino-50 overflow-hidden rounded-tarjeta border border-vino-100">
                <FilaResumen etiqueta="Tipo de sangre" valor={tipoSangre} />
                <FilaResumen etiqueta="Municipio" valor={municipio} />
                <FilaResumen etiqueta="Franja horaria" valor={franja} />
              </dl>

              <div className="mt-6">
                <label
                  htmlFor="correo"
                  className="block text-sm font-bold text-vino-800"
                >
                  Correo electronico{' '}
                  <span className="font-normal text-texto-tenue">
                    (opcional — puedes dejarlo vacio)
                  </span>
                </label>
                <p className="mt-1 text-xs text-texto-tenue">
                  Solo lo usamos para avisarte cuando vuelvas a poder donar. Si
                  no lo escribes, el registro funciona igual.
                </p>
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="mt-2.5 min-h-11 w-full rounded-suave border border-vino-200 bg-white px-4 py-2.5 text-sm transition-[border-color,box-shadow] duration-[var(--dur-rapida)] focus:border-vino-500"
                />
              </div>

              <div className="mt-8 flex gap-3">
                <Boton variante="secundario" onClick={() => setPaso(2)}>
                  Atras
                </Boton>
                <Boton onClick={() => setTerminado(true)} conFlecha>
                  Terminar registro
                </Boton>
              </div>
            </section>
          )}
        </div>
      </Tarjeta>

      <Aviso tono="informacion" titulo="Por que no te pedimos datos personales">
        Puedes donar sin entregar tu identidad. Si mas adelante quieres tener
        perfil, historial y reconocimientos, puedes registrarte de forma
        completa cuando tu quieras.
      </Aviso>

      <CintaSintetica />
    </div>
  )
}

/* ------------------------------------------------------------ subcomponentes */

function OpcionBoton({
  children,
  activa,
  onClick,
  grande = false,
}: {
  children: React.ReactNode
  activa: boolean
  onClick: () => void
  grande?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={unir(
        'w-full rounded-suave border font-bold transition-all duration-[var(--dur-rapida)] ease-salida active:scale-[0.97] motion-reduce:active:scale-100',
        grande ? 'min-h-14 text-base' : 'min-h-11 px-4 text-sm',
        activa
          ? 'border-vino-600 bg-vino-600 text-white shadow-nivel-2'
          : 'border-vino-200 bg-white text-vino-800 hover:border-vino-400 hover:bg-vino-50',
      )}
    >
      {children}
    </button>
  )
}

function FilaResumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between bg-white px-4 py-3.5 text-sm">
      <dt className="text-texto-gris">{etiqueta}</dt>
      <dd className="font-bold text-vino-800">{valor}</dd>
    </div>
  )
}

/**
 * M1-U1-04 — Codigo de donacion entregado.
 * El codigo sustituye al perfil: sin el no hay forma de recuperar la donacion,
 * y la pantalla lo advierte de forma explicita.
 */
function CodigoEntregado() {
  const navegar = useNavigate()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Tarjeta enmarcada>
        <div className="animate-entrar-panel text-center">
          <div className="relative mx-auto w-fit">
            <span
              aria-hidden="true"
              className="animate-anillo absolute inset-0 rounded-full border-2 border-exito-500/40"
            />
            <Isotipo
              className="relative mx-auto h-16 w-16 text-vino-600"
              animado
              latiendo
            />
          </div>

          <div className="mt-6">
            <Etiqueta tono="exito">Registro completo</Etiqueta>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-vino-800">
            Listo. Gracias por querer donar.
          </h1>
          <p className="mt-3 text-texto-gris">
            Este es tu codigo de donacion. Presentalo en el punto de donacion.
          </p>

          <p className="mx-auto mt-7 w-fit rounded-tarjeta border-2 border-dashed border-vino-400 bg-vino-50 px-10 py-5 font-mono text-3xl font-bold tracking-[0.2em] text-vino-700 shadow-nivel-1">
            DEMO-AN-77Q4
          </p>

          <div className="mt-7 text-left">
            <Aviso tono="operativo" titulo="Guarda este codigo">
              Como no registramos tus datos personales, este codigo es la unica
              forma de consultar tu donacion despues. Tomale una foto o
              escribelo antes de salir.
            </Aviso>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Boton conFlecha onClick={() => navegar('/donantes/bienvenida')}>
              Ver jornadas cercanas
            </Boton>
            <Boton
              variante="secundario"
              icono={<IconoEscudo />}
              onClick={() => navegar('/donantes/registro-perfil')}
            >
              Crear un perfil completo
            </Boton>
          </div>
        </div>
      </Tarjeta>

      <CintaSintetica />
    </div>
  )
}
