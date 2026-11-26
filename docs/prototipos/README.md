# Prototipos de pantallas y alertas · D-02

**Responsable:** Miguel Angel Marcelo Taracena, reasignado de Gonzalo el 28 de octubre de 2026.

Las imágenes de este catálogo son capturas de las pantallas reales de Abarrotes+, usadas como prototipos iterados para el documento Scrum (§4.6–4.7). No son wireframes previos ni certifican por sí mismas que una historia esté aprobada: el estado de integración se consulta en el [sprint backlog](../scrum/sprint-backlog.md).

**Capturas actualizadas el 29 de octubre de 2026** al sistema visual "Mostrador" (ver `docs/diseno/README.md`): ocho pantallas y cuatro alertas reales, generadas en Edge a 1440×900 con datos locales de ejemplo. La primera versión (28 oct) la hizo Miguel. Se comprobó el recorrido completo de escaneo a cobro y cierre de caja, sin errores de JavaScript. Se usa el teclado para reproducir el comportamiento del lector USB; no se ha probado un dispositivo físico.

## Pantallas principales

| Referencia | Pantalla / ruta | Historia | Imagen | Qué permite revisar |
|---|---|---|---|---|
| P-00 | Inicio · `/` | — | [inicio.png](img/inicio.png) | Resumen del turno, acciones rápidas, actividad y productos por reponer (con skeletons al cargar). |
| P-01 | Acceso · `/login` | HU-01 | [login.png](img/login.png) | Usuario, contraseña y acceso a las funciones del rol. |
| P-02 | Venta · `/venta` | HU-02, HU-03 | [venta.png](img/venta.png) | Escaneo, búsqueda manual, edición de cantidades, retiro de renglones, productos a granel y total. |
| P-03 | Cobro · `/venta` | HU-06 | [cobro.png](img/cobro.png) | Métodos de pago, referencia, total, pagado y cambio. |
| P-04 | Inventario · `/inventario` | HU-04 | [inventario.png](img/inventario.png) | Precio, existencia, unidad y búsqueda por nombre o código de la sucursal. |
| P-05 | Caja · `/caja` | HU-05, HU-09 | [caja.png](img/caja.png) | Apertura, corte por método de pago, pagos a proveedores y cierre. |
| P-06 | Agregar productos · `/productos/nuevo` | HU-08 | [productos.png](img/productos.png) | Alta de producto y entrada de existencias a uno registrado. |
| P-07 | Cuentas de cajero · `/usuarios` | HU-12 | [cajeros.png](img/cajeros.png) | Alta, estado de cuenta y acciones de gestión para el administrador. |
| P-08 | Registrar merma · `/mermas` | HU-10 | [merma.png](img/merma.png) | Búsqueda del producto, existencia, cantidad, motivo y comentario de la merma. |
| P-09 | Reporte semanal · `/reportes` | HU-13 | [reporte.png](img/reporte.png) | Semana de lunes a domingo, ingresos por forma de pago, ventas con su responsable y exportación a PDF. |
| P-10 | Cuentas de administrador · `/administradores` | HU-15 | [administradores.png](img/administradores.png) | Selector de sucursal, alta, estado de cuenta y acciones de gestión para el jefe. |
| P-11 | Visitas de proveedores · `/proveedores` | HU-07 | [proveedores.png](img/proveedores.png) | Registro de visitas del administrador y lista por fecha y proveedor con filtros de próximas y pasadas. |
| P-12 | Selector de sucursal del jefe · barra superior | HU-14 | [jefe-inventario-centro.png](img/jefe-inventario-centro.png) · [jefe-venta-norte.png](img/jefe-venta-norte.png) | El jefe elige la sucursal y opera en ella: inventario de Centro y venta en Norte con búsqueda en vivo. |
| P-13 | Sucursales · `/sucursales` | HU-16 | [sucursales.png](img/sucursales.png) · [sucursales-confirmar-suspender.png](img/sucursales-confirmar-suspender.png) | Alta, lista con estado, suspender, reactivar y eliminar; confirmación con Enter o Esc. |
| P-14 | Teléfono · `/` y `/venta` | Diseño responsivo | [movil-inicio.png](img/movil-inicio.png) · [movil-venta.png](img/movil-venta.png) | La misma aplicación a 390×844: menú lateral plegable, tarjetas apiladas y venta con búsqueda en vivo. |

Las pantallas P-12 a P-14 son del Sprint 4 (D-06, Sosa, reasignada de Gonzalo el 26 de noviembre). Se capturaron el 26 de noviembre de 2026; ese día también se actualizó [login.png](img/login.png) al acceso rediseñado (logotipo, galería de arte y mostrar contraseña, T-35 y T-36). Se relacionan con [casos-de-uso-sprint-4.md](../diagramas/casos-de-uso-sprint-4.md).

Las pantallas P-08 a P-11 son del Sprint 3 (D-04, Sosa). Se capturaron el 9 de noviembre de 2026 con el mismo procedimiento, y se relacionan con [casos-de-uso-sprint-3.md](../diagramas/casos-de-uso-sprint-3.md).

## Alertas

| Referencia | Situación | Resultado que debe verse | Imagen |
|---|---|---|---|
| A-01 / P-02 | Escanear un código que no existe en la sucursal. | Aviso de producto no encontrado y opción para buscar por nombre. | [alerta-producto-no-encontrado.png](img/alerta-producto-no-encontrado.png) |
| A-02 / P-03 | Intentar confirmar una venta con una suma de pagos menor al total. | Pago insuficiente y monto faltante; no se registra la venta. | [alerta-pago-insuficiente.png](img/alerta-pago-insuficiente.png) |
| A-03 / P-05 | Capturar un efectivo contado distinto del esperado en el cierre. | Sobrante o faltante y solicitud de comentario para explicar la diferencia. | [alerta-diferencia-corte.png](img/alerta-diferencia-corte.png) |
| A-04 / P-01 | Entrar con la cuenta de ejemplo `suspendido` y su contraseña válida. | Acceso bloqueado por cuenta suspendida. | [alerta-usuario-suspendido.png](img/alerta-usuario-suspendido.png) |
| A-05 / P-08 | Registrar una merma mayor que la existencia del producto. | «La cantidad supera la existencia disponible»; el inventario no cambia. | [alerta-merma-sin-existencia.png](img/alerta-merma-sin-existencia.png) |
| A-06 / P-01 | Entrar con un cajero de una sucursal suspendida (en la captura, Poniente). | «Tu sucursal no está activa. Contacta al jefe.»; no se inicia sesión. | [alerta-sucursal-suspendida.png](img/alerta-sucursal-suspendida.png) |

## Cómo reproducir las capturas

Usar la base local con datos de ejemplo. Los usuarios de ejemplo comparten la contraseña `abarrotes123`.

1. Capturar P-01 antes de autenticarse. Para A-04, intentar entrar como `suspendido` y conservar el mensaje de rechazo.
2. Entrar como `cajero1` para la venta y abrir su caja con $100 de ejemplo antes de confirmar cobros. La captura P-05 usa `cajero2`, con $200 iniciales y $197 contados para demostrar la diferencia.
3. En Venta, escanear `7501000000011` (Coca-Cola 600 ml), repetir el código y comprobar que aumenta la cantidad. Agregar un producto a granel y capturar P-02.
4. Escanear un código inexistente y capturar A-01 con el acceso a búsqueda manual.
5. Abrir Cobro para P-03. Para A-02, disminuir el pago por debajo del total e intentar confirmar. No registrar una venta únicamente para producir una captura de error.
6. En Caja, capturar efectivo contado distinto del esperado; registrar A-03 antes de cerrar. Así se conserva el turno para seguir la demostración.
7. Capturar P-04, P-06 y P-07 con `admin.centro`, que tiene acceso al inventario y a la gestión de cajeros.
8. Sprint 3: con `cajero1`, en Registrar merma buscar «Coca», elegir Coca-Cola 600 ml, capturar 2 piezas como caducado y tomar P-08 sin confirmar. Para A-05, cambiar la cantidad a 999 y confirmar. Con `admin.centro` capturar P-09 y, después de registrar una visita de Bimbo para el 12 de noviembre, P-11; con `jefe`, P-10.

9. Sprint 4: con `jefe`, elegir Centro en el selector y abrir Inventario (P-12); elegir Norte, abrir Venta y escribir «Coca». En Sucursales capturar la lista (P-13) y, con Suspender de Sur, el diálogo de confirmación; cancelar con Esc. Para A-06, crear una sucursal con un cajero, suspenderla e intentar entrar con ese cajero. Para P-14, entrar como `cajero1` a 390×844.

Las capturas se guardan en `img/` y se relacionan con las nueve descripciones en [casos-de-uso.md](../diagramas/casos-de-uso.md). No incluyen contraseñas visibles, tokens ni datos ajenos a los ejemplos locales.
