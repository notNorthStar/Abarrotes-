import { useCarrito } from './carrito/store'

// HU-02 (Gonzalo): escaneo y carrito · HU-03 (Miguel): granel · HU-06 (Sosa): cobro
export function VentaPage() {
  const renglones = useCarrito((s) => s.renglones)
  const total = useCarrito((s) => s.total)

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Venta</h1>
      <p className="mb-4 text-slate-500">Pendiente: HU-02 escaneo · HU-03 granel · HU-06 cobro</p>
      <div className="rounded bg-white p-4 shadow">
        <p>{renglones.length} productos en la cuenta</p>
        <p className="text-xl font-bold">Total: ${total()}</p>
      </div>
    </section>
  )
}
