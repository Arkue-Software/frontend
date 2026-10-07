import { BITACORA } from '@/shared/datos/sinteticos'
import {
  Aviso,
  CintaSintetica,
  Tabla,
  Td,
  Th,
  TituloSeccion,
} from '@/shared/ui/Primitivos'

/**
 * TR-07 — Bitacora de auditoria (U7).
 *
 * ZONA GRIS 12.1 (a) del inventario de pantallas: la bitacora NO pertenece a
 * ningun modulo del SRS. Vive provisionalmente en `shared/paginas` porque no
 * existe `src/modules/auditoria/`. Requiere decision del Product Owner.
 *
 * RNF-01: la bitacora registra QUE una unidad paso a no apta, con actor y
 * fecha. No registra POR QUE. Ni siquiera el auditor ve la causa clinica,
 * porque verificar que el procedimiento se cumplio no exige conocer el
 * diagnostico.
 *
 * RNF-02: aqui aparecen los intentos denegados por jurisdiccion.
 */
export function Bitacora() {
  return (
    <div className="space-y-5">
      <CintaSintetica />

      <TituloSeccion descripcion="Registro de solo lectura. El auditor no modifica lo que audita.">
        Bitacora de auditoria
      </TituloSeccion>

      <Aviso
        tono="informacion"
        titulo="Que puede verificarse aqui, y que no"
      >
        La bitacora permite comprobar que cada cambio de estado tuvo autor y
        fecha, y que el protocolo de disposicion final se ejecuto. No contiene
        resultados de tamizaje ni causas clinicas: esa informacion no se captura
        en ninguna parte del sistema.
      </Aviso>

      <Tabla>
        <thead>
          <tr>
            <Th>Evento</Th>
            <Th>Fecha</Th>
            <Th>Actor</Th>
            <Th>Accion</Th>
            <Th>Recurso</Th>
            <Th>Resultado</Th>
          </tr>
        </thead>
        <tbody>
          {BITACORA.map((evento) => (
            <tr key={evento.id}>
              <Td className="font-mono text-xs">{evento.id}</Td>
              <Td className="whitespace-nowrap">{evento.fecha}</Td>
              <Td>{evento.actor}</Td>
              <Td>{evento.accion}</Td>
              <Td className="font-mono text-xs">{evento.recurso}</Td>
              <Td>
                <span
                  className={
                    evento.resultado === 'denegado'
                      ? 'inline-flex rounded-full border border-vino-400 bg-vino-50 px-2.5 py-0.5 text-xs font-semibold text-vino-700'
                      : 'inline-flex rounded-full border border-exito-600 bg-exito-50 px-2.5 py-0.5 text-xs font-semibold text-exito-600'
                  }
                >
                  {evento.resultado === 'denegado' ? 'Denegado' : 'Permitido'}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </Tabla>
    </div>
  )
}
