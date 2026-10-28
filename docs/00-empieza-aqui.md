# 00 · Empieza aquí (Miguel y Gonzalo)

Guía para trabajar en Abarrotes+ con tu IA (**Codex**, **Cursor** o **Antigravity**). Léela una vez; después tu IA se encarga del resto con `AGENTS.md`.

## Situación (28 oct)

- **El domingo 1 de noviembre entregamos Sprint 1 + Sprint 2** (9 HU, 47 pts) más el documento Scrum. **Objetivo: cerrar todo hoy, 28 oct.**
- Ya están en `develop` (31 pts): T-00, **HU-01** login, **HU-06** cobro, **HU-12** cuentas de cajero, **HU-08** alta de productos (Sosa), **HU-03** granel y **HU-04** inventario (Miguel), más casos de uso, diagrama de clases y burndown.
- **Gonzalo no puede continuar este sprint.** Sus tareas se repartieron el 28 oct: **HU-02 y D-02 → Miguel**; **HU-09 y HU-05 → Sosa**.
- Tu trabajo es **programar tus HU y mandar tus PRs**. **No revisas PRs**: Sosa revisa, aprueba e integra todo.
- Cada quien commitea **desde su propia cuenta de GitHub**: eso es lo que la maestra ve como tu aporte.

## Tu trabajo (re-planeado al 28 oct)

### Miguel (`MiguelTaracena`): carrito, inventario y prototipos (15 pts)

| Orden | Qué | Estado / para |
|---|---|---|
| — | **HU-03** Producto a granel | ✅ #8 |
| — | **HU-04** Consulta de inventario | ✅ #9 |
| — | **D-01** Casos de uso | ✅ #10 |
| 1 | **HU-02** Cobrar con código de barras (T-03, T-04) — *reasignada de Gonzalo* | **Hoy 28 oct** |
| 2 | **D-02** Prototipos de pantallas y alertas — *reasignada de Gonzalo* | **Hoy 28 oct** |

Ahora eres dueño de `features/venta/carrito`, `VentaPage.tsx` (ya hiciste la tabla de la cuenta), la lectura de `productos` y `features/inventario/InventarioPage.tsx`.

**Pistas para HU-02:**
- Input de escaneo con foco permanente: el lector USB escribe el código + Enter. Busca con `GET /api/productos/codigo/:codigo` y agrega con `useCarrito().agregarProducto(p)` (si ya está, **suma** cantidad: el store ya lo hace).
- Código no encontrado (404) → aviso y **búsqueda manual** por nombre (`GET /api/productos?q=`).
- Quitar renglón y cambiar cantidad desde la tabla de la cuenta (`quitar`, `cambiarCantidad` ya existen en el store).
- Para probar el cobro completo necesitas **caja abierta**: llega con HU-05 (Sosa) hoy mismo.

**Pistas para D-02:** pueden ser capturas de las pantallas reales (login, venta, cobro, caja, inventario, agregar productos, cajeros) y de las alertas (producto no encontrado, pago insuficiente, diferencia en el corte, usuario suspendido) en `docs/prototipos/`, con un `README.md` que las liste. Enlázalas en `docs/diagramas/casos-de-uso.md` (P-01–P-07).

### Sosa: caja (11 pts nuevos)

**HU-09** Pagos a proveedor (T-10) y **HU-05** Abrir caja y corte (T-09, T-11), en el módulo `caja` y `features/caja`.

### Gonzalo (`gxnzHer`)

Sin tareas este sprint. Si se reincorpora, se coordina con Sosa para el Sprint 3.

**HU-08 (alta de productos) es de Sosa**: no la toques; la pantalla "Agregar productos" sirve para cargar datos de prueba.

## Instalación (una vez)

1. Instala **Git**, **Node 20+**, **Docker Desktop** y tu IA.
2. Ten aceptada la invitación de colaborador del repo (ya estás agregado).
3. Abre tu IA en una carpeta vacía y escríbele:

   > Clona https://github.com/notNorthStar/Abarrotes-.git en la carpeta `abarrotes` y cámbiate a la rama `develop`. Luego: `npm install`, copia `.env.example` a `apps/api/.env`, `docker compose up -d`, `npm run db:migrate`, `npm run db:seed` y `npm test`. Docker Desktop ya está abierto. Dime si algo falla.

4. Abre la carpeta `abarrotes` como proyecto en tu IA. Siempre trabaja desde ahí.
5. Con `npm run dev`, entra a http://localhost:5173 como `cajero1` / `abarrotes123`. Si ves la pantalla de Venta, estás listo.

### Ajustes por herramienta

| IA | Qué hacer |
|---|---|
| **Codex** | Lee `AGENTS.md` sola. Trabaja en modo que permita editar archivos y correr comandos. |
| **Cursor** | Lee `.cursor/rules/` (que apunta a `AGENTS.md`). Usa el chat en modo **Agent**. |
| **Antigravity** | Lee `GEMINI.md` y `.agent/rules/` (apuntan a `AGENTS.md`). Si no los toma, empieza cada conversación con: *"Lee AGENTS.md antes de hacer nada"*. |

Los comandos con `/` (como `/hu`) son de Claude Code; **tú usas las frases de abajo.**

## Qué le escribes a tu IA

| Para… | Escribe |
|---|---|
| Empezar (primera vez) | `Soy Miguel. Lee AGENTS.md y docs/00-empieza-aqui.md y dime qué me toca.` |
| **Trabajar una HU** | `Lee y sigue docs/prompts/implementar-hu.md para HU-02.` |
| Seguir una HU a medias | `Sigue con HU-02 usando docs/prompts/implementar-hu.md; ya tengo la rama.` |
| Daily | `Lee y sigue docs/prompts/daily.md.` |
| Ver cómo va el sprint | `Lee y sigue docs/prompts/estado.md.` |
| Entender lo que hizo | `Explícame en palabras simples qué hace cada archivo que cambiaste.` |

Con `implementar-hu.md` la IA:
1. Crea tu rama `hu-XX-…` **desde `develop`**.
2. Te muestra el plan (criterios de aceptación, archivos y pruebas) y **espera tu OK**.
3. Programa, corre `npm test` y `npm run lint`.
4. Hace commits, sube la rama y abre el PR **contra `develop` con Sosa (`notNorthStar`) como reviewer**. Si tu IA no puede abrir el PR, abre el link que te da GitHub al hacer push.

## Después de abrir tu PR

- **Sosa lo revisa.** Si pide cambios, verás sus comentarios en el PR. Dile a tu IA: `Atiende los comentarios del PR #N` (o pégale los comentarios). Corrige **en la misma rama** y haz push: el PR se actualiza solo.
- Cuando Sosa lo integra, la rama se borra. Para la siguiente HU, tu IA vuelve a partir de `develop` actualizado.
- **No esperes a que se apruebe un PR para empezar la siguiente HU**: empieza la siguiente desde `develop`.

## Reglas de oro

- **Una rama por HU**, nunca push directo a `develop` ni a `main`, y **no hagas merge**: eso lo hace Sosa.
- **No toques módulos de otro.** El schema de la BD (`schema.prisma`) solo lo cambia Sosa; si necesitas un campo, pídelo.
- **No inventes alcance:** solo lo que dicen los criterios de aceptación de `docs/02-backlog.md`. Si hay duda, pregunta en el grupo.
- **Si te atoras más de 1 hora, avisa en el grupo.**
- Daily todos los días (`docs/prompts/daily.md`).

## Mapa de documentos

| Doc | Para qué |
|---|---|
| `AGENTS.md` | Reglas que sigue tu IA |
| `docs/02-backlog.md` | **Criterios de aceptación** de cada HU |
| `docs/03-plan-entrega.md` | Dueños de módulo, definición de hecho |
| `docs/04-arquitectura.md` | Estructura del código y API |
| `docs/05-modelo-datos.md` | Base de datos y fórmulas de dinero |
| `docs/06-flujo-trabajo.md` | Ramas, commits, PRs |
