import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import type { Producto } from '../../api/tipos'
import { useAuth } from '../../auth/AuthContext'
import { Icono, type NombreIcono } from '../../components/Icono'
import { Chip, Esqueleto, PaginaConPanel, Tarjeta, Tecla, claseBoton, pesos } from '../../components/ui'
import type { Corte, Turno } from '../caja/tipos'

// Inicio: resumen del turno, acciones rápidas, actividad y productos por reponer.

type Actividad = {
  tipo: 'VENTA' | 'PAGO_PROVEEDOR'
  id: number
  titulo: string
  metodos: string[]
  monto: string
  creadoEn: string
}

type Datos = {
  turno: Turno | null
  corte: Corte | null
  actividad: Actividad[]
  reponer: Producto[] | null
}

// Umbral visual de "por reponer" (no es un criterio de aceptación): ≤ 5 piezas o ≤ 3 kg.
const porReponer = (p: Producto) => Number(p.existencia) <= (p.unidad === 'KILO' ? 3 : 5)

const METODO: Record<string, string> = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' }

function saludo() {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

function haceCuanto(fecha: string) {
  const min = Math.round((Date.now() - new Date(fecha).getTime()) / 60000)
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  return new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export function InicioPage() {
  const { usuario } = useAuth()
  const [datos, setDatos] = useState<Datos | null>(null)

  useEffect(() => {
    let vigente = true
    async function cargar() {
      const { turno } = await api.get<{ turno: Turno | null }>('/caja/actual')
      const [corte, actividad, productos] = await Promise.all([
        turno ? api.get<Corte>('/caja/actual/corte') : Promise.resolve(null),
        turno ? api.get<Actividad[]>('/caja/actual/actividad') : Promise.resolve([]),
        // El jefe necesita elegir sucursal (HU-14); para él no se muestra la lista.
        api.get<Producto[]>('/productos').catch(() => null),
      ])
      if (vigente) setDatos({ turno, corte, actividad, reponer: productos ? productos.filter(porReponer) : null })
    }
    cargar().catch(() => vigente && setDatos({ turno: null, corte: null, actividad: [], reponer: null }))
    return () => {
      vigente = false
    }
  }, [])

  const cargando = datos === null
  const fecha = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
  const cajaAbierta = !!datos?.turno

  const acciones: { titulo: string; desc: string; to: string; icono: NombreIcono; tecla?: string }[] = [
    { titulo: 'Nueva venta', desc: 'Escanea o busca productos', to: '/venta', icono: 'escanear', tecla: 'F2' },
    { titulo: 'Pago a proveedor', desc: 'Registra un pago del turno', to: '/caja', icono: 'proveedor' },
    { titulo: 'Consultar inventario', desc: 'Precio y existencia', to: '/inventario', icono: 'inventario' },
    cajaAbierta || cargando
      ? { titulo: 'Cerrar caja', desc: 'Corte y conteo de efectivo', to: '/caja', icono: 'candado' }
      : { titulo: 'Abrir caja', desc: 'Empieza tu turno', to: '/caja', icono: 'caja' },
  ]

  return (
    <PaginaConPanel etiquetaPanel="Turno actual" panel={<PanelTurno datos={datos} />}>
      <div className="flex flex-col gap-1">
        <h1 className="text-[26px] font-semibold tracking-tight">
          {saludo()}, {usuario?.nombre}
        </h1>
        <p className="text-sm text-piedra first-letter:uppercase">{fecha}</p>
      </div>

      <section aria-label="Resumen del turno" className="grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-3">
        <Resumen
          etiqueta="Ventas del turno"
          cargando={cargando}
          valor={datos?.corte ? pesos(datos.corte.totalVendido) : '—'}
          nota={datos?.corte ? `${datos.corte.numeroVentas} ${datos.corte.numeroVentas === 1 ? 'venta' : 'ventas'}` : 'Caja cerrada'}
        />
        <Resumen
          etiqueta="Efectivo esperado"
          cargando={cargando}
          valor={datos?.corte ? pesos(datos.corte.efectivoEsperado) : '—'}
          nota={datos?.corte ? 'en caja ahora' : 'Abre tu caja para empezar'}
        />
        <Resumen
          etiqueta="Por reponer"
          cargando={cargando}
          valor={datos?.reponer ? String(datos.reponer.length) : '—'}
          nota={datos?.reponer ? 'productos con existencia baja' : 'Selecciona una sucursal'}
        />
      </section>

      <section aria-labelledby="h-acciones" className="flex flex-col gap-3">
        <h2 id="h-acciones" className="text-sm font-semibold">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3">
          {acciones.map((a) => (
            <Link
              key={a.titulo}
              to={a.to}
              className="flex min-h-[72px] items-start gap-3 rounded-xl border border-linea bg-hueso p-3.5 transition-colors hover:border-[#C9C4B9] hover:bg-superficie"
            >
              <span aria-hidden="true" className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-[#EFEDE7]">
                <Icono nombre={a.icono} />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium">{a.titulo}</span>
                <span className="text-xs leading-snug text-piedra">{a.desc}</span>
              </span>
              {a.tecla && <Tecla>{a.tecla}</Tecla>}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="h-actividad" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="h-actividad" className="text-sm font-semibold">
            Actividad del turno
          </h2>
          {cajaAbierta && (
            <Link to="/caja" className="text-[13px] text-piedra hover:text-tinta">
              Ver corte
            </Link>
          )}
        </div>
        <Tarjeta className="overflow-hidden">
          {cargando &&
            ['38%', '30%', '44%', '34%'].map((ancho) => (
              <div key={ancho} className="flex items-center gap-3 border-t border-[#F0EEE8] px-4 py-3.5 first:border-t-0">
                <Esqueleto className="h-8 w-8 rounded-lg" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div aria-hidden="true" className="esqueleto h-3" style={{ width: ancho }} />
                  <Esqueleto className="h-2.5 w-1/4" />
                </div>
                <Esqueleto className="h-3.5 w-16" />
              </div>
            ))}
          {!cargando && datos.actividad.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-piedra">
              {cajaAbierta ? 'Aún no hay movimientos en este turno.' : 'Abre tu caja para registrar ventas y pagos.'}
            </p>
          )}
          {!cargando &&
            datos.actividad.map((a) => (
              <div
                key={`${a.tipo}-${a.id}`}
                className="flex min-h-14 items-center gap-3 border-t border-[#F0EEE8] px-4 py-3 first:border-t-0 hover:bg-hueso"
              >
                <span aria-hidden="true" className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-crema text-grafito">
                  <Icono nombre={a.tipo === 'VENTA' ? 'recibo' : 'proveedor'} tamano={16} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm">{a.titulo}</span>
                  <span className="text-xs text-piedra">
                    {a.metodos.map((m) => METODO[m] ?? m).join(' y ')} · {haceCuanto(a.creadoEn)}
                  </span>
                </span>
                <span className={`num text-sm font-medium ${a.tipo === 'PAGO_PROVEEDOR' ? 'text-chile' : ''}`}>
                  {a.tipo === 'PAGO_PROVEEDOR' ? '− ' : ''}
                  {pesos(a.monto)}
                </span>
              </div>
            ))}
        </Tarjeta>
      </section>
    </PaginaConPanel>
  )
}

function Resumen({ etiqueta, valor, nota, cargando }: { etiqueta: string; valor: string; nota: string; cargando: boolean }) {
  return (
    <Tarjeta className="flex min-h-[108px] flex-col gap-2.5 p-4">
      <span className="text-[13px] text-piedra">{etiqueta}</span>
      {cargando ? (
        <>
          <Esqueleto className="h-[26px] w-3/5" />
          <Esqueleto className="h-3 w-2/5" />
        </>
      ) : (
        <>
          <span className="num text-[26px] font-semibold tracking-tight">{valor}</span>
          <span className="text-xs text-piedra">{nota}</span>
        </>
      )}
    </Tarjeta>
  )
}

function PanelTurno({ datos }: { datos: Datos | null }) {
  const cargando = datos === null
  const corte = datos?.corte
  return (
    <>
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Turno actual</h2>
          {corte && (
            <span className="text-xs text-piedra">
              Desde {new Date(corte.abiertoEn).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        {cargando && (
          <div className="flex flex-col gap-3">
            <Esqueleto className="h-3.5" />
            <Esqueleto className="h-3.5 w-[85%]" />
            <Esqueleto className="h-3.5 w-[70%]" />
            <Esqueleto className="h-5 w-[55%]" />
          </div>
        )}
        {!cargando && corte && (
          <dl className="flex flex-col text-[13px]">
            <div className="flex justify-between py-1.5">
              <dt className="text-piedra">Monto inicial</dt>
              <dd className="num">{pesos(corte.montoInicial)}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-piedra">Ventas en efectivo</dt>
              <dd className="num">+ {pesos(corte.ventasPorMetodo.EFECTIVO)}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-piedra">Pagos a proveedor</dt>
              <dd className="num">− {pesos(corte.pagosProveedor.EFECTIVO)}</dd>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-linea pt-2.5">
              <dt className="font-medium">Efectivo esperado</dt>
              <dd className="num text-lg font-semibold">{pesos(corte.efectivoEsperado)}</dd>
            </div>
          </dl>
        )}
        {!cargando && !corte && (
          <p className="rounded-lg bg-crema px-3 py-3 text-[13px] leading-relaxed text-grafito">
            Tu caja está cerrada. Ábrela con el efectivo inicial para poder cobrar.
          </p>
        )}
        <Link to="/caja" className={claseBoton('primario')}>
          {corte || cargando ? 'Ir a caja' : 'Abrir caja'}
          <Icono nombre="derecha" tamano={16} />
        </Link>
      </section>

      {datos?.reponer !== null && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-sm font-semibold">Por reponer</h2>
          {cargando ? (
            <div className="flex flex-col gap-2.5">
              <Esqueleto className="h-8" />
              <Esqueleto className="h-8" />
              <Esqueleto className="h-8" />
            </div>
          ) : datos.reponer && datos.reponer.length > 0 ? (
            <ul className="flex flex-col">
              {datos.reponer.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 border-t border-[#EEEBE5] py-2 text-[13px]">
                  <span>{p.nombre}</span>
                  <Chip tono="maiz" className="num">
                    {p.unidad === 'KILO' ? `${Number(p.existencia).toFixed(3)} kg` : `${Number(p.existencia)} pzas`}
                  </Chip>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-piedra">Nada por reponer.</p>
          )}
          <Link to="/inventario" className="text-[13px] text-piedra hover:text-tinta">
            Ver inventario
          </Link>
        </section>
      )}
    </>
  )
}
