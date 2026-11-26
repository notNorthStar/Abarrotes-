# Documentación del uso de Scrum — Abarrotes+

> Sigue la estructura de la plantilla "Formato ejemplo para documentar el uso de Scrum en un proyecto" (ver `docs/07-scrum-entregables.md`). Versión final: cierre del Sprint 4 y entrega de `v1.0.0` (26 nov 2026).

| Campo | Detalle |
|---|---|
| Proyecto | Abarrotes+ — Sistema de punto de venta para abarrotes / minisúper |
| Equipo | Luis David Sosa Fernández · Gonzalo Mendoza Herrera · Miguel Angel Marcelo Taracena |
| Repositorio | https://github.com/notNorthStar/Abarrotes- |
| Fecha | 21 de octubre de 2026 (primer borrador) · 26 de noviembre de 2026 (versión final) |

---

## 1. Introducción

### 1.1 Propósito

Este documento describe la aplicación del marco de trabajo Scrum en el desarrollo de **Abarrotes+**, un sistema web de punto de venta (POS) para una tienda de abarrotes o minisúper con varias sucursales. Registra los roles, artefactos, eventos y resultados de cada sprint, como evidencia del trabajo colaborativo del equipo.

### 1.2 Alcance

Abarrotes+ permite a los **cajeros** iniciar sesión, cobrar ventas (lectura de código de barras, productos a granel y pago mixto con efectivo, tarjeta o transferencia), registrar pagos a proveedores, registrar mermas, consultar las visitas de proveedores y realizar el corte y cierre de su caja; a los **administradores**, gestionar cajeros y productos de su sucursal, atender como cajeros con su propia caja, registrar visitas de proveedores y consultar el reporte semanal; y al **jefe**, gestionar las cuentas de administrador, crear, suspender y eliminar sucursales, y operar como administrador en cualquiera de ellas.

El producto completo consta de 16 historias de usuario (80 puntos) distribuidas en cuatro sprints. Este documento cubre la entrega del **1 de noviembre de 2026** (`v0.2.0`), que integra el Sprint 1 y el Sprint 2 (9 historias, 47 puntos), la del **15 de noviembre de 2026** (`v0.3.0`), del Sprint 3 (5 historias, 23 puntos), y la entrega final del **26 de noviembre de 2026** (`v1.0.0`), del Sprint 4 (2 historias, 10 puntos), con el producto completo. Quedan fuera de alcance la integración con básculas, terminales bancarias y la recuperación de contraseña por correo.

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
| Luis David Sosa Fernández | Scrum Master + Desarrollador | Facilitar eventos, remover impedimentos, mantener artefactos (burndown, sprint backlog, tablero, documento Scrum); desarrollo | Configuración del proyecto, autenticación, cobro y pagos, cuentas de cajero y de administrador, alta de productos, caja (pagos a proveedor y corte); revisa e integra todos los PR |
| Gonzalo Mendoza Herrera | Desarrollador | Sin tareas en el Sprint 2 (baja temporal desde el 28 oct); en el Sprint 3, una historia por disponibilidad limitada; en el Sprint 4, correcciones de esa historia | Visitas de proveedores |
| Miguel Angel Marcelo Taracena | Desarrollador | Desarrollo de sus historias, casos de uso y prototipos | Carrito (escaneo y granel), consulta de inventario, mermas, reporte semanal, gestión de sucursales |
| No asignado | Product Owner | Priorizar el backlog y aceptar las historias | — |

El Product Owner no llegó a confirmarse: las dudas de alcance se resolvieron con lo acordado en el Planning Poker y las decisiones quedaron anotadas en el backlog y en los PRs. Carlos Vicente López Rosales y otro integrante formaron parte del equipo inicial y abandonaron el proyecto; no tienen trabajo asignado.

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
| 10 | HU-10 | Registro de producto caducado/dañado | Medio | 3 | 3 | Miguel |
| 11 | HU-11 | Operaciones de cajero (admin) | Medio | 2 | 3 | Sosa |
| 12 | HU-15 | Gestión de cuentas de administrador | Medio | 3 | 3 | Sosa |
| 13 | HU-07 | Saber visitas de proveedores | Bajo | 2 | 3 | Gonzalo |
| 14 | HU-13 | Reporte semanal por sucursal | Medio | 13 | 3 | Miguel |
| 15 | HU-14 | Operaciones de administrador (jefe) | Bajo | 2 | 4 | Sosa |
| 16 | HU-16 | Gestión de sucursales | Bajo | 8 | 4 | Miguel |

### 4.2 Pila del sprint (Sprint Backlog)

Sprint 2 re-planeado (incluye el Sprint 1). Estado al 21 de octubre de 2026. Fuente viva: `docs/scrum/sprint-2-backlog.md`.

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

> Nota: estados al cierre (28 oct); la fuente es `docs/scrum/sprint-2-backlog.md`.

#### Sprint 3

Meta: que el administrador controle mermas, cubra la caja y vea el reporte semanal. Desde este sprint el estado se lleva en el [tablero de GitHub Projects](https://github.com/users/notNorthStar/projects/1/views/2): un issue por historia y por tarea, asignado a su responsable. `docs/scrum/sprint-3-backlog.md` guarda el PR y la fecha de cada tarea para el burndown.

| ID | Tarea | HU | Pts | Responsable | Estado | PR |
|---|---|---|---|---|---|---|
| T-15 | Verificar y ajustar operaciones de cajero para el administrador | HU-11 | 2 | Sosa | ✅ | #53 |
| T-16 | Pruebas: el administrador abre su caja y el corte queda por persona | HU-11 | | Sosa | ✅ | #53 |
| T-17 | API de cuentas de administrador para el jefe (reutiliza HU-12) | HU-15 | 3 | Sosa | ✅ | #54 |
| T-18 | Pantalla de cuentas de administrador | HU-15 | | Sosa | ✅ | #54 |
| T-19 | API de merma: motivo obligatorio, descuento de inventario y movimiento + pruebas | HU-10 | 3 | Miguel | ✅ | #50 |
| T-20 | Pantalla para registrar producto caducado o dañado | HU-10 | | Miguel | ✅ | #50 |
| T-21 | API de visitas de proveedores + pruebas | HU-07 | 2 | Gonzalo | ✅ | #56 |
| T-22 | Pantalla de visitas: lista por fecha y proveedor, y formulario del admin | HU-07 | | Gonzalo | ✅ | #56 |
| T-23 | API del reporte semanal por sucursal + pruebas | HU-13 | 13 | Miguel | ✅ | #51 |
| T-24 | Pantalla del reporte en tabla | HU-13 | | Miguel | ✅ | #51 |
| T-25 | Exportar el reporte a PDF | HU-13 | | Miguel | ✅ | #51 |
| D-04 | Casos de uso y capturas de las pantallas nuevas | Doc | — | Sosa | ✅ | #55, #57 |
| D-05 | Minutas, burndown y documento Scrum del Sprint 3 | Doc | — | Sosa | ✅ | #52 y cierre |

**Total comprometido:** 23 pts · **Completado:** 23 pts el 9 de noviembre (5 de 5 HU): Miguel 16, Sosa 5, Gonzalo 2.

#### Sprint 4

Meta: que el jefe administre todas las sucursales. Vista del [tablero](https://github.com/users/notNorthStar/projects/1/views/5); `docs/scrum/sprint-backlog.md` guarda el PR y la fecha de cada tarea.

| ID | Tarea | HU | Pts | Responsable | Estado | PR |
|---|---|---|---|---|---|---|
| T-26 | Selector de sucursal del jefe; el cliente envía `sucursalId` | HU-14 | 2 | Sosa | ✅ | #70 |
| T-27 | Quitar los avisos por pantalla; pruebas del jefe en una sucursal | HU-14 | | Sosa | ✅ | #70 |
| T-28 | API de sucursales: crear, listar, suspender, reactivar y eliminar | HU-16 | 8 | Miguel | ✅ | #87 |
| T-29 | Bloqueo de acceso de usuarios de sucursal inactiva | HU-16 | | Miguel | ✅ | #87 |
| T-30 | Pantalla de sucursales del jefe | HU-16 | | Miguel | ✅ | #87 |
| T-31 | Correcciones de la revisión de HU-07 | HU-07 | — | Gonzalo | ✅ | #69 |
| T-32 – T-36 | Mejoras: búsqueda en vivo, teclado, imágenes, logotipo y acceso, folio automático | Mejora | — | Sosa | ✅ | #72–#74, #81, #83–#86 |
| T-37 | Comentario de cierre obligatorio y corte de sesiones suspendidas | Ajuste | — | Sosa | ✅ | #90 |
| D-06 | Casos de uso y capturas de HU-14 y HU-16 | Doc | — | Sosa (reasignada de Gonzalo) | ✅ | #91 |
| D-07 | Minutas, burndown, documento Scrum final y `v1.0.0` | Doc | — | Sosa | ✅ | #92 |

**Total comprometido:** 10 pts · **Completado:** 10 pts (2 de 2 HU): Miguel 8, Sosa 2. Producto: 80 de 80 pts.

### 4.3 Diagrama de clases

El diagrama de clases y el diagrama entidad-relación se generan desde el modelo de datos (`apps/api/prisma/schema.prisma`) y se encuentran en `docs/diagramas/clases.md`, junto con las decisiones de diseño: multisucursal desde el inicio, borrado lógico mediante el atributo `estado`, copia de `precioUnitario` en cada renglón de venta y registro de `MovimientoInventario` para trazabilidad. 

![Diagrama de clases](../diagramas/img/clases.png)

![Diagrama entidad-relación](../diagramas/img/er.png)

### 4.4 Diagrama de casos de uso

Actores cajero, administrador y jefe, con herencia de permisos (el jefe hereda del administrador y este del cajero), y los nueve casos de uso de los Sprints 1 y 2. Fuente: `docs/diagramas/casos-de-uso.md` (Miguel Angel Marcelo Taracena).

![Diagrama de casos de uso](../diagramas/img/casos-de-uso.png)

Casos de uso del Sprint 3 (CU-07, CU-10, CU-11, CU-13 y CU-15). Fuente: `docs/diagramas/casos-de-uso-sprint-3.md` (Luis David Sosa Fernández, D-04).

![Diagrama de casos de uso del Sprint 3](../diagramas/img/casos-de-uso-sprint-3.png)

Casos de uso del Sprint 4 (CU-14 y CU-16). Fuente: `docs/diagramas/casos-de-uso-sprint-4.md` (Luis David Sosa Fernández, D-06).

![Diagrama de casos de uso del Sprint 4](../diagramas/img/casos-de-uso-sprint-4.png)

### 4.5 Descripciones de casos de uso con prototipos

Las nueve descripciones de los Sprints 1 y 2 (objetivo, precondiciones, flujo principal, alternos, postcondiciones y trazabilidad a los criterios de aceptación) están en `docs/diagramas/casos-de-uso.md`. Las capturas de las pantallas de granel e inventario están en `docs/evidencias/miguel/`. Las cinco del Sprint 3 están en `docs/diagramas/casos-de-uso-sprint-3.md` y las dos del Sprint 4 en `docs/diagramas/casos-de-uso-sprint-4.md`.

Cada caso enlaza su pantalla (P-01–P-14) en la tabla de evidencia visual de su documento; las capturas están en la sección 4.6.

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

Pantallas nuevas del Sprint 3 (D-04, capturadas el 9 nov):

![Registrar merma](../prototipos/img/merma.png)

![Reporte semanal](../prototipos/img/reporte.png)

![Cuentas de administrador](../prototipos/img/administradores.png)

![Visitas de proveedores](../prototipos/img/proveedores.png)

Pantallas nuevas del Sprint 4 (D-06, capturadas el 26 nov; el acceso se actualizó al rediseño):

![Jefe en el inventario de Centro](../prototipos/img/jefe-inventario-centro.png)

![Jefe vendiendo en Norte](../prototipos/img/jefe-venta-norte.png)

![Sucursales](../prototipos/img/sucursales.png)

![Confirmar suspensión de sucursal](../prototipos/img/sucursales-confirmar-suspender.png)

Vista en teléfono (390×844):

![Inicio en teléfono](../prototipos/img/movil-inicio.png)

![Venta en teléfono](../prototipos/img/movil-venta.png)

### 4.7 Prototipos de alertas

![Producto no encontrado](../prototipos/img/alerta-producto-no-encontrado.png)

![Pago insuficiente](../prototipos/img/alerta-pago-insuficiente.png)

![Diferencia en el corte](../prototipos/img/alerta-diferencia-corte.png)

![Cuenta suspendida](../prototipos/img/alerta-usuario-suspendido.png)

![Merma mayor que la existencia](../prototipos/img/alerta-merma-sin-existencia.png)

![Sucursal suspendida](../prototipos/img/alerta-sucursal-suspendida.png)

### 4.8 Sprint

Los sprints duran **2 semanas**. El calendario del proyecto es:

| Sprint | Fechas | Meta | Pts planeados | Resultado |
|---|---|---|---|---|
| 1 | 5 – 18 oct 2026 | Que un cajero pueda iniciar sesión y cobrar una venta completa | 24 | No entregado (velocidad real 0) por la salida de 2 integrantes |
| 2 | 19 oct – 1 nov 2026 | Re-planeado: entregar Sprint 1 + Sprint 2 (9 HU) | 47 | Entregado: 47 de 47 pts (`v0.2.0`) |
| 3 | 2 – 15 nov 2026 | Que el administrador controle mermas, cubra la caja y vea el reporte semanal | 23 | Entregado: 23 de 23 pts (`v0.3.0`) |
| 4 | 16 – 29 nov 2026 | Que el jefe administre todas las sucursales | 10 | Entregado: 10 de 10 pts (`v1.0.0`, 26 nov) |

### 4.9 Incremento

**Versión `v0.2.0` (Sprints 1 y 2).** Incremento funcional y demostrable: un cajero inicia sesión, abre su caja, registra ventas por código de barras y a granel, cobra con pago mixto y cambio, registra pagos a proveedor y cierra su caja con corte y diferencia; el administrador gestiona cajeros, alta de productos e inventario. Interfaz con el sistema visual "Mostrador". 9 de 9 HU (47 pts), 130 pruebas automatizadas.

**Versión `v0.3.0` (Sprint 3).** Se agregan: registro de mermas (caducado o dañado) que descuenta inventario sin afectar la caja; el administrador atiende como cajero con su propia caja y corte; reporte semanal por sucursal con ingresos, pagos, altas y mermas, cada uno con su responsable, exportable a PDF; visitas de proveedores que registra el administrador y consulta el cajero; y gestión de cuentas de administrador por el jefe. 5 de 5 HU (23 pts), 194 pruebas automatizadas. Detalle en las Sprint Reviews (`docs/scrum/reuniones.md`).

**Versión `v1.0.0` (Sprint 4, entrega final).** Se agregan: el jefe opera como administrador en cualquier sucursal desde un selector en la barra superior; gestión de sucursales (crear, suspender, reactivar y eliminar) con bloqueo inmediato de sus usuarios; y, como mejoras del equipo, búsqueda con coincidencias en vivo, operación completa con teclado, fotos de productos y logotipos de proveedores, logotipo de la aplicación, acceso con galería de arte, folio automático con tarjeta y diseño adaptable a teléfono. Producto completo: 16 de 16 HU (80 pts), 243 pruebas automatizadas.

### 4.10 Burn Up

La gráfica de burnup del producto (puntos acumulados completados contra el plan de 80 puntos: 24 / 47 / 70 / 80) se mantiene en `docs/scrum/burndown.md`, sección "Gráficas". Real acumulado: 0 al cierre del Sprint 1, 47 al del Sprint 2, 70 al del Sprint 3 y 80 al del Sprint 4, igual al plan.

![Burnup del producto](../diagramas/img/burnup.png)

### 4.11 Burn Down

Las gráficas de burndown (puntos restantes por día contra la línea ideal) se mantienen en `docs/scrum/burndown.md`, sección "Gráficas".

**Sprint 2.** El burndown se mantuvo plano hasta el día 7 (47 pts) y bajó a 0 el día 10 (28 oct), cuatro días antes del fin del sprint: 26 pts el 26 oct (HU-01, HU-06, HU-12, HU-08) y los 21 restantes el 28 oct (HU-03, HU-04, HU-02, HU-09, HU-05).

![Burndown Sprint 2](../diagramas/img/burndown.png)

**Sprint 3.** El burndown volvió a quedar plano siete días (23 pts) y bajó a 0 el día 8 (9 nov), cuando se integraron las cinco historias: HU-10 y HU-13 de Miguel, HU-11 y HU-15 de Sosa, y HU-07 de Gonzalo.

![Burndown Sprint 3](../diagramas/img/burndown-sprint-3.png)

**Sprint 4.** El plan se publicó el día 9; el burndown estuvo plano ocho días (10 pts), bajó a 8 el día 9 (24 nov, HU-14) y a 0 el día 10 (25 nov, HU-16). El sprint se cerró el día 11 (26 nov).

![Burndown Sprint 4](../diagramas/img/burndown-sprint-4.png)

### 4.12 Reunión de inicio de sprint

El **21 de octubre de 2026** se realizó la reunión de re-planeación e inicio del Sprint 2 (minuta completa en `docs/scrum/reuniones.md`). Resumen:

- **Contexto:** el Sprint 1 no se entregó (velocidad real 0) debido a que dos integrantes abandonaron el proyecto.
- **Compromiso:** entregar Sprint 1 + Sprint 2 el 1 de noviembre: 9 historias, 47 puntos.
- **Stack:** React + Node.js/Express + PostgreSQL con Prisma.
- **Reparto por dominio** (propuesto por el Scrum Master, pendiente de confirmación de Gonzalo y Miguel): Sosa 16 pts (T-00, HU-01, HU-06, HU-12, D-03); Gonzalo 16 pts (HU-02, HU-09, HU-05, D-02); Miguel 15 pts (HU-03, HU-04, HU-08, D-01).
- **Flujo de trabajo:** ramas `main` / `develop` / `hu-XX`, con Pull Request revisado por otro integrante; trabajo asistido por IA mediante `AGENTS.md` y prompts del repositorio.
- **Riesgos:** dependencia HU-06 → HU-05, poco tiempo y aprendizaje del stack.
- **Pendientes:** confirmar Product Owner, confirmar el reparto y activar la protección de ramas.

El **4 de noviembre de 2026** se planeó el Sprint 3 (minuta en `docs/scrum/reuniones.md`):

- **Meta:** que el administrador controle mermas, cubra la caja y vea el reporte semanal. **Compromiso:** 5 historias, 23 puntos.
- **Reparto:** Miguel 16 pts (HU-10 y HU-13, que dependen entre sí); Sosa 5 pts (HU-11 y HU-15) más revisión e integración; Gonzalo 2 pts (HU-07), por su disponibilidad limitada.
- **Puntos de control:** si no había PR de HU-07 el 10 nov pasaba a Sosa; si la API de HU-13 no estaba lista el 11 nov, Sosa tomaba el PDF. No hizo falta activar ninguno.
- **Seguimiento:** desde el 4 nov el estado se lleva en un tablero de GitHub Projects con un issue por historia y tarea.

El **Sprint 4** se planeó el 17 nov y se publicó el 24 nov (minuta en `docs/scrum/reuniones.md`):

- **Meta:** que el jefe administre todas las sucursales. **Compromiso:** 2 historias, 10 puntos.
- **Reparto:** Miguel 8 pts (HU-16); Sosa 2 pts (HU-14) más revisión, integración y cierre; Gonzalo, correcciones de HU-07 y documentación del sprint.
- **Puntos de control:** si Gonzalo no subía avance de D-06 el 28 nov, pasaba a Sosa; se reasignó el 26 nov para cerrar a tiempo.

### 4.13 Reunión técnica diaria

Formato de daily asíncrono en `docs/scrum/dailies/_plantilla.md` (prompt `docs/prompts/daily.md`). Registrados en el repositorio: 21 oct y 24 nov 2026 (este último de Miguel); en Drive: 12 y 20 oct. En el Sprint 3 no se registraron dailies; el seguimiento se apoyó en el tablero y en la actividad de GitHub (ramas, PRs y revisiones). Se reconoce como área de mejora en las dos retrospectivas.

### 4.14 Cierre de sprint

**Sprint 2**
- **Sprint Review:** 9 de 9 HU entregadas (47 pts), cada una con PR revisado e integrado; demo formal el 1 nov.
- **Retrospectiva:** bien — recuperación total del Sprint 1, trabajo por dominio sin conflictos, harness de IA y revisión centralizada; mejorar — detección tardía de la salida de integrantes, dailies irregulares y concentración de carga; acciones para el Sprint 3.

**Sprint 3**
- **Sprint Review:** 5 de 5 HU entregadas (23 pts), integradas el 9 nov; los tres integrantes entregaron código propio con PR revisado.
- **Retrospectiva:** bien — compromiso completo seis días antes, Miguel adelantó el PDF, tablero visible para todos y 194 pruebas; mejorar — avance invisible hasta el día 8, sin dailies, tarjetas que no movían sus responsables, un PR contra `main` y cierre formal dos días tarde; acciones para el Sprint 4.

**Sprint 4**
- **Sprint Review:** 2 de 2 HU entregadas (10 pts); producto completo con 80 de 80 pts en `v1.0.0`. La maestra felicitó al equipo y destacó la interfaz.
- **Retrospectiva:** bien — producto completo tres días antes, HU-16 completa de Miguel con 24 pruebas, cierre en fecha y 243 pruebas; mejorar — plan publicado el día 9, D-06 reasignada, mejoras sin estimar y sin Product Owner confirmado.

Minutas completas: `docs/scrum/reuniones.md`.

---

## 5. Conclusiones

El equipo entregó en el Sprint 2 la totalidad del compromiso de los Sprints 1 y 2 (9 historias, 47 puntos) pese a iniciar con el Sprint 1 sin entregar y perder a dos integrantes. Scrum permitió hacer visibles los problemas (burndown plano hasta el día 7) y responder con re-planeaciones concretas: reparto por dominio, revisión centralizada y reasignación de historias según la disponibilidad real.

El uso de inteligencia artificial con reglas compartidas (`AGENTS.md`) aceleró el desarrollo sin perder control: cada cambio pasó por criterios de aceptación, pruebas automatizadas y revisión antes de integrarse.

En el Sprint 3 el equipo cumplió de nuevo el compromiso completo (5 historias, 23 puntos) y, por primera vez, los tres integrantes entregaron código propio. Con eso el producto suma 70 de 80 puntos, igual al plan. La lección del sprint es que el avance llegó todo junto el día 8: el equipo terminó a tiempo, pero el burndown no permitió ver el progreso mientras ocurría.

En el Sprint 4 el equipo cerró el producto completo: 16 historias y 80 puntos en cuatro sprints, con la velocidad real igual al plan desde el Sprint 2. Además de lo comprometido se agregaron mejoras de uso (búsqueda en vivo, teclado, imágenes, diseño adaptable a teléfono) que la maestra reconoció en la presentación.

La lección principal del proyecto es que Scrum hizo visible cada problema a tiempo para corregirlo: la salida de dos integrantes, los arranques tardíos y la carga concentrada en una persona. Las re-planeaciones y las reasignaciones con fecha permitieron entregar todo lo comprometido. Para un proyecto futuro, el equipo publicaría la planeación el primer día, estimaría también las mejoras y confirmaría al Product Owner desde el inicio.
