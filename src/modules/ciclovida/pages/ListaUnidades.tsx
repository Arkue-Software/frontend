import { Link, useSearchParams } from 'react-router-dom'
import { useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { COMPONENTES, ESTADOS_UNIDAD, ETIQUETA_COMPONENTE, ETIQUETA_ESTADO_UNIDAD } from '@/shared/datos/catalogos'
import { fechaCorta, hoy, idCorto, jurisdiccionEnFrase } from '@/shared/formato'
import { NombreInstitucion } from '@/shared/institucional/NombreInstitucion'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { Boton, EstadoVacio, Fila, Selector, Tabla, Td, Th, TituloSeccion, unir } from '@/shared/ui/Primitivos'
import { InsigniaEstadoUnidad } from '@/shared/ui/EstadoUnidad'
import { CargandoLinea } from '@/shared/ui/Cargando'
import { IconoRegistro } from '@/shared/ui/Iconos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { ComponenteSanguineo, EstadoUnidad, Pagina, Unidad } from '@/shared/tipos'

/**
 * M3-U3-03 — Unidades bajo custodia de la institución (GET /v1/unidades).
 *
 * Los filtros y la página viven en la URL: se pueden compartir y sobreviven a
 * recargar. U3 opera las unidades; U4 las consulta, y U5 y U6 consultan las
 * de los bancos de su jurisdicción, con el banco custodio de cada una.
 */

const TAMANO = 25

export function ListaUnidades() {
  useTituloPagina('Unidades')
  const { usuario } = useSesion()
  const territorial = usuario?.rol === 'U5' || usuario?.rol === 'U6'
  const [parametros, setParametros] = useSearchParams()
  const estado = (parametros.get('estado') ?? '') as EstadoUnidad | ''
  const componente = (parametros.get('componente') ?? '') as ComponenteSanguineo | ''
  const pagina = Math.max(Number(parametros.get('pagina') ?? '0') || 0, 0)

  const consulta = useConsulta(
    (api) =>
      api.trazabilidad.listarUnidades({
        estado: estado || undefined,
        componente: componente || undefined,
        pagina,
        tamano: TAMANO,
      }),
    [estado, componente, pagina],
  )

  function cambiar(clave: string, valor: string) {
    const nuevos = new URLSearchParams(parametros)
    if (valor) nuevos.set(clave, valor)
    else nuevos.delete(clave)
    if (clave !== 'pagina') nuevos.delete('pagina')
    setParametros(nuevos, { replace: true })
  }

  return (
    <div className="space-y-5">
      <TituloSeccion
        etiqueta="Ciclo de vida"
        descripcion={
          usuario?.rol === 'U3'
            ? 'Las unidades bajo custodia de tu banco. Abre una para registrar el siguiente paso.'
            : territorial
              ? `Las unidades bajo custodia de los bancos de ${jurisdiccionEnFrase(usuario?.jurisdiccion)}, en consulta.`
              : 'Las unidades bajo custodia de tu banco, en consulta.'
        }
      >
        Unidades
      </TituloSeccion>

      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <Selector
          id="filtro-estado"
          etiqueta="Estado"
          valor={estado}
          onCambio={(v) => cambiar('estado', v)}
          vacio="Todos los estados"
          opciones={ESTADOS_UNIDAD.map((e) => ({ valor: e, texto: ETIQUETA_ESTADO_UNIDAD[e] }))}
        />
        <Selector
          id="filtro-componente"
          etiqueta="Componente"
          valor={componente}
          onCambio={(v) => cambiar('componente', v)}
          vacio="Todos los componentes"
          opciones={COMPONENTES.map((c) => ({ valor: c, texto: ETIQUETA_COMPONENTE[c] }))}
        />
      </div>

      {consulta.estado === 'cargando' && consulta.datos && <CargandoLinea />}
      <EstadoDeConsulta consulta={consulta}>
        {(datos) => (
          <Listado
            datos={datos}
            conBanco={territorial}
            onPagina={(p) => cambiar('pagina', p === 0 ? '' : String(p))}
            filtrado={!!(estado || componente)}
          />
        )}
      </EstadoDeConsulta>
    </div>
  )
}

function Listado({
  datos,
  conBanco,
  onPagina,
  filtrado,
}: {
  datos: Pagina<Unidad>
  conBanco: boolean
  onPagina: (p: number) => void
  filtrado: boolean
}) {
  if (datos.elementos.length === 0) {
    return (
      <EstadoVacio titulo={filtrado ? 'Ninguna unidad coincide con los filtros' : 'Aún no hay unidades'} icono={<IconoRegistro />}>
        {filtrado ? 'Cambia el estado o el componente para ver otras unidades.' : 'Las unidades aparecen al registrar una donación.'}
      </EstadoVacio>
    )
  }
  const paginas = Math.max(Math.ceil(datos.total / datos.tamano), 1)
  const dia = hoy()

  return (
    <>
      <Tabla>
        <thead>
          <tr>
            <Th>Unidad</Th>
            {conBanco && <Th>Banco</Th>}
            <Th>Componente</Th>
            <Th>Grupo</Th>
            <Th>Estado</Th>
            <Th>Captación</Th>
            <Th>Vence</Th>
          </tr>
        </thead>
        <tbody>
          {datos.elementos.map((u) => {
            const vigente = !['despachada', 'no_apta', 'vencida', 'desechada'].includes(u.estado)
            const venceHoy = vigente && u.fechaVencimiento.slice(0, 10) <= dia
            return (
              <Fila key={u.id}>
                <Td>
                  <Link to={`/ciclovida/unidades/${u.id}`} className="font-mono font-bold text-vino-700 underline-offset-4 hover:underline">
                    {idCorto(u.id)}
                  </Link>
                </Td>
                {conBanco && (
                  <Td>
                    <NombreInstitucion id={u.institucionCustodiaId} />
                  </Td>
                )}
                <Td>{ETIQUETA_COMPONENTE[u.componente]}</Td>
                <Td className="font-bold">{u.grupo}</Td>
                <Td>
                  <InsigniaEstadoUnidad estado={u.estado} />
                </Td>
                <Td>{fechaCorta(u.fechaCaptacion)}</Td>
                <Td className={unir(venceHoy && 'font-bold text-aviso-600')}>{fechaCorta(u.fechaVencimiento)}</Td>
              </Fila>
            )
          })}
        </tbody>
      </Tabla>
      <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 text-sm text-texto-gris">
        <span>
          {datos.total} {datos.total === 1 ? 'unidad' : 'unidades'} · página {datos.pagina + 1} de {paginas}
        </span>
        <div className="flex gap-2">
          <Boton variante="secundario" deshabilitado={datos.pagina === 0} onClick={() => onPagina(datos.pagina - 1)}>
            Anterior
          </Boton>
          <Boton variante="secundario" deshabilitado={datos.pagina + 1 >= paginas} onClick={() => onPagina(datos.pagina + 1)}>
            Siguiente
          </Boton>
        </div>
      </nav>
    </>
  )
}
