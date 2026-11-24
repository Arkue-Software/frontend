/**
 * Formato de fechas y codigos para pantalla, en espanol de Colombia y en la
 * hora de Bogota. Las fechas sin hora (AAAA-MM-DD) se tratan como fechas del
 * calendario, sin conversion de zona, para que no se corran un dia.
 */

const ZONA = 'America/Bogota'

function aFecha(valor: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [a, m, d] = valor.split('-').map(Number)
    return new Date(Date.UTC(a, m - 1, d, 12))
  }
  return new Date(valor)
}

export function fecha(valor: string | null | undefined): string {
  if (!valor) return '—'
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA }).format(
    aFecha(valor),
  )
}

export function fechaCorta(valor: string | null | undefined): string {
  if (!valor) return '—'
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: ZONA }).format(
    aFecha(valor),
  )
}

export function fechaHora(valor: string | null | undefined): string {
  if (!valor) return '—'
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA,
  }).format(aFecha(valor))
}

/** Los ocho primeros caracteres del identificador: legibles en una etiqueta o al teléfono. */
export function idCorto(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

/** «K7P3MXR29QHT» → «K7P3-MXR2-9QHT». */
export function codigoLegible(codigo: string): string {
  return (codigo.match(/.{1,4}/g) ?? [codigo]).join('-')
}

/** Fecha de hoy (AAAA-MM-DD) en Bogotá. */
export function hoy(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date())
}

/**
 * Si quien nació en `nacimiento` (AAAA-MM-DD) ya cumplió `anios` el día
 * `dia`. Se compara el texto de las fechas, que ordena como el tiempo; quien
 * nació un 29 de febrero los cumple el 1 de marzo en un año no bisiesto.
 */
export function cumplioAnios(nacimiento: string, anios: number, dia: string): boolean {
  const aniversario = String(Number(nacimiento.slice(0, 4)) + anios).padStart(4, '0') + nacimiento.slice(4)
  return aniversario <= dia
}

/**
 * La jurisdicción dentro de una frase: «Campañas de Antioquia», «de todo el
 * país», «de tu banco de sangre». Un nombre de territorio es nombre propio y
 * conserva sus mayúsculas.
 */
export function jurisdiccionEnFrase(j: { ambito: string; etiqueta: string; territorioRuta?: string } | undefined): string {
  if (!j) return 'tu jurisdicción'
  if (j.ambito === 'territorio') return j.territorioRuta === '/00' ? 'todo el país' : j.etiqueta
  return j.etiqueta.charAt(0).toLowerCase() + j.etiqueta.slice(1)
}
