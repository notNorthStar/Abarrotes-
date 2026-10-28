# Sistema visual "Mostrador"

Interfaz de Abarrotes+: app de escritorio sobria, inspirada en herramientas modernas — barra lateral oscura, contenido claro, panel lateral derecho de contexto, paleta de comandos (`Ctrl K`) y números en monoespaciada.

- **Prototipo interactivo (Claude Design):** https://claude.ai/artifact/VJg54UhTSpuPsdFWZUou8Z
- **Fuentes de los prototipos:** `prototipo-*.dc.html` en esta carpeta (referencia de medidas, textos y estructura).

## Reglas

1. **Paleta cerrada.** Solo los colores de `apps/web/tailwind.config.js`. Nunca `slate-*`, `emerald-*`, `gray-*`, `red-*` de Tailwind ni hex sueltos en componentes nuevos.
2. **Un solo acento:** `maiz` para foco, estado activo y marca. Nunca como fondo de texto blanco (no pasa contraste): con `maiz` va texto `tinta`.
3. **Semántica:** `hoja` = éxito / caja abierta / cambio; `chile` = error / faltante / eliminar; `maiz-claro` = granel y avisos; `cielo` = transferencia.
4. **Números con `.num`** (Geist Mono, dígitos tabulares): montos, cantidades, códigos de barras, atajos.
5. **Componentes de `components/ui.tsx`:** `Boton`, `claseBoton`, `Tarjeta`, `Chip`, `Tecla`, `Esqueleto`, `Aviso`, `EncabezadoPagina`, `Pagina`, `PaginaConPanel`, `pesos`. Íconos con `<Icono nombre="…" />` (`components/Icono.tsx`); nunca emojis.
6. **Sin "AI slop":** sin degradados decorativos, sin tarjetas con borde izquierdo de color, sin sombras pesadas. Bordes `linea` de 1 px, radios 8–12 px.
7. **Accesible:** `<button>`, `<a>`/`<Link>`, `<input>` con `<label>`; `aria-label` en botones de solo ícono; objetivos táctiles ≥ 36–44 px; contraste ≥ 4.5:1 (`piedra` sobre `papel` pasa).
8. **Carga con skeletons** (`Esqueleto` / clase `.esqueleto`), no con "Cargando…".

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `tinta` | #1A1916 | Texto, barra lateral, botón principal |
| `grafito` | #3A3833 | Texto secundario fuerte |
| `piedra` | #6B675F | Etiquetas, notas |
| `linea` / `borde` | #E4E1DA / #D9D4C9 | Bordes / bordes de campos |
| `papel` | #F6F5F1 | Fondo de la app |
| `hueso` / `crema` | #FBFAF7 / #F3F1EC | Superficies suaves |
| `superficie` | #FFFFFF | Tarjetas y paneles |
| `maiz` (+ `claro`, `texto`, `borde`) | #E3A13B | Acento único |
| `hoja` (+ `claro`, `texto`) | #2E7D4F | Éxito |
| `chile` (+ `claro`, `texto`) | #B9382A | Error |
| `cielo` (`claro`, `texto`) | #EAF0F8 / #284A73 | Transferencia |
| `riel.*` | — | Colores de la barra lateral |

## Tipografía

Geist (UI) y Geist Mono (números), cargadas en `apps/web/index.html`. Títulos de página 26 px / 600 con `tracking-tight`; secciones 14 px / 600; cuerpo 14 px; notas 12–13 px en `piedra`.

## Estructura de pantalla

- `Layout` (barra lateral + barra superior) envuelve todo; cada pantalla renderiza solo su contenido.
- Pantallas con panel derecho de contexto: `PaginaConPanel` (Inicio, Venta → cobro, Caja → cerrar caja, Inventario → detalle).
- El resto: `Pagina` + `EncabezadoPagina`.
