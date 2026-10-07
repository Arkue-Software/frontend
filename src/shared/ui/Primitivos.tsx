import type { ReactNode } from 'react'
import {
  IconoAlerta,
  IconoEscudo,
  IconoFlecha,
  IconoVerificado,
} from './Iconos'

export function unir(...clases: (string | false | null | undefined)[]) {
  return clases.filter(Boolean).join(' ')
}

/* ------------------------------------------------------------------ Boton */

interface BotonProps {
  children: ReactNode
  onClick?: () => void
  variante?: 'primario' | 'secundario' | 'texto'
  tamano?: 'normal' | 'grande'
  tipo?: 'button' | 'submit'
  deshabilitado?: boolean
  ancho?: boolean
  /** Muestra una flecha dentro de su propio circulo, al final del boton. */
  conFlecha?: boolean
  icono?: ReactNode
  etiquetaAccesible?: string
}

/**
 * Boton.
 *
 * El area minima es de 44px de alto en todas las variantes: es el tamano
 * minimo de un objetivo tactil, y por debajo de eso la gente falla el toque.
 *
 * Al presionar, el boton se encoge levemente. Es la retroalimentacion que
 * hace que un control se sienta fisico en lugar de instantaneo.
 */
export function Boton({
  children,
  onClick,
  variante = 'primario',
  tamano = 'normal',
  tipo = 'button',
  deshabilitado = false,
  ancho = false,
  conFlecha = false,
  icono,
  etiquetaAccesible,
}: BotonProps) {
  const base =
    'group relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-bold transition-[transform,background-color,border-color,box-shadow,color] duration-[var(--dur-rapida)] ease-salida active:scale-[0.975] disabled:pointer-events-none disabled:opacity-40 motion-reduce:active:scale-100'

  const tamanos = {
    normal: unir('px-5 py-2.5 text-sm', conFlecha && 'pr-2'),
    grande: unir('px-7 py-3.5 text-base', conFlecha && 'pr-2.5'),
  }

  const variantes = {
    primario:
      'bg-vino-600 text-white shadow-nivel-2 hover:bg-vino-700 hover:shadow-nivel-3',
    secundario:
      'border border-vino-200 bg-white text-vino-700 shadow-nivel-1 hover:border-vino-300 hover:bg-vino-50 hover:shadow-nivel-2',
    texto:
      'px-2 text-vino-700 hover:bg-vino-50 hover:text-vino-800',
  }

  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={deshabilitado}
      aria-label={etiquetaAccesible}
      className={unir(
        base,
        tamanos[tamano],
        variantes[variante],
        ancho && 'w-full',
      )}
    >
      {icono && (
        <span aria-hidden="true" className="[&>svg]:h-[1.15em] [&>svg]:w-[1.15em]">
          {icono}
        </span>
      )}
      <span>{children}</span>
      {conFlecha && (
        /*
          La flecha nunca va suelta junto al texto: vive en su propio circulo,
          y al pasar el cursor se desplaza dentro de el. El movimiento ocurre
          dentro del boton, no lo desplaza.
        */
        <span
          aria-hidden="true"
          className={unir(
            'ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-[var(--dur-media)] ease-resorte group-hover:translate-x-0.5',
            variante === 'primario' ? 'bg-white/15' : 'bg-vino-100',
          )}
        >
          <IconoFlecha className="h-4 w-4" />
        </span>
      )}
    </button>
  )
}

/* ---------------------------------------------------------------- Tarjeta */

/**
 * Tarjeta.
 *
 * `enmarcada` envuelve el contenido en una bandeja exterior con su propio
 * borde y radio mayor, y deja el nucleo dentro con un radio menor calculado.
 * Las curvas quedan concentricas y la pieza se lee como un objeto montado en
 * una bandeja, no como un rectangulo pegado al fondo.
 */
export function Tarjeta({
  children,
  className,
  enmarcada = false,
  interactiva = false,
}: {
  children: ReactNode
  className?: string
  enmarcada?: boolean
  interactiva?: boolean
}) {
  const nucleo = (
    <div
      className={unir(
        'rounded-tarjeta border border-vino-100/80 bg-white p-6 shadow-nivel-1 shadow-interior',
        interactiva &&
          'transition-[transform,box-shadow] duration-[var(--dur-media)] ease-salida hover:-translate-y-0.5 hover:shadow-nivel-3 motion-reduce:hover:translate-y-0',
        !enmarcada && className,
      )}
    >
      {children}
    </div>
  )

  if (!enmarcada) return nucleo

  return (
    <div
      className={unir(
        'rounded-panel border border-vino-100 bg-vino-50/60 p-1.5',
        className,
      )}
    >
      {nucleo}
    </div>
  )
}

/* --------------------------------------------------------------- Titulares */

/** Etiqueta diminuta que antecede a un titular y le da contexto. */
export function Etiqueta({
  children,
  tono = 'marca',
}: {
  children: ReactNode
  tono?: 'marca' | 'exito' | 'neutro'
}) {
  const tonos = {
    marca: 'border-vino-200 bg-vino-50 text-vino-700',
    exito: 'border-exito-600/30 bg-exito-50 text-exito-600',
    neutro: 'border-vino-100 bg-white text-texto-tenue',
  }
  return (
    <span
      className={unir(
        'inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
        tonos[tono],
      )}
    >
      {children}
    </span>
  )
}

export function TituloSeccion({
  children,
  descripcion,
  etiqueta,
}: {
  children: ReactNode
  descripcion?: string
  etiqueta?: string
}) {
  return (
    <div className="mb-6">
      {etiqueta && (
        <div className="mb-3">
          <Etiqueta>{etiqueta}</Etiqueta>
        </div>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-vino-800 sm:text-3xl">
        {children}
      </h1>
      {descripcion && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-texto-gris">
          {descripcion}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Aviso */

type TonoAviso = 'informacion' | 'operativo' | 'error' | 'exito'

/**
 * Aviso.
 *
 * `operativo` usa el vinotinto institucional: es una alerta del negocio
 * (escasez, vencimiento), no un fallo del sistema. `error` usa el rojo de
 * error y queda reservado para fallos reales. La marca eligio el vinotinto
 * justamente para que no se confunda con un error, y mezclarlos anularia esa
 * decision.
 *
 * El tono nunca es el unico portador del significado: cada aviso lleva icono
 * y titulo, para que se entienda sin distinguir los colores.
 */
export function Aviso({
  tono = 'informacion',
  titulo,
  children,
}: {
  tono?: TonoAviso
  titulo: string
  children?: ReactNode
}) {
  const estilos: Record<TonoAviso, string> = {
    informacion: 'border-vino-200 bg-vino-50/70 text-vino-800',
    operativo: 'border-vino-400 bg-vino-50 text-vino-800',
    error: 'border-error-500 bg-error-50 text-error-500',
    exito: 'border-exito-600 bg-exito-50 text-exito-600',
  }
  const iconos: Record<TonoAviso, ReactNode> = {
    informacion: <IconoEscudo className="h-5 w-5" />,
    operativo: <IconoAlerta className="h-5 w-5" />,
    error: <IconoAlerta className="h-5 w-5" />,
    exito: <IconoVerificado className="h-5 w-5" />,
  }

  return (
    <div
      className={unir(
        'flex gap-3 rounded-tarjeta border-l-4 p-4 shadow-nivel-1',
        estilos[tono],
      )}
    >
      <span className="mt-0.5 shrink-0">{iconos[tono]}</span>
      <div>
        <p className="text-sm font-bold">{titulo}</p>
        {children && (
          <div className="mt-1 text-sm leading-relaxed opacity-90">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- Dato / KPI */

export function Dato({
  etiqueta,
  valor,
  nota,
  icono,
  destacado = false,
}: {
  etiqueta: string
  valor: ReactNode
  nota?: string
  icono?: ReactNode
  destacado?: boolean
}) {
  return (
    <div
      className={unir(
        'rounded-tarjeta border p-5 transition-[transform,box-shadow] duration-[var(--dur-media)] ease-salida hover:-translate-y-0.5 hover:shadow-nivel-2 motion-reduce:hover:translate-y-0',
        destacado
          ? 'border-vino-300 bg-vino-600 text-white shadow-nivel-2'
          : 'border-vino-100/80 bg-white shadow-nivel-1',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={unir(
            'text-[11px] font-bold uppercase tracking-[0.14em]',
            destacado ? 'text-vino-100' : 'text-texto-tenue',
          )}
        >
          {etiqueta}
        </p>
        {icono && (
          <span
            aria-hidden="true"
            className={destacado ? 'text-vino-200' : 'text-vino-300'}
          >
            {icono}
          </span>
        )}
      </div>
      <p
        className={unir(
          'mt-2 text-3xl font-bold tabular-nums tracking-tight',
          destacado ? 'text-white' : 'text-vino-800',
        )}
      >
        {valor}
      </p>
      {nota && (
        <p
          className={unir(
            'mt-1 text-xs',
            destacado ? 'text-vino-100' : 'text-texto-tenue',
          )}
        >
          {nota}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Tabla */

export function Tabla({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-tarjeta border border-vino-100/80 bg-white shadow-nivel-1">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  )
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="border-b border-vino-100 bg-vino-50/60 px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-vino-700"
    >
      {children}
    </th>
  )
}

export function Fila({ children }: { children: ReactNode }) {
  return (
    <tr className="transition-colors duration-[var(--dur-rapida)] hover:bg-vino-50/50">
      {children}
    </tr>
  )
}

export function Td({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <td className={unir('border-b border-vino-50 px-4 py-3.5', className)}>
      {children}
    </td>
  )
}

/* --------------------------------------------------- Marca de dato ficticio */

export function CintaSintetica() {
  return (
    <p className="flex items-center gap-2 rounded-full border border-dashed border-vino-300 bg-white/70 px-4 py-2 text-xs text-texto-gris">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-vino-400"
      />
      Prototipo de interfaz. Todos los datos son{' '}
      <strong className="font-bold text-vino-700">sinteticos</strong> y no
      corresponden a personas ni instituciones reales.
    </p>
  )
}

/* ------------------------------------------------------------ Estado vacio */

export function EstadoVacio({
  titulo,
  children,
  accion,
  icono,
}: {
  titulo: string
  children: ReactNode
  accion?: ReactNode
  icono?: ReactNode
}) {
  return (
    <Tarjeta className="text-center">
      {icono && (
        <span
          aria-hidden="true"
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-vino-50 text-vino-400 [&>svg]:h-7 [&>svg]:w-7"
        >
          {icono}
        </span>
      )}
      <h3 className="text-lg font-bold text-vino-800">{titulo}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-texto-gris">
        {children}
      </p>
      {accion && <div className="mt-5">{accion}</div>}
    </Tarjeta>
  )
}

/* ----------------------------------------------- Conmutador de demostracion */

/**
 * Conmutador para alternar entre el camino feliz y el estado de excepcion.
 * Es un artefacto exclusivo del prototipo y se marca visualmente como tal,
 * para que nadie lo confunda con un control del producto.
 */
export function ConmutadorDemo({
  opciones,
  valor,
  onCambio,
}: {
  opciones: { id: string; etiqueta: string }[]
  valor: string
  onCambio: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-dashed border-vino-300 bg-white/70 p-1.5 pl-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-vino-600">
        Demostracion
      </span>
      <div className="flex flex-wrap gap-1">
        {opciones.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            onClick={() => onCambio(opcion.id)}
            aria-pressed={valor === opcion.id}
            className={unir(
              'min-h-9 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-[var(--dur-rapida)] ease-salida',
              valor === opcion.id
                ? 'bg-vino-600 text-white shadow-nivel-1'
                : 'text-vino-700 hover:bg-vino-50',
            )}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>
    </div>
  )
}
