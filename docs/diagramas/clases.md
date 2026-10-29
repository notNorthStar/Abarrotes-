# Diagrama de clases — Abarrotes+

Generado desde `apps/api/prisma/schema.prisma` (fuente de verdad). Si el schema cambia, regenerar este diagrama. Los atributos con `?` son opcionales (pueden ser nulos). `Decimal` se guarda en la base como `Decimal(10,2)` (dinero) o `Decimal(10,3)` (cantidades y existencias a granel).

## Diagrama de clases

Imagen para el documento: [`img/clases.png`](img/clases.png)

```mermaid
classDiagram
    direction LR

    class Rol {
        <<enumeration>>
        CAJERO
        ADMIN
        JEFE
    }
    class Estado {
        <<enumeration>>
        ACTIVO
        SUSPENDIDO
        ELIMINADO
    }
    class UnidadVenta {
        <<enumeration>>
        PIEZA
        KILO
    }
    class MetodoPago {
        <<enumeration>>
        EFECTIVO
        TARJETA
        TRANSFERENCIA
    }
    class TipoMovimiento {
        <<enumeration>>
        ALTA
        ENTRADA
        VENTA
        MERMA
    }
    class MotivoMerma {
        <<enumeration>>
        CADUCADO
        DANADO
    }

    class Sucursal {
        +Int id
        +String nombre
        +String? direccion
        +Estado estado
        +DateTime creadoEn
    }
    class Usuario {
        +Int id
        +String nombre
        +String usuario
        +String passwordHash
        +Rol rol
        +Estado estado
        +Int? sucursalId
        +DateTime creadoEn
    }
    class Producto {
        +Int id
        +String codigoBarras
        +String nombre
        +Decimal precio
        +UnidadVenta unidad
        +Decimal existencia
        +Estado estado
        +Int sucursalId
        +DateTime creadoEn
    }
    class MovimientoInventario {
        +Int id
        +TipoMovimiento tipo
        +Decimal cantidad
        +MotivoMerma? motivo
        +String? comentario
        +Int productoId
        +Int usuarioId
        +DateTime creadoEn
    }
    class TurnoCaja {
        +Int id
        +Int usuarioId
        +Int sucursalId
        +Decimal montoInicial
        +DateTime abiertoEn
        +DateTime? cerradoEn
        +Decimal? efectivoEsperado
        +Decimal? efectivoContado
        +Decimal? diferencia
        +String? comentario
    }
    class Venta {
        +Int id
        +Int turnoId
        +Int usuarioId
        +Decimal total
        +Decimal cambio
        +DateTime creadoEn
    }
    class VentaRenglon {
        +Int id
        +Int ventaId
        +Int productoId
        +Decimal cantidad
        +Decimal precioUnitario
        +Decimal subtotal
    }
    class PagoVenta {
        +Int id
        +Int ventaId
        +MetodoPago metodo
        +Decimal monto
        +String? referencia
    }
    class Proveedor {
        +Int id
        +String nombre
    }
    class PagoProveedor {
        +Int id
        +Int turnoId
        +Int proveedorId
        +Decimal monto
        +MetodoPago metodo
        +String? comentario
        +DateTime creadoEn
    }
    class VisitaProveedor {
        +Int id
        +Int proveedorId
        +Int sucursalId
        +DateTime fecha
        +String? nota
    }

    Sucursal "0..1" -- "0..*" Usuario : usuarios
    Sucursal "1" -- "0..*" Producto : productos
    Sucursal "1" -- "0..*" TurnoCaja : turnos
    Sucursal "1" -- "0..*" VisitaProveedor : visitas
    Usuario "1" -- "0..*" TurnoCaja : turnos
    Usuario "1" -- "0..*" Venta : ventas
    Usuario "1" -- "0..*" MovimientoInventario : movimientos
    Producto "1" -- "0..*" MovimientoInventario : movimientos
    Producto "1" -- "0..*" VentaRenglon : renglones
    TurnoCaja "1" -- "0..*" Venta : ventas
    TurnoCaja "1" -- "0..*" PagoProveedor : pagosProveedor
    Venta "1" *-- "0..*" VentaRenglon : renglones
    Venta "1" *-- "0..*" PagoVenta : pagos
    Proveedor "1" -- "0..*" PagoProveedor : pagos
    Proveedor "1" -- "0..*" VisitaProveedor : visitas

    Usuario ..> Rol
    Usuario ..> Estado
    Sucursal ..> Estado
    Producto ..> Estado
    Producto ..> UnidadVenta
    MovimientoInventario ..> TipoMovimiento
    MovimientoInventario ..> MotivoMerma
    PagoVenta ..> MetodoPago
    PagoProveedor ..> MetodoPago
```

Restricciones de unicidad: `Usuario.usuario` es único global; `Proveedor.nombre` es único; `Producto` es único por `(sucursalId, codigoBarras)` (el mismo código puede existir en sucursales distintas).

## Decisiones de diseño

- **Multisucursal desde el inicio:** `Producto`, `TurnoCaja`, `VisitaProveedor` y `Usuario` pertenecen a una `Sucursal`; así HU-14 y HU-16 (Sprint 4) no obligan a migrar datos. `Usuario.sucursalId` es nulo solo para el rol `JEFE`, que opera sobre todas las sucursales.
- **Borrado lógico con `estado`:** `Sucursal`, `Usuario` y `Producto` usan el enum `Estado` (`ACTIVO`, `SUSPENDIDO`, `ELIMINADO`) en lugar de borrar renglones, para conservar el historial de ventas, turnos y movimientos (HU-12 CA3, HU-16).
- **`precioUnitario` copiado en el renglón:** `VentaRenglon` guarda el precio vigente al momento de vender; si después cambia `Producto.precio`, las ventas y cortes pasados no se alteran.
- **`MovimientoInventario` para trazabilidad:** cada alta, entrada, venta o merma registra quién (`usuarioId`), cuándo (`creadoEn`) y cuánto (`cantidad` con signo), base del reporte semanal (HU-13) y de las mermas (HU-10).
- **Pagos separados de la venta:** `PagoVenta` permite el pago mixto (HU-06) y `PagoProveedor` ligado a `TurnoCaja` permite calcular el efectivo esperado del corte (HU-05, HU-09).

## Diagrama ER (simplificado)

Imagen para el documento: [`img/er.png`](img/er.png)

```mermaid
erDiagram
    SUCURSAL |o--o{ USUARIO : "tiene"
    SUCURSAL ||--o{ PRODUCTO : "inventaria"
    SUCURSAL ||--o{ TURNO_CAJA : "abre"
    SUCURSAL ||--o{ VISITA_PROVEEDOR : "recibe"
    USUARIO ||--o{ TURNO_CAJA : "opera"
    USUARIO ||--o{ VENTA : "registra"
    USUARIO ||--o{ MOVIMIENTO_INVENTARIO : "realiza"
    PRODUCTO ||--o{ MOVIMIENTO_INVENTARIO : "se mueve en"
    PRODUCTO ||--o{ VENTA_RENGLON : "se vende en"
    TURNO_CAJA ||--o{ VENTA : "contiene"
    TURNO_CAJA ||--o{ PAGO_PROVEEDOR : "contiene"
    VENTA ||--o{ VENTA_RENGLON : "detalla"
    VENTA ||--o{ PAGO_VENTA : "se paga con"
    PROVEEDOR ||--o{ PAGO_PROVEEDOR : "recibe"
    PROVEEDOR ||--o{ VISITA_PROVEEDOR : "realiza"

    SUCURSAL {
        int id PK
        string nombre
        string estado
    }
    USUARIO {
        int id PK
        string usuario UK
        string rol
        string estado
        int sucursalId FK
    }
    PRODUCTO {
        int id PK
        string codigoBarras
        decimal precio
        string unidad
        decimal existencia
        int sucursalId FK
    }
    TURNO_CAJA {
        int id PK
        int usuarioId FK
        int sucursalId FK
        decimal montoInicial
        decimal efectivoEsperado
    }
    VENTA {
        int id PK
        int turnoId FK
        int usuarioId FK
        decimal total
        decimal cambio
    }
    VENTA_RENGLON {
        int id PK
        int ventaId FK
        int productoId FK
        decimal cantidad
        decimal precioUnitario
    }
    PAGO_VENTA {
        int id PK
        int ventaId FK
        string metodo
        decimal monto
    }
    MOVIMIENTO_INVENTARIO {
        int id PK
        int productoId FK
        int usuarioId FK
        string tipo
        decimal cantidad
    }
    PROVEEDOR {
        int id PK
        string nombre UK
    }
    PAGO_PROVEEDOR {
        int id PK
        int turnoId FK
        int proveedorId FK
        decimal monto
        string metodo
    }
    VISITA_PROVEEDOR {
        int id PK
        int proveedorId FK
        int sucursalId FK
        datetime fecha
    }
```
