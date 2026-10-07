import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSesion } from '@/shared/sesion/SesionContexto'
import { LISTA_ROLES } from '@/shared/datos/roles'
import { navegacionDe, RUTA_INICIAL } from './navegacion'
import type { IconoNav } from './navegacion'
import { unir } from '@/shared/ui/Primitivos'
import type { RolId } from '@/shared/tipos'
import { Marca } from './Isotipo'
import {
  IconoAlerta,
  IconoBitacora,
  IconoBuscar,
  IconoCorazon,
  IconoGota,
  IconoHospital,
  IconoInventario,
  IconoMedalla,
  IconoPersona,
  IconoRegistro,
  IconoTransferencia,
  IconoUbicacion,
} from '@/shared/ui/Iconos'

const ICONOS: Record<IconoNav, typeof IconoGota> = {
  gota: IconoGota,
  corazon: IconoCorazon,
  persona: IconoPersona,
  registro: IconoRegistro,
  medalla: IconoMedalla,
  buscar: IconoBuscar,
  inventario: IconoInventario,
  alerta: IconoAlerta,
  transferencia: IconoTransferencia,
  hospital: IconoHospital,
  bitacora: IconoBitacora,
}

export function AppShell() {
  const { rol } = useSesion()
  const ubicacion = useLocation()
  const entradas = navegacionDe(rol.id)
  const esDonante = rol.id === 'U1' || rol.id === 'U2'

  return (
    <div className="flex min-h-full flex-col bg-crema">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-vino-600 focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-30">
        <div className="border-b border-vino-700/40 bg-vino-600/95 text-white backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
            <Marca compacto latiendo colorFondo="var(--color-vino-600)" />
            <SelectorDeRol />
          </div>

          {entradas.length > 0 && (
            <nav
              aria-label="Navegacion principal"
              className="border-t border-white/10"
            >
              <ul className="mx-auto flex max-w-7xl flex-wrap gap-0.5 px-3">
                {entradas.map((entrada) => {
                  const Icono = ICONOS[entrada.icono]
                  return (
                    <li key={entrada.ruta}>
                      <NavLink
                        to={entrada.ruta}
                        className={({ isActive }) =>
                          unir(
                            'group relative flex min-h-11 items-center gap-2 px-3 py-2.5 text-sm font-bold transition-colors duration-[var(--dur-rapida)]',
                            isActive
                              ? 'text-white'
                              : 'text-vino-100/80 hover:text-white',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icono
                              className={unir(
                                'h-4 w-4 transition-opacity duration-[var(--dur-rapida)]',
                                isActive
                                  ? 'opacity-100'
                                  : 'opacity-60 group-hover:opacity-100',
                              )}
                            />
                            {entrada.etiqueta}
                            {/*
                              El subrayado activo crece desde el centro en vez
                              de aparecer de golpe. Solo escala: no reordena
                              nada de la barra.
                            */}
                            <span
                              aria-hidden="true"
                              className={unir(
                                'absolute inset-x-2 bottom-0 h-0.5 origin-center rounded-full bg-white transition-transform duration-[var(--dur-media)] ease-salida',
                                isActive ? 'scale-x-100' : 'scale-x-0',
                              )}
                            />
                          </>
                        )}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </nav>
          )}
        </div>

        {/* Barra de contexto: el ambito visible siempre esta declarado (RNF-02) */}
        <div className="border-b border-vino-100 bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 text-xs">
            <span className="flex items-center gap-1.5 text-texto-gris">
              <IconoPersona className="h-3.5 w-3.5 text-vino-400" />
              <strong className="font-bold text-vino-700">{rol.nombre}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-texto-gris">
              <IconoUbicacion className="h-3.5 w-3.5 text-vino-400" />
              {rol.jurisdiccion}
            </span>
          </div>
        </div>
      </header>

      {/*
        La clave por ruta reinicia las animaciones de entrada al navegar, de
        modo que cada pantalla se presenta en vez de aparecer cortada.
      */}
      <main
        id="contenido"
        key={ubicacion.pathname}
        className={unir(
          'animate-entrar-panel mx-auto w-full flex-1 px-4 py-8',
          esDonante ? 'max-w-5xl' : 'max-w-7xl',
        )}
      >
        <Outlet />
      </main>

      <footer className="mt-8 border-t border-vino-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-texto-tenue">
          <span>
            RedVital — prototipo de interfaz V1. Datos sinteticos. Arkhe
            Software S.A.S.
          </span>
          <span>De la raiz a la red</span>
        </div>
      </footer>
    </div>
  )
}

/**
 * Conmutador de perfil. Artefacto exclusivo del prototipo, para demostrar que
 * cada rol ve algo distinto. En el sistema real el rol viene del gateway.
 */
function SelectorDeRol() {
  const { rol, cambiarRol } = useSesion()
  const navegar = useNavigate()

  return (
    <div className="ml-auto flex items-center gap-2.5">
      <label
        htmlFor="selector-rol"
        className="text-[11px] font-bold uppercase tracking-[0.14em] text-vino-100"
      >
        Ver como
      </label>
      <select
        id="selector-rol"
        value={rol.id}
        onChange={(e) => {
          const id = e.target.value as RolId
          cambiarRol(id)
          navegar(RUTA_INICIAL[id])
        }}
        className="min-h-11 rounded-full border border-white/25 bg-white/95 px-4 py-2 text-sm font-bold text-vino-800 shadow-nivel-1 transition-colors duration-[var(--dur-rapida)] hover:bg-white"
      >
        {LISTA_ROLES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.id} — {r.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}
