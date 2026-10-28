# 03 · Plan de entrega: Sprint 1 + Sprint 2 → domingo 1 de noviembre

El Sprint 1 no se entregó. Para el cierre del Sprint 2 hay que entregar **las 9 HU de ambos sprints (47 pts)** más los **artefactos Scrum** que pide la maestra (ver `07-scrum-entregables.md`). Trabajando con IA es alcanzable si **nadie se bloquea con nadie**: por eso el reparto es por dominio y el modelo de datos se fija el primer día.

## Reparto

> **26 oct:** HU-08 se reasigna de Miguel a Sosa para tener alta de productos cuanto antes.
> **28 oct:** Gonzalo no puede continuar este sprint. Sus tareas se reparten: HU-02 y D-02 a Miguel; HU-09 y HU-05 a Sosa.

| Persona | Sprint 1 | Sprint 2 | Pts | Además (documentación) |
|---|---|---|---|---|
| **Sosa** | T-00 Setup, HU-01 (3), HU-06 (8) | HU-12 (5), HU-08 (5), HU-09 (3), HU-05 (8) | 32 | Documento Scrum, diagrama de clases/ER, burndown/burnup |
| **Gonzalo** | — | — | 0 | Sin tareas este sprint (baja temporal el 28 oct) |
| **Miguel** | HU-03 (8), HU-02 (5) | HU-04 (2) | 15 | Casos de uso; prototipos de pantallas y de alertas |

**Dueño de cada archivo/módulo** (para evitar conflictos de merge):

| Módulo | Dueño | Los demás… |
|---|---|---|
| `apps/api/prisma/schema.prisma`, seed, setup, auth, `usuarios` | Sosa | piden cambios al schema por PR pequeño o en el chat del equipo |
| `apps/api/src/modules/ventas` (confirmar venta + pagos) | Sosa | — |
| `apps/web/src/features/venta/carrito` (store del carrito, escaneo) + `VentaPage.tsx` | Miguel | Miguel agrega la captura de granel usando la API del store |
| `apps/api/src/modules/caja` + `apps/web/src/features/caja` (turnos, pagos a proveedor, corte) | Sosa | — |
| `apps/api/src/modules/productos` (lectura) + `apps/web/src/features/inventario/InventarioPage.tsx` | Miguel | El escaneo (HU-02) usa `GET /productos/codigo/:codigo` |
| Alta y entradas de productos: `crear`/`registrarEntrada` en `productos.service.ts` + `features/inventario/AgregarProductoPage.tsx` | Sosa (HU-08, hecha) | Miguel no necesita tocarlos |

## Dependencias

```mermaid
graph LR
  T00[T-00 Setup + schema + seed] --> HU01[HU-01 Login]
  HU01 --> HU02[HU-02 Escaneo]
  HU01 --> HU04[HU-04 Inventario]
  HU02 --> HU03[HU-03 Granel]
  HU02 --> HU06[HU-06 Cobro]
  HU03 --> HU06
  HU06 --> HU05[HU-05 Corte]
  HU09[HU-09 Pago proveedor] --> HU05
  HU01 --> HU12[HU-12 Cajeros]
  HU04 --> HU08[HU-08 Alta productos]
```

Para no esperar: T-00 deja **contratos** (rutas, tipos y store del carrito con funciones vacías) para que todos arranquen en paralelo con datos del seed.

## Calendario

> **Re-planeado el 26 oct:** Sosa terminó sus HU; las fechas vigentes de Gonzalo y Miguel están en `docs/00-empieza-aqui.md`. La tabla de abajo es el plan original.

| Día | Sosa | Gonzalo | Miguel |
|---|---|---|---|
| **Mié 21 – Jue 22 oct** | **T-00**: monorepo, Docker Postgres, schema completo, seed, login base, layout | Prototipos de pantallas (venta, cobro, caja, alertas) | Diagrama de casos de uso + descripciones |
| **Vie 23 – Sáb 24** | HU-01 completa (roles, guard, logout) | HU-02 escaneo + carrito | HU-03 granel (sobre el store del carrito) |
| **Dom 25 – Lun 26** | HU-06 cobro mixto + cambio + descuento de stock | HU-09 pagos a proveedor + abrir caja | HU-04 consulta de inventario |
| **Mar 27 – Mié 28** | HU-12 cuentas de cajero | HU-05 corte y cierre | HU-08 alta de productos + movimientos |
| **Jue 29 – Vie 30** | Integración, diagrama de clases, burndown | Pruebas end-to-end del turno completo | Pruebas de inventario, capturas para el doc |
| **Sáb 31 oct** | Documento Scrum completo, review de demo | Ensayo de demo | Ensayo de demo |
| **Dom 1 nov** | **ENTREGA** — tag `v0.2.0`, documento en Drive | | |

Daily scrum **todos los días** (asíncrono vale: cada quien corre `/daily` y sube su parte) → `docs/scrum/dailies/`.

## Definición de "Hecho" (DoD)

Una HU está hecha cuando:
1. Cumple **todos** sus criterios de aceptación (`02-backlog.md`).
2. Tiene pruebas de API (Vitest + supertest) para los CA con lógica (cálculos, permisos, validaciones).
3. `npm run lint` y `npm test` pasan.
4. Se mergeó a `develop` por **PR aprobado e integrado por Sosa** (los PRs de Sosa se integran directo).
5. Se marcó en `docs/scrum/sprint-backlog.md` y se puede demostrar con datos del seed.

## Plan de contingencia

Si el jueves 29 algo no está, se recorta en este orden (de lo menos a lo más importante): HU-08 sumar existencias → HU-12 restablecer contraseña → búsqueda manual de HU-02. **Nunca** se recorta el flujo login → venta → cobro → corte: es la demo.
