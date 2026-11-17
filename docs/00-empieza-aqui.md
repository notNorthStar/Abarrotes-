# 00 · Empieza aquí (Miguel y Gonzalo)

Guía para trabajar en Abarrotes+ con tu IA (**Codex**, **Cursor** o **Antigravity**). Léela una vez; después tu IA se encarga del resto con `AGENTS.md`.

## Situación (4 nov)

- **Sprint 3: del 2 al 15 de noviembre.** Meta: que el administrador controle mermas, cubra la caja y vea el reporte semanal (5 HU, 23 pts).
- El Sprint 1 + 2 está cerrado y entregado (`v0.2.0`, 47 pts).
- Tu trabajo es **programar tus HU y mandar tus PRs**. **No revisas PRs**: Sosa revisa, aprueba e integra todo.
- Cada quien commitea **desde su propia cuenta de GitHub**: eso es lo que la maestra ve como tu aporte.
- Antes de empezar: `git pull` en `develop` y `npm install`. La interfaz cambió: sigue `docs/diseno/README.md`.

## Tu trabajo

El estado de todo está en el **[tablero del Sprint 3](https://github.com/users/notNorthStar/projects/1/views/2)**. Cada historia y cada tarea es un issue asignado a su responsable.

### Miguel (`MiguelTaracena`): 16 pts

| Orden | Qué | PR para |
|---|---|---|
| 1 | **HU-10** Producto caducado o dañado (#32; T-19 #33, T-20 #34) | Dom 8 nov |
| 2 | **HU-13** Reporte semanal por sucursal (#41; T-23 #42, T-24 #43, T-25 #44) | Jue 12 nov |

Haz HU-10 primero, porque el reporte incluye las mermas. Si el miércoles 11 la API del reporte no está lista, avisa: Sosa toma el PDF.

### Gonzalo (`gxnzHer`): 2 pts

| Qué | PR para |
|---|---|
| **HU-07** Saber visitas de proveedores (#38; T-21 #39, T-22 #40) | Mar 10 nov |

Es tu única historia, porque estarás ausente la mayor parte del sprint, y no depende de nadie. El modelo `VisitaProveedor` ya existe. **Si sabes que no llegas al martes 10, avísale a Sosa antes**, para reasignarla sin retrasar el cierre.

### Sosa: 5 pts

**HU-11**, **HU-15**, revisión e integración de PRs, y documentación del sprint (D-04, D-05).

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

En el [tablero](https://github.com/users/notNorthStar/projects/1/views/2) arrastra **tus** tarjetas (la historia y sus tareas):

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
| [Tablero](https://github.com/users/notNorthStar/projects/1/views/2) | Quién hace qué y en qué va cada tarea |
