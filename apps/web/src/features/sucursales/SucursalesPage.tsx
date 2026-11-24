import { useEffect, useRef, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import { Icono } from '../../components/Icono'
import {
  Aviso,
  Boton,
  Chip,
  EncabezadoPagina,
  Esqueleto,
  Pagina,
  Tarjeta,
} from '../../components/ui'

type SucursalGestion = {
  id: number
  nombre: string
  direccion: string | null
  estado: 'ACTIVO' | 'SUSPENDIDO'
  creadoEn: string
}
const mensaje = (e: unknown) =>
  e instanceof ApiError ? e.message : 'No se pudo conectar con el servidor. Intenta de nuevo.'
const ordenar = (lista: SucursalGestion[]) =>
  [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es') || a.id - b.id)

export function SucursalesPage() {
  const [sucursales, setSucursales] = useState<SucursalGestion[]>([])
  const [cargando, setCargando] = useState(true)
  const [intento, setIntento] = useState(0)
  const [errorLista, setErrorLista] = useState('')
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const bloqueo = useRef(false)

  useEffect(() => {
    let vigente = true
    setCargando(true)
    setErrorLista('')
    api
      .get<SucursalGestion[]>('/sucursales')
      .then((lista) => {
        if (vigente) setSucursales(lista)
      })
      .catch((e: unknown) => {
        if (vigente) setErrorLista(mensaje(e))
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [intento])

  async function ejecutar(accion: () => Promise<void>) {
    if (bloqueo.current) return
    bloqueo.current = true
    setOcupado(true)
    setAviso(null)
    try {
      await accion()
    } catch (e) {
      setAviso({ tipo: 'error', texto: mensaje(e) })
    } finally {
      bloqueo.current = false
      setOcupado(false)
    }
  }

  function crear(e: FormEvent) {
    e.preventDefault()
    void ejecutar(async () => {
      const nueva = await api.post<SucursalGestion>('/sucursales', {
        nombre: nombre.trim(),
        direccion: direccion.trim(),
      })
      setSucursales((lista) => ordenar([...lista, nueva]))
      setNombre('')
      setDireccion('')
      setAviso({ tipo: 'ok', texto: `Se creó la sucursal ${nueva.nombre}.` })
    })
  }

  function cambiar(sucursal: SucursalGestion) {
    const suspender = sucursal.estado === 'ACTIVO'
    if (
      suspender &&
      !window.confirm(
        `¿Suspender la sucursal ${sucursal.nombre}? Sus usuarios no podrán entrar y sus sesiones quedarán bloqueadas en la siguiente petición. Se conservarán las cajas abiertas, el inventario y el historial.`,
      )
    )
      return
    void ejecutar(async () => {
      const actualizada = await api.patch<SucursalGestion>(`/sucursales/${sucursal.id}`, {
        estado: suspender ? 'SUSPENDIDO' : 'ACTIVO',
      })
      setSucursales((lista) => lista.map((s) => (s.id === sucursal.id ? actualizada : s)))
      setAviso({
        tipo: 'ok',
        texto: `La sucursal ${sucursal.nombre} está ${suspender ? 'suspendida' : 'activa'}.`,
      })
    })
  }

  function eliminar(sucursal: SucursalGestion) {
    if (
      !window.confirm(
        `¿Eliminar la sucursal ${sucursal.nombre}? Dejará de aparecer en las listas y sus usuarios no podrán entrar. Se conservarán las cajas abiertas, el inventario y el historial. Esta acción no se puede deshacer desde esta pantalla.`,
      )
    )
      return
    void ejecutar(async () => {
      await api.delete(`/sucursales/${sucursal.id}`)
      setSucursales((lista) => lista.filter((s) => s.id !== sucursal.id))
      setAviso({
        tipo: 'ok',
        texto: `Se eliminó la sucursal ${sucursal.nombre}. Sus datos e historial se conservan.`,
      })
    })
  }

  const deshabilitado = cargando || ocupado || !!errorLista
  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Sucursales"
        subtitulo="Administra las sucursales activas e inactivas del negocio."
        acciones={
          <Boton
            variante="secundario"
            disabled={cargando || ocupado}
            onClick={() => setIntento((n) => n + 1)}
          >
            Actualizar lista
          </Boton>
        }
      />
      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      <Tarjeta className="p-5">
        <form onSubmit={crear} className="flex flex-col gap-4" aria-labelledby="nueva-sucursal">
          <div>
            <h2 id="nueva-sucursal" className="text-sm font-semibold">
              Nueva sucursal
            </h2>
            <p className="mt-1 text-[13px] text-piedra">
              La sucursal se crea activa. El nombre es obligatorio.
            </p>
          </div>
          <fieldset
            disabled={deshabilitado}
            className="flex flex-wrap items-end gap-4 disabled:opacity-60"
          >
            <label
              className="flex min-w-0 flex-[1_1_220px] flex-col gap-1.5 text-[13px] font-medium"
              htmlFor="sucursal-nombre"
            >
              Nombre
              <input
                id="sucursal-nombre"
                className="campo"
                required
                maxLength={120}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Sucursal Sur"
              />
            </label>
            <label
              className="flex min-w-0 flex-[2_1_280px] flex-col gap-1.5 text-[13px] font-medium"
              htmlFor="sucursal-direccion"
            >
              Dirección (opcional)
              <input
                id="sucursal-direccion"
                className="campo"
                maxLength={250}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle y número"
              />
            </label>
            <Boton type="submit" disabled={deshabilitado || !nombre.trim()}>
              <Icono nombre="mas" tamano={16} />
              {ocupado ? 'Guardando…' : 'Crear sucursal'}
            </Boton>
          </fieldset>
        </form>
      </Tarjeta>
      {errorLista && (
        <div className="flex flex-col items-start gap-3">
          <Aviso tipo="error">{errorLista}</Aviso>
          <Boton variante="secundario" onClick={() => setIntento((n) => n + 1)}>
            Reintentar
          </Boton>
        </div>
      )}
      <div aria-busy={cargando} aria-live="polite">
        {cargando ? (
          <Tarjeta className="flex flex-col gap-5 p-5">
            <Esqueleto className="h-5 w-48" />
            <Esqueleto className="h-8 w-full" />
            <Esqueleto className="h-8 w-full" />
            <span role="status" className="sr-only">
              Consultando sucursales
            </span>
          </Tarjeta>
        ) : (
          !errorLista && (
            <Tarjeta className="overflow-hidden">
              <div className="border-b border-linea px-5 py-4">
                <h2 className="text-sm font-semibold">Sucursales del negocio</h2>
                <p className="mt-1 text-xs text-piedra">
                  <span className="num">{sucursales.length}</span> sucursales registradas; las
                  eliminadas no se muestran.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <caption className="sr-only">Lista de sucursales y acciones de gestión</caption>
                  <thead className="bg-hueso text-left text-xs text-piedra">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Sucursal
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Dirección
                      </th>
                      <th scope="col" className="px-5 py-3 font-medium">
                        Estado
                      </th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sucursales.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-piedra">
                          No hay sucursales registradas. Crea la primera para comenzar.
                        </td>
                      </tr>
                    ) : (
                      sucursales.map((s) => (
                        <tr key={s.id} className="border-t border-linea hover:bg-hueso">
                          <th
                            scope="row"
                            className="max-w-xs break-words px-5 py-4 text-left font-medium"
                          >
                            {s.nombre}
                            <span className="num mt-1 block text-xs font-normal text-piedra">
                              #{s.id}
                            </span>
                          </th>
                          <td className="max-w-xs break-words px-5 py-4 text-piedra">
                            {s.direccion || 'Sin dirección'}
                          </td>
                          <td className="px-5 py-4">
                            <Chip tono={s.estado === 'ACTIVO' ? 'hoja' : 'neutro'}>
                              {s.estado === 'ACTIVO' ? 'Activa' : 'Suspendida'}
                            </Chip>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <Boton
                                tamano="sm"
                                variante="secundario"
                                disabled={deshabilitado}
                                aria-label={`${s.estado === 'ACTIVO' ? 'Suspender' : 'Reactivar'} ${s.nombre}`}
                                onClick={() => cambiar(s)}
                              >
                                {s.estado === 'ACTIVO' ? 'Suspender' : 'Reactivar'}
                              </Boton>
                              <Boton
                                tamano="sm"
                                variante="fantasma"
                                className="text-chile-texto"
                                disabled={deshabilitado}
                                aria-label={`Eliminar ${s.nombre}`}
                                onClick={() => eliminar(s)}
                              >
                                <Icono nombre="basura" tamano={16} />
                                Eliminar
                              </Boton>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Tarjeta>
          )
        )}
      </div>
      <p className="text-xs leading-relaxed text-piedra">
        Suspender o eliminar una sucursal bloquea a sus usuarios en la siguiente petición. El
        inventario, las ventas, las cajas abiertas y los movimientos se conservan.
      </p>
    </Pagina>
  )
}
