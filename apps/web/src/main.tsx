import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { App } from './App'
import { ProveedorConfirmar } from './components/Confirmar'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProveedorConfirmar>
          <App />
        </ProveedorConfirmar>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
