# 00 · Empieza aquí (Miguel y Gonzalo)

Guía para trabajar en Abarrotes+ con tu IA (**Codex**, **Cursor** o **Antigravity**). Léela una vez; después tu IA se encarga del resto con `AGENTS.md`.

## Situación (24 nov)

- **Sprint 4: del 16 al 29 de noviembre.** Meta: que el jefe administre todas las sucursales (2 HU, 10 pts). Es el último sprint: se entrega `v1.0.0`.
- Entregados: Sprint 1 + 2 (`v0.2.0`, 47 pts) y Sprint 3 (`v0.3.0`, 23 pts).
- **Acuerdos de la retro del Sprint 3:** sube tu avance a tu rama cada día (quedan pocos) aunque esté a medias, registra tu daily y mueve tus tarjetas del tablero.
- Tu trabajo es **programar tus HU y mandar tus PRs**. **No revisas PRs**: Sosa revisa, aprueba e integra todo.
- Cada quien commitea **desde su propia cuenta de GitHub**: eso es lo que la maestra ve como tu aporte.
- Antes de empezar: `git pull` en `develop` y `npm install`. La interfaz cambió: sigue `docs/diseno/README.md`.

## Tu trabajo

El estado de todo está en el **[tablero](https://github.com/users/notNorthStar/projects/1/views/5)** (vista "Sprint 4"). Cada historia y cada tarea es un issue asignado a su responsable.

### Miguel (`MiguelTaracena`): 8 pts

| Orden | Qué | PR para |
|---|---|---|
| 1 | **HU-16** API de sucursales (#48; T-28 #62) y bloqueo de acceso de sus usuarios (T-29 #63) | Jue 26 nov |
| 2 | **HU-16** Pantalla de sucursales del jefe (T-30 #64) | Vie 27 nov |

Los criterios y dos dudas para el PO están en `docs/02-backlog.md`; anota en el PR qué decidiste. El inicio de sesión ya rechaza sucursales no activas (HU-01). El bloqueo toca `middleware/auth.ts`, que es compartido: si lo cambias, avisa en el PR. Si el jueves 26 no está la API, avisa: Sosa toma la pantalla.

### Gonzalo (`gxnzHer`): sin puntos de historia

| Orden | Qué | PR para |
|---|---|---|
| 1 | **T-31** (#65) Correcciones de tu PR de HU-07: quitar las rutas duplicadas `/`, validar la fecha solo como `AAAA-MM-DD` y quitar las mayúsculas de la fecha | Jue 26 nov |
| 2 | **D-06** (#66) Casos de uso y capturas de HU-14 y HU-16, con el formato de `docs/diagramas/casos-de-uso-sprint-3.md` | Sáb 28 nov |

Los detalles de T-31 están en la revisión de tu PR #56. **Abre tus PR contra `develop`**, y si haces rebase, sube con `git push --force-with-lease`. D-06 depende de que HU-14 y HU-16 estén integradas. Si el sábado 28 a mediodía no has subido avance, Sosa lo toma.

### Sosa: 2 pts

**HU-14** (#47, selector de sucursal del jefe), revisión e integración de PRs, y cierre final (D-07 #67): review, retro, documento Scrum y `v1.0.0`.

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

## Mueve tus tarjetas

En el [tablero](https://github.com/users/notNorthStar/projects/1/views/5) arrastra **tus** tarjetas (la historia y sus tareas):

| Cuándo | A qué columna |
|---|---|
| Empiezas a trabajar | **En progreso** |
| Abres el PR | **En revisión** |

Tu IA te lo recuerda, pero lo haces tú: puede no tener permiso sobre el tablero. **Hecho** lo marca Sosa cuando integra tu PR. En el PR escribe `Refs #N` con el número de la historia.

## Después de abrir tu PR

- **Sosa lo revisa.** Si pide cambios, tu tarjeta sigue en *En revisión* y verás sus comentarios en el PR. Dile a tu IA: `Atiende los comentarios del PR #N` (o pégale los comentarios). Corrige **en la misma rama** y haz push: el PR se actualiza solo.
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
| `docs/06-flujo-trabajo.md` | Ramas, commits, PRs, tablero |
| [Tablero](https://github.com/users/notNorthStar/projects/1/views/5) | Quién hace qué y en qué va cada tarea |
