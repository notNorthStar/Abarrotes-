// Única forma de llamar a la API desde el front. Agrega el token (y la sucursal del jefe) y convierte { error } en excepción.

import { conSucursal, sucursalStore } from './sucursal'

const TOKEN_KEY = 'abarrotes.token'
/** Se emite cuando el servidor rechaza un token ya guardado (expiró o la cuenta se suspendió). */
export const SESION_TERMINADA = 'abarrotes:sesion-terminada'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`
  const esArchivo = body instanceof Blob
  if (body !== undefined) headers['Content-Type'] = esArchivo ? body.type : 'application/json'

  const res = await fetch(`/api${conSucursal(path, sucursalStore.get())}`, {
    method,
    headers,
    body: body === undefined ? undefined : esArchivo ? body : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && token) window.dispatchEvent(new Event(SESION_TERMINADA))
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Error de conexión')
  return data as T
}

async function download(path: string): Promise<Blob> {
  const token = tokenStore.get()
  const res = await fetch(`/api${conSucursal(path, sucursalStore.get())}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(res.status, data.error ?? 'No se pudo descargar el archivo')
  }
  return res.blob()
}

export const api = {
  download,
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  subir: (path: string, archivo: Blob) => request<{ id: string }>('POST', path, archivo),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
