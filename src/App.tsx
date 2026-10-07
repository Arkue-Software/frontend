import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/shared/layout/AppShell'
import { RUTA_INICIAL } from '@/shared/layout/navegacion'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { CargandoRedVital } from '@/shared/ui/Cargando'

/**
 * Alcance del prototipo V1: modulos M1, M3 y M4, mas el transversal minimo.
 * M2 (Campanas), M5 (Red Territorial) y M6 (Analitica) quedan para el V2,
 * segun el alcance aprobado del inventario de pantallas.
 *
 * Cada modulo se carga por separado. El donante que entra a registrarse no
 * descarga el codigo del inventario ni el de la bitacora, que no va a usar.
 * La pantalla de carga que aparece mientras llega el modulo es real: no hay
 * espera simulada en ninguna parte del prototipo.
 */

// M1 — Gestion de Donantes
const Bienvenida = pagina(() => import('@/modules/donantes/pages/Bienvenida'), 'Bienvenida')
const RegistroAnonimo = pagina(() => import('@/modules/donantes/pages/RegistroAnonimo'), 'RegistroAnonimo')
const RegistroPerfil = pagina(() => import('@/modules/donantes/pages/RegistroPerfil'), 'RegistroPerfil')
const MiPerfil = pagina(() => import('@/modules/donantes/pages/MiPerfil'), 'MiPerfil')
const MiHistorial = pagina(() => import('@/modules/donantes/pages/MiHistorial'), 'MiHistorial')
const MisReconocimientos = pagina(() => import('@/modules/donantes/pages/MisReconocimientos'), 'MisReconocimientos')
const ConsultaDonante = pagina(() => import('@/modules/donantes/pages/ConsultaDonante'), 'ConsultaDonante')

// M3 — Ciclo de Vida de la Unidad
const RegistroDonacion = pagina(() => import('@/modules/ciclovida/pages/RegistroDonacion'), 'RegistroDonacion')
const ListaUnidades = pagina(() => import('@/modules/ciclovida/pages/ListaUnidades'), 'ListaUnidades')
const DetalleUnidad = pagina(() => import('@/modules/ciclovida/pages/DetalleUnidad'), 'DetalleUnidad')

// M4 — Inventario y Distribucion
const PanelInventario = pagina(() => import('@/modules/inventario/pages/PanelInventario'), 'PanelInventario')
const Alertas = pagina(() => import('@/modules/inventario/pages/Alertas'), 'Alertas')
const Transferencias = pagina(() => import('@/modules/inventario/pages/Transferencias'), 'Transferencias')
const InventarioJurisdiccion = pagina(() => import('@/modules/inventario/pages/InventarioJurisdiccion'), 'InventarioJurisdiccion')
const InventarioNacional = pagina(() => import('@/modules/inventario/pages/InventarioNacional'), 'InventarioNacional')

// Transversal
const Bitacora = pagina(() => import('@/shared/paginas/Bitacora'), 'Bitacora')
const Denegacion = pagina(() => import('@/shared/paginas/Denegacion'), 'Denegacion')
const NoEncontrado = pagina(() => import('@/shared/paginas/NoEncontrado'), 'NoEncontrado')

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Inicio />} />

        {/* M1 */}
        <Route path="donantes/bienvenida" element={<Carga><Bienvenida /></Carga>} />
        <Route path="donantes/registro-anonimo" element={<Carga><RegistroAnonimo /></Carga>} />
        <Route path="donantes/registro-perfil" element={<Carga><RegistroPerfil /></Carga>} />
        <Route path="donantes/perfil" element={<Carga><MiPerfil /></Carga>} />
        <Route path="donantes/historial" element={<Carga><MiHistorial /></Carga>} />
        <Route path="donantes/reconocimientos" element={<Carga><MisReconocimientos /></Carga>} />
        <Route path="donantes/consulta" element={<Carga><ConsultaDonante /></Carga>} />

        {/* M3 */}
        <Route path="ciclovida/registro-donacion" element={<Carga><RegistroDonacion /></Carga>} />
        <Route path="ciclovida/unidades" element={<Carga><ListaUnidades /></Carga>} />
        <Route path="ciclovida/unidades/:codigo" element={<Carga><DetalleUnidad /></Carga>} />

        {/* M4 */}
        <Route path="inventario" element={<Carga><PanelInventario /></Carga>} />
        <Route path="inventario/alertas" element={<Carga><Alertas /></Carga>} />
        <Route path="inventario/transferencias" element={<Carga><Transferencias /></Carga>} />
        <Route path="inventario/jurisdiccion" element={<Carga><InventarioJurisdiccion /></Carga>} />
        <Route path="inventario/nacional" element={<Carga><InventarioNacional /></Carga>} />

        {/* Transversal */}
        <Route path="bitacora" element={<Carga><Bitacora /></Carga>} />
        <Route path="denegado" element={<Carga><Denegacion /></Carga>} />
        <Route path="*" element={<Carga><NoEncontrado /></Carga>} />
      </Route>
    </Routes>
  )
}

function Carga({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<CargandoRedVital />}>{children}</Suspense>
}

/** Cada perfil aterriza en la primera pantalla que tiene sentido para el. */
function Inicio() {
  const { rol } = useSesion()
  return <Navigate to={RUTA_INICIAL[rol.id]} replace />
}

/**
 * Envuelve una importacion diferida y toma la exportacion con nombre del
 * modulo. Las pantallas se exportan por nombre y no por defecto, para que un
 * cambio de nombre falle en compilacion en vez de en tiempo de ejecucion.
 */
function pagina<N extends string>(
  importar: () => Promise<Record<N, React.ComponentType>>,
  nombre: N,
) {
  return lazy(async () => ({ default: (await importar())[nombre] }))
}
