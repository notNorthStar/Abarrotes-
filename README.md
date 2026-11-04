# Abarrotes+

Sistema de punto de venta multisucursal para tiendas de abarrotes. Proyecto en Scrum de **Luis David Sosa Fernández, Gonzalo Mendoza Herrera y Miguel Angel Marcelo Taracena**.

> 🚧 **Sprint 3 en curso** (2 al 15 nov): 5 HU, 23 pts. Ver [plan](docs/03-plan-entrega.md) y [tablero](https://github.com/users/notNorthStar/projects/1/views/2). Sprint 1 + 2 entregados en `v0.2.0`.

## Para el equipo: cómo empezar (5 min)

👉 **Lee primero [docs/00-empieza-aqui.md](docs/00-empieza-aqui.md)**: qué te toca, cómo instalar y cómo trabajar cada día. Se trabaja sobre la rama **`develop`**.

1. Instala Node 20, Docker Desktop y Git. Ten tu herramienta de IA (Claude Code, Cursor o Copilot).
2. `git clone https://github.com/notNorthStar/Abarrotes-.git` y ábrelo con tu IA.
3. Lee `AGENTS.md` (tu IA lo lee sola) y busca tu nombre en [docs/03-plan-entrega.md](docs/03-plan-entrega.md).
4. Levanta el proyecto (Docker Desktop debe estar abierto):
   ```
   npm install
   cp .env.example apps/api/.env
   docker compose up -d
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```
   Web en http://localhost:5173 (entra con `cajero1` / `abarrotes123`), API en http://localhost:3000/api.
   Antes de cada PR: `npm test` (crea y llena la BD `abarrotes_test` sola) y `npm run lint` (ESLint + tipos).
5. Trabaja tu HU: en Claude Code `/hu HU-XX`; en otra IA pega `docs/prompts/implementar-hu.md`.
6. Cada día: `/daily` (o `docs/prompts/daily.md`).

## Documentación

| Doc | Contenido |
|---|---|
| [01 Visión y equipo](docs/01-vision-y-equipo.md) | Qué es, quién es quién, roles, fechas |
| [02 Backlog](docs/02-backlog.md) | 16 HU con criterios de aceptación |
| [03 Plan de entrega](docs/03-plan-entrega.md) | Reparto, dueños de módulo, calendario, DoD |
| [04 Arquitectura](docs/04-arquitectura.md) | Stack, estructura, convenciones, API |
| [05 Modelo de datos](docs/05-modelo-datos.md) | Schema Prisma y fórmulas |
| [06 Flujo de trabajo](docs/06-flujo-trabajo.md) | Git, PRs, trabajo con IA |
| [07 Entregables Scrum](docs/07-scrum-entregables.md) | Checklist del documento para la maestra |
| [Tablero](https://github.com/users/notNorthStar/projects/1/views/2) | Estado de las tareas en GitHub Projects |
| [Sprint backlog](docs/scrum/sprint-backlog.md) | Registro de PR y fechas para el burndown (lo mantiene Sosa) |
