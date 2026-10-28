import { useCarrito } from './carrito/store'
import { Cobro } from './cobro/Cobro'
import { Granel } from './granel/Granel'
import { useEffect, useRef, useState } from 'react'
import type { Producto } from '../../api/tipos'
import { Escaneo } from './carrito/Escaneo'
import { FilaProducto } from './carrito/FilaProducto'

// HU-02/HU-03 (Miguel): escaneo, carrito y granel · HU-06 (Sosa): cobro
export function VentaPage() {
  const renglones = useCarrito((s) => s.renglones)
  const total = useCarrito((s) => s.total)
  const inputEscaneo = useRef<HTMLInputElement>(null)
  const [productoGranel, setProductoGranel] = useState<Producto | null>(null)
  const enfocar = () => inputEscaneo.current?.focus()
  const cantidadAnterior = useRef(renglones.length)

  useEffect(() => {
    // Cobro vacía el carrito al confirmar: deja el lector listo para la siguiente venta.
    if (cantidadAnterior.current > 0 && renglones.length === 0) inputEscaneo.current?.focus()
    cantidadAnterior.current = renglones.length
  }, [renglones.length])

  return (
    <section className="space-y-4">
      <h1 className="mb-4 text-2xl font-semibold">Venta</h1>
      <Escaneo inputRef={inputEscaneo} onGranel={setProductoGranel} />
      <Granel
        productoExterno={productoGranel}
        onFinalizar={() => {
          setProductoGranel(null)
          enfocar()
        }}
      />
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
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {renglones.map((r) => (
                  <FilaProducto
                    key={`${r.productoId}-${r.cantidad}`}
                    renglon={r}
                    alTerminar={enfocar}
                  />
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
