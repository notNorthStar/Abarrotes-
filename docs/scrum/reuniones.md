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

> Redactada por el Scrum Master a partir de los hechos del sprint (17 nov 2026).

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

---

## Planeación del Sprint 3 — 4 nov 2026

> Reparto propuesto por el Scrum Master; **falta que Miguel y Gonzalo lo confirmen.**

**Meta:** que el administrador controle mermas, cubra la caja y vea el reporte semanal.

**Compromiso:** 5 HU, 23 pts, igual al plan del Product Backlog.

| HU | Nombre | Pts | Responsable |
|---|---|---|---|
| HU-10 | Registro de producto caducado/dañado | 3 | Miguel |
| HU-11 | Operaciones de cajero para el administrador | 2 | Sosa |
| HU-15 | Gestión de cuentas de administrador | 3 | Sosa |
| HU-07 | Saber visitas de proveedores | 2 | Gonzalo |
| HU-13 | Reporte semanal por sucursal | 13 | Miguel |

### Acuerdos

- Gonzalo tiene una sola historia porque estará ausente la mayor parte del sprint. Si no hay PR de HU-07 el 10 de noviembre, pasa a Sosa.
- Si la API de HU-13 no está lista el 11 de noviembre, Sosa toma la exportación a PDF.
- Sosa revisa e integra todos los PRs. Cierre el 15 de noviembre con el tag `v0.3.0`.

### Riesgos

- HU-13 concentra más de la mitad de los puntos y depende de HU-10.
- Disponibilidad limitada de Gonzalo.
- En el Sprint 2 el avance se detectó tarde; este sprint se retoma el daily.

### Pendientes

- [x] Confirmar el reparto con Miguel y Gonzalo: cada quien entregó las historias asignadas.
- [ ] Confirmar al Product Owner.
- [x] Decidir con el PO: una merma mayor que la existencia se rechaza (9 nov). La semana de lunes a domingo se aplicó como estaba en el backlog.

---

## Sprint Review — cierre del Sprint 3

> Minuta preparada por el Scrum Master el 17 nov 2026 con el incremento terminado.

| Campo | Detalle |
|---|---|
| Fecha | Cierre del sprint: 15 nov 2026 · minuta: 17 nov 2026 |
| Asistentes | Luis David Sosa Fernández (SM + dev) · Miguel Angel Marcelo Taracena (dev) · Gonzalo Mendoza Herrera (dev) |
| Meta | Que el administrador controle mermas, cubra la caja y vea el reporte semanal |
| Compromiso | 5 HU · 23 pts |
| Entregado | **5 HU · 23 pts (100 %)**, todo integrado el 9 nov (día 8 de 14) |

### HU entregadas

| HU | Nombre | Pts | Responsable | PR | ¿Cumple DoD? |
|---|---|---|---|---|---|
| HU-10 | Registro de producto caducado/dañado | 3 | Miguel | #50 | Sí |
| HU-13 | Reporte semanal por sucursal (con PDF) | 13 | Miguel | #51 | Sí |
| HU-11 | Operaciones de cajero para el administrador | 2 | Sosa | #53 | Sí |
| HU-15 | Gestión de cuentas de administrador | 3 | Sosa | #54 | Sí |
| HU-07 | Saber visitas de proveedores | 2 | Gonzalo | #56 | Sí |

Documentación: casos de uso y capturas del sprint (D-04, #55 y #57); sprint backlog y burndown al día (D-05, #52). DoD verificada en cada PR: criterios de aceptación cubiertos, pruebas automatizadas (31 web + 163 API al cierre, 64 más que en el Sprint 2), lint, tipos y build correctos, PR revisado y aprobado por el Scrum Master e integrado a `develop`.

### Incremento demostrado

Recorrido en la app con los datos de ejemplo (capturas en `docs/prototipos/img/`):
1. `cajero1` registra 2 piezas de Coca-Cola 600 ml como caducadas: la existencia baja y su caja no cambia. Una merma mayor que la existencia se rechaza.
2. `admin.centro` abre su propia caja, vende y cobra; su corte solo incluye sus operaciones, aunque un cajero tenga otra caja abierta.
3. `admin.centro` consulta el reporte semanal: ingresos por forma de pago, ventas, pagos a proveedor, altas y mermas con su responsable, y lo exporta a PDF.
4. `admin.centro` registra una visita de proveedor; `cajero1` la ve en la lista y `cajero.norte`, de otra sucursal, no.
5. `jefe` elige una sucursal y crea, suspende, reactiva y elimina cuentas de administrador; un administrador suspendido no puede entrar.

### Retroalimentación

- Pregunta abierta al cliente (9 nov): si los cambios de otros usuarios deben verse en tiempo real. Hoy cada pantalla los muestra al recargar sus datos. Si lo pide, entra como historia nueva al backlog.

---

## Retrospectiva — Sprint 3

> Redactada por el Scrum Master a partir de los hechos del sprint (17 nov 2026).

| Campo | Detalle |
|---|---|
| Fecha | 17 nov 2026 |
| Asistentes | Luis David Sosa Fernández · Miguel Angel Marcelo Taracena · Gonzalo Mendoza Herrera |

### ¿Qué salió bien?

- Se cumplió el 100 % del compromiso (23 de 23 pts) seis días antes del fin del sprint.
- Los tres integrantes entregaron código propio con PR revisado: Miguel completó sus 16 pts e hizo también la exportación a PDF, que estaba prevista como respaldo de Sosa; Gonzalo entregó HU-07, su primera historia integrada.
- El tablero de GitHub Projects hizo visible el estado de cada historia y tarea para todo el equipo y para la maestra.
- La calidad se sostuvo: 194 pruebas automatizadas y ningún PR integrado rompió `develop`.
- Las decisiones de alcance (merma mayor que la existencia, semana de lunes a domingo) se resolvieron y quedaron anotadas en los PRs.

### ¿Qué mejorar?

- El burndown estuvo plano siete días: no hubo nada en GitHub hasta el día 8, cuando se integró todo. El avance real no fue visible a tiempo.
- No se registraron dailies del Sprint 3, aunque era una acción acordada en la retrospectiva anterior.
- Nadie movió sus tarjetas a *En progreso* ni a *En revisión*; el tablero solo cambiaba cuando el Scrum Master integraba.
- El PR de HU-07 se abrió contra `main` en lugar de `develop`, y un `git pull` después del rebase duplicó sus commits.
- El cierre formal (review, retro y tag) se hizo el 17 nov, dos días después de la fecha.
- El Product Owner sigue sin confirmarse.

### Acciones

| Acción | Responsable | Para cuándo |
|---|---|---|
| Subir avance a una rama al menos cada dos días, aunque esté a medias | Todos | Sprint 4 |
| Daily asíncrono registrado en `docs/scrum/dailies/` | Todos (lo revisa el SM) | Sprint 4 |
| Mover las tarjetas del tablero al empezar y al abrir el PR | Todos | Sprint 4 |
| Revisar antes de abrir un PR que la base sea `develop` y subir con `--force-with-lease` después de un rebase | Gonzalo y Miguel | Sprint 4 |
| Cerrar el Sprint 4 en su fecha (29 nov) | Scrum Master | Fin del Sprint 4 |
| Confirmar el Product Owner con la maestra | Scrum Master | Inicio del Sprint 4 |

---

## Planeación del Sprint 4 — 17 nov 2026 (publicada el 24 nov)

> Reparto propuesto por el Scrum Master el 17 nov; el 24 nov se publicó con el calendario ajustado, porque no había avance.

**Meta:** que el jefe administre todas las sucursales.

**Compromiso:** 2 HU, 10 pts, igual al plan del Product Backlog. Es el último sprint: con él el producto llega a 80 de 80 pts y se entrega `v1.0.0` el 29 de noviembre.

| HU | Nombre | Pts | Responsable |
|---|---|---|---|
| HU-14 | Operaciones de administrador para el jefe (selector de sucursal) | 2 | Sosa |
| HU-16 | Gestión de sucursales | 8 | Miguel |

Tareas sin puntos: T-31 correcciones de la revisión de HU-07 y D-06 casos de uso y capturas (Gonzalo); D-07 cierre final (Sosa).

### Acuerdos

- Los criterios de aceptación de HU-14 y HU-16 se escribieron con las aclaraciones del Planning Poker (`docs/02-backlog.md`).
- Si no hay PR de la API de HU-16 el 26 de noviembre, Sosa toma su pantalla. Si Gonzalo no sube avance de D-06 el 28 a mediodía, Sosa lo toma.
- Acciones de la retro del Sprint 3: subir avance cada dos días, daily registrado y mover las tarjetas del tablero.
- Cierre el 29 de noviembre con la review, la retro, el documento Scrum final y el tag `v1.0.0`.

### Riesgos

- El plan se publicó el 24, día 9 de 14: quedan 5 días para 10 puntos.
- HU-16 toca el acceso de usuarios (`middleware/auth.ts`), que es compartido.
- Disponibilidad limitada de Gonzalo.

### Pendientes

- [x] Reparto en marcha: Miguel entregó HU-16 el 25 nov; D-06 se reasignó a Sosa el 26 nov.
- [ ] Confirmar al Product Owner.
- [x] Decidir las dos dudas de HU-16 (25 nov): sesiones cortadas en la siguiente petición; se permite suspender con cajas abiertas.
- [ ] Preguntar al cliente si quiere ver cambios en tiempo real (historia nueva fuera de este compromiso; queda para una versión posterior).

---

## Sprint Review — cierre del Sprint 4 y del producto

> Minuta del Scrum Master del 26 nov 2026, con el incremento terminado y la demostración del sistema completo.

| Campo | Detalle |
|---|---|
| Fecha | 26 nov 2026 (el sprint terminaba el 29 nov) |
| Asistentes | Luis David Sosa Fernández (SM + dev) · Miguel Angel Marcelo Taracena (dev) · Gonzalo Mendoza Herrera (dev) |
| Meta | Que el jefe administre todas las sucursales |
| Compromiso | 2 HU · 10 pts |
| Entregado | **2 HU · 10 pts (100 %)**, integradas el 24 y el 25 nov. Producto: **16 de 16 HU, 80 de 80 pts** |

### HU entregadas

| HU | Nombre | Pts | Responsable | PR | ¿Cumple DoD? |
|---|---|---|---|---|---|
| HU-14 | Operaciones de administrador para el jefe (selector de sucursal) | 2 | Sosa | #70 | Sí |
| HU-16 | Gestión de sucursales y bloqueo de usuarios de sucursal inactiva | 8 | Miguel | #87 | Sí |

Tareas sin puntos: T-31 correcciones de HU-07 (Gonzalo, #69); mejoras T-32 a T-36 (Sosa, #72–#74, #81, #83–#86); ajuste T-37 (Sosa, #90); D-06 casos de uso y capturas (Sosa, reasignada, #91); D-07 cierre (Sosa). DoD verificada en cada PR: criterios cubiertos, pruebas (39 web + 204 API = 243 al cierre, 49 más que en el Sprint 3), lint, tipos y build correctos, PR revisado e integrado a `develop`.

### Incremento demostrado

Recorrido con los datos de ejemplo (capturas en `docs/prototipos/img/`):
1. `jefe` elige Centro en la barra superior y revisa su inventario; cambia a Norte y vende ahí. La elección se conserva al recargar.
2. `jefe` crea una sucursal, la suspende (confirmando con Enter) y sus usuarios ya no pueden entrar; al reactivarla vuelven a entrar.
3. Una cuenta suspendida pierde al instante la sesión que tenía abierta y vuelve al acceso (T-37).
4. El cierre de caja pide comentario siempre (HU-05 CA5, T-37).
5. Mejoras del sprint: búsqueda con coincidencias en vivo, operación completa con teclado, fotos de productos y logotipos de proveedores, logotipo de la aplicación, acceso con galería de arte y mostrar contraseña, folio automático con tarjeta y diseño que funciona en teléfono.

### Retroalimentación

- En la presentación del sistema la maestra felicitó al equipo y destacó la interfaz frente a la de los demás equipos.
- Pregunta abierta al cliente: ver en tiempo real los cambios de otros usuarios. Queda fuera de `v1.0.0` como historia para una versión posterior.

---

## Retrospectiva — Sprint 4

> Redactada por el Scrum Master el 26 nov 2026 a partir de los hechos del sprint.

| Campo | Detalle |
|---|---|
| Fecha | 26 nov 2026 |
| Asistentes | Luis David Sosa Fernández · Miguel Angel Marcelo Taracena · Gonzalo Mendoza Herrera |

### ¿Qué salió bien?

- Se cumplió el 100 % del compromiso y el producto completo: 80 de 80 pts en `v1.0.0`, tres días antes de la fecha.
- Miguel entregó HU-16 completa (API, bloqueo y pantalla) con 24 pruebas nuevas y registró su daily del 24 nov.
- Gonzalo atendió las observaciones de su PR de HU-07 (T-31).
- Se cerró el sprint en tiempo, una de las acciones de la retro anterior.
- Al comparar el backlog con lo entregado se detectaron y corrigieron dos huecos antes de la entrega (T-37).
- 243 pruebas automatizadas y ningún PR rompió `develop`.

### ¿Qué mejorar?

- El sprint arrancó tarde: el plan se publicó el día 9 y el burndown estuvo plano ocho días.
- Gonzalo no entregó D-06 y se reasignó; la carga del cierre volvió a concentrarse en el Scrum Master.
- Las mejoras T-32 a T-36 entraron sin estimarse en Planning Poker: aportaron valor, pero no se reflejan en la velocidad.
- El Product Owner nunca se confirmó; las dudas de alcance las resolvió el equipo.

### Acciones (para un proyecto futuro)

| Acción | Por qué |
|---|---|
| Publicar la planeación el primer día del sprint | En los sprints 3 y 4 el arranque tardío dejó el burndown plano |
| Estimar también las mejoras que se agreguen a mitad del sprint | Para que la velocidad refleje el trabajo real |
| Confirmar al Product Owner antes del primer sprint | Para que las decisiones de alcance no dependan del equipo |
| Repartir la documentación desde el inicio y con fecha | Para no concentrar el cierre en una persona |
