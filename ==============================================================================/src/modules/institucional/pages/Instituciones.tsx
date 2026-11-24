import { useMemo, useState } from 'react'
import { useAccion, useConsulta } from '@/shared/consulta/useConsulta'
import { EstadoDeConsulta } from '@/shared/consulta/EstadoDeConsulta'
import { fecha, jurisdiccionEnFrase } from '@/shared/formato'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { DialogoConfirmacion } from '@/shared/ui/DialogoConfirmacion'
import { IconoHospital, IconoRegistro } from '@/shared/ui/Iconos'
import { Aviso, Boton, CampoTexto, EstadoVacio, Selector, Tabla, Td, Th, TituloSeccion, unir } from '@/shared/ui/Primitivos'
import { useTituloPagina } from '@/shared/useTituloPagina'
import type { Institucion, TerritorioRegistrado, TipoInstitucion } from '@/shared/tipos'

/**
 * M6 — Registro de instituciones (GET/POST /v1/instituciones y PUT
 * /v1/instituciones/{id}, RF-09, EC-42). El administrador de banco ve la
 * suya; el coordinador y el auditor, las de su jurisdicción; el
 * administrador nacional, todas. El coordinador (en su jurisdicción) y el
 * administrador nacional dan de alta, cambian y dan de baja. El tipo no
 * cambia nunca: otros servicios ya decidieron sobre él.
 */

export const ETIQUETA_TIPO_INSTITUCION: Record<TipoInstitucion, string> = {
  banco_de_sangre: 'Banco de sangre',
  servicio_transfusion: 'Servicio de transfusión',
}

type Dialogo = { tipo: 'nueva' } | { tipo: 'editar'; institucion: Institucion } | { tipo: 'vigencia'; institucion: Institucion }

export function Instituciones() {
  useTituloPagina('Instituciones')
  const { rol, usuario } = useSesion()
  const administra = rol.id === 'U5' || rol.id === 'U6'
  const [departamento, setDepartamento] = useState('')
  const [tipo, setTipo] = useState<TipoInstitucion | ''>('')
  const [bajas, setBajas] = useState(false)
  const [dialogo, setDialogo] = useState<Dialogo | null>(null)

  const territorios = useConsulta((api) => api.institucional.listarTerritorios({ tamano: 500 }), [])
  const consulta = useConsulta(
    (api) =>
      api.institucional.listarInstituciones({
        territorioRuta: departamento || undefined,
        tipo: tipo || undefined,
        incluirBajas: administra && bajas,
        tamano: 500,
      }),
    [departamento, tipo, bajas],
  )

  const departamentos = useMemo(
    () =>
      (territorios.datos?.elementos ?? [])
        .filter((t) => t.nivel === 'departamental')
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [territorios.datos],
  )
  const municipios = useMemo(
    () => (territorios.datos?.elementos ?? []).filter((t) => t.nivel === 'municipal' && t.vigente),
    [territorios.datos],
  )

  function reemplazar(i: Institucion) {
    if (!consulta.datos) return
    const existe = consulta.datos.elementos.some((x) => x.id === i.id)
    const elementos = existe ? consulta.datos.elementos.map((x) => (x.id === i.id ? i : x)) : [i, ...consulta.datos.elementos]
    // Una baja deja de figurar si no se están mostrando las bajas.
    const visibles = elementos.filter((x) => x.vigente || bajas)
    consulta.establecer({ ...consulta.datos, elementos: visibles, total: visibles.length })
    setDialogo(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TituloSeccion
          etiqueta="Red institucional"
          descripcion={
            rol.id === 'U4'
              ? 'Tu banco en el registro institucional.'
              : `Bancos de sangre y servicios de transfusión de ${jurisdiccionEnFrase(usuario?.jurisdiccion)}.`
          }
        >
          Instituciones
        </TituloSeccion>
        {administra && (
          <Boton icono={<IconoHospital />} onClick={() => setDialogo({ tipo: 'nueva' })} deshabilitado={municipios.length === 0}>
            Nueva institución
          </Boton>
        )}
      </div>

      {rol.id !== 'U4' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {departamentos.length > 1 && (
            <Selector
              id="filtro-departamento"
              etiqueta="Departamento"
              valor={departamento}
              onCambio={setDepartamento}
              vacio="Todos"
              opciones={departamentos.map((d) => ({ valor: d.ruta, texto: d.nombre }))}
            />
          )}
          <Selector
            id="filtro-tipo"
            etiqueta="Tipo"
            valor={tipo}
            onCambio={(v) => setTipo(v as TipoInstitucion | '')}
            vacio="Todos"
            opciones={Object.entries(ETIQUETA_TIPO_INSTITUCION).map(([valor, texto]) => ({ valor, texto }))}
          />
          {administra && (
            <label className="flex items-end gap-2 pb-3 text-sm text-vino-800">
              <input type="checkbox" checked={bajas} onChange={(e) => setBajas(e.target.checked)} className="h-4 w-4" />
              Mostrar también las dadas de baja
            </label>
          )}
        </div>
      )}

      <EstadoDeConsulta consulta={consulta}>
        {(pagina) =>
          pagina.elementos.length === 0 ? (
            <EstadoVacio titulo="No hay instituciones" icono={<IconoHospital />}>
              No hay instituciones registradas con estos filtros en tu jurisdicción.
            </EstadoVacio>
          ) : (
            <Tabla>
              <thead>
                <tr>
                  <Th>Institución</Th>
                  <Th>Tipo</Th>
                  <Th>Municipio</Th>
                  <Th>Alta</Th>
                  <Th>Estado</Th>
                  {administra && <Th>Acción</Th>}
                </tr>
              </thead>
              <tbody>
                {pagina.elementos.map((i) => (
                  <tr key={i.id}>
                    <Td className="font-bold text-vino-800">
                      {i.nombre}
                      <span className="block font-mono text-xs font-normal text-texto-tenue">{i.codigo}</span>
                    </Td>
                    <Td>{ETIQUETA_TIPO_INSTITUCION[i.tipo]}</Td>
                    <Td>
                      {i.territorioNombre}
                      {i.direccion && <span className="block text-xs text-texto-tenue">{i.direccion}</span>}
                    </Td>
                    <Td className="whitespace-nowrap text-xs">{fecha(i.creadoEn)}</Td>
                    <Td>
                      <span
                        className={unir(
                          'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold',
                          i.vigente ? 'border-exito-600/40 bg-exito-50 text-exito-600' : 'border-vino-200 bg-white text-texto-gris',
                        )}
                      >
                        {i.vigente ? 'Vigente' : 'Dada de baja'}
                      </span>
                    </Td>
                    {administra && (
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          <Boton variante="texto" icono={<IconoRegistro />} onClick={() => setDialogo({ tipo: 'editar', institucion: i })}>
                            Editar
                          </Boton>
                          <Boton variante="texto" onClick={() => setDialogo({ tipo: 'vigencia', institucion: i })}>
                            {i.vigente ? 'Dar de baja' : 'Reactivar'}
                          </Boton>
                        </div>
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Tabla>
          )
        }
      </EstadoDeConsulta>

      <Aviso tono="informacion" titulo="Sobre el tipo de institución">
        Un banco de sangre capta y custodia unidades; un servicio de transfusión no las custodia (Resolución 901 de
        1996). El tipo se fija en el alta y no cambia.
      </Aviso>

      {dialogo?.tipo === 'nueva' && <NuevaInstitucion municipios={municipios} onCerrar={() => setDialogo(null)} onGuardada={reemplazar} />}
      {dialogo?.tipo === 'editar' && <EditarInstitucion institucion={dialogo.institucion} onCerrar={() => setDialogo(null)} onGuardada={reemplazar} />}
      {dialogo?.tipo === 'vigencia' && <CambiarVigencia institucion={dialogo.institucion} onCerrar={() => setDialogo(null)} onGuardada={reemplazar} />}
    </div>
  )
}

const CODIGO = /^[A-Za-z0-9-]{4,20}$/

function mensajeError(e: { estado: number; detalle: string } | null, generico: string): string | null {
  if (!e) return null
  if (e.estado === 409) return e.detalle || 'Ya existe una institución con ese código de habilitación.'
  if (e.estado === 400) return e.detalle || 'Revisa los datos.'
  if (e.estado === 403 || e.estado === 404) return 'Esa institución o ese municipio están fuera de tu jurisdicción.'
  return generico
}

function NuevaInstitucion({
  municipios,
  onCerrar,
  onGuardada,
}: {
  municipios: TerritorioRegistrado[]
  onCerrar: () => void
  onGuardada: (i: Institucion) => void
}) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<TipoInstitucion>('banco_de_sangre')
  const [municipio, setMunicipio] = useState('')
  const [direccion, setDireccion] = useState('')
  const crear = useAccion((api) =>
    api.institucional.crearInstitucion({
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      tipo,
      territorioId: municipio,
      direccion: direccion.trim() || null,
    }),
  )
  const errorCodigo = codigo && !CODIGO.test(codigo.trim()) ? 'De 4 a 20 letras, dígitos o guiones.' : null
  const valido = CODIGO.test(codigo.trim()) && nombre.trim().length > 0 && nombre.trim().length <= 160 && Boolean(municipio)

  async function confirmar() {
    const i = await crear.ejecutar()
    if (i) onGuardada(i)
  }

  return (
    <DialogoConfirmacion
      abierto
      titulo="Nueva institución"
      descripcion="Nace vigente, sin unidades ni umbrales. Nada anterior al alta se le atribuye."
      textoConfirmar="Dar de alta"
      onConfirmar={confirmar}
      onCerrar={onCerrar}
      cargando={crear.enCurso}
      confirmarDeshabilitado={!valido}
      error={mensajeError(crear.error, 'No fue posible dar de alta la institución. Inténtalo de nuevo.')}
    >
      <div className="space-y-4">
        <CampoTexto
          id="institucion-codigo"
          etiqueta="Código de habilitación"
          valor={codigo}
          onCambio={setCodigo}
          maxLength={20}
          error={errorCodigo}
        />
        <CampoTexto id="institucion-nombre" etiqueta="Nombre" valor={nombre} onCambio={setNombre} maxLength={160} />
        <Selector
          id="institucion-tipo"
          etiqueta="Tipo"
          valor={tipo}
          onCambio={(v) => setTipo(v as TipoInstitucion)}
          opciones={Object.entries(ETIQUETA_TIPO_INSTITUCION).map(([valor, texto]) => ({ valor, texto }))}
        />
        <Selector
          id="institucion-municipio"
          etiqueta="Municipio"
          valor={municipio}
          onCambio={setMunicipio}
          vacio="Elige un municipio"
          opciones={[...municipios]
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
            .map((m) => ({ valor: m.id, texto: `${m.nombre} (${m.codigoDivipola})` }))}
        />
        <CampoTexto id="institucion-direccion" etiqueta="Dirección" opcional valor={direccion} onCambio={setDireccion} maxLength={200} />
      </div>
    </DialogoConfirmacion>
  )
}

function EditarInstitucion({
  institucion,
  onCerrar,
  onGuardada,
}: {
  institucion: Institucion
  onCerrar: () => void
  onGuardada: (i: Institucion) => void
}) {
  const [nombre, setNombre] = useState(institucion.nombre)
  const [direccion, setDireccion] = useState(institucion.direccion ?? '')
  const guardar = useAccion((api) =>
    api.institucional.modificarInstitucion(institucion.id, { nombre: nombre.trim(), direccion: direccion.trim() }),
  )
  const valido =
    nombre.trim().length > 0 && nombre.trim().length <= 160 &&
    (nombre.trim() !== institucion.nombre || direccion.trim() !== (institucion.direccion ?? ''))

  async function confirmar() {
    const i = await guardar.ejecutar()
    if (i) onGuardada(i)
  }

  return (
    <DialogoConfirmacion
      abierto
      titulo="Editar institución"
      descripcion={`${ETIQUETA_TIPO_INSTITUCION[institucion.tipo]} en ${institucion.territorioNombre}. El código, el tipo y el municipio no cambian.`}
      textoConfirmar="Guardar cambios"
      onConfirmar={confirmar}
      onCerrar={onCerrar}
      cargando={guardar.enCurso}
      confirmarDeshabilitado={!valido}
      error={mensajeError(guardar.error, 'No fue posible guardar los cambios. Inténtalo de nuevo.')}
    >
      <div className="space-y-4">
        <CampoTexto id="editar-nombre" etiqueta="Nombre" valor={nombre} onCambio={setNombre} maxLength={160} />
        <CampoTexto id="editar-direccion" etiqueta="Dirección" opcional valor={direccion} onCambio={setDireccion} maxLength={200} />
      </div>
    </DialogoConfirmacion>
  )
}

function CambiarVigencia({
  institucion,
  onCerrar,
  onGuardada,
}: {
  institucion: Institucion
  onCerrar: () => void
  onGuardada: (i: Institucion) => void
}) {
  const baja = institucion.vigente
  const cambio = useAccion((api) => api.institucional.modificarInstitucion(institucion.id, { vigente: !baja }))

  async function confirmar() {
    const i = await cambio.ejecutar()
    if (i) onGuardada(i)
  }

  return (
    <DialogoConfirmacion
      abierto
      titulo={baja ? 'Dar de baja la institución' : 'Reactivar la institución'}
      descripcion={
        baja
          ? `«${institucion.nombre}» dejará de figurar en los listados. Sus unidades y su historial conservan la referencia.`
          : `«${institucion.nombre}» volverá a figurar en los listados.`
      }
      textoConfirmar={baja ? 'Dar de baja' : 'Reactivar'}
      onConfirmar={confirmar}
      onCerrar={onCerrar}
      cargando={cambio.enCurso}
      error={mensajeError(cambio.error, 'No fue posible completar el cambio. Inténtalo de nuevo.')}
    />
  )
}
