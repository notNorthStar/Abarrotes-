# PRs preparados para revisión de Sosa

Base de integración: `develop`. Reviewer: `notNorthStar`. Cambios separados en hu-03-granel, hu-04-inventario y doc-casos-de-uso, creadas desde develop. Cada PR contiene únicamente su historia o documentación. La integración corresponde a Sosa.

## [HU-03] Captura manual de productos a granel

**Responsable:** Miguel Angel Marcelo Taracena · **Reviewer:** @notNorthStar

Al seleccionar un producto por kilo, el cajero captura el peso en kg o gramos y ve el precio antes de agregarlo a la cuenta. Por ejemplo, 750 g de jitomate a $28.90/kg producen 0.750 kg y un subtotal de $21.68.

- [x] CA1: reconoce unidades PIEZA y KILO del contrato existente.
- [x] CA2: captura manual al seleccionar producto por kilo.
- [x] CA3: kilos con hasta 3 decimales y conversión exacta desde gramos.
- [x] CA4: subtotal con Decimal y redondeo half-up a 2 decimales.
- [x] CA5: rechaza cero, negativos, texto y exceso de precisión; API rechaza piezas fraccionarias.
- [x] CA6: muestra peso, precio/kg y subtotal en el carrito compartido.

**Archivos:** `apps/web/src/features/venta/granel/`, `VentaPage.tsx`, `apps/api/src/modules/productos/granel.test.ts`, configuración de Vitest web, scripts de pruebas de raíz/web y capturas de granel.

**Cómo probar:** seguir pasos 1–4 de [la guía](README.md), ejecutar `npm test`, `npm run lint` y `npm run build`.

**Validación:** 17 pruebas web + 83 API correctas; lint y build correctos; recorrido real en Edge sin errores JavaScript. Se usa el contrato del store de Gonzalo; no se modificó el store, el cobro ni el servicio de ventas de Sosa. Las pruebas de ventas se añadieron dentro del módulo de productos de Miguel. Sin dependencias nuevas de aplicación. PostgreSQL portátil se usó únicamente como entorno local excluido de Git.

**Decisión de captura:** se admiten gramos enteros para conservar una precisión máxima de 0.001 kg. Cambiar kg/g limpia el campo y lo indica en pantalla para evitar reinterpretar el peso anterior.

**Capturas:** [captura de peso](granel-captura.png), [carrito](granel-carrito.png).

## [HU-04] Consulta de inventario por sucursal

**Responsable:** Miguel Angel Marcelo Taracena · **Reviewer:** @notNorthStar

Sustituye la pantalla pendiente por una consulta de inventario con búsqueda por nombre o código. Permite consultar precio, unidad y existencia sin modificar productos y muestra los errores con opción de reintento.

- [x] CA1: solo consulta de precio, existencia y unidad.
- [x] CA2: búsqueda por nombre o código.
- [x] CA3: datos limitados a la sucursal autenticada mediante la API existente.

**Archivos:** `InventarioPage.tsx`, `apps/api/src/modules/productos/productos.test.ts`, captura de inventario.

**Cómo probar:** paso 5 de [la guía](README.md); buscar `coca`, `7501000000011` y un nombre inexistente. Probar cajeros Centro y Norte. Las pruebas incluyen intento de manipular `sucursalId`.

**Validación:** suite API de 83 pruebas correcta, lint y build correctos, búsqueda y vacío comprobados en Edge. No cambia la API, el schema ni HU-08. El listado existente devuelve hasta 50 productos; la pantalla lo informa y ofrece búsqueda. El selector de sucursal del JEFE corresponde a HU-14 y sigue fuera de esta historia.

**Captura:** [inventario](inventario.png).

## [D-01] Casos de uso de los sprints 1 y 2

**Responsable:** Miguel Angel Marcelo Taracena · **Reviewer:** @notNorthStar

Añade el diagrama Mermaid con cajero, administrador y jefe, junto con nueve descripciones trazadas al backlog: objetivo, precondiciones, flujo principal, alternativas y postcondiciones. Incluye evidencias reales de las pantallas de Miguel y guía de demo.

**Validación:** nueve casos documentados, enlaces locales revisados. La duda HU-05 CA5 conserva su estado sin inventar una decisión del equipo.

**Pendiente del equipo:** incorporar los prototipos restantes de Gonzalo y exportar el diagrama para el documento final. No se afirma que historias ajenas estén terminadas ni se cambia su estado.
