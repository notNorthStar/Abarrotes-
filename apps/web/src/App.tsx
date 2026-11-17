import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireRol } from './auth/RequireRol'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { InicioPage } from './features/inicio/InicioPage'
import { VentaPage } from './features/venta/VentaPage'
import { CajaPage } from './features/caja/CajaPage'
import { InventarioPage } from './features/inventario/InventarioPage'
import { AgregarProductoPage } from './features/inventario/AgregarProductoPage'
import { MermaPage } from './features/inventario/MermaPage'
import { ProveedoresPage } from './features/proveedores/ProveedoresPage'
import { UsuariosPage } from './features/usuarios/UsuariosPage'
import { AdministradoresPage } from './features/usuarios/AdministradoresPage'
import { ReportesPage } from './features/reportes/ReportesPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireRol minimo="CAJERO">
            <Layout />
          </RequireRol>
        }
      >
        <Route index element={<InicioPage />} />
        <Route
          path="reportes"
          element={
            <RequireRol minimo="ADMIN">
              <ReportesPage />
            </RequireRol>
          }
        />
        <Route path="venta" element={<VentaPage />} />
        <Route path="caja" element={<CajaPage />} />
        <Route path="inventario" element={<InventarioPage />} />
        <Route path="productos/nuevo" element={<AgregarProductoPage />} />
        <Route path="mermas" element={<MermaPage />} />
        <Route path="proveedores" element={<ProveedoresPage />} />
        <Route
          path="usuarios"
          element={
            <RequireRol minimo="ADMIN">
              <UsuariosPage />
            </RequireRol>
          }
        />
        <Route
          path="administradores"
          element={
            <RequireRol minimo="JEFE">
              <AdministradoresPage />
            </RequireRol>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
