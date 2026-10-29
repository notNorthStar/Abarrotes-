# Changelog

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
