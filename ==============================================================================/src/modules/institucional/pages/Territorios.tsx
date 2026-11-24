import { useMemo, useState } from 'react'
import { useAccion, useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { rutaDeCodigo } from '@/shared/datos/divipola'
import { jurisdiccionEnFrase } from '@/shared/formato'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { DialogoConfirmacion } from '@/shared/ui/DialogoConfirmacion'
import { IconoBuscar, IconoUbicacion } from '@/shared/ui/Iconos'
import { Boton, CampoTexto, EstadoVacio, Tarjeta, TituloSeccion } from '@/shared/ui/Primitivos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { TerritorioRegistrado } from '@/shared/tipos'

/**
 * M6 — Jerarquía territorial (GET /v1/territorios, RF-09). Cada perfil ve la
 * parte de la jerarquía que cae en su jurisdicción: el país, su departamento
 * o el municipio de su banco. Solo el administrador nacional da de alta
 * territorios (POST /v1/territorios); la ruta la calcula el servicio a partir
 * del código DIVIPOLA.
 */
export function Territorios() {
  useTituloPagina('Territorios')
  const { rol, usuario } = useSesion()
  const consulta = useConsulta((api) => api.institucional.listarTerritorios({ tamano: 500 }), [])
  const [filtro, setFiltro] = useState('')
  const [creando, setCreando] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TituloSeccion
          etiqueta="Red territorial"
          descripcion={`Departamentos y municipios de ${jurisdiccionEnFrase(usuario?.jurisdiccion)}, según el código DIVIPOLA del DANE.`}
        >
          Territorios
        </TituloSeccion>
        {rol.id === 'U6' && (
          <Boton icono={<IconoUbicacion />} onClick={() => setCreando(true)}>
            Agregar territorio
          </Boton>
        )}
      </div>

      <EstadoDeConsulta consulta={consulta}>
        {(pagina) => (
          <>
            <div className="max-w-sm">
              <CampoTexto id="filtro-territorio" etiqueta="Buscar" placeholder="Nombre o código" valor={filtro} onCambio={setFiltro} />
            </div>
            <Arbol territorios={pagina.elementos} filtro={filtro} />
          </>
        )}
      </EstadoDeConsulta>

      {creando && consulta.datos && (
        <NuevoTerritorio
          existentes={consulta.datos.elementos}
          onCerrar={() => setCreando(false)}
          onCreado={(t) => {
            if (consulta.datos) consulta.establecer({ ...consulta.datos, elementos: [...consulta.datos.elementos, t], total: consulta.datos.total + 1 })
            setCreando(false)
          }}
        />
      )}
    </div>
  )
}

function Arbol({ territorios, filtro }: { territorios: TerritorioRegistrado[]; filtro: string }) {
  const grupos = useMemo(() => {
    const texto = filtro.trim().toLocaleLowerCase('es')
    const coincide = (t: TerritorioRegistrado) =>
      !texto || t.nombre.toLocaleLowerCase('es').includes(texto) || t.codigoDivipola.startsWith(texto)
    const departamentos = territorios.filter((t) => t.nivel === 'departamental')
    const municipios = territorios.filter((t) => t.nivel === 'municipal')
    // Un municipio sin su departamento en la lista: la jurisdicción es ese municipio.
    const sueltos = municipios.filter((m) => !departamentos.some((d) => d.id === m.padreId))
    const porDepartamento = departamentos
      .map((d) => {
        const suyos = municipios.filter((m) => m.padreId === d.id)
        return { departamento: d, municipios: coincide(d) ? suyos : suyos.filter(coincide) }
      })
      .filter((g) => coincide(g.departamento) || g.municipios.length > 0)
      .sort((a, b) => a.departamento.nombre.localeCompare(b.departamento.nombre, 'es'))
    return { porDepartamento, sueltos: sueltos.filter(coincide) }
  }, [territorios, filtro])

  if (grupos.porDepartamento.length === 0 && grupos.sueltos.length === 0) {
    return (
      <EstadoVacio titulo="Sin coincidencias" icono={<IconoBuscar />}>
        Ningún territorio de tu jurisdicción coincide con la búsqueda.
      </EstadoVacio>
    )
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {grupos.sueltos.length > 0 && (
        <Tarjeta>
          <ListaMunicipios municipios={grupos.sueltos} />
        </Tarjeta>
      )}
      {grupos.porDepartamento.map(({ departamento, municipios }) => (
        <Tarjeta key={departamento.id}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-bold text-vino-800">{departamento.nombre}</h2>
            <span className="font-mono text-xs text-texto-tenue">{departamento.codigoDivipola}</span>
          </div>
          <p className="mt-1 text-xs text-texto-tenue">
            {municipios.length === 1 ? '1 municipio registrado' : `${municipios.length} municipios registrados`}
          </p>
          <ListaMunicipios municipios={municipios} />
        </Tarjeta>
      ))}
    </div>
  )
}

function ListaMunicipios({ municipios }: { municipios: TerritorioRegistrado[] }) {
  if (municipios.length === 0) return null
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {[...municipios]
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
        .map((m) => (
          <li key={m.id}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-vino-100 bg-white px-3 py-1 text-xs text-vino-800">
              {m.nombre}
              <span className="font-mono text-[10px] text-texto-tenue">{m.codigoDivipola}</span>
              {!m.vigente && <span className="text-[10px] text-texto-tenue">(no vigente)</span>}
            </span>
          </li>
        ))}
    </ul>
  )
}

function NuevoTerritorio({
  existentes,
  onCerrar,
  onCreado,
}: {
  existentes: TerritorioRegistrado[]
  onCerrar: () => void
  onCreado: (t: TerritorioRegistrado) => void
}) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const crear = useAccion((api) => api.institucional.crearTerritorio(codigo, nombre.trim()))

  const forma = /^(\d{2}|\d{5})$/.test(codigo) && codigo !== '00'
  const padre = forma ? existentes.find((t) => t.codigoDivipola === (codigo.length === 5 ? codigo.slice(0, 2) : '00')) : undefined
  const repetido = existentes.some((t) => t.codigoDivipola === codigo)
  const errorCodigo = !codigo
    ? null
    : !forma
      ? 'Dos dígitos para un departamento o cinco para un municipio.'
      : repetido
        ? 'Ese código ya está registrado.'
        : !padre
          ? `Primero registra el departamento ${codigo.slice(0, 2)}.`
          : null
  const valido = forma && !repetido && Boolean(padre) && nombre.trim().length > 0 && nombre.trim().length <= 120

  async function confirmar() {
    const t = await crear.ejecutar()
    if (t) onCreado(t)
  }

  return (
    <DialogoConfirmacion
      abierto
      titulo="Agregar territorio"
      descripcion="Registra un departamento o un municipio con su código DIVIPOLA oficial. El nivel y el territorio del que depende salen del código."
      textoConfirmar="Agregar"
      onConfirmar={confirmar}
      onCerrar={onCerrar}
      cargando={crear.enCurso}
      confirmarDeshabilitado={!valido}
      error={
        crear.error
          ? crear.error.estado === 409
            ? 'Ese código ya está registrado.'
            : crear.error.estado === 400
              ? crear.error.detalle
              : 'No fue posible registrar el territorio. Inténtalo de nuevo.'
          : null
      }
    >
      <div className="space-y-4">
        <CampoTexto
          id="territorio-codigo"
          etiqueta="Código DIVIPOLA"
          inputMode="numeric"
          maxLength={5}
          valor={codigo}
          onCambio={(v) => setCodigo(v.replace(/\D/g, ''))}
          error={errorCodigo}
        />
        <CampoTexto id="territorio-nombre" etiqueta="Nombre" valor={nombre} onCambio={setNombre} maxLength={120} />
        {forma && padre && (
          <p className="text-xs text-texto-gris">
            {codigo.length === 5 ? 'Municipio' : 'Departamento'} de {padre.nombre}. Ruta:{' '}
            <span className="font-mono">{rutaDeCodigo(codigo)}</span>
          </p>
        )}
      </div>
    </DialogoConfirmacion>
  )
}
