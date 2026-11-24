/**
 * Regla del nombre de una persona, la misma que aplican Identidad y Donacion:
 * letras, espacios, apostrofo, guion y punto de abreviatura. El nombre sale en
 * el saludo de los correos, y sin esta regla podria llevar un enlace o un texto
 * ajeno.
 */
const NOMBRE = /^\p{L}(?:[\p{L}\p{M} '’-]|\.(?= |$))*$/u

export function errorNombre(nombre: string): string | null {
  const limpio = nombre.trim()
  if (!limpio) return null
  return NOMBRE.test(limpio) ? null : 'Solo letras, espacios, guiones y apóstrofos.'
}
