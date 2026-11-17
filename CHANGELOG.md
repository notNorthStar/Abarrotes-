# Changelog

## v0.3.0 — Cierre del Sprint 3 · 15 nov 2026

5 historias, 23 puntos, integradas el 9 de noviembre. Producto acumulado: 70 de 80 puntos.

### Historias de usuario
- **HU-10** Registro de producto caducado o dañado: motivo obligatorio, descuento de existencias sin afectar la caja y rechazo si la cantidad supera la existencia. (#50, Miguel)
- **HU-13** Reporte semanal por sucursal (lunes a domingo): ingresos por forma de pago con efectivo neto de cambio, ventas, pagos a proveedor, productos agregados y mermas con su responsable; exportación a PDF. (#51, Miguel)
- **HU-11** El administrador opera como cajero con su propia caja; el corte queda por persona. (#53, Sosa)
- **HU-15** El jefe gestiona cuentas de administrador por sucursal: crear, suspender, reactivar, restablecer contraseña y eliminar (lógico). (#54, Sosa)
- **HU-07** Visitas de proveedores: el administrador las registra y el cajero las consulta por fecha y proveedor. (#56, Gonzalo)

### Dependencias
- `pdfkit` 0.17.2 para el PDF del reporte semanal.

### Documentación Scrum
- Tablero en GitHub Projects con un issue por historia y tarea; casos de uso y capturas del Sprint 3 (#55, #57); sprint backlog, burndown y burnup; review, retrospectiva y documento Scrum del Sprint 3.

### Calidad
- 194 pruebas automatizadas (31 web + 163 API), lint, tipos y build correctos en cada PR.

## v0.2.0 — Cierre del Sprint 2 (Sprint 1 + Sprint 2) · 29 oct 2026

Entrega: domingo 1 de noviembre de 2026. 9 historias, 47 puntos.

### Historias de usuario
- **HU-01** Inicio de sesión por rol; bloqueo de cuentas suspendidas, eliminadas y de sucursal inactiva. (#1)
- **HU-12** Gestión de cuentas de cajero: crear, suspender, reactivar, restablecer contraseña y eliminar (lógico). (#2)
- **HU-06** Cobro con efectivo, tarjeta y transferencia; pago mixto, cambio y descuento de existencias. (#3)
- **HU-08** Alta de productos y entrada de existencias con registro de quién y cuándo. (#7)
- **HU-03** Productos a granel con captura de peso en kg o g y cálculo del importe. (#8)
- **HU-04** Consulta de inventario por sucursal con búsqueda. (#9)
- **HU-09 / HU-05** Caja: abrir, pagos a proveedor, corte por forma de pago y cierre con diferencia. (#13)
- **HU-02** Escaneo por código de barras, búsqueda manual y edición de la cuenta. (#14)

### Interfaz
- Sistema visual "Mostrador": paleta cerrada, Geist / Geist Mono, barra lateral por rol, paleta de comandos (Ctrl K), atajos F2 y F9, pantalla de Inicio con skeletons. (#16)

### Documentación Scrum
- Backlog con criterios de aceptación, plan de entrega, minutas (re-planeación, ajustes de proceso, review y retro), burndown/burnup, diagrama de clases y ER, casos de uso (#10), prototipos (#15) y borrador del documento Scrum.

### Calidad
- 130 pruebas automatizadas (27 web + 103 API), lint y verificación de tipos en cada PR; ramas `main` y `develop` protegidas con revisión del Scrum Master.
