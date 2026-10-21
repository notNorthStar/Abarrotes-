# Abarrotes+

Sistema de punto de venta multisucursal para tiendas de abarrotes. Proyecto en Scrum de **Luis David Sosa Fernández, Gonzalo Mendoza Herrera y Miguel Angel Marcelo Taracena**.

> 🚧 Sprint 2 en curso — entrega de Sprint 1 + 2: **domingo 1 de noviembre de 2026**. Ver [plan de entrega](docs/03-plan-entrega.md).

## Para el equipo: cómo empezar (5 min)

1. Instala Node 20, Docker Desktop y Git. Ten tu herramienta de IA (Claude Code, Cursor o Copilot).
2. `git clone https://github.com/notNorthStar/Abarrotes-.git` y ábrelo con tu IA.
3. Lee `AGENTS.md` (tu IA lo lee sola) y busca tu nombre en [docs/03-plan-entrega.md](docs/03-plan-entrega.md).
4. Cuando exista el esqueleto (T-00, lo hace Sosa):
   ```
   npm install
   docker compose up -d
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```
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
| [Sprint backlog](docs/scrum/sprint-backlog.md) | Tablero de tareas |
