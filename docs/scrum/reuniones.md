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
- [ ] Activar la protección de ramas `main` y `develop` en GitHub (PR + 1 aprobación).

---

## Sprint Review — 1 nov 2026

| Campo | Detalle |
|---|---|
| Fecha | Domingo 1 de noviembre de 2026 |
| Asistentes | |

### HU entregadas

| HU | Nombre | Pts | ¿Cumple DoD? | Observaciones |
|---|---|---|---|---|
| | | | | |

### Incremento demostrado

-

### Retroalimentación

-

---

## Retrospectiva — 1 nov 2026

| Campo | Detalle |
|---|---|
| Fecha | Domingo 1 de noviembre de 2026 |
| Asistentes | |

### ¿Qué salió bien?

-

### ¿Qué mejorar?

-

### Acciones

| Acción | Responsable | Para cuándo |
|---|---|---|
| | | |
