import { useEffect, useState, type RefObject } from 'react'
import type { Producto } from '../../../api/tipos'
import { BuscadorProductos } from '../../../components/BuscadorProductos'
import { Icono } from '../../../components/Icono'
import { prepararCobro } from '../cobro/Cobro'
import { useCarrito } from './store'

type Props = {
  inputRef: RefObject<HTMLInputElement>
  onGranel: (producto: Producto) => void
}

// HU-02 (Miguel): escaneo y búsqueda. Las coincidencias aparecen al escribir (T-33, Sosa).
export function Escaneo({ inputRef, onGranel }: Props) {
  const agregar = useCarrito((s) => s.agregarProducto)
  const [aviso, setAviso] = useState('')

  useEffect(() => inputRef.current?.focus(), [inputRef])

  function seleccionar(producto: Producto) {
    if (producto.unidad === 'KILO') {
      onGranel(producto)
      setAviso(`Captura el peso de ${producto.nombre}.`)
    } else {
      agregar(producto)
      setAviso(`${producto.nombre} agregado a la cuenta.`)
      inputRef.current?.focus()
    }
  }

  return (
    <section aria-labelledby="titulo-escaneo" className="flex flex-col gap-2">
      <h2 id="titulo-escaneo" className="sr-only">
        Escanear productos
      </h2>
      <BuscadorProductos
        id="codigo-venta"
        etiqueta="Código de barras o nombre"
        placeholder="Escanea, o escribe código o nombre"
        inputRef={inputRef}
        onElegir={seleccionar}
        onVacio={prepararCobro}
      >
        <button
          type="button"
          onClick={() => document.getElementById('buscar-granel')?.focus()}
          className="inline-flex h-[52px] items-center gap-2 rounded-[10px] border border-linea bg-superficie px-4 text-sm transition-colors hover:bg-[#EFEDE7]"
        >
          <Icono nombre="granel" />
          Granel
        </button>
      </BuscadorProductos>
      <p role="status" className="flex items-center gap-1.5 text-[13px] text-hoja-texto">
        {aviso && (
          <>
            <Icono nombre="check" tamano={16} />
            {aviso}
          </>
        )}
      </p>
    </section>
  )
}
