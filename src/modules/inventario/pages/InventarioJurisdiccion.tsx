import { useNavigate } from 'react-router-dom'
import { BANCOS, INVENTARIO } from '@/shared/datos/sinteticos'
import { useSesion } from '@/shared/sesion/SesionContexto'
import {
  Aviso,
  Boton,
  CintaSintetica,
  Dato,
  Tabla,
  Tarjeta,
  Td,
  Th,
  TituloSeccion,
} from '@/shared/ui/Primitivos'

/**
 * M4-U5-01 — Inventario agregado de mi jurisdiccion.
 * M4-U5-02 — Inventario fuera de mi jurisdiccion (excepcion, via /denegado).
 *
 * Pantalla de usuarios TERRITORIALES. El administrador nacional tiene la suya
 * (M4-U6-01, InventarioNacional): RNF-02 habla de un usuario territorial, y
 * la jurisdiccion de aquel perfil es el pais entero, de modo que ni el aviso
 * ni la denegacion de abajo le corresponden.
 *
 * El auditor (U7) sigue entrando aqui de forma provisional. Su pantalla
 * propia, M4-U7-01, esta pendiente.
 *
 * RNF-02, con dos capas:
 *
 *  1. Filtro de datos: solo se suman bancos de la jurisdiccion del usuario.
 *  2. Ausencia de pistas: NO se muestra el total nacional como referencia.
 *     Mostrarlo permitiria deducir por resta el inventario de las demas
 *     jurisdicciones, que es exactamente lo que la restriccion impide.
 *
 * El boton de demostracion dispara la denegacion real de TR-04.
 */
export function InventarioJurisdiccion() {
  const { rol } = useSesion()
  const navegar = useNavigate()

  const total = INVENTARIO.reduce((s, e) => s + e.disponibles, 0)
  const bancosVisibles = BANCOS // todos son del departamento sintetico

  return (
    <div className="space-y-5">
      <CintaSintetica />

      <TituloSeccion descripcion={`Vista agregada de ${rol.jurisdiccion}.`}>
        Inventario de mi jurisdiccion
      </TituloSeccion>

      <div className="grid gap-4 sm:grid-cols-3">
        <Dato
          etiqueta="Bancos en la jurisdiccion"
          valor={bancosVisibles.length}
        />
        <Dato etiqueta="Unidades disponibles" valor={total * 3} />
        <Dato
          etiqueta="Bancos bajo umbral"
          valor={2}
          nota="Requieren seguimiento"
        />
      </div>

      <Tabla>
        <thead>
          <tr>
            <Th>Banco</Th>
            <Th>Municipio</Th>
            <Th>Unidades disponibles</Th>
            <Th>Combinaciones bajo umbral</Th>
          </tr>
        </thead>
        <tbody>
          {bancosVisibles.map((b, i) => (
            <tr key={b.id}>
              <Td className="whitespace-nowrap font-semibold text-vino-800">
                {b.nombre}
              </Td>
              <Td>{b.municipio}</Td>
              <Td className="font-bold">{[288, 216, 154, 121][i]}</Td>
              <Td>{[4, 2, 3, 1][i]}</Td>
            </tr>
          ))}
        </tbody>
      </Tabla>

      {/*
        RNF-02: no hay comparacion contra el total nacional ni contra otros
        departamentos. Ambas permiten inferir datos ajenos por diferencia.
      */}
      <Aviso tono="informacion" titulo="Por que no ves un comparativo nacional">
        Tu vista se limita a los bancos de tu jurisdiccion. No se muestra el
        total nacional ni el de otros departamentos, porque a partir de esas
        cifras podria deducirse informacion que no te corresponde.
      </Aviso>

      <Tarjeta className="border-dashed">
        <p className="text-xs font-semibold text-vino-700">Demostracion</p>
        <p className="mt-1 text-sm text-texto-gris">
          Asi responde el sistema cuando un usuario territorial intenta
          consultar datos de otra jurisdiccion. No es un error generico: es una
          denegacion, y queda auditada.
        </p>
        <div className="mt-3">
          <Boton variante="secundario" onClick={() => navegar('/denegado')}>
            Intentar consultar otro departamento
          </Boton>
        </div>
      </Tarjeta>
    </div>
  )
}
