# Documentación del uso de Scrum — Abarrotes+

> Sigue la estructura de la plantilla "Formato ejemplo para documentar el uso de Scrum en un proyecto" (ver `docs/07-scrum-entregables.md`). Estado al cierre del Sprint 2 (29 oct 2026). Pendiente solo la retroalimentación de la demo del 1 nov y la confirmación de la retrospectiva por el equipo.

| Campo | Detalle |
|---|---|
| Proyecto | Abarrotes+ — Sistema de punto de venta para abarrotes / minisúper |
| Equipo | Luis David Sosa Fernández · Gonzalo Mendoza Herrera · Miguel Angel Marcelo Taracena |
| Repositorio | https://github.com/notNorthStar/Abarrotes- |
| Fecha del borrador | 21 de octubre de 2026 |

---

## 1. Introducción

### 1.1 Propósito

Este documento describe la aplicación del marco de trabajo Scrum en el desarrollo de **Abarrotes+**, un sistema web de punto de venta (POS) para una tienda de abarrotes o minisúper con varias sucursales. Registra los roles, artefactos, eventos y resultados de cada sprint, como evidencia del trabajo colaborativo del equipo.

### 1.2 Alcance

Abarrotes+ permite a los **cajeros** iniciar sesión, cobrar ventas (lectura de código de barras, productos a granel y pago mixto con efectivo, tarjeta o transferencia), registrar pagos a proveedores y realizar el corte y cierre de su caja; a los **administradores**, gestionar cajeros y productos de su sucursal; y al **jefe**, supervisar todas las sucursales.

El producto completo consta de 16 historias de usuario (80 puntos) distribuidas en cuatro sprints. Este documento cubre la entrega del **1 de noviembre de 2026**, que integra el Sprint 1 y el Sprint 2 (9 historias, 47 puntos). Quedan fuera de alcance la integración con básculas, terminales bancarias y la recuperación de contraseña por correo.

---

## 2. Fundamentación y valores

Se eligió Scrum porque el proyecto tiene requisitos que se aclaran conforme avanza (como ocurrió en el Planning Poker), un plazo fijo y un equipo pequeño. Scrum permite entregar incrementos funcionales cada dos semanas, priorizar por valor para el usuario y adaptar el plan ante cambios. Esto último resultó decisivo cuando dos integrantes abandonaron el proyecto durante el Sprint 1 y fue necesario re-planear.

El equipo adopta los cinco valores de Scrum:

- **Compromiso:** cada integrante asume historias completas de su dominio y las lleva hasta la Definición de Hecho.
- **Enfoque:** se trabaja solo en lo comprometido en el sprint backlog; lo que no está en los criterios de aceptación no se implementa.
- **Apertura:** el avance y los impedimentos se registran en los dailies y en el sprint backlog del repositorio, visibles para todos.
- **Respeto:** cada integrante es dueño de sus módulos; los cambios en el trabajo de otro se acuerdan antes.
- **Coraje:** se reconoce con transparencia que el Sprint 1 no se entregó y se re-planea en lugar de ocultarlo.

---

## 3. Personas y roles del proyecto

| Persona | Rol Scrum | Responsabilidades | Dominio técnico |
|---|---|---|---|
| Luis David Sosa Fernández | Scrum Master + Desarrollador | Facilitar eventos, remover impedimentos, mantener artefactos (burndown, sprint backlog, documento Scrum); desarrollo | Configuración del proyecto, autenticación, cobro y pagos, cuentas de cajero, alta de productos, caja (pagos a proveedor y corte); revisa e integra todos los PR |
| Gonzalo Mendoza Herrera | Desarrollador | Sin tareas en el Sprint 2 (baja temporal desde el 28 oct); sus historias se reasignaron | — |
| Miguel Angel Marcelo Taracena | Desarrollador | Desarrollo de sus historias, casos de uso y prototipos | Carrito (escaneo y granel), consulta de inventario |
| Por confirmar | Product Owner | Priorizar el backlog y aceptar las historias | — |

Mientras no se confirme el Product Owner, las dudas de alcance se resuelven con lo acordado en el Planning Poker. Carlos Vicente López Rosales y otro integrante formaron parte del equipo inicial y abandonaron el proyecto; no tienen trabajo asignado.

---

## 4. Desarrollo del proyecto con Scrum

### 4.1 Pila de producto (Product Backlog)

16 historias, 80 puntos, velocidad planeada ≈ 24 pts por sprint. Los criterios de aceptación de cada historia están en `docs/02-backlog.md`.

| Prioridad | HU | Nombre | Valor | Pts | Sprint | Responsable |
|---|---|---|---|---|---|---|
| 1 | HU-01 | Inicio de sesión | Alto | 3 | 1 | Sosa |
| 2 | HU-06 | Cobros con tarjeta, efectivo y transferencia | Alto | 8 | 1 | Sosa |
| 3 | HU-02 | Cobrar productos con código de barras | Alto | 5 | 1 | Miguel (reasignada 28 oct) |
| 4 | HU-03 | Producto a granel (peso/cantidad) | Alto | 8 | 1 | Miguel |
| 5 | HU-09 | Registrar pagos a proveedores | Alto | 3 | 2 | Sosa (reasignada 28 oct) |
| 6 | HU-05 | Corte y cierre de caja | Alto | 8 | 2 | Sosa (reasignada 28 oct) |
| 7 | HU-12 | Gestión de cuentas de cajero | Medio | 5 | 2 | Sosa |
| 8 | HU-04 | Revisar el inventario | Medio | 2 | 2 | Miguel |
| 9 | HU-08 | Agregar productos | Medio | 5 | 2 | Sosa (reasignada 26 oct) |
| 10 | HU-10 | Registro de producto caducado/dañado | Medio | 3 | 3 | — |
| 11 | HU-11 | Operaciones de cajero (admin) | Medio | 2 | 3 | — |
| 12 | HU-15 | Gestión de cuentas de administrador | Medio | 3 | 3 | — |
| 13 | HU-07 | Saber visitas de proveedores | Bajo | 2 | 3 | — |
| 14 | HU-13 | Reporte semanal por sucursal | Medio | 13 | 3 | — |
| 15 | HU-14 | Operaciones de administrador (jefe) | Bajo | 2 | 4 | — |
| 16 | HU-16 | Gestión de sucursales | Bajo | 8 | 4 | — |

### 4.2 Pila del sprint (Sprint Backlog)

Sprint 2 re-planeado (incluye el Sprint 1). Estado al 21 de octubre de 2026. Fuente viva: `docs/scrum/sprint-backlog.md`.

Estados: ⬜ Por hacer · 🟨 En progreso · 🟦 En revisión (PR abierto) · ✅ Hecho (mergeado)

| ID | Tarea | HU | Pts | Responsable | Estado |
|---|---|---|---|---|---|
| T-00 | Monorepo, Docker Postgres, schema, seed, layout, cliente API | — | — | Sosa | ✅ Integrado en `develop` |
| T-01 | Login API + JWT + middleware `requireRol` | HU-01 | 3 | Sosa | ✅ |
| T-02 | Pantalla login, contexto de sesión, guard por rol, logout | HU-01 | | Sosa | ✅ |
| T-03 | Store del carrito + input de escaneo | HU-02 | 5 | Miguel (reasignada 28 oct) | ✅ |
| T-04 | Producto no encontrado + búsqueda manual | HU-02 | | Miguel (reasignada 28 oct) | ✅ |
| T-05 | Captura de peso, conversión g→kg, validaciones | HU-03 | 8 | Miguel | ✅ |
| T-06 | Cálculo de precio a granel + integración al carrito + pruebas | HU-03 | | Miguel | ✅ |
| T-07 | `POST /ventas`: recálculo, pagos mixtos, cambio, descuento de stock | HU-06 | 8 | Sosa | ✅ |
| T-08 | Pantalla de cobro (pago mixto, referencia, cambio) | HU-06 | | Sosa | ✅ |
| T-09 | Abrir caja (turno) y bloqueo de venta sin turno | HU-05 | 8 | Sosa (reasignada 28 oct) | ✅ |
| T-10 | Registrar pago a proveedor | HU-09 | 3 | Sosa (reasignada 28 oct) | ✅ |
| T-11 | Corte: totales por método, efectivo esperado, cierre con diferencia | HU-05 | | Sosa (reasignada 28 oct) | ✅ |
| T-12 | CRUD cajeros (crear, suspender, eliminar lógico, reset password) | HU-12 | 5 | Sosa | ✅ |
| T-13 | Consulta de inventario con búsqueda | HU-04 | 2 | Miguel | ✅ |
| T-14 | Alta de producto y entrada de existencias + movimientos | HU-08 | 5 | Sosa (reasignada) | ✅ |
| D-01 | Diagrama de casos de uso + descripciones | Doc | — | Miguel | ✅ |
| D-02 | Prototipos principales y de alertas | Doc | — | Miguel (reasignada 28 oct) | ✅ |
| D-03 | Diagrama de clases, burndown/burnup, documento Scrum | Doc | — | Sosa | ✅ |

**Total comprometido:** 47 pts · **Completado:** 47 pts al 28 de octubre (9 de 9 HU). Sprint cerrado.

> Nota: estados al cierre (28 oct); la fuente viva es `docs/scrum/sprint-backlog.md`. Sincronizar antes de la versión final.

### 4.3 Diagrama de clases

El diagrama de clases y el diagrama entidad-relación se generan desde el modelo de datos (`apps/api/prisma/schema.prisma`) y se encuentran en `docs/diagramas/clases.md`, junto con las decisiones de diseño: multisucursal desde el inicio, borrado lógico mediante el atributo `estado`, copia de `precioUnitario` en cada renglón de venta y registro de `MovimientoInventario` para trazabilidad. 

![Diagrama de clases](../diagramas/img/clases.png)

![Diagrama entidad-relación](../diagramas/img/er.png)

### 4.4 Diagrama de casos de uso

Actores cajero, administrador y jefe, con herencia de permisos (el jefe hereda del administrador y este del cajero), y los nueve casos de uso de los Sprints 1 y 2. Fuente: `docs/diagramas/casos-de-uso.md` (Miguel Angel Marcelo Taracena).

![Diagrama de casos de uso](../diagramas/img/casos-de-uso.png)

### 4.5 Descripciones de casos de uso con prototipos

Las nueve descripciones (objetivo, precondiciones, flujo principal, alternos, postcondiciones y trazabilidad a los criterios de aceptación) están en `docs/diagramas/casos-de-uso.md`. Las capturas de las pantallas de granel e inventario están en `docs/evidencias/miguel/`.

Cada caso enlaza su pantalla (P-01–P-07) en la tabla de evidencia visual de `docs/diagramas/casos-de-uso.md`; las capturas están en la sección 4.6.

### 4.6 Prototipos principales

Capturas de las pantallas reales usadas como prototipos iterados (D-02, Miguel; actualizadas al sistema visual "Mostrador" el 29 oct). Catálogo: `docs/prototipos/README.md`.

![Inicio](../prototipos/img/inicio.png)

![Venta](../prototipos/img/venta.png)

![Cobro](../prototipos/img/cobro.png)

![Caja](../prototipos/img/caja.png)

![Inventario](../prototipos/img/inventario.png)

![Agregar productos](../prototipos/img/productos.png)

![Cuentas de cajero](../prototipos/img/cajeros.png)

![Inicio de sesión](../prototipos/img/login.png)

### 4.7 Prototipos de alertas

![Producto no encontrado](../prototipos/img/alerta-producto-no-encontrado.png)

![Pago insuficiente](../prototipos/img/alerta-pago-insuficiente.png)

![Diferencia en el corte](../prototipos/img/alerta-diferencia-corte.png)

![Cuenta suspendida](../prototipos/img/alerta-usuario-suspendido.png)

### 4.8 Sprint

Los sprints duran **2 semanas**. El calendario del proyecto es:

| Sprint | Fechas | Meta | Pts planeados | Resultado |
|---|---|---|---|---|
| 1 | 5 – 18 oct 2026 | Que un cajero pueda iniciar sesión y cobrar una venta completa | 24 | No entregado (velocidad real 0) por la salida de 2 integrantes |
| 2 | 19 oct – 1 nov 2026 | Re-planeado: entregar Sprint 1 + Sprint 2 (9 HU) | 47 | En curso |
| 3 | 2 – 15 nov 2026 | — | 23 | Por planear |
| 4 | 16 – 29 nov 2026 | — | 10 | Por planear |

### 4.9 Incremento

Versión `v0.2.0`. Incremento funcional y demostrable: un cajero inicia sesión, abre su caja, registra ventas por código de barras y a granel, cobra con pago mixto y cambio, registra pagos a proveedor y cierra su caja con corte y diferencia; el administrador gestiona cajeros, alta de productos e inventario. Interfaz con el sistema visual "Mostrador". 9 de 9 HU (47 pts), 130 pruebas automatizadas. Detalle en la Sprint Review (`docs/scrum/reuniones.md`).

### 4.10 Burn Up

La gráfica de burnup del producto (puntos acumulados completados contra el plan de 80 puntos: 24 / 47 / 70 / 80) se mantiene en `docs/scrum/burndown.md`, sección "Gráficas". Al cierre del Sprint 1 el real acumulado es 0.

![Burnup del producto](../diagramas/img/burnup.png)

### 4.11 Burn Down

La gráfica de burndown del Sprint 2 (puntos restantes por día contra la línea ideal de 47 a 0) se mantiene en `docs/scrum/burndown.md`, sección "Gráficas", y se actualiza diariamente. El burndown se mantuvo plano hasta el día 7 (47 pts) y bajó a 0 el día 10 (28 oct), cuatro días antes del fin del sprint: 26 pts el 26 oct (HU-01, HU-06, HU-12, HU-08) y los 21 restantes el 28 oct (HU-03, HU-04, HU-02, HU-09, HU-05).

![Burndown Sprint 2](../diagramas/img/burndown.png)

### 4.12 Reunión de inicio de sprint

El **21 de octubre de 2026** se realizó la reunión de re-planeación e inicio del Sprint 2 (minuta completa en `docs/scrum/reuniones.md`). Resumen:

- **Contexto:** el Sprint 1 no se entregó (velocidad real 0) debido a que dos integrantes abandonaron el proyecto.
- **Compromiso:** entregar Sprint 1 + Sprint 2 el 1 de noviembre: 9 historias, 47 puntos.
- **Stack:** React + Node.js/Express + PostgreSQL con Prisma.
- **Reparto por dominio** (propuesto por el Scrum Master, pendiente de confirmación de Gonzalo y Miguel): Sosa 16 pts (T-00, HU-01, HU-06, HU-12, D-03); Gonzalo 16 pts (HU-02, HU-09, HU-05, D-02); Miguel 15 pts (HU-03, HU-04, HU-08, D-01).
- **Flujo de trabajo:** ramas `main` / `develop` / `hu-XX`, con Pull Request revisado por otro integrante; trabajo asistido por IA mediante `AGENTS.md` y prompts del repositorio.
- **Riesgos:** dependencia HU-06 → HU-05, poco tiempo y aprendizaje del stack.
- **Pendientes:** confirmar Product Owner, confirmar el reparto y activar la protección de ramas.

### 4.13 Reunión técnica diaria

Formato de daily asíncrono en `docs/scrum/dailies/_plantilla.md` (prompt `docs/prompts/daily.md`). Registrados en el repositorio: 21 oct 2026; en Drive: 12 y 20 oct. El seguimiento diario se apoyó además en la actividad de GitHub (ramas, PRs y revisiones). Se reconoce como área de mejora en la retrospectiva.

### 4.14 Cierre de sprint

- **Sprint Review:** 9 de 9 HU entregadas (47 pts), cada una con PR revisado e integrado; demo formal el 1 nov.
- **Retrospectiva:** bien — recuperación total del Sprint 1, trabajo por dominio sin conflictos, harness de IA y revisión centralizada; mejorar — detección tardía de la salida de integrantes, dailies irregulares y concentración de carga; acciones para el Sprint 3.
- Minuta completa: `docs/scrum/reuniones.md`.

---

## 5. Conclusiones

El equipo entregó en el Sprint 2 la totalidad del compromiso de los Sprints 1 y 2 (9 historias, 47 puntos) pese a iniciar con el Sprint 1 sin entregar y perder a dos integrantes. Scrum permitió hacer visibles los problemas (burndown plano hasta el día 7) y responder con re-planeaciones concretas: reparto por dominio, revisión centralizada y reasignación de historias según la disponibilidad real.

El uso de inteligencia artificial con reglas compartidas (`AGENTS.md`) aceleró el desarrollo sin perder control: cada cambio pasó por criterios de aceptación, pruebas automatizadas y revisión antes de integrarse.

Para el Sprint 3 el equipo se compromete a sostener el daily, confirmar al Product Owner y planear con base en la velocidad real observada.

> Pendiente de confirmar por el equipo antes de la entrega.
