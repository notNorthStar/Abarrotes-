# Reuniones de Scrum — Abarrotes+

Minutas de las reuniones de inicio y cierre de sprint. Los dailies están en `docs/scrum/dailies/`.

---

## Reunión de re-planeación / inicio de Sprint 2 — 21 oct 2026

| Campo | Detalle |
|---|---|
| Proyecto | Abarrotes+ (POS web para abarrotes / minisúper multisucursal) |
| Tipo | Sprint Planning (re-planeación del Sprint 1 + Sprint 2) |
| Fecha | Miércoles 21 de octubre de 2026 (día 3 del Sprint 2) |
| Scrum Master | Luis David Sosa Fernández |
| Product Owner | Por confirmar |
| Asistentes | Luis David Sosa Fernández · Gonzalo Mendoza Herrera · Miguel Angel Marcelo Taracena |

### Contexto

- El **Sprint 1** (5 – 18 oct 2026) tenía como meta "que un cajero pueda iniciar sesión y cobrar una venta completa" (24 pts). **No se entregó: velocidad real = 0.**
- Causa: **dos integrantes abandonaron el proyecto** (Carlos Vicente López Rosales y otro integrante), lo que dejó al equipo con 3 personas y sin el trabajo que tenían asignado.
- El **Sprint 2** (19 oct – 1 nov 2026) se re-planea para entregar **Sprint 1 + Sprint 2: 9 historias de usuario, 47 pts**, el domingo 1 de noviembre.
- Los dailies previos en Drive tenían errores (el del 20/10/2026 decía "12 oct" y listaba a Carlos como asistente). A partir de ahora solo se registran los 3 integrantes actuales.

### Acuerdos

1. **Stack técnico:** React (front) + Node.js/Express (API) + PostgreSQL con Prisma (base de datos).
2. **Reparto por dominio** para que nadie se bloquee con nadie (propuesto por Sosa; **pendiente de confirmación de Gonzalo y Miguel**):
   - Sosa — T-00, HU-01, HU-06, HU-12, D-03 (16 pts).
   - Gonzalo — HU-02, HU-09, HU-05, D-02 (16 pts).
   - Miguel — HU-03, HU-04, HU-08, D-01 (15 pts).
3. **Flujo de ramas:** `main` (entregas) ← `develop` (integración) ← ramas `hu-XX-…` por historia; todo entra a `develop` por **Pull Request revisado por otro integrante**.
4. **Trabajo con IA (AI harness):** `AGENTS.md` y los prompts de `docs/prompts/` definen las reglas que sigue la IA de cada integrante (criterios de aceptación, pruebas, flujo de ramas).
5. **Sprints de 2 semanas.** Daily asíncrono diario en `docs/scrum/dailies/`.
6. Una HU cuenta como hecha (burndown) cuando cumple la Definición de Hecho y se mergea a `develop`.

### Avance a la fecha de la reunión

- T-00 (esqueleto del proyecto) integrado en `develop`.
- HU-01 implementada con pruebas en la rama `hu-01-inicio-sesion`; pendiente de PR y revisión.
- HU-06 y HU-12 en desarrollo.
- Ninguna HU mergeada aún → **puntos restantes: 47 / 47**.

### Sprint backlog comprometido (47 pts)

| HU | Nombre | Pts | Responsable | Sprint de origen |
|---|---|---|---|---|
| HU-01 | Inicio de sesión | 3 | Sosa | 1 |
| HU-06 | Cobros con tarjeta, efectivo y transferencia | 8 | Sosa | 1 |
| HU-02 | Cobrar productos con código de barras | 5 | Gonzalo | 1 |
| HU-03 | Producto a granel (peso/cantidad) | 8 | Miguel | 1 |
| HU-09 | Registrar pagos a proveedores | 3 | Gonzalo | 2 |
| HU-05 | Corte y cierre de caja | 8 | Gonzalo | 2 |
| HU-12 | Gestión de cuentas de cajero | 5 | Sosa | 2 |
| HU-04 | Revisar el inventario | 2 | Miguel | 2 |
| HU-08 | Agregar productos | 5 | Miguel | 2 |
| **Total** | | **47** | | |

Tareas técnicas y de documentación sin puntos: T-00 (Sosa), D-01 (Miguel), D-02 (Gonzalo), D-03 (Sosa). Detalle en `docs/scrum/sprint-backlog.md`.

### Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Dependencia HU-06 → HU-05: el corte de caja necesita las ventas y pagos registrados por el cobro | Gonzalo podría quedar bloqueado | Contratos definidos en T-00 (rutas, tipos, datos del seed) para avanzar en paralelo |
| Poco tiempo: 47 pts en 12 días restantes con velocidad previa 0 | No completar todas las HU | Plan de contingencia de `docs/03-plan-entrega.md`; nunca se recorta el flujo login → venta → cobro → corte |
| Curva de aprendizaje del stack (React, Express, Prisma) | Retrasos en las primeras HU | Trabajo asistido por IA con `AGENTS.md`; cada integrante debe poder explicar su código en la demo |

### Pendientes

- [ ] Confirmar quién es el Product Owner (con la maestra / el equipo).
- [ ] Confirmar el reparto de HU con Gonzalo y Miguel.
- [x] Activar la protección de ramas `main` y `develop` en GitHub (PR + aprobación de Code Owner) — 26 oct.

---

## Ajuste de proceso — 26 oct 2026 (día 8)

**Decide:** Luis David Sosa Fernández (Scrum Master).

- **Revisión centralizada:** Sosa es el único que revisa, aprueba e integra los PRs (`CODEOWNERS = @notNorthStar`). Gonzalo y Miguel solo implementan y mandan PRs. Los PRs de Sosa se integran directo.
- **Motivo:** al día 8 Gonzalo y Miguel no tenían avance en GitHub; quitarles la carga de revisión les deja todo el tiempo para sus HU.
- **Herramientas:** Gonzalo y Miguel trabajan con Codex, Cursor o Antigravity; se agregan `GEMINI.md` y `.agent/rules/` y la guía `docs/00-empieza-aqui.md` con las frases para cada IA.
- **Reasignación:** HU-08 (alta de productos, 5 pts) pasa de Miguel a Sosa para tener inventario cargable desde admin cuanto antes. Reparto vigente: Sosa 21 pts, Gonzalo 16, Miguel 10.
- **Estado:** se integran HU-01, HU-06, HU-12 y HU-08 (21 pts). Restan 26 pts (Gonzalo 16, Miguel 10), re-calendarizados del 27 al 31 oct.

---

## Ajuste de proceso — 28 oct 2026 (día 10)

**Decide:** Luis David Sosa Fernández (Scrum Master).

- **Impedimento:** Gonzalo Mendoza Herrera tuvo un problema personal y no puede continuar en este sprint. No había entregado avance de HU-02, HU-09, HU-05 ni D-02.
- **Reasignación:** HU-02 (5 pts) y D-02 (prototipos) pasan a Miguel; HU-09 (3 pts) y HU-05 (8 pts) pasan a Sosa. Criterio: Miguel ya construyó el carrito (granel y tabla de la cuenta); la caja depende del cobro de Sosa (`turnoAbiertoDe`, ventas y pagos).
- **Reparto vigente:** Sosa 32 pts, Miguel 15 pts, Gonzalo 0 pts.
- **Estado:** 31/47 pts integrados (Miguel entregó HU-03, HU-04 y D-01 el 27 oct). Restan 16 pts; objetivo: cerrarlos el 28 oct.

---

## Sprint Review — cierre del Sprint 2

> Minuta preparada por el Scrum Master el 29 oct 2026 con el incremento terminado; la demostración formal ante la maestra es el domingo 1 de noviembre. **Confirmar asistentes y retroalimentación después de la demo.**

| Campo | Detalle |
|---|---|
| Fecha | 29 oct 2026 (cierre) · demo formal 1 nov 2026 |
| Asistentes | Luis David Sosa Fernández (SM + dev) · Miguel Angel Marcelo Taracena (dev) · Product Owner: por confirmar |
| Compromiso | 9 HU · 47 pts (Sprint 1 + Sprint 2) |
| Entregado | **9 HU · 47 pts (100 %)** |

### HU entregadas

| HU | Nombre | Pts | Responsable final | PR | ¿Cumple DoD? |
|---|---|---|---|---|---|
| HU-01 | Inicio de sesión | 3 | Sosa | #1 | Sí |
| HU-06 | Cobros con tarjeta, efectivo y transferencia | 8 | Sosa | #3 | Sí |
| HU-02 | Cobrar productos con código de barras | 5 | Miguel (de Gonzalo) | #14 | Sí |
| HU-03 | Producto a granel | 8 | Miguel | #8 | Sí |
| HU-09 | Registrar pagos a proveedores | 3 | Sosa (de Gonzalo) | #13 | Sí |
| HU-05 | Corte y cierre de caja | 8 | Sosa (de Gonzalo) | #13 | Sí |
| HU-12 | Gestión de cuentas de cajero | 5 | Sosa | #2 | Sí |
| HU-04 | Revisar el inventario | 2 | Miguel | #9 | Sí |
| HU-08 | Agregar productos | 5 | Sosa (de Miguel) | #7 | Sí |

DoD verificada en cada PR: criterios de aceptación cubiertos, pruebas automatizadas (27 web + 103 API al cierre), lint y tipos correctos, PR integrado a `develop` y revisado/aprobado por el Scrum Master.

### Incremento demostrado

Recorrido completo en la app (capturas en `docs/prototipos/img/`):
1. Inicio de sesión por rol; una cuenta suspendida no puede entrar.
2. Abrir caja con monto inicial.
3. Venta: escaneo por código (suma cantidad al repetir), búsqueda manual si no existe, producto a granel por peso (0.750 kg × $28.90 = $21.68).
4. Cobro mixto (efectivo + tarjeta con referencia) con cálculo de cambio; pago insuficiente bloqueado. La existencia se descuenta.
5. Pago a proveedor en efectivo o transferencia.
6. Corte por forma de pago, efectivo esperado y cierre con sobrante/faltante y comentario obligatorio.
7. Administración: alta de productos y entradas de existencias, consulta de inventario, gestión de cuentas de cajero.
8. Interfaz rediseñada (sistema visual "Mostrador"): barra lateral, Inicio con resumen del turno, paleta de comandos.

### Retroalimentación

- [Completar después de la demo del 1 nov: observaciones de la maestra / PO.]

---

## Retrospectiva — Sprint 2

> **Borrador** redactado por el Scrum Master a partir de los hechos del sprint. El equipo debe revisarlo y agregar su opinión antes de la entrega.

| Campo | Detalle |
|---|---|
| Fecha | 29 oct 2026 (borrador) |
| Asistentes | [Confirmar] |

### ¿Qué salió bien?

- Se recuperó el Sprint 1 completo y se entregó junto con el Sprint 2: 47 de 47 puntos.
- La re-planeación por dominio (cada quien dueño de sus módulos) evitó conflictos: ningún PR tuvo conflictos de integración.
- El AI harness (`AGENTS.md`, prompts y guía de arranque) permitió que cada integrante trabajara con su propia herramienta de IA siguiendo las mismas reglas.
- La revisión centralizada en el Scrum Master con protección de ramas dio un `develop` siempre funcional.
- Las pruebas automatizadas por criterio de aceptación detectaron errores antes de integrar.

### ¿Qué mejorar?

- El Sprint 1 no se entregó: la salida de dos integrantes no se detectó ni se re-planeó a tiempo.
- Durante los primeros días del Sprint 2 no hubo avance visible en GitHub de dos integrantes; la falta de dailies impidió detectarlo antes.
- Hubo que reasignar historias dos veces (26 y 28 oct), lo que concentró la carga en el Scrum Master (32 pts).
- Los dailies no se registraron todos los días (solo el del 21 oct está en el repo).
- El Product Owner nunca se confirmó.

### Acciones

| Acción | Responsable | Para cuándo |
|---|---|---|
| Daily obligatorio (aunque sea asíncrono) y revisión de avance en GitHub cada 2 días | Scrum Master | Sprint 3 |
| Confirmar el Product Owner con la maestra | Scrum Master | Inicio del Sprint 3 |
| Re-planear el Sprint 3 según la disponibilidad real del equipo (incluida la posible reincorporación de Gonzalo) | Todos | Planeación del Sprint 3 |
| Mantener el burndown actualizado diariamente | Scrum Master | Sprint 3 |
