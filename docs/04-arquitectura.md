# 04 · Arquitectura y convenciones

## Stack

| Capa | Tecnología |
|---|---|
| Front | React 18 + Vite + TypeScript, React Router, Tailwind CSS |
| API | Node 20 + Express + TypeScript, Zod (validación), JWT (auth), bcrypt |
| BD | PostgreSQL 16 (Docker) + Prisma ORM |
| Pruebas | Vitest + supertest (API), Vitest + Testing Library (front, opcional) |
| Calidad | ESLint + Prettier |

Monorepo con **npm workspaces**.

## Estructura

```
Abarrotes+/
├─ AGENTS.md / CLAUDE.md        # instrucciones para la IA
├─ docker-compose.yml           # postgres
├─ package.json                 # workspaces + scripts raíz
├─ apps/
│  ├─ api/
│  │  ├─ prisma/
│  │  │  ├─ schema.prisma
│  │  │  └─ seed.ts             # sucursal, usuarios de prueba, productos (pieza y kilo)
│  │  └─ src/
│  │     ├─ app.ts              # express app (exportada para supertest)
│  │     ├─ server.ts
│  │     ├─ lib/                # prisma client, errores, dinero
│  │     ├─ middleware/         # auth (JWT), requireRol, manejo de errores
│  │     └─ modules/
│  │        ├─ auth/            # HU-01
│  │        ├─ usuarios/        # HU-12, HU-15
│  │        ├─ productos/       # HU-03, HU-04, HU-08
│  │        ├─ ventas/          # HU-02 (lookup), HU-06
│  │        └─ caja/            # HU-05, HU-09
│  │           ├─ caja.routes.ts
│  │           ├─ caja.service.ts
│  │           ├─ caja.schemas.ts   # zod
│  │           └─ caja.test.ts
│  └─ web/
│     └─ src/
│        ├─ api/client.ts       # fetch con token
│        ├─ auth/               # contexto de sesión, RequireRol
│        ├─ components/         # UI compartida (Button, Modal, Alert…)
│        └─ features/
│           ├─ venta/           # carrito, escaneo, granel, cobro
│           ├─ caja/            # abrir, pagos proveedor, corte
│           ├─ inventario/
│           └─ usuarios/
└─ docs/
```

Cada módulo de API = `routes` (HTTP, sin lógica) → `service` (reglas de negocio, Prisma) → `schemas` (Zod). **La lógica de negocio va en el service** para poder probarla.

## Convenciones

- **Idioma:** dominio en español sin acentos (`Producto`, `Venta`, `turnoCaja`, `precioUnitario`); términos técnicos en inglés (`routes`, `service`, `middleware`). UI y mensajes en español.
- **Dinero:** `Decimal(10,2)` en BD; en JS usar el helper `lib/dinero.ts` (centavos enteros o `Prisma.Decimal`), **nunca `float` para sumar dinero**. Redondeo half-up a 2 decimales.
- **Cantidades:** `Decimal(10,3)` (kg con 3 decimales; pieza = entero).
- **Fechas:** UTC en BD; se muestran en hora de México.
- **Borrado:** siempre **lógico** (`estado = ELIMINADO`) para usuarios, productos y sucursales.
- **Multisucursal:** toda consulta de negocio filtra por `sucursalId` del usuario autenticado (salvo JEFE). Nunca confiar en un `sucursalId` que mande el cliente si el rol no es JEFE.
- **Operaciones de dinero o inventario** en `prisma.$transaction`.
- **Errores:** lanzar `AppError(status, mensaje)`; el middleware responde `{ error: "mensaje" }`.

## API (contrato inicial)

Base: `/api`. Auth: header `Authorization: Bearer <jwt>`. Payload del JWT: `{ sub, rol, sucursalId }`.

| Método | Ruta | Rol mín. | HU |
|---|---|---|---|
| POST | `/auth/login` | — | 01 |
| GET | `/auth/me` | CAJERO | 01 |
| GET | `/productos?q=` | CAJERO | 04, 02 (búsqueda manual) |
| GET | `/productos/codigo/:codigo` | CAJERO | 02 |
| POST | `/productos` | CAJERO | 08 |
| POST | `/productos/:id/entradas` | CAJERO | 08 (sumar existencia) |
| POST | `/caja/abrir` | CAJERO | 05 |
| GET | `/caja/actual` | CAJERO | 05 |
| GET | `/caja/actual/corte` | CAJERO | 05 (vista previa) |
| POST | `/caja/actual/cerrar` | CAJERO | 05 |
| POST | `/caja/actual/pagos-proveedor` | CAJERO | 09 |
| POST | `/ventas` | CAJERO | 06 |
| GET | `/usuarios` | ADMIN | 12 |
| POST | `/usuarios` | ADMIN | 12 |
| PATCH | `/usuarios/:id` | ADMIN | 12 (suspender/reactivar/reset password) |
| DELETE | `/usuarios/:id` | ADMIN | 12 (lógico) |

`POST /ventas` body:
```json
{
  "renglones": [{ "productoId": 1, "cantidad": "2" }, { "productoId": 7, "cantidad": "0.750" }],
  "pagos": [{ "metodo": "EFECTIVO", "monto": "200.00" }, { "metodo": "TARJETA", "monto": "50.00", "referencia": "4821" }]
}
```
**El servidor recalcula precios y total** con los precios de la BD; no confía en los del cliente.

## Scripts (raíz)

```
npm install
docker compose up -d          # postgres en localhost:5432
npm run db:migrate            # prisma migrate dev
npm run db:seed
npm run dev                   # api :3000 + web :5173
npm test
npm run lint
```
