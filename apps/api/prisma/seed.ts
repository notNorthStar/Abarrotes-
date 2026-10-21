// Datos de prueba. Borra todo y vuelve a crear. Contraseña de todos: abarrotes123
import 'dotenv/config'
import { PrismaClient, Rol, Estado, UnidadVenta } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const productosPieza: [string, string, string][] = [
  ['7501000000011', 'Coca-Cola 600 ml', '18.50'],
  ['7501000000028', 'Coca-Cola 2 L', '38.00'],
  ['7501000000035', 'Agua Ciel 1 L', '12.00'],
  ['7501000000042', 'Leche Lala entera 1 L', '28.50'],
  ['7501000000059', 'Pan Bimbo blanco grande', '52.00'],
  ['7501000000066', 'Huevo San Juan 12 pzas', '45.00'],
  ['7501000000073', 'Sabritas original 45 g', '19.00'],
  ['7501000000080', 'Galletas Marías Gamesa', '22.00'],
  ['7501000000097', 'Atún Dolores en agua', '24.50'],
  ['7501000000103', 'Frijoles La Sierra refritos', '21.00'],
  ['7501000000110', 'Aceite 1-2-3 1 L', '46.00'],
  ['7501000000127', 'Arroz Verde Valle 1 kg', '34.00'],
  ['7501000000134', 'Sopa Nissin vaso', '16.00'],
  ['7501000000141', 'Jabón Zote rosa', '20.00'],
  ['7501000000158', 'Papel higiénico Pétalo 4 rollos', '36.00'],
  ['7501000000165', 'Detergente Roma 1 kg', '39.00'],
  ['7501000000172', 'Café Nescafé clásico 120 g', '89.00'],
  ['7501000000189', 'Azúcar Zulka 1 kg', '32.00'],
  ['7501000000196', 'Mayonesa McCormick 390 g', '42.00'],
  ['7501000000202', 'Chiles La Costeña 220 g', '17.50'],
]

const productosKilo: [string, string, string][] = [
  ['2000000000015', 'Jitomate saladet', '28.90'],
  ['2000000000022', 'Cebolla blanca', '24.50'],
  ['2000000000039', 'Plátano tabasco', '19.90'],
  ['2000000000046', 'Frijol negro a granel', '36.00'],
  ['2000000000053', 'Azúcar estándar a granel', '29.50'],
  ['2000000000060', 'Limón con semilla', '32.00'],
]

async function main() {
  // Orden inverso de dependencias
  await prisma.pagoVenta.deleteMany()
  await prisma.ventaRenglon.deleteMany()
  await prisma.venta.deleteMany()
  await prisma.pagoProveedor.deleteMany()
  await prisma.turnoCaja.deleteMany()
  await prisma.movimientoInventario.deleteMany()
  await prisma.visitaProveedor.deleteMany()
  await prisma.proveedor.deleteMany()
  await prisma.producto.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.sucursal.deleteMany()

  const centro = await prisma.sucursal.create({ data: { nombre: 'Centro', direccion: 'Av. Xalapa 100' } })
  const norte = await prisma.sucursal.create({ data: { nombre: 'Norte', direccion: 'Calle Norte 25' } })

  const passwordHash = await bcrypt.hash('abarrotes123', 10)
  const usuarios: { nombre: string; usuario: string; rol: Rol; sucursalId: number | null; estado?: Estado }[] = [
    { nombre: 'Jefe General', usuario: 'jefe', rol: Rol.JEFE, sucursalId: null },
    { nombre: 'Admin Centro', usuario: 'admin.centro', rol: Rol.ADMIN, sucursalId: centro.id },
    { nombre: 'Cajero Uno', usuario: 'cajero1', rol: Rol.CAJERO, sucursalId: centro.id },
    { nombre: 'Cajero Dos', usuario: 'cajero2', rol: Rol.CAJERO, sucursalId: centro.id },
    { nombre: 'Cajero Norte', usuario: 'cajero.norte', rol: Rol.CAJERO, sucursalId: norte.id },
    { nombre: 'Cajero Suspendido', usuario: 'suspendido', rol: Rol.CAJERO, sucursalId: centro.id, estado: Estado.SUSPENDIDO },
  ]
  for (const u of usuarios) {
    await prisma.usuario.create({ data: { ...u, passwordHash } })
  }
  const admin = await prisma.usuario.findUniqueOrThrow({ where: { usuario: 'admin.centro' } })

  for (const sucursal of [centro, norte]) {
    const lista = [
      ...productosPieza.map(([codigo, nombre, precio]) => ({ codigo, nombre, precio, unidad: UnidadVenta.PIEZA, existencia: '50' })),
      ...productosKilo.map(([codigo, nombre, precio]) => ({ codigo, nombre, precio, unidad: UnidadVenta.KILO, existencia: '25.000' })),
    ]
    for (const p of lista) {
      await prisma.producto.create({
        data: {
          codigoBarras: p.codigo,
          nombre: p.nombre,
          precio: p.precio,
          unidad: p.unidad,
          existencia: p.existencia,
          sucursalId: sucursal.id,
          movimientos: { create: { tipo: 'ALTA', cantidad: p.existencia, usuarioId: admin.id } },
        },
      })
    }
  }

  await prisma.proveedor.createMany({ data: [{ nombre: 'Coca-Cola FEMSA' }, { nombre: 'Bimbo' }] })

  console.log('Seed listo: 2 sucursales, 6 usuarios (contraseña abarrotes123), 52 productos, 2 proveedores')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
