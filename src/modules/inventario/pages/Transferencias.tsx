import { useState } from 'react'
import { BANCOS, TRANSFERENCIAS } from '@/shared/datos/sinteticos'
import { useSesion } from '@/shared/sesion/SesionContexto'
import {
  Aviso,
  Boton,
  CintaSintetica,
  ConmutadorDemo,
  EstadoVacio,
  Tabla,
  Tarjeta,
  Td,
  Th,
  TituloSeccion,
} from '@/shared/ui/Primitivos'
import type { Transferencia } from '@/shared/tipos'

/**
 * M4-U4-01 — Sugerencia de transferencia ante escasez.
 * M4-U4-03 — Bandeja de transferencias.
 * M4-U4-04 — Aprobar o rechazar una transferencia entrante.
 * M4-U4-05 — Transferencia rechazada (excepcion).
 * M4-U4-06 — Sin bancos con excedente en la jurisdiccion (excepcion).
 * M4-U4-07 — Movilizacion de donantes compatibles.
 *
 * RNF-02, punto clave: el selector de banco destino y las sugerencias se
 * alimentan UNICAMENTE de bancos de la jurisdiccion del usuario. Cuando no hay
 * excedente, la pantalla ofrece movilizar donantes y NUNCA sugiere buscar en
 * otra jurisdiccion, porque insinuar que existen bancos fuera ya seria filtrar
 * informacion territorial.
 *
 * Es tambien el punto de escalamiento en dos niveles del sistema: primero
 * redistribuir dentro de la red, y solo despues movilizar donantes.
 */

const ETIQUETA_ESTADO: Record<Transferencia['estado'], string> = {
  sugerida: 'Sugerida por el sistema',
  solicitada: 'Solicitada',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  'en transito': 'En transito',
}

function nombreBanco(id: string) {
  return BANCOS.find((b) => b.id === id)?.nombre ?? id
}

export function Transferencias() {
  const { rol } = useSesion()
  const [hayExcedente, setHayExcedente] = useState(true)

  return (
    <div className="space-y-5">
      <CintaSintetica />

      <TituloSeccion
        descripcion={`Redistribucion dentro de ${rol.jurisdiccion}. Toda transferencia requiere aprobacion del banco que entrega.`}
      >
        Transferencias
      </TituloSeccion>

      <ConmutadorDemo
        valor={hayExcedente ? 'con' : 'sin'}
        onCambio={(id) => setHayExcedente(id === 'con')}
        opciones={[
          { id: 'con', etiqueta: 'Hay excedente en la red' },
          { id: 'sin', etiqueta: 'Sin excedente' },
        ]}
      />

      {hayExcedente ? (
        <>
          <Tarjeta>
            <h2 className="text-lg font-bold text-vino-800">
              Sugerencia ante la escasez de O-
            </h2>
            <p className="mt-2 text-sm text-texto-gris">
              El sistema encontro un banco con excedente dentro de tu
              jurisdiccion.
            </p>
            <div className="mt-4 rounded-md border border-vino-200 bg-vino-50 p-4">
              <p className="text-sm font-semibold text-vino-800">
                Banco Hospital Central — 10 unidades de globulos rojos O-
              </p>
              <p className="mt-1 text-xs text-texto-gris">
                Ciudad Ejemplo · mismo departamento · disponible desde hoy
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Boton>Solicitar transferencia</Boton>
                <Boton variante="secundario">Ver otras opciones</Boton>
              </div>
            </div>
          </Tarjeta>

          <Tabla>
            <thead>
              <tr>
                <Th>Transferencia</Th>
                <Th>Origen</Th>
                <Th>Destino</Th>
                <Th>Componente</Th>
                <Th>Unidades</Th>
                <Th>Estado</Th>
                <Th>Accion</Th>
              </tr>
            </thead>
            <tbody>
              {TRANSFERENCIAS.map((t) => (
                <tr key={t.id}>
                  <Td className="font-mono text-xs font-semibold text-vino-800">
                    {t.id}
                  </Td>
                  <Td className="whitespace-nowrap">{nombreBanco(t.origen)}</Td>
                  <Td className="whitespace-nowrap">{nombreBanco(t.destino)}</Td>
                  <Td className="whitespace-nowrap">
                    {t.componente} {t.tipoSangre}
                  </Td>
                  <Td className="font-semibold">{t.unidades}</Td>
                  <Td>
                    <span className="inline-flex rounded-full border border-vino-200 bg-vino-50 px-2.5 py-0.5 text-xs font-semibold text-vino-700">
                      {ETIQUETA_ESTADO[t.estado]}
                    </span>
                  </Td>
                  <Td>
                    {t.estado === 'sugerida' && (
                      <Boton variante="texto">Solicitar</Boton>
                    )}
                    {t.estado === 'solicitada' && (
                      <Boton variante="texto">Aprobar o rechazar</Boton>
                    )}
                    {t.estado === 'rechazada' && (
                      <Boton variante="texto">Buscar otro banco</Boton>
                    )}
                    {(t.estado === 'aprobada' || t.estado === 'en transito') && (
                      <span className="text-xs text-texto-gris">
                        Sin accion pendiente
                      </span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Tabla>

          <Aviso tono="informacion" titulo="Sobre la transferencia rechazada">
            Un rechazo siempre tiene motivo operativo: el banco de origen
            necesita sus propias unidades. Nunca corresponde a una razon
            clinica de las unidades involucradas.
          </Aviso>
        </>
      ) : (
        <>
          <EstadoVacio titulo="No hay bancos con excedente disponible">
            Ningun banco de tu jurisdiccion tiene excedente de globulos rojos O-
            en este momento. Cuando la red interna no alcanza, el siguiente paso
            es convocar donantes compatibles.
          </EstadoVacio>

          <Tarjeta>
            <h2 className="text-lg font-bold text-vino-800">
              Movilizar donantes compatibles
            </h2>
            <p className="mt-2 text-sm text-texto-gris">
              Se enviara un aviso a los donantes con tipo de sangre compatible
              que esten cerca y que ya puedan donar.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-vino-100 bg-vino-50 p-3">
                <p className="text-xs text-texto-gris">Donantes compatibles</p>
                <p className="text-xl font-bold text-vino-800">148</p>
              </div>
              <div className="rounded-md border border-vino-100 bg-vino-50 p-3">
                <p className="text-xs text-texto-gris">Ya pueden donar</p>
                <p className="text-xl font-bold text-vino-800">62</p>
              </div>
              <div className="rounded-md border border-vino-100 bg-vino-50 p-3">
                <p className="text-xs text-texto-gris">Aceptan avisos</p>
                <p className="text-xl font-bold text-vino-800">41</p>
              </div>
            </div>

            {/*
              La pantalla trabaja sobre conteos agregados. No lista donantes
              identificados: el administrador de banco no necesita saber quien
              es cada persona para convocar.
            */}
            <p className="mt-3 text-xs text-texto-gris">
              La convocatoria trabaja sobre conteos agregados. Esta pantalla no
              muestra la identidad de ningun donante.
            </p>

            <div className="mt-4">
              <Boton>Enviar convocatoria a 41 donantes</Boton>
            </div>
          </Tarjeta>

          {/*
            RNF-02: aqui NO hay ninguna sugerencia de buscar en otro
            departamento. La ausencia de excedente es siempre dentro de la
            jurisdiccion visible, y la interfaz no insinua que exista mas red.
          */}
        </>
      )}
    </div>
  )
}
