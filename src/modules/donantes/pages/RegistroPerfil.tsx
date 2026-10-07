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
import {
  IconoCalendario,
  IconoEscudo,
  IconoMedalla,
  IconoRegistro,
} from '@/shared/ui/Iconos'

/**
 * M1-U2-01 — Registro con perfil completo.
 * M1-U2-02 — Consentimiento de tratamiento de datos (Ley 1581).
 *
 * RF-01 pide dos modalidades de registro: la anonima y la de perfil completo.
 * Esta es la segunda, y es deliberadamente el camino largo.
 *
 * Diferencia con el registro anonimo, que conviene no perder de vista: el
 * limite de tres pasos de RNF-03 aplica a AQUEL, porque su razon de ser es
 * que nadie abandone por friccion. Aqui la persona ya decidio entregar sus
 * datos, y el consentimiento informado exige espacio para leer. Por eso son
 * cuatro pasos y no tres.
 *
 * La pantalla nunca presenta el registro anonimo como una version inferior.
 * Donar sin identificarse es igual de valido y la interfaz lo dice; lo que se
 * explica es que anade el perfil, no que le falta a la otra via.
 */

const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const
const TOTAL_PASOS = 4

const VENTAJAS = [
  {
    icono: <IconoRegistro />,
    titulo: 'Historial propio',
    texto: 'La lista de tus donaciones, con fecha y banco.',
  },
  {
    icono: <IconoMedalla />,
    titulo: 'Reconocimientos',
    texto: 'Insignias por donacion recurrente. Sin valor economico.',
  },
  {
    icono: <IconoCalendario />,
    titulo: 'Reserva de cupo',
    texto: 'Puedes apartar un lugar en una jornada antes de ir.',
  },
]

export function RegistroPerfil() {
  const [paso, setPaso] = useState(1)
  const [nombre, setNombre] = useState('')
  const [documento, setDocumento] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [tipo, setTipo] = useState<string | null>(null)
  const [aceptaDatos, setAceptaDatos] = useState(false)
  const [aceptaAvisos, setAceptaAvisos] = useState(false)
  const [listo, setListo] = useState(false)

  if (listo) return <PerfilCreado nombre={nombre} />

  const identidadCompleta = nombre.trim() !== '' && documento.trim() !== ''
  const contactoCompleto = correo.trim() !== '' || telefono.trim() !== ''

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <CintaSintetica />

      <IndicadorPasos actual={paso} total={TOTAL_PASOS} />

      <Tarjeta enmarcada>
        {/* La clave por paso reinicia la animacion de entrada. */}
        <div key={paso} className="animate-entrar-panel min-h-[28rem]">
          {paso === 1 && (
            <section aria-labelledby="perfil1">
              <Etiqueta>Paso 1 de 4</Etiqueta>
              <h1
                id="perfil1"
                className="mt-4 text-2xl font-bold tracking-tight text-vino-800"
              >
                Como te llamas
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-texto-gris">
                Estos datos son los que hacen que el perfil sea tuyo y que el
                banco pueda reconocerte cuando llegues.
              </p>

              <div className="mt-6 space-y-4">
                <Campo
                  etiqueta="Nombre completo"
                  valor={nombre}
                  onCambio={setNombre}
                  ejemplo="Nombre de ejemplo Apellido"
                />
                <Campo
                  etiqueta="Numero de documento"
                  valor={documento}
                  onCambio={setDocumento}
                  ejemplo="DEMO-000000000"
                  ayuda="Es lo que permite vincular tus donaciones anteriores con este perfil."
                />
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Boton
                  conFlecha
                  deshabilitado={!identidadCompleta}
                  onClick={() => setPaso(2)}
                >
                  Continuar
                </Boton>
              </div>

              <Aviso
                tono="informacion"
                titulo="Registrarte es opcional, siempre"
              >
                Puedes seguir donando de forma anonima cuantas veces quieras.
                Una donacion anonima vale exactamente lo mismo que esta: lo que
                cambia es que tu no ves el registro.
              </Aviso>
            </section>
          )}

          {paso === 2 && (
            <section aria-labelledby="perfil2">
              <Etiqueta>Paso 2 de 4</Etiqueta>
              <h1
                id="perfil2"
                className="mt-4 text-2xl font-bold tracking-tight text-vino-800"
              >
                Como te avisamos
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-texto-gris">
                Con uno de los dos basta. Sirve para recuperar tu perfil y,
                si lo autorizas mas adelante, para avisarte de jornadas cerca
                de ti.
              </p>

              <div className="mt-6 space-y-4">
                <Campo
                  etiqueta="Correo electronico"
                  valor={correo}
                  onCambio={setCorreo}
                  ejemplo="ejemplo@demo.test"
                  tipo="email"
                />
                <Campo
                  etiqueta="Telefono"
                  valor={telefono}
                  onCambio={setTelefono}
                  ejemplo="300 000 0000"
                  tipo="tel"
                />
              </div>

              <fieldset className="mt-6">
                <legend className="text-sm font-bold text-vino-800">
                  Tu tipo de sangre
                </legend>
                <p className="mt-1 text-xs text-texto-gris">
                  Si no lo sabes, puedes dejarlo en blanco: se confirma en el
                  banco antes de donar.
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {TIPOS_SANGRE.map((t) => (
                    <OpcionTipo
                      key={t}
                      activa={tipo === t}
                      onClick={() => setTipo(tipo === t ? null : t)}
                    >
                      {t}
                    </OpcionTipo>
                  ))}
                </div>
              </fieldset>

              <div className="mt-7 flex flex-wrap gap-3">
                <Boton variante="secundario" onClick={() => setPaso(1)}>
                  Atras
                </Boton>
                <Boton
                  conFlecha
                  deshabilitado={!contactoCompleto}
                  onClick={() => setPaso(3)}
                >
                  Continuar
                </Boton>
              </div>
            </section>
          )}

          {paso === 3 && (
            /*
              M1-U2-02. El consentimiento es un paso propio y no una casilla
              al pie del formulario anterior: quien acepta tiene que haber
              podido leer que acepta.

              Las dos casillas empiezan SIN marcar y son independientes. Un
              consentimiento premarcado no es consentimiento, y mezclar el
              tratamiento de datos con la publicidad obliga a aceptar la
              segunda para obtener lo primero.
            */
            <section aria-labelledby="perfil3">
              <Etiqueta>Paso 3 de 4</Etiqueta>
              <h1
                id="perfil3"
                className="mt-4 text-2xl font-bold tracking-tight text-vino-800"
              >
                Tratamiento de tus datos
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-texto-gris">
                Ley 1581 de 2012. Lee antes de aceptar; esto no es un tramite.
              </p>

              <div className="mt-5 space-y-3 rounded-tarjeta border border-vino-100 bg-fondo-suave p-5 text-sm leading-relaxed text-texto-gris">
                <p>
                  <strong className="text-vino-800">Para que se usan.</strong>{' '}
                  Tu nombre, documento y contacto se usan para identificarte en
                  el banco, calcular cuando vuelves a ser elegible y guardar tu
                  historial de donaciones.
                </p>
                <p>
                  <strong className="text-vino-800">Que no se hace.</strong> Tus
                  datos no se venden, no se ceden con fines comerciales y no se
                  usan para decidir sobre ti fuera del proceso de donacion.
                </p>
                <p>
                  <strong className="text-vino-800">Tus derechos.</strong>{' '}
                  Puedes consultar, corregir y pedir la supresion de tus datos
                  cuando quieras. Si los suprimes, el perfil se elimina y
                  vuelves a la modalidad anonima.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <Casilla
                  marcada={aceptaDatos}
                  onCambio={setAceptaDatos}
                  titulo="Autorizo el tratamiento de mis datos personales"
                  texto="Obligatorio para crear el perfil. Sin esta autorizacion puedes seguir donando de forma anonima."
                />
                <Casilla
                  marcada={aceptaAvisos}
                  onCambio={setAceptaAvisos}
                  titulo="Quiero recibir avisos de jornadas cercanas"
                  texto="Opcional e independiente de lo anterior. Puedes desactivarlo despues sin perder el perfil."
                />
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Boton variante="secundario" onClick={() => setPaso(2)}>
                  Atras
                </Boton>
                <Boton
                  conFlecha
                  deshabilitado={!aceptaDatos}
                  onClick={() => setPaso(4)}
                >
                  Continuar
                </Boton>
              </div>
            </section>
          )}

          {paso === 4 && (
            <section aria-labelledby="perfil4">
              <Etiqueta>Paso 4 de 4</Etiqueta>
              <h1
                id="perfil4"
                className="mt-4 text-2xl font-bold tracking-tight text-vino-800"
              >
                Revisa antes de crear el perfil
              </h1>

              <dl className="mt-5 divide-y divide-vino-100 rounded-tarjeta border border-vino-100 bg-white">
                <FilaResumen etiqueta="Nombre" valor={nombre} />
                <FilaResumen etiqueta="Documento" valor={documento} />
                <FilaResumen
                  etiqueta="Contacto"
                  valor={[correo, telefono].filter(Boolean).join(' · ')}
                />
                <FilaResumen
                  etiqueta="Tipo de sangre"
                  valor={tipo ?? 'Se confirma en el banco'}
                />
                <FilaResumen
                  etiqueta="Tratamiento de datos"
                  valor="Autorizado"
                />
                <FilaResumen
                  etiqueta="Avisos de jornadas"
                  valor={aceptaAvisos ? 'Autorizados' : 'No autorizados'}
                />
              </dl>

              <div className="mt-7 flex flex-wrap gap-3">
                <Boton variante="secundario" onClick={() => setPaso(3)}>
                  Atras
                </Boton>
                <Boton conFlecha onClick={() => setListo(true)}>
                  Crear mi perfil
                </Boton>
              </div>
            </section>
          )}
        </div>
      </Tarjeta>

      {paso === 1 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {VENTAJAS.map((v) => (
            <div
              key={v.titulo}
              className="rounded-tarjeta border border-vino-100/80 bg-white p-4 shadow-nivel-1"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-vino-50 text-vino-600 [&>svg]:h-4.5 [&>svg]:w-4.5"
              >
                {v.icono}
              </span>
              <p className="mt-3 text-sm font-bold text-vino-800">{v.titulo}</p>
              <p className="mt-1 text-xs leading-relaxed text-texto-gris">
                {v.texto}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ subcomponentes */

function Campo({
  etiqueta,
  valor,
  onCambio,
  ejemplo,
  ayuda,
  tipo = 'text',
}: {
  etiqueta: string
  valor: string
  onCambio: (v: string) => void
  ejemplo: string
  ayuda?: string
  tipo?: 'text' | 'email' | 'tel'
}) {
  const id = `campo-${etiqueta.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-vino-800">
        {etiqueta}
      </label>
      {ayuda && <p className="mt-1 text-xs text-texto-gris">{ayuda}</p>}
      <input
        id={id}
        type={tipo}
        value={valor}
        placeholder={ejemplo}
        onChange={(e) => onCambio(e.target.value)}
        className="mt-2 min-h-11 w-full rounded-suave border border-vino-200 bg-white px-4 text-sm text-vino-800 placeholder:text-texto-tenue focus:border-vino-500"
      />
    </div>
  )
}

function OpcionTipo({
  children,
  activa,
  onClick,
}: {
  children: React.ReactNode
  activa: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={unir(
        'min-h-11 rounded-suave border text-sm font-bold transition-all duration-[var(--dur-rapida)] ease-salida active:scale-[0.97] motion-reduce:active:scale-100',
        activa
          ? 'border-vino-600 bg-vino-600 text-white shadow-nivel-2'
          : 'border-vino-200 bg-white text-vino-800 hover:border-vino-400',
      )}
    >
      {children}
    </button>
  )
}

function Casilla({
  marcada,
  onCambio,
  titulo,
  texto,
}: {
  marcada: boolean
  onCambio: (v: boolean) => void
  titulo: string
  texto: string
}) {
  const id = `casilla-${titulo.slice(0, 18).toLowerCase().replace(/\s+/g, '-')}`
  return (
    <label
      htmlFor={id}
      className={unir(
        'flex cursor-pointer gap-3 rounded-tarjeta border p-4 transition-colors duration-[var(--dur-rapida)]',
        marcada ? 'border-vino-400 bg-vino-50' : 'border-vino-200 bg-white',
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={marcada}
        onChange={(e) => onCambio(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-vino-600"
      />
      <span>
        <span className="block text-sm font-bold text-vino-800">{titulo}</span>
        <span className="mt-1 block text-xs leading-relaxed text-texto-gris">
          {texto}
        </span>
      </span>
    </label>
  )
}

function FilaResumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-texto-tenue">
        {etiqueta}
      </dt>
      <dd className="text-right text-sm font-semibold text-vino-800">
        {valor || '—'}
      </dd>
    </div>
  )
}

/** Resultado del registro. No es un quinto paso: cuando aparece, ya termino. */
function PerfilCreado({ nombre }: { nombre: string }) {
  const navegar = useNavigate()
  const primero = nombre.trim().split(' ')[0]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Tarjeta enmarcada>
        <div className="animate-entrar-panel text-center">
          <Isotipo
            className="mx-auto h-16 w-16 text-vino-600"
            animado
            latiendo
          />

          <div className="mt-6">
            <Etiqueta tono="exito">Perfil creado</Etiqueta>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-vino-800">
            Listo{primero ? `, ${primero}` : ''}. Ya tienes perfil.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-texto-gris">
            Desde ahora tus donaciones quedan en tu historial y puedes reservar
            cupo en las jornadas.
          </p>

          <div className="mt-6 text-left">
            <Aviso tono="informacion" titulo="Esto es un prototipo">
              En el sistema real entrarias como donante registrado en este
              momento. Aqui el perfil no viene del gateway, asi que para ver el
              resultado cambia el selector <strong>Ver como</strong> de la barra
              superior a <strong>U2 — Donante registrado</strong>.
            </Aviso>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Boton conFlecha onClick={() => navegar('/donantes/perfil')}>
              Ver mi perfil
            </Boton>
            <Boton
              variante="secundario"
              icono={<IconoEscudo />}
              onClick={() => navegar('/donantes/bienvenida')}
            >
              Volver al inicio
            </Boton>
          </div>
        </div>
      </Tarjeta>

      <CintaSintetica />
    </div>
  )
}
