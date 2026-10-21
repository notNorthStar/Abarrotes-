# 05 · Modelo de datos

> **Fuente de verdad:** `apps/api/prisma/schema.prisma`. El bloque de abajo es una referencia de lectura (el real agrega las relaciones inversas, p. ej. `VentaRenglon.producto` y `VisitaProveedor.sucursal`).

La estructura **multisucursal se define desde el Sprint 1** (aunque HU-16 se construya en el Sprint 4). Este schema es el punto de partida de T-00; incluye ya las tablas de sprints futuros para no romper migraciones después. **Cambios al schema: solo por PR propio y avisando al equipo.**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Rol {
  CAJERO
  ADMIN
  JEFE
}

enum Estado {
  ACTIVO
  SUSPENDIDO
  ELIMINADO
}

enum UnidadVenta {
  PIEZA
  KILO
}

enum MetodoPago {
  EFECTIVO
  TARJETA
  TRANSFERENCIA
}

enum TipoMovimiento {
  ALTA
  ENTRADA
  VENTA
  MERMA
}

enum MotivoMerma {
  CADUCADO
  DANADO
}

model Sucursal {
  id        Int      @id @default(autoincrement())
  nombre    String
  direccion String?
  estado    Estado   @default(ACTIVO)
  creadoEn  DateTime @default(now())
  usuarios  Usuario[]
  productos Producto[]
  turnos    TurnoCaja[]
}

model Usuario {
  id           Int      @id @default(autoincrement())
  nombre       String
  usuario      String   @unique
  passwordHash String
  rol          Rol
  estado       Estado   @default(ACTIVO)
  sucursalId   Int?     // null solo para JEFE
  sucursal     Sucursal? @relation(fields: [sucursalId], references: [id])
  creadoEn     DateTime @default(now())
  turnos       TurnoCaja[]
  ventas       Venta[]
  movimientos  MovimientoInventario[]
}

model Producto {
  id           Int         @id @default(autoincrement())
  codigoBarras String
  nombre       String
  precio       Decimal     @db.Decimal(10, 2)  // por pieza o por kg
  unidad       UnidadVenta @default(PIEZA)
  existencia   Decimal     @db.Decimal(10, 3)  @default(0)
  estado       Estado      @default(ACTIVO)
  sucursalId   Int
  sucursal     Sucursal    @relation(fields: [sucursalId], references: [id])
  creadoEn     DateTime    @default(now())
  movimientos  MovimientoInventario[]
  @@unique([sucursalId, codigoBarras])
}

// Quién movió inventario y cuándo (HU-08, HU-10, HU-13)
model MovimientoInventario {
  id         Int            @id @default(autoincrement())
  tipo       TipoMovimiento
  cantidad   Decimal        @db.Decimal(10, 3) // + entra, - sale
  motivo     MotivoMerma?
  comentario String?
  productoId Int
  producto   Producto       @relation(fields: [productoId], references: [id])
  usuarioId  Int
  usuario    Usuario        @relation(fields: [usuarioId], references: [id])
  creadoEn   DateTime       @default(now())
}

model TurnoCaja {
  id             Int       @id @default(autoincrement())
  usuarioId      Int
  usuario        Usuario   @relation(fields: [usuarioId], references: [id])
  sucursalId     Int
  sucursal       Sucursal  @relation(fields: [sucursalId], references: [id])
  montoInicial   Decimal   @db.Decimal(10, 2)
  abiertoEn      DateTime  @default(now())
  cerradoEn      DateTime?
  efectivoEsperado Decimal? @db.Decimal(10, 2)
  efectivoContado  Decimal? @db.Decimal(10, 2)
  diferencia     Decimal?  @db.Decimal(10, 2)
  comentario     String?
  ventas         Venta[]
  pagosProveedor PagoProveedor[]
}

model Venta {
  id        Int       @id @default(autoincrement())
  turnoId   Int
  turno     TurnoCaja @relation(fields: [turnoId], references: [id])
  usuarioId Int
  usuario   Usuario   @relation(fields: [usuarioId], references: [id])
  total     Decimal   @db.Decimal(10, 2)
  cambio    Decimal   @db.Decimal(10, 2) @default(0)
  creadoEn  DateTime  @default(now())
  renglones VentaRenglon[]
  pagos     PagoVenta[]
}

model VentaRenglon {
  id             Int      @id @default(autoincrement())
  ventaId        Int
  venta          Venta    @relation(fields: [ventaId], references: [id])
  productoId     Int
  cantidad       Decimal  @db.Decimal(10, 3)
  precioUnitario Decimal  @db.Decimal(10, 2) // copia del precio al momento de vender
  subtotal       Decimal  @db.Decimal(10, 2)
}

model PagoVenta {
  id         Int        @id @default(autoincrement())
  ventaId    Int
  venta      Venta      @relation(fields: [ventaId], references: [id])
  metodo     MetodoPago
  monto      Decimal    @db.Decimal(10, 2) // en EFECTIVO: lo recibido
  referencia String?    // TARJETA / TRANSFERENCIA
}

model Proveedor {
  id      Int     @id @default(autoincrement())
  nombre  String  @unique
  pagos   PagoProveedor[]
  visitas VisitaProveedor[]
}

model PagoProveedor {
  id          Int        @id @default(autoincrement())
  turnoId     Int
  turno       TurnoCaja  @relation(fields: [turnoId], references: [id])
  proveedorId Int
  proveedor   Proveedor  @relation(fields: [proveedorId], references: [id])
  monto       Decimal    @db.Decimal(10, 2)
  metodo      MetodoPago // EFECTIVO o TRANSFERENCIA
  comentario  String?
  creadoEn    DateTime   @default(now())
}

// HU-07 (Sprint 3)
model VisitaProveedor {
  id          Int       @id @default(autoincrement())
  proveedorId Int
  proveedor   Proveedor @relation(fields: [proveedorId], references: [id])
  sucursalId  Int
  fecha       DateTime
  nota        String?
}
```

## Reglas de cálculo

```
subtotal renglón        = round2(cantidad × precioUnitario)
total venta             = Σ subtotales
cambio                  = max(0, Σ pagos − total)          // solo puede venir del efectivo
ventas efectivo netas   = Σ PagoVenta[EFECTIVO].monto − Σ Venta.cambio   (del turno)
efectivo esperado       = montoInicial + ventas efectivo netas − Σ PagoProveedor[EFECTIVO].monto
diferencia              = efectivoContado − efectivoEsperado   // + sobrante, − faltante
```

## Seed mínimo

- 1 sucursal "Centro" (+ 1 "Norte" para probar aislamiento).
- Usuarios (contraseña `abarrotes123`): `jefe` (JEFE), `admin.centro` (ADMIN), `cajero1`, `cajero2` (CAJERO, Centro), `cajero.norte` (CAJERO, Norte), `suspendido` (CAJERO, SUSPENDIDO).
- ~20 productos por pieza con códigos EAN reales-ish (`7501000000011`…) y ~6 por kilo (jitomate, frijol, azúcar…).
- 2 proveedores.
