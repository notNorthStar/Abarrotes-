# AGENTS.md — Abarrotes+

Instrucciones para cualquier agente de IA (Claude Code, Cursor, Copilot, Codex, Gemini…) que trabaje en este repo. Léelas completas antes de tocar código.

## Proyecto

POS web multisucursal para una tienda de abarrotes. Proyecto escolar en **Scrum simulado** con 3 integrantes: **Luis David Sosa Fernández** (Scrum Master + dev), **Gonzalo Mendoza Herrera** y **Miguel Angel Marcelo Taracena**. Estamos en el Sprint 2 y debemos entregar **Sprint 1 + Sprint 2 el domingo 1 de noviembre de 2026**. El trabajo debe ser **colaborativo y verificable en GitHub**.

## Antes de trabajar, lee

| Necesitas… | Archivo |
|---|---|
| Contexto, equipo, roles de usuario, fechas | `docs/01-vision-y-equipo.md` |
| Historias de usuario y **criterios de aceptación** | `docs/02-backlog.md` |
| Quién hace qué, dueños de módulo, calendario, DoD | `docs/03-plan-entrega.md` |
| Stack, estructura de carpetas, convenciones, API | `docs/04-arquitectura.md` |
| Schema Prisma y fórmulas (venta, cambio, corte) | `docs/05-modelo-datos.md` |
| Git, PRs, reglas de colaboración | `docs/06-flujo-trabajo.md` |
| Documento Scrum que pide la maestra | `docs/07-scrum-entregables.md` |
| Estado de tareas | `docs/scrum/sprint-backlog.md` |

Prompts reutilizables (para cualquier herramienta): `docs/prompts/`.

## Stack

React 18 + Vite + TS + Tailwind (`apps/web`) · Node 20 + Express + TS + Zod + JWT (`apps/api`) · PostgreSQL 16 en Docker + Prisma · Vitest + supertest · npm workspaces.

Comandos: `docker compose up -d` · `npm run db:migrate` · `npm run db:seed` · `npm run dev` · `npm test` · `npm run lint`.

## Reglas obligatorias

1. **Pregunta quién eres trabajando.** Al iniciar una sesión, si no lo sabes, pregunta al usuario cuál de los 3 integrantes es. Trabaja solo en **sus** HU y **sus** módulos (tabla de dueños en `docs/03-plan-entrega.md`). Si la tarea requiere tocar el módulo de otro, detente y dilo.
2. **Los criterios de aceptación mandan.** Implementa exactamente lo de `docs/02-backlog.md`. No agregues alcance que el Planning Poker descartó (integración con báscula o banco, recuperación por correo, aprobación de altas, gráficas). Si falta información, **pregunta** en vez de inventar, y anótalo en el PR como duda.
3. **Planea antes de codificar.** Para cada HU: resume los CA, lista archivos a crear/modificar y pruebas a escribir, y espera el OK del usuario si el cambio es grande.
4. **Dinero con precisión.** Nunca `number` flotante para sumar dinero. Usa `Prisma.Decimal` o centavos enteros vía `apps/api/src/lib/dinero.ts`. Redondeo half-up a 2 decimales. Cantidades a granel: 3 decimales.
5. **El servidor es la fuente de verdad**: recalcula precios, totales, cambio y efectivo esperado; nunca confíes en los montos del cliente.
6. **Multisucursal y roles en el backend**: toda consulta filtra por `sucursalId` del token (salvo JEFE) y cada ruta usa `requireRol(...)`. Roles jerárquicos `JEFE ⊃ ADMIN ⊃ CAJERO`.
7. **Borrado lógico** siempre (`estado = ELIMINADO`).
8. **Transacciones** (`prisma.$transaction`) para cualquier operación que mueva dinero o inventario.
9. **Pruebas**: cada CA con lógica (cálculos, permisos, validaciones) lleva prueba en `*.test.ts` junto al service. Corre `npm test` y `npm run lint` antes de dar algo por terminado y reporta el resultado real.
10. **Schema**: no modifiques `schema.prisma` sin que el usuario confirme que le toca (por defecto es de Sosa). Si hace falta un campo, propón el cambio.
11. **Git**: rama `hu-XX-descripcion`, commits `tipo(modulo): descripción [HU-XX]` en español, PR con la plantilla. **Nunca** hagas push a `main`, force-push ni merge sin que el usuario lo pida.
12. **Actualiza `docs/scrum/sprint-backlog.md`** (solo los renglones del usuario) al empezar y al terminar una tarea.
13. **Explica lo que hiciste**: el integrante debe poder defender su código en la demo. Al terminar, da un resumen breve de qué hace cada archivo nuevo.

## Convenciones de código

- Dominio en español sin acentos (`Producto`, `turnoCaja`, `precioUnitario`); técnico en inglés (`routes`, `service`). UI y mensajes de error en español.
- API: módulo = `x.routes.ts` (HTTP) → `x.service.ts` (lógica) → `x.schemas.ts` (Zod) → `x.test.ts`.
- Errores: `throw new AppError(status, "mensaje")` → responde `{ error }`.
- Front: una carpeta por feature en `apps/web/src/features/`; componentes compartidos en `components/`; llamadas HTTP solo vía `api/client.ts`.
- TypeScript estricto; sin `any` salvo justificación.
- Sin dependencias nuevas sin mencionarlo en el PR.

## Datos de prueba

El seed crea usuarios con contraseña `abarrotes123`: `jefe`, `admin.centro`, `cajero1`, `cajero2`, `cajero.norte`, `suspendido`; productos por pieza y por kilo en sucursales Centro y Norte. Ver `docs/05-modelo-datos.md`.
