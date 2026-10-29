# 07 · Entregables Scrum (lo que pide la maestra)

La plantilla del Drive ("Formato ejemplo para documentar el uso de Scrum en un proyecto") define el documento final. Este checklist mapea cada sección a quién la hace y de dónde sale. Los diagramas se escriben en **Mermaid** dentro de `docs/diagramas/` (la IA los genera desde el código/backlog) y se exportan como imagen al documento de Drive.

Borrador del documento: `docs/scrum/documento-scrum.md`.

| Sección de la plantilla | Contenido | Responsable | Fuente en el repo | Estado |
|---|---|---|---|---|
| 1. Introducción (propósito, alcance) | Sistema Abarrotes+ | Sosa | `docs/01-vision-y-equipo.md` | ✅ |
| 2. Fundamentación y valores | Por qué Scrum | Sosa | — | ✅ |
| 3. Personas y roles | Tabla del equipo (solo 3 integrantes) | Sosa | `docs/01-vision-y-equipo.md` | ✅ |
| 4.1 Pila de producto | Backlog priorizado | Sosa | `docs/02-backlog.md` | ✅ |
| 4.2 Pila del sprint | Tareas de S1+S2 con estado | Todos | `docs/scrum/sprint-backlog.md` | ✅ |
| 4.3 Diagrama de clases | Desde `schema.prisma` | Sosa | `docs/diagramas/clases.md` | ✅ |
| 4.4 Diagrama de casos de uso | Actores: cajero, admin, jefe | Miguel | `docs/diagramas/casos-de-uso.md` → `img/casos-de-uso.png` | ✅ |
| 4.5 Descripciones de casos de uso con prototipos | 1 por HU de S1+S2 | Miguel | `docs/diagramas/casos-de-uso.md` | ✅ |
| 4.6 Prototipos principales | Login, venta, cobro, caja, inventario, usuarios | Miguel | `docs/prototipos/` | ✅ |
| 4.7 Prototipos de alertas | Producto no encontrado, pago insuficiente, diferencia en corte, usuario suspendido… | Miguel | `docs/prototipos/` | ✅ |
| 4.8 Sprint | Duración 2 semanas, fechas | Sosa | `docs/01-vision-y-equipo.md` | ✅ |
| 4.9 Incremento | Qué funciona al 1 nov (+ capturas) | Todos | release `v0.2.0` | ✅ |
| 4.10 Burn Up | Puntos completados vs. plan (80 pts) | Sosa | `docs/scrum/burndown.md` | ✅ |
| 4.11 Burn Down | Puntos restantes por día del sprint | Sosa | `docs/scrum/burndown.md` | ✅ |
| 4.12 Reunión de inicio de sprint | Minuta de planeación (re-planeación S1+S2) | Sosa | `docs/scrum/reuniones.md` | ✅ |
| 4.13 Reunión técnica diaria | Dailies | Todos | `docs/scrum/dailies/` + Drive | ✅ |
| 4.14 Cierre de sprint | Review + retrospectiva | Todos | `docs/scrum/reuniones.md` | ✅ (retro por confirmar) |
| 5. Conclusiones | Borrador | Todos | `docs/scrum/documento-scrum.md` | 🟨 confirmar con el equipo |

## Notas

- Los dailies del Drive tienen errores: `DS-20/10/2026` dice "12 oct" en Fecha y lista a Carlos como asistente. Corregir y registrar en adelante solo a los 3 integrantes.
- Es honesto (y bien visto en Scrum) documentar en la retrospectiva que el Sprint 1 no se entregó, por qué (2 integrantes abandonaron) y cómo se re-planeó: velocidad real S1 = 0, S2 = 47 comprometidos.
- Prototipos: pueden ser capturas de pantallas reales si se aclara que se iteraron, pero lo ideal es hacer wireframes primero (Excalidraw/Figma) y luego la pantalla.
