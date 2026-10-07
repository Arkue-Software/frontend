import { DEPARTAMENTOS } from '@/shared/datos/sinteticos'
import {
  Aviso,
  CintaSintetica,
  Dato,
  Tabla,
  Td,
  Th,
  TituloSeccion,
  unir,
} from '@/shared/ui/Primitivos'

/**
 * M4-U6-01 — Inventario consolidado nacional.
 *
 * Pantalla propia del administrador nacional, separada de la del coordinador
 * territorial. Las dos agregan inventario, pero no por lo mismo: el
 * coordinador suma bancos de su departamento, y el nacional suma
 * departamentos.
 *
 * RNF-02 no impone aqui ninguna restriccion territorial, y no es una
 * excepcion a la regla: el requisito habla de un usuario TERRITORIAL, y la
 * jurisdiccion de este perfil es el pais entero. No hay ambito ajeno del que
 * protegerse, asi que esta pantalla no lleva ni el aviso de "no ves un
 * comparativo nacional" ni la denegacion de TR-04.
 *
 * RNF-01 si sigue vigente, y es lo que hace que las dos restricciones se vean
 * como lo que son: independientes. La columna de no aptas es una TASA
 * AGREGADA por departamento. No se desglosa por causa, no se puede descender
 * hasta la unidad y no existe campo en el modelo que lo permita.
 */
export function InventarioNacional() {
  const conBanco = DEPARTAMENTOS.filter((d) => d.bancosActivos > 0)
  const sinBanco = DEPARTAMENTOS.filter((d) => d.bancosActivos === 0)
  const unidades = DEPARTAMENTOS.reduce((s, d) => s + d.unidadesDisponibles, 0)
  const bajoUmbral = DEPARTAMENTOS.reduce(
    (s, d) => s + d.combinacionesBajoUmbral,
    0,
  )

  return (
    <div className="space-y-5">
      <CintaSintetica />

      <TituloSeccion descripcion="Suma de los bancos de todos los departamentos. Cada fila es un departamento, no un banco.">
        Inventario consolidado nacional
      </TituloSeccion>

      <div className="grid gap-4 sm:grid-cols-3">
        <Dato
          etiqueta="Unidades disponibles"
          valor={unidades.toLocaleString('es-CO')}
          destacado
        />
        <Dato
          etiqueta="Departamentos con banco activo"
          valor={`${conBanco.length} de ${DEPARTAMENTOS.length}`}
          nota={
            sinBanco.length > 0
              ? `${sinBanco.length} sin cobertura`
              : 'Cobertura completa'
          }
        />
        <Dato
          etiqueta="Combinaciones bajo umbral"
          valor={bajoUmbral}
          nota="Suma de todos los departamentos"
        />
      </div>

      <Tabla>
        <thead>
          <tr>
            <Th>Departamento</Th>
            <Th>Bancos activos</Th>
            <Th>Unidades disponibles</Th>
            <Th>Combinaciones bajo umbral</Th>
            <Th>Tasa de no aptas</Th>
          </tr>
        </thead>
        <tbody>
          {DEPARTAMENTOS.map((d) => {
            const sinCobertura = d.bancosActivos === 0
            return (
              <tr key={d.departamento}>
                <Td className="whitespace-nowrap font-semibold text-vino-800">
                  {d.departamento}
                </Td>
                <Td
                  className={unir(
                    'font-semibold',
                    sinCobertura && 'text-vino-700',
                  )}
                >
                  {d.bancosActivos}
                </Td>
                <Td className="font-bold">
                  {sinCobertura ? '—' : d.unidadesDisponibles.toLocaleString('es-CO')}
                </Td>
                <Td>{sinCobertura ? '—' : d.combinacionesBajoUmbral}</Td>
                {/*
                  RNF-01: una tasa, nunca un motivo. La celda no es un enlace y
                  no hay pantalla de detalle detras.
                */}
                <Td>{sinCobertura ? '—' : `${d.tasaNoAptas.toFixed(1)} %`}</Td>
              </tr>
            )
          })}
        </tbody>
      </Tabla>

      <Aviso tono="informacion" titulo="Por que aqui no hay restriccion territorial">
        RNF-02 limita a los usuarios territoriales, y tu jurisdiccion asignada
        es el territorio nacional: ningun departamento te queda fuera. La
        restriccion que sigue vigente es otra — la tasa de no aptas es un
        agregado y no se desglosa por causa clinica en ninguna jurisdiccion,
        tampoco en esta.
      </Aviso>

      {sinBanco.length > 0 && (
        <Aviso tono="operativo" titulo="Departamentos sin banco activo">
          {sinBanco.map((d) => d.departamento).join(', ')}. La poblacion de
          estos departamentos depende de la red de los departamentos vecinos.
          Es el dato que sustenta el indicador de cobertura territorial.
        </Aviso>
      )}
    </div>
  )
}
