import { useCarrito } from './carrito/store'
import { Cobro } from './cobro/Cobro'
import { Granel } from './granel/Granel'

// HU-02 (Gonzalo): escaneo y carrito · HU-03 (Miguel): granel · HU-06 (Sosa): cobro
export function VentaPage() {
  const renglones = useCarrito((s) => s.renglones)
  const total = useCarrito((s) => s.total)

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Venta</h1>
      <Granel />
      <div className="rounded bg-white p-4 shadow">
        <p>{renglones.length} productos en la cuenta</p>
        {renglones.length > 0 && (
          <div className="overflow-x-auto">
            <table className="my-3 w-full text-left text-sm">
              <caption className="sr-only">Productos de la cuenta</caption>
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Precio unitario</th>
                  <th scope="col">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {renglones.map((r) => (
                  <tr key={r.productoId} className="border-t">
                    <th scope="row" className="py-2 font-normal">
                      {r.nombre}
                    </th>
                    <td>
                      {r.cantidad} {r.unidad === 'KILO' ? 'kg' : 'pzas'}
                    </td>
                    <td>
                      ${r.precio} / {r.unidad === 'KILO' ? 'kg' : 'pieza'}
                    </td>
                    <td>${r.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xl font-bold">Total: ${total()}</p>
      </div>
      <Cobro />
    </section>
  )
}
