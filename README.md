# RedVital Web

Aplicación web de RedVital. React 19 + TypeScript + Vite + Tailwind CSS 4, con primitivos de Radix UI.

**Estado actual: prototipo de alta fidelidad V1.** No hay lógica de negocio ni conexión con los servicios de backend. Todos los datos son sintéticos y viven en `src/shared/datos/`.

## Cómo ejecutarlo

Requiere Node.js 20 o superior (probado con Node 24).

```bash
npm install
```

```bash
npm run dev
```

Abre `http://localhost:5173`.

### Otros comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila TypeScript y genera `dist/` |
| `npm run preview` | Sirve el `dist/` ya construido |
| `npm run typecheck` | Verifica tipos sin generar archivos |

## Cómo recorrerlo en una presentación

La barra superior tiene un selector **"Ver como"** con los siete perfiles del SRS. Es un artefacto exclusivo del prototipo: en el sistema real el rol viene del API Gateway. Cambiar de perfil cambia la navegación, porque **un rol no ve las entradas de los módulos que no le corresponden** — no aparecen deshabilitadas ni con candado, simplemente no están.

Recorrido sugerido, uno por cada restricción crítica:

1. **RNF-03 — registro anónimo en 3 pasos.** Perfil `U1 — Donante anónimo`. El indicador dice "Paso 1 de 3" y ningún paso pide cédula, nombre ni correo obligatorio. La pantalla del código es el resultado, no un cuarto paso.
2. **RNF-01 — nunca la causa clínica.** Perfil `U3 — Operador de banco` → *Unidades* → `DEMO-U-004822` (no apta). El recorrido muestra que hubo tamizaje y quién lo registró, nunca por qué. Abre *Registrar resultado de tamizaje*: el formulario tiene dos botones y **ningún campo de motivo**. Esa ausencia es el mecanismo: lo que no se captura no se puede exponer después.
3. **RNF-02 — jurisdicción.** Perfil `U5 — Coordinador territorial` → *Inventario de mi jurisdicción* → botón *Intentar consultar otro departamento*. La respuesta es una denegación que nombra la jurisdicción propia, nunca la ajena, no confirma que el recurso exista, y avisa que el intento quedó auditado.
4. **Bitácora.** Perfil `U7 — Auditor`. Es el único perfil sin acceso de escritura en ningún módulo.

Varias pantallas tienen un conmutador **"Demostración"** con borde punteado, para mostrar el camino feliz y su estado de excepción sin tener que fabricar datos.

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/modules/donantes/` | M1 — Gestión de Donantes |
| `src/modules/ciclovida/` | M3 — Ciclo de Vida de la Unidad |
| `src/modules/inventario/` | M4 — Inventario y Distribución |
| `src/shared/ui/` | Componentes visuales compartidos, iconografía y animaciones |
| `src/shared/layout/` | Estructura de la aplicación, isotipo y navegación por rol |
| `src/shared/paginas/` | Pantallas transversales (denegación, bitácora, no encontrado) |
| `src/shared/datos/` | Datos sintéticos y catálogo de roles |
| `src/styles/tema.css` | Tokens de color, tipografía, sombras y movimiento |

## Sistema visual

- **Tipografía:** Atkinson Hyperlegible, diseñada para máxima legibilidad. El donante puede ser cualquier persona, de cualquier nivel educativo.
- **Color:** la paleta institucional en `tema.css`. Dos familias que nunca se mezclan — el vinotinto es identidad y alerta operativa; el rojo de error queda reservado para fallos reales del sistema.
- **Movimiento:** concentrado en el recorrido del donante, que es la única superficie cuyo trabajo es persuadir. Las pantallas clínicas y de inventario se mantienen quietas y densas: quien marca una unidad no apta necesita velocidad, no coreografía.
- **Accesibilidad:** foco visible siempre, objetivos táctiles de 44px, iconos SVG propios (nunca emoji), y `prefers-reduced-motion` respetado de forma global — con esa preferencia activa toda animación decorativa se anula y queda el estado final.
- Las animaciones usan solo `transform` y `opacity`, que el navegador resuelve sin rehacer el diseño de la página. Los revelados al hacer scroll usan `IntersectionObserver`, no escuchas de `scroll`.
- Cada módulo se carga por separado. La pantalla de carga con el isotipo animado es real: no hay esperas simuladas en ninguna parte.

Los módulos M2 (Campañas), M5 (Red Territorial) y M6 (Analítica) no están en el V1. El inventario completo de las 96 pantallas está en [`docs/inventario-pantallas.md`](docs/inventario-pantallas.md).

### Pendiente conocido dentro del alcance

`M4-U7-01`, la vista de inventario del auditor, todavía no existe. El perfil `U7` entra provisionalmente a la pantalla del coordinador territorial, que le habla de «mi jurisdicción» cuando su ámbito es la bitácora, y le ofrece la demostración de denegación territorial que no le corresponde. La vista del administrador nacional sí está separada desde el principio: `RNF-02` restringe a los usuarios **territoriales**, y la jurisdicción de `U6` es el país entero.

## Decisiones registradas

La elección de Tailwind, Radix y Vite está sustentada en `redvital-docs/docs/adr/ADR-006-stack-de-interfaz.md`.
