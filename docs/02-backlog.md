# 02 · Product Backlog con criterios de aceptación

16 historias, 80 puntos, velocidad planeada ≈ 24 pts/sprint. Los **criterios de aceptación (CA)** salen de las aclaraciones del Planning Poker; son el contrato para implementar y probar cada HU. Si algo no está aquí, **no se inventa**: se anota como duda en el PR y se pregunta al equipo.

| Prio | HU | Nombre | Valor | Pts | Sprint | Responsable |
|---|---|---|---|---|---|---|
| 1 | HU-01 | Inicio de sesión | Alto | 3 | 1 | Sosa |
| 2 | HU-06 | Cobros con tarjeta, efectivo y transferencia | Alto | 8 | 1 | Sosa |
| 3 | HU-02 | Cobrar productos con código de barras | Alto | 5 | 1 | Gonzalo |
| 4 | HU-03 | Producto a granel (peso/cantidad) | Alto | 8 | 1 | Miguel |
| 5 | HU-09 | Registrar pagos a proveedores | Alto | 3 | 2 | Gonzalo |
| 6 | HU-05 | Corte y cierre de caja | Alto | 8 | 2 | Gonzalo |
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

---

## Sprint 1 — "Que un cajero pueda iniciar sesión y cobrar una venta completa" (24 pts)

### HU-01 · Inicio de sesión (3 pts) — Sosa
> Como cajero/administrador/jefe quiero acceder a mi cuenta con usuario y contraseña para poder acceder a mis funciones.

- CA1: Login con **usuario + contraseña**. Contraseñas guardadas con hash (bcrypt).
- CA2: Al entrar, **redirige según rol** (cajero → pantalla de venta; admin/jefe → panel).
- CA3: Credenciales incorrectas → mensaje genérico ("Usuario o contraseña incorrectos").
- CA4: Usuario **suspendido o eliminado** (o de sucursal suspendida) no puede iniciar sesión.
- CA5: Cerrar sesión.
- Fuera de alcance: recuperación de contraseña por correo y bloqueo por intentos (la contraseña la restablece el admin/jefe).
- Nota técnica: el **control de roles** (middleware + guard de rutas en front) se reutiliza en todas las demás HU.

### HU-06 · Cobros con tarjeta, efectivo y transferencia (8 pts) — Sosa
> Como cajero quiero cobrar con efectivo, tarjeta y transferencia.

- CA1: Se puede cobrar con **efectivo, tarjeta o transferencia**.
- CA2: **Pago mixto**: una venta puede pagarse combinando métodos (p. ej. parte efectivo, parte tarjeta).
- CA3: Tarjeta y transferencia solo **registran método + número de referencia**; **no hay conexión con banco/terminal**.
- CA4: Si hay efectivo, el sistema **calcula el cambio** (efectivo recibido − saldo pendiente).
- CA5: No se puede confirmar la venta si la suma de pagos < total. Tarjeta/transferencia no pueden exceder el saldo (solo el efectivo genera cambio).
- CA6: Al confirmar: se guarda la venta con su detalle y pagos, y **se descuenta la existencia** de cada producto (en una transacción).

### HU-02 · Cobrar productos con código de barras (5 pts) — Gonzalo
> Como cajero quiero escanear el código de barras de un producto para agregarlo a la cuenta del cliente.

- CA1: Lector **USB tipo teclado** (escribe el código + Enter en un input con foco). Sin integración especial.
- CA2: Escanear un producto lo agrega a la cuenta; **escanear de nuevo el mismo producto suma cantidad**.
- CA3: Código no encontrado → **aviso** y opción de **búsqueda manual** por nombre.
- CA4: Se puede quitar un renglón o cambiar su cantidad antes de cobrar.
- CA5: Muestra subtotal por renglón y total de la cuenta en tiempo real.
- Nota: el input de escaneo debe recuperar el foco después de cada acción.

### HU-03 · Producto a granel con cálculo automático (8 pts) — Miguel
> Como cajero quiero agregar el peso o cantidad de un producto a granel (frutas, semillas…) y que el sistema calcule el precio y lo agregue a la cuenta.

- CA1: Cada producto tiene **unidad de venta: `PIEZA` o `KILO`**.
- CA2: Al agregar un producto por kilo se abre captura de **peso manual** (sin báscula conectada).
- CA3: Peso en **kg con hasta 3 decimales**; se permite capturar en gramos y se convierte (÷1000).
- CA4: **Precio = peso × precio por kg, redondeado a 2 decimales (half-up)**.
- CA5: Validaciones: peso > 0, numérico, máx. 3 decimales; productos por pieza solo aceptan enteros.
- CA6: El renglón muestra peso, precio/kg y subtotal; se integra al mismo carrito de HU-02.

## Sprint 2 — "Que un cajero opere un turno completo con su caja cuadrada y el admin gestione cajeros y productos" (23 pts)

### HU-09 · Registrar pagos a proveedores (3 pts) — Gonzalo
> Como cajero quiero registrar los pagos que haga a proveedores para que el dinero coincida con el corte de caja.

- CA1: Campos: **monto, proveedor, forma de pago, comentario**.
- CA2: Pago en **efectivo** sale de la caja → **se resta del efectivo esperado** en el corte (HU-05).
- CA3: Pago por **transferencia** solo se registra; **no afecta** el efectivo esperado.
- CA4: Requiere caja (turno) abierta; queda ligado al turno y al usuario.

### HU-05 · Corte y cierre de caja (8 pts) — Gonzalo
> Como cajero quiero saber el dinero disponible al abrir y cerrar mi caja para ver que coincida con las ventas.

- CA1: **Abrir caja** con monto inicial. Una caja (turno) por cajero en turno. Sin caja abierta no se puede vender ni registrar pagos.
- CA2: El corte muestra totales **separados por forma de pago** (efectivo, tarjeta, transferencia).
- CA3: **Efectivo esperado = monto inicial + ventas en efectivo (neto de cambio) − pagos a proveedor en efectivo**.
- CA4: Al cerrar, el cajero captura el **efectivo contado**; el sistema muestra la **diferencia** (sobrante/faltante).
- CA5: **Comentario obligatorio** al cerrar _(interpretación: obligatorio cuando la diferencia ≠ 0; confirmar con PO)_.
- Fuera de alcance: reporte detallado del corte (va en HU-13).

### HU-12 · Gestión de cuentas de cajero (5 pts) — Sosa
> Como administrador quiero añadir, suspender y eliminar cuentas de cajero.

- CA1: Admin crea cajeros (nombre, usuario, contraseña) **solo en su sucursal**.
- CA2: **Suspender** bloquea el inicio de sesión; se puede reactivar.
- CA3: **Eliminar es lógico** (estado `ELIMINADO`), se conserva el historial de operaciones.
- CA4: Admin **solo ve cajeros de su sucursal**.
- CA5: Admin puede restablecer la contraseña de un cajero (cubre la "recuperación" de HU-01).
- Nota: construir de forma reutilizable — HU-15 (cuentas de admin) la reutiliza.

### HU-04 · Revisar el inventario (2 pts) — Miguel
> Como cajero quiero acceder al inventario para saber precio y cantidad de productos.

- CA1: Solo **consulta** (sin editar): precio, existencia, unidad.
- CA2: **Búsqueda por nombre o código**.
- CA3: Solo productos de la sucursal del usuario.

### HU-08 · Agregar productos (5 pts) — Sosa (reasignada de Miguel el 26 oct)
> Como cajero quiero agregar productos al inventario para no depender del administrador en días de visita de proveedores.

- CA1: **Alta de producto nuevo**: código de barras, nombre, precio, unidad (pieza/kilo), cantidad.
- CA2: **Sumar existencias** a un producto existente (buscar por código).
- CA3: Código de barras **único por sucursal**.
- CA4: **Sin aprobación del admin** en esta versión.
- CA5: Se registra **quién y cuándo** agregó (para HU-13): tabla de movimientos de inventario.
- Nota: por la jerarquía de roles, **admin y jefe también pueden** dar de alta productos y registrar entradas (pantalla "Agregar productos").

---

## Sprint 3 y 4 (referencia, no se entregan el 1 de nov)

- **HU-10** Merma caducado/dañado (3): sin autorización; motivo obligatorio; descuenta inventario; aparece en reporte semanal.
- **HU-11** Operaciones de cajero para admin (2): permisos de cajero al admin; el admin abre su propia caja.
- **HU-15** Cuentas de administrador (3): igual que HU-12 pero el jefe gestiona admins; eliminación lógica.
- **HU-07** Visitas de proveedores (2): el admin las registra; vista de lista por fecha y proveedor.
- **HU-13** Reporte semanal por sucursal (13): ingresos, pagos, productos agregados, quién hizo cada operación; tabla + **exportar PDF**; sin gráficas.
- **HU-14** Operaciones de admin para jefe (2): permisos de admin al jefe + **selector de sucursal**.
- **HU-16** Gestión de sucursales (8): crear/suspender/eliminar; sucursal suspendida → bloquea acceso de sus usuarios, el inventario se conserva.
