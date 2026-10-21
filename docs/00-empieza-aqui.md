# 00 · Empieza aquí (equipo)

Guía para Gonzalo y Miguel (y para Sosa en otra máquina). Léela una vez completa; después tu IA se encarga del resto con `AGENTS.md`.

## Situación

- El Sprint 1 no se entregó. **El domingo 1 de noviembre entregamos Sprint 1 + Sprint 2** (9 HU, 47 pts) más el documento Scrum.
- Trabajamos **full IA**, pero la maestra evalúa colaboración: **cada quien commitea desde su cuenta, abre sus PRs y revisa los de otro**. Si la IA escribe el código, tú lo revisas y debes poder explicarlo en la demo.
- Stack: React + Node/Express + PostgreSQL (Prisma). Todo corre local con Docker.

## Tu trabajo

> El reparto lo propuso Sosa con IA siguiendo lo que ya estaba asignado en el Drive. **Si quieres cambiar algo, dilo en el grupo hoy** y se ajusta `03-plan-entrega.md`.

### Gonzalo — Carrito y caja (16 pts)

| Orden | Qué | Cuándo |
|---|---|---|
| 1 | **D-02** Prototipos de pantallas (venta, cobro, caja, inventario, cuentas) y alertas | Mié 21 – Jue 22 (mientras se mergea T-00) |
| 2 | **HU-02** Cobrar con código de barras (T-03, T-04) | Vie 23 – Sáb 24 |
| 3 | **HU-09** Pagos a proveedores (T-10) + abrir caja (T-09) | Dom 25 – Lun 26 |
| 4 | **HU-05** Corte y cierre de caja (T-11) | Mar 27 – Mié 28 |

Eres dueño de `features/venta/carrito` y del módulo `caja`. **Revisas los PRs de Sosa.**

### Miguel — Productos e inventario (15 pts)

| Orden | Qué | Cuándo |
|---|---|---|
| 1 | **D-01** Diagrama de casos de uso + descripciones | Mié 21 – Jue 22 |
| 2 | **HU-03** Producto a granel (T-05, T-06) — usa `useCarrito().agregarProducto(p, peso)` | Vie 23 – Sáb 24 |
| 3 | **HU-04** Consulta de inventario (T-13) | Dom 25 – Lun 26 |
| 4 | **HU-08** Alta de productos (T-14) | Mar 27 – Mié 28 |

Eres dueño del módulo `productos` y de `features/inventario`. **Revisas los PRs de Gonzalo.**

### Sosa — Base, login, cobro y cuentas (16 pts)

T-00 (en PR) → HU-01 → HU-06 → HU-12, más D-03 (clases, burndown, documento Scrum). **Revisa los PRs de Miguel.**

## Instalación (una vez)

1. Instala **Git**, **Node 20+**, **Docker Desktop** y tu IA (Claude Code recomendado; Cursor/Copilot también funcionan).
2. Acepta la invitación de colaborador del repo en GitHub (te llega por correo).
3. Clona y entra a `develop`:
   ```bash
   git clone https://github.com/notNorthStar/Abarrotes-.git abarrotes
   cd abarrotes
   git checkout develop
   ```
4. **Cuando T-00 ya esté en `develop`** (Sosa avisa en el grupo), con Docker Desktop abierto:
   ```bash
   npm install
   cp .env.example apps/api/.env
   docker compose up -d
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```
   Abre http://localhost:5173 y entra con `cajero1` / `abarrotes123`. Si ves la pantalla de Venta, estás listo.
5. Verifica que todo pase: `npm test` y `npm run lint`.

## Cómo trabajar cada día

1. **Daily** (asíncrono, antes de las 10 pm): en Claude Code `/daily`; en otra IA pega `docs/prompts/daily.md`. Sube tu parte al repo y al Drive (`DailyScrums/`).
2. **Trabajar tu HU**: en Claude Code `/hu HU-XX`; en otra IA pega `docs/prompts/implementar-hu.md` cambiando `{HU}`. La IA:
   - crea tu rama `hu-XX-…` **desde `develop`**,
   - te muestra el plan (criterios de aceptación, archivos, pruebas) y **espera tu OK**,
   - implementa con pruebas, corre `npm test` y `npm run lint`,
   - prepara el PR **contra `develop`**.
3. **Antes de empezar cada día**: trae lo de los demás → `git fetch origin && git rebase origin/develop` (la IA lo hace en el paso 2).
4. **Abre tu PR** en cuanto la HU cumpla sus criterios; no esperes a terminar todo. Pide review a quien te toca.
5. **Revisa el PR que te toca el mismo día**: `/revisar-pr <número>` o `docs/prompts/revisar-pr.md`. Deja comentarios/aprobación **en GitHub** (es evidencia).
6. Marca tus tareas en `docs/scrum/sprint-backlog.md` (🟨 al empezar, 🟦 con PR, ✅ al mergear).

## Reglas de oro

- **Ramas por HU, no por persona.** Nunca push directo a `develop` ni a `main`.
- **No toques módulos de otro** sin avisar. El schema de la BD (`schema.prisma`) solo lo cambia Sosa; si necesitas un campo, pídelo.
- **No inventes alcance.** Lo que no está en los criterios de aceptación (`docs/02-backlog.md`) no se hace; si hay duda, pregunta en el grupo.
- **Si te atoras más de 1 hora, dilo en el grupo.** Es un impedimento y se anota en el daily.

## Mapa de documentos

| Doc | Para qué |
|---|---|
| `AGENTS.md` | Reglas que sigue tu IA |
| `docs/02-backlog.md` | **Criterios de aceptación** de cada HU |
| `docs/03-plan-entrega.md` | Calendario, dueños de módulo, definición de hecho |
| `docs/04-arquitectura.md` | Estructura del código y API |
| `docs/05-modelo-datos.md` | Base de datos y fórmulas de dinero |
| `docs/06-flujo-trabajo.md` | Ramas, commits, PRs |
| `docs/07-scrum-entregables.md` | Qué lleva el documento Scrum |
