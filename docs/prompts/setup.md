# Prompt: T-00 — esqueleto del proyecto (solo Sosa, una vez)

> Uso: `/setup`. Objetivo: dejar el repo listo para que los 3 trabajen en paralelo **hoy mismo**.

Crea en la rama `t00-setup`, siguiendo `docs/04-arquitectura.md` y `docs/05-modelo-datos.md` al pie de la letra:

1. **Raíz:** `package.json` con workspaces `apps/*` y scripts `dev` (api + web en paralelo con `concurrently`), `test`, `lint`, `db:migrate`, `db:seed`; `docker-compose.yml` (postgres:16, usuario/clave/bd `abarrotes`, puerto 5432); `.gitignore`, `.env.example`, `.editorconfig`, ESLint + Prettier compartidos, `.nvmrc` (20).
2. **apps/api:** Express + TS (`tsx` para dev), `app.ts` exportable para supertest, `server.ts`, `lib/prisma.ts`, `lib/dinero.ts` (suma, multiplicación, round2 half-up con `Prisma.Decimal`), `lib/AppError.ts`, middleware `auth` (JWT), `requireRol` jerárquico y manejador de errores. `prisma/schema.prisma` completo del doc 05 + migración inicial + `seed.ts` con los datos del doc 05. Vitest configurado con una BD de pruebas (`DATABASE_URL` de test) y un helper para obtener token por rol.
3. **Contratos vacíos** para que nadie espere a nadie: carpetas de cada módulo (`auth`, `usuarios`, `productos`, `ventas`, `caja`) con `routes` montadas que respondan 501, y `GET /productos/codigo/:codigo` + `GET /productos?q=` ya funcionales (son lectura simple y desbloquean a Gonzalo y Miguel).
4. **apps/web:** Vite + React + TS + Tailwind + React Router; `api/client.ts` (fetch con Bearer token y manejo de `{error}`); `auth/` con contexto de sesión y `<RequireRol>`; layout con menú por rol; páginas placeholder por feature; `features/venta/carrito/store.ts` con el **contrato del carrito**:
   ```ts
   type Renglon = { productoId: number; nombre: string; unidad: 'PIEZA'|'KILO'; precio: string; cantidad: string; subtotal: string }
   agregarProducto(p, cantidad = '1')   // suma si ya existe (HU-02)
   cambiarCantidad(productoId, cantidad)
   quitar(productoId)
   vaciar()
   total(): string
   ```
5. **Docs:** `README.md` con pasos de instalación verificados.
6. Verifica: `npm install`, `docker compose up -d`, migrar, seed, `npm run dev` levanta ambos, `npm test` y `npm run lint` pasan. Reporta resultados reales.
7. Marca T-00 en `docs/scrum/sprint-backlog.md`, commitea por partes y prepara el PR. Pide confirmación antes del push.
