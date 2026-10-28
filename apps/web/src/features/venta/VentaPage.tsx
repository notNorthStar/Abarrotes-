import { useCarrito } from './carrito/store'
import { Cobro } from './cobro/Cobro'
import { Granel } from './granel/Granel'
import { useEffect, useRef, useState } from 'react'
import type { Producto } from '../../api/tipos'
import { PaginaConPanel, Tarjeta, pesos } from '../../components/ui'
import { Escaneo } from './carrito/Escaneo'
import { FilaProducto } from './carrito/FilaProducto'

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`

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

  // Artículos: piezas por su cantidad; cada producto a granel cuenta como uno.
  const articulos = renglones.reduce((acc, r) => acc + (r.unidad === 'KILO' ? 1 : Number(r.cantidad)), 0)

  return (
    <PaginaConPanel etiquetaPanel="Cobro" panel={<Cobro />}>
      <h1 className="sr-only">Venta</h1>
      <Escaneo inputRef={inputEscaneo} onGranel={setProductoGranel} />
      <Granel
        productoExterno={productoGranel}
        onFinalizar={() => {
          setProductoGranel(null)
          enfocar()
        }}
      />
      <Tarjeta className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <h2 className="text-sm font-semibold">Cuenta</h2>
          <span className="text-[13px] text-piedra">
            {plural(renglones.length, 'producto', 'productos')} · {plural(articulos, 'artículo', 'artículos')}
          </span>
        </div>
        {renglones.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <caption className="sr-only">Productos de la cuenta</caption>
              <thead>
                <tr className="text-xs text-piedra">
                  <th scope="col" className="border-t border-[#F0EEE8] px-4 py-2 font-medium">
                    Producto
                  </th>
                  <th scope="col" className="border-t border-[#F0EEE8] px-2 py-2 font-medium">
                    Cantidad
                  </th>
                  <th scope="col" className="border-t border-[#F0EEE8] px-2 py-2 text-right font-medium">
                    Precio
                  </th>
                  <th scope="col" className="border-t border-[#F0EEE8] px-2 py-2 text-right font-medium">
                    Importe
                  </th>
                  <th scope="col" className="border-t border-[#F0EEE8] px-4 py-2">
                    <span className="sr-only">Acciones</span>
                  </th>
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
        ) : (
          <p className="border-t border-[#F0EEE8] px-4 py-10 text-center text-sm text-piedra">
            La cuenta está vacía. Escanea un producto para empezar.
          </p>
        )}
        <div className="flex items-baseline justify-between border-t border-linea bg-hueso px-4 py-3.5">
          <span className="text-sm text-piedra">Total</span>
          <span className="num text-[22px] font-semibold">{pesos(total())}</span>
        </div>
      </Tarjeta>
    </PaginaConPanel>
  )
}
