# 01 · Visión y equipo

## Qué es Abarrotes+

Sistema web de **punto de venta (POS) para una tienda de abarrotes / minisúper con varias sucursales**. Permite a los cajeros cobrar (código de barras, productos a granel, pago mixto), cuadrar su caja al final del turno, y a los administradores/jefe gestionar cuentas, inventario y sucursales.

Proyecto académico trabajado con **Scrum simulado**: sprints de 2 semanas, product backlog priorizado, planning poker, daily scrums y entregas incrementales. La maestra exige **trabajo colaborativo verificable** (commits, PRs y dailies de cada integrante).

## Equipo

| Persona | GitHub | Rol Scrum | Dominio técnico principal |
|---|---|---|---|
| Luis David Sosa Fernández | `notNorthStar` | Scrum Master + Dev | Autenticación, cuentas, cobro/pagos, alta de productos, setup del proyecto |
| Gonzalo Mendoza Herrera | `gxnzHer` | Dev | Carrito por código de barras, caja (pagos a proveedor, corte) |
| Miguel Angel Marcelo Taracena | `MiguelTaracena` | Dev | Productos a granel, consulta de inventario |

- **Product Owner:** _[confirmar con la maestra / el equipo]_. Mientras tanto las dudas de alcance se resuelven con lo acordado en el Planning Poker (ver `02-backlog.md`).
- Carlos Vicente López Rosales y otro integrante **abandonaron el proyecto**; aparecen en documentos antiguos del Drive (dailies, `Prioridad_HU.docx`). No se les asigna trabajo.

## Usuarios del sistema (roles)

| Rol | Alcance | Puede |
|---|---|---|
| **Cajero** | Su sucursal | Abrir/cerrar caja, cobrar, registrar pagos a proveedor, consultar inventario, agregar productos, registrar mermas |
| **Administrador** | Su sucursal | Todo lo del cajero (abre su propia caja) + gestionar cajeros, registrar visitas de proveedores, ver reporte semanal |
| **Jefe** | Todas las sucursales (selector) | Todo lo del administrador + gestionar administradores y sucursales |

Los roles son jerárquicos: `JEFE ⊃ ADMIN ⊃ CAJERO`.

## Fechas clave

| Hito | Fecha |
|---|---|
| Sprint 1 (oficial) | 5 – 18 oct 2026 — **no se entregó** |
| Sprint 2 (en curso) | 19 oct – 1 nov 2026 |
| **Entrega Sprint 1 + Sprint 2** | **Domingo 1 de noviembre de 2026** |
| Sprint 3 | 2 – 15 nov 2026 |
| Sprint 4 | 16 – 29 nov 2026 |

## Fuentes originales

Drive del equipo: https://drive.google.com/drive/folders/1UoHY3jAT2uF__-pO8akAa-J5X0kaFcfc
- `Product_Backlog_POS` — backlog priorizado y plan de sprints
- `Prioridad_HU.docx` — redacción de historias de usuario
- `PlanningPoker` — estimaciones y **aclaraciones de alcance** (son la fuente de los criterios de aceptación)
- `Formato ejemplo para documentar el uso de Scrum` — plantilla del documento que pide la maestra
- `DailyScrums/` — minutas de daily

Repositorio: https://github.com/notNorthStar/Abarrotes-
