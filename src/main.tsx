import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { ProveedorSesion } from '@/shared/sesion/SesionContexto'
import './styles/tema.css'

const contenedor = document.getElementById('root')
if (!contenedor) {
  throw new Error('No se encontro el elemento #root en index.html')
}

createRoot(contenedor).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorSesion>
        <App />
      </ProveedorSesion>
    </BrowserRouter>
  </StrictMode>,
)
