# 00 · Empieza aquí (Gonzalo y Miguel)

Guía para trabajar en Abarrotes+ con tu IA (**Codex**, **Cursor** o **Antigravity**). Léela una vez; después tu IA se encarga del resto con `AGENTS.md`.

## Situación (26 oct)

- **El domingo 1 de noviembre entregamos Sprint 1 + Sprint 2** (9 HU, 47 pts) más el documento Scrum.
- Ya están en `develop`: la base del proyecto (T-00), **HU-01** login, **HU-06** cobro, **HU-12** cuentas de cajero y **HU-08** alta de productos (reasignada a Sosa), más el diagrama de clases y el burndown. **Faltan las tuyas.**
- Tu trabajo es **programar tus HU y mandar tus PRs**. **No revisas PRs**: Sosa revisa, aprueba e integra todo.
- Cada quien commitea **desde su propia cuenta de GitHub**: eso es lo que la maestra ve como tu aporte.

## Tu trabajo (re-planeado al 26 oct)

### Gonzalo (`gxnzHer`): carrito y caja (16 pts)

| Orden | Qué | Para |
|---|---|---|
| 1 | **HU-02** Cobrar con código de barras (T-03, T-04) | Lun 27 |
| 2 | **HU-09** Pagos a proveedores (T-10) + abrir caja (T-09) | Mar 28 |
| 3 | **HU-05** Corte y cierre de caja (T-11). Reutiliza `turnoAbiertoDe()` de `modules/ventas/ventas.service.ts` | Jue 30 |
| 4 | **D-02** Prototipos de pantallas y alertas | Vie 31 |

Eres dueño de `features/venta/carrito` y del módulo `caja`.

### Miguel (`MiguelTaracena`): granel e inventario (10 pts)

| Orden | Qué | Para |
|---|---|---|
| 1 | **HU-03** Producto a granel (T-05, T-06). Usa `useCarrito().agregarProducto(p, peso)` | Lun 27 |
| 2 | **HU-04** Consulta de inventario (T-13) | Mar 28 |
| 3 | **D-01** Diagrama de casos de uso + descripciones | Jue 30 |

Eres dueño de la lectura de `productos` y de `features/inventario/InventarioPage.tsx`. **HU-08 (alta de productos) ya la hizo Sosa**: no la toques; la pantalla "Agregar productos" es suya. Para probar puedes dar de alta productos ahí.

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
| Empezar (primera vez) | `Soy Gonzalo (o Miguel). Lee AGENTS.md y docs/00-empieza-aqui.md y dime qué me toca.` |
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
