import { useState } from 'react'
import {
  Aviso,
  Boton,
  CintaSintetica,
  Dato,
  Tarjeta,
  TituloSeccion,
} from '@/shared/ui/Primitivos'

/**
 * M1-U3-01 — Busqueda y consulta de donante (operador, solo lectura).
 * M1-U3-02 — Donante no elegible (excepcion).
 *
 * RNF-01: cuando el donante no es elegible, el operador ve la fecha y un
 * bloqueo. NO ve la causa. La restriccion aplica tambien al personal
 * operativo, no solo al donante: nadie en la interfaz ve el motivo clinico.
 */
export function ConsultaDonante() {
  const [codigo, setCodigo] = useState('DEMO-REG-0042')
  const [resultado, setResultado] = useState<'elegible' | 'no elegible' | null>(
    'elegible',
  )

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <CintaSintetica />

      <TituloSeccion descripcion="Consulta de solo lectura para asociar una donacion. No incluye historia clinica.">
        Consultar donante
      </TituloSeccion>

      <Tarjeta>
        <label
          htmlFor="codigo-donante"
          className="block text-sm font-semibold text-vino-800"
        >
          Codigo de donante o de donacion anonima
        </label>
        <div className="mt-2 flex flex-wrap gap-3">
          <input
            id="codigo-donante"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="min-w-56 flex-1 rounded-md border border-vino-200 px-3 py-2 font-mono text-sm"
          />
          <Boton onClick={() => setResultado('elegible')}>Buscar</Boton>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md border border-dashed border-vino-300 px-3 py-2">
          <span className="text-xs font-semibold text-vino-700">
            Demostracion:
          </span>
          <Boton variante="secundario" onClick={() => setResultado('elegible')}>
            Donante elegible
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => setResultado('no elegible')}
          >
            Donante no elegible
          </Boton>
        </div>
      </Tarjeta>

      {resultado === 'elegible' && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Dato etiqueta="Codigo" valor="DEMO-REG-0042" />
            <Dato etiqueta="Tipo de sangre" valor="O+" />
            <Dato etiqueta="Elegibilidad" valor="Vigente" nota="Puede donar hoy" />
          </div>
          <Tarjeta>
            <p className="text-sm text-texto-gris">
              Ultima donacion registrada: 2 de mayo de 2026 en Banco Distrital
              de Sangre.
            </p>
            <div className="mt-4">
              <Boton>Registrar donacion</Boton>
            </div>
          </Tarjeta>
        </>
      )}

      {resultado === 'no elegible' && (
        <Tarjeta>
          <h2 className="text-lg font-bold text-vino-800">
            Este donante aun no es elegible
          </h2>
          <p className="mt-2 text-sm text-texto-gris">
            Podra donar a partir del{' '}
            <strong className="text-vino-700">4 de noviembre de 2026</strong>.
            No es posible registrar una donacion antes de esa fecha.
          </p>

          <div className="mt-4">
            {/*
              RNF-01: el operador tampoco ve el motivo. Si el bloqueo fuera
              clinico, esta pantalla se veria exactamente igual.
            */}
            <Aviso tono="operativo" titulo="Registro bloqueado">
              El sistema no muestra el motivo de la no elegibilidad. Si el
              donante pregunta, remitelo al procedimiento de atencion del banco.
            </Aviso>
          </div>

          <div className="mt-5">
            <Boton deshabilitado>Registrar donacion</Boton>
          </div>
        </Tarjeta>
      )}
    </div>
  )
}
